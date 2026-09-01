'use server';

import { db } from '@/lib/db';
import {
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  stockOpnames,
  stockOpnameItems,
  stockMutations,
  outletStock,
  products,
  categories,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface PurchaseItemInput {
  productId: string;
  unitName: string;
  conversionQty: number;
  qty: number;
  costPerUnit: number;
  subtotal: number;
}

export interface CreatePurchaseOrderInput {
  supplierId?: string;
  paymentStatus: 'PAID' | 'UNPAID';
  items: PurchaseItemInput[];
  notes?: string;
}

export interface OpnameItemInput {
  productId: string;
  systemStock: number;
  physicalStock: number;
  reason: 'RUSAK' | 'HILANG' | 'KADALUARSA' | 'SALAH_HITUNG' | 'LAINNYA';
  notes?: string;
}

export interface CreateStockOpnameInput {
  items: OpnameItemInput[];
  notes?: string;
}

/**
 * 1. Fetch Suppliers
 */
export async function getSuppliersAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.tenantId, user.tenantId))
    .orderBy(desc(suppliers.createdAt));
}

/**
 * 2. Create Supplier
 */
export async function createSupplierAction(name: string, phone?: string, address?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const id = createId();
  await db.insert(suppliers).values({
    id,
    tenantId: user.tenantId,
    name: name.trim(),
    phone: phone?.trim() || null,
    address: address?.trim() || null,
  });

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/restock');
  return { success: true, id };
}

/**
 * 3. Create Purchase Order (Barang Masuk) & Auto Moving Average HPP
 */
export async function createPurchaseOrderAction(input: CreatePurchaseOrderInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!user.outletId) throw new Error('Cabang aktif tidak ditemukan.');

  if (!input.items || input.items.length === 0) {
    throw new Error('Daftar barang masuk tidak boleh kosong.');
  }

  const poId = createId();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const poNumber = `PO-${todayStr}-${randomSuffix}`;

  const totalAmount = input.items.reduce((sum, item) => sum + item.subtotal, 0);

  // 1. Insert Purchase Order
  await db.insert(purchaseOrders).values({
    id: poId,
    tenantId: user.tenantId,
    outletId: user.outletId || user.tenantId,
    supplierId: input.supplierId || null,
    poNumber,
    totalAmount,
    status: 'COMPLETED',
  });

  // 2. Process Items, Update Stock & Calculate Moving Average HPP
  for (const item of input.items) {
    await db.insert(purchaseOrderItems).values({
      id: createId(),
      purchaseOrderId: poId,
      productId: item.productId,
      unitName: item.unitName,
      conversionQty: item.conversionQty,
      qty: item.qty,
      purchasePrice: item.costPerUnit,
      subtotal: item.subtotal,
    });

    // Total physical base units added = qty * conversionQty
    const baseQtyIn = item.qty * item.conversionQty;
    const costPerBaseUnit = item.costPerUnit / item.conversionQty;

    // Get current product details (HPP and Current Global Stock)
    const productRecord = await db
      .select()
      .from(products)
      .where(and(eq(products.id, item.productId), eq(products.tenantId, user.tenantId)))
      .limit(1);

    if (productRecord.length > 0) {
      const prod = productRecord[0];
      const oldHpp = prod.costPrice || 0;

      // Get outlet stock
      const stockRecord = await db
        .select()
        .from(outletStock)
        .where(
          and(
            eq(outletStock.productId, item.productId),
            eq(outletStock.outletId, user.outletId)
          )
        )
        .limit(1);

      const oldStock = stockRecord[0]?.currentStock || 0;
      const newStock = oldStock + baseQtyIn;

      // Moving Average HPP Formula:
      // New HPP = ((Old Stock * Old HPP) + (Base Qty In * Cost per Base Unit)) / (Old Stock + Base Qty In)
      const validOldStock = Math.max(0, oldStock);
      const totalCostVal = validOldStock * oldHpp + baseQtyIn * costPerBaseUnit;
      const totalQtyVal = validOldStock + baseQtyIn;
      const newMovingAvgHpp = totalQtyVal > 0 ? Math.round(totalCostVal / totalQtyVal) : costPerBaseUnit;

      // Update Product HPP
      await db
        .update(products)
        .set({ costPrice: newMovingAvgHpp })
        .where(eq(products.id, item.productId));

      // Update Outlet Stock
      if (stockRecord.length > 0) {
        await db
          .update(outletStock)
          .set({ currentStock: newStock })
          .where(eq(outletStock.id, stockRecord[0].id));
      } else {
        await db.insert(outletStock).values({
          id: createId(),
          tenantId: user.tenantId,
          outletId: user.outletId,
          productId: item.productId,
          currentStock: newStock,
        });
      }

      // Record Stock Mutation
      await db.insert(stockMutations).values({
        id: createId(),
        tenantId: user.tenantId,
        outletId: user.outletId,
        productId: item.productId,
        type: 'PURCHASE',
        qtyChange: baseQtyIn,
        stockBefore: oldStock,
        stockAfter: newStock,
        referenceId: poNumber,
        notes: `Barang Masuk Supplier #${poNumber} (${item.qty} ${item.unitName}) - HPP Baru: Rp ${newMovingAvgHpp.toLocaleString('id-ID')}`,
      });
    }
  }

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/restock');
  revalidatePath('/dashboard/products');
  return { success: true, poNumber };
}

