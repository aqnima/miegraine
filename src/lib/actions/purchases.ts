'use server';

import { db } from '@/lib/db';
import {
  suppliers,
  purchases,
  purchaseItems,
  products,
  outletStock,
  users,
  outlets,
  auditLogs,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  batchNumber?: string;
  expiredDate?: string;
}

/**
 * 1. Fetch All Suppliers for Current Tenant
 */
export async function getSuppliersAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const list = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.tenantId, user.tenantId))
    .orderBy(desc(suppliers.createdAt));

  return list;
}

/**
 * 2. Create New Supplier
 */
export async function createSupplierAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'cashier') throw new Error('Hanya Owner dan Admin yang dapat mengelola supplier.');

  const name = formData.get('name') as string;
  const contactPerson = (formData.get('contactPerson') as string) || null;
  const phone = (formData.get('phone') as string) || null;
  const address = (formData.get('address') as string) || null;
  const email = (formData.get('email') as string) || null;

  if (!name || name.trim() === '') {
    throw new Error('Nama supplier wajib diisi.');
  }

  const supplierId = nanoid();
  await db.insert(suppliers).values({
    id: supplierId,
    tenantId: user.tenantId,
    name: name.trim(),
    contactPerson,
    phone,
    address,
    email,
    createdAt: new Date(),
  });

  revalidatePath('/dashboard/purchases');
  revalidatePath('/dashboard/suppliers');
  return { success: true, id: supplierId };
}

/**
 * 2b. Update Supplier
 */
export async function updateSupplierAction(
  id: string,
  data: {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    address?: string | null;
    email?: string | null;
  }
) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'cashier') throw new Error('Hanya Owner dan Admin yang dapat mengelola supplier.');

  if (!data.name || data.name.trim() === '') {
    throw new Error('Nama supplier wajib diisi.');
  }

  await db
    .update(suppliers)
    .set({
      name: data.name.trim(),
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      address: data.address || null,
      email: data.email || null,
    })
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, user.tenantId)));

  revalidatePath('/dashboard/purchases');
  return { success: true };
}

/**
 * 2c. Delete Supplier
 */
export async function deleteSupplierAction(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'cashier') throw new Error('Hanya Owner dan Admin yang dapat mengelola supplier.');

  await db
    .delete(suppliers)
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, user.tenantId)));

  revalidatePath('/dashboard/purchases');
  return { success: true };
}

/**
 * 3. Fetch All Purchase Invoices
 */
export async function getPurchasesAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const allPurchases = await db
    .select({
      id: purchases.id,
      invoiceNo: purchases.invoiceNo,
      supplierId: purchases.supplierId,
      supplierName: purchases.supplierName,
      purchaseDate: purchases.purchaseDate,
      totalAmount: purchases.totalAmount,
      paymentStatus: purchases.paymentStatus,
      paymentMethod: purchases.paymentMethod,
      paidAmount: purchases.paidAmount,
      dueDays: purchases.dueDays,
      notes: purchases.notes,
      createdAt: purchases.createdAt,
      creatorName: users.name,
      outletName: outlets.name,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.createdById, users.id))
    .leftJoin(outlets, eq(purchases.outletId, outlets.id))
    .where(eq(purchases.tenantId, user.tenantId))
    .orderBy(desc(purchases.purchaseDate));

  // Enrich with items
  const enriched = await Promise.all(
    allPurchases.map(async (p) => {
      const items = await db
        .select()
        .from(purchaseItems)
        .where(eq(purchaseItems.purchaseId, p.id));

      return {
        ...p,
        items,
        totalItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    })
  );

  return enriched;
}

/**
 * 4. Create New Purchase (Kulakan Barang Masuk)
 */
export async function createPurchaseAction(payload: {
  supplierId?: string;
  supplierName: string;
  invoiceNo: string;
  purchaseDate: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'TEMPO';
  paymentStatus: 'PAID' | 'DUE' | 'PARTIAL';
  paidAmount: number;
  dueDays?: number;
  notes?: string;
  items: PurchaseItemPayload[];
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'cashier') throw new Error('Hanya Owner dan Admin yang dapat mencatat pembelian kulakan.');

  if (!payload.items || payload.items.length === 0) {
    throw new Error('Minimal harus ada 1 item barang yang dibeli.');
  }

  const purchaseId = nanoid();
  const outletId = user.outletId;
  if (!outletId) throw new Error('Outlet aktif tidak valid.');

  let totalAmount = 0;
  const itemRecords: {
    id: string;
    purchaseId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    batchNumber?: string;
    expiredDate?: Date;
  }[] = [];

  for (const item of payload.items) {
    if (item.quantity <= 0 || item.unitPrice < 0) continue;

    const prod = await db
      .select()
      .from(products)
      .where(and(eq(products.id, item.productId), eq(products.tenantId, user.tenantId)))
      .limit(1);

    if (prod.length === 0) continue;

    const subtotal = item.quantity * item.unitPrice;
    totalAmount += subtotal;

    // 1. Update Product costPrice (HPP) in Master
    await db
      .update(products)
      .set({
        costPrice: item.unitPrice,
      })
      .where(eq(products.id, item.productId));

    // 2. Increase Stock at Current Active Outlet
    const existingStock = await db
      .select()
      .from(outletStock)
      .where(
        and(
          eq(outletStock.outletId, outletId),
          eq(outletStock.productId, item.productId)
        )
      )
      .limit(1);

    if (existingStock.length > 0) {
      await db
        .update(outletStock)
        .set({
          currentStock: existingStock[0].currentStock + item.quantity,
        })
        .where(
          and(
            eq(outletStock.outletId, outletId),
            eq(outletStock.productId, item.productId)
          )
        );
    } else {
      await db.insert(outletStock).values({
        id: nanoid(),
        tenantId: user.tenantId,
        outletId,
        productId: item.productId,
        currentStock: item.quantity,
      });
    }

    itemRecords.push({
      id: nanoid(),
      purchaseId,
      productId: item.productId,
      productName: prod[0].name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal,
      batchNumber: item.batchNumber || undefined,
      expiredDate: item.expiredDate ? new Date(item.expiredDate) : undefined,
    });
  }

  // Insert Purchase Header
  await db.insert(purchases).values({
    id: purchaseId,
    tenantId: user.tenantId,
    outletId,
    supplierId: payload.supplierId || null,
    supplierName: payload.supplierName,
    invoiceNo: payload.invoiceNo,
    purchaseDate: new Date(payload.purchaseDate),
    totalAmount,
    paymentStatus: payload.paymentStatus,
    paymentMethod: payload.paymentMethod,
    paidAmount: payload.paidAmount || (payload.paymentStatus === 'PAID' ? totalAmount : 0),
    dueDays: payload.dueDays || 0,
    notes: payload.notes || null,
    createdById: user.userId,
    createdAt: new Date(),
  });

  // Insert Purchase Items
  if (itemRecords.length > 0) {
    await db.insert(purchaseItems).values(itemRecords);
  }

  // Audit Log
  await db.insert(auditLogs).values({
    id: nanoid(),
    tenantId: user.tenantId,
    outletId,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    action: 'PURCHASE_ORDER_RECORDED',
    resourceType: 'PURCHASE',
    resourceId: purchaseId,
    newData: JSON.stringify({ invoiceNo: payload.invoiceNo, totalAmount, itemsCount: itemRecords.length }),
    reason: `Catat faktur pembelian masuk ${payload.invoiceNo} dari ${payload.supplierName}`,
  });

  revalidatePath('/dashboard/purchases');
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/reports');
  return { success: true, purchaseId };
}