/**
 * 4. Create Stock Opname (Penyesuaian Fisik vs Sistem)
 */
export async function createStockOpnameAction(input: CreateStockOpnameInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!user.outletId) throw new Error('Cabang aktif tidak ditemukan.');

  if (!input.items || input.items.length === 0) {
    throw new Error('Daftar barang opname tidak boleh kosong.');
  }

  const opnameId = createId();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const opnameNo = `OPN-${todayStr}-${randomSuffix}`;

  // 1. Insert Stock Opname Header
  await db.insert(stockOpnames).values({
    id: opnameId,
    tenantId: user.tenantId,
    outletId: user.outletId,
    userId: user.userId,
    opnameNo,
    notes: input.notes || null,
  });

  // 2. Process Opname Items & Adjust Stock
  for (const item of input.items) {
    const diffQty = item.physicalStock - item.systemStock;

    await db.insert(stockOpnameItems).values({
      id: createId(),
      opnameId,
      productId: item.productId,
      systemStock: item.systemStock,
      physicalStock: item.physicalStock,
      differenceQty: diffQty,
      reason: item.reason,
      notes: item.notes || null,
    });

    // Update Outlet Stock to exact physical stock
    await db
      .update(outletStock)
      .set({ currentStock: item.physicalStock })
      .where(
        and(
          eq(outletStock.productId, item.productId),
          eq(outletStock.outletId, user.outletId)
        )
      );

    // Record Stock Mutation
    await db.insert(stockMutations).values({
      id: createId(),
      tenantId: user.tenantId,
      outletId: user.outletId,
      productId: item.productId,
      type: diffQty >= 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
      qtyChange: diffQty,
      stockBefore: item.systemStock,
      stockAfter: item.physicalStock,
      referenceId: opnameNo,
      notes: `Stok Opname #${opnameNo} (Alasan: ${item.reason})`,
    });
  }

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/opname');
  revalidatePath('/dashboard/products');
  return { success: true, opnameNo };
}

/**
 * 5. Fetch Recent Purchase Orders
 */
export async function getPurchaseOrdersAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select({
      po: purchaseOrders,
      supplierName: suppliers.name,
    })
    .from(purchaseOrders)
    .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
    .where(eq(purchaseOrders.tenantId, user.tenantId))
    .orderBy(desc(purchaseOrders.receivedAt))
    .limit(30);
}

/**
 * 6. Fetch Stock Mutations (Kartu Stok)
 */
export async function getStockMutationsAction(productId?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const conditions = [eq(stockMutations.tenantId, user.tenantId)];
  if (productId) {
    conditions.push(eq(stockMutations.productId, productId));
  }

  return db
    .select({
      mutation: stockMutations,
      productName: products.name,
      baseUnit: products.baseUnit,
    })
    .from(stockMutations)
    .leftJoin(products, eq(stockMutations.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(stockMutations.createdAt))
    .limit(50);
}

/**
 * 7. Fetch Inventory Summary (Total Asset Value & Low Stock Count)
 */
export async function getInventorySummaryAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const prods = await db
    .select({
      product: products,
      stock: outletStock.currentStock,
    })
    .from(products)
    .leftJoin(
      outletStock,
      and(
        eq(outletStock.productId, products.id),
        user.outletId ? eq(outletStock.outletId, user.outletId) : sql`1=1`
      )
    )
    .where(and(eq(products.tenantId, user.tenantId), eq(products.isActive, true)));

  let totalAssetValue = 0;
  let lowStockCount = 0;
  let totalItemsCount = prods.length;

  for (const item of prods) {
    const stock = item.stock || 0;
    const hpp = item.product.costPrice || 0;
    totalAssetValue += stock * hpp;

    if (stock <= (item.product.minStockAlert || 5)) {
      lowStockCount += 1;
    }
  }

  return {
    totalAssetValue,
    lowStockCount,
    totalItemsCount,
  };
}
