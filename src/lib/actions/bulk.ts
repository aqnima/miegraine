'use server';

import { db } from '@/lib/db';
import {
  products,
  categories,
  productUnits,
  productPriceTiers,
  outletStock,
  stockMutations,
  transactions,
  customers,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface BulkProductRow {
  barcode?: string;
  name: string;
  categoryName?: string;
  baseUnit: string;
  costPrice: number;
  sellingPrice: number;
  initialStock: number;
  extraUnitName?: string;
  extraUnitConversion?: number;
  extraUnitPrice?: number;
}

/**
 * 1. Bulk Import Products from Excel / CSV Array
 */
export async function bulkImportProductsAction(rows: BulkProductRow[]) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!user.outletId) throw new Error('Cabang aktif tidak ditemukan.');

  if (!rows || rows.length === 0) {
    throw new Error('Data import kosong.');
  }

  let importedCount = 0;

  for (const row of rows) {
    if (!row.name || !row.baseUnit || !row.sellingPrice) continue;

    const productId = createId();
    const baseUnit = row.baseUnit.trim().toLowerCase();
    const costPrice = Number(row.costPrice) || 0;
    const sellingPrice = Number(row.sellingPrice) || 0;
    const initialStock = Number(row.initialStock) || 0;

    // 1. Insert Base Product
    await db.insert(products).values({
      id: productId,
      tenantId: user.tenantId,
      name: row.name.trim(),
      barcode: row.barcode?.trim() || null,
      baseUnit,
      costPrice,
      minStockAlert: 5,
      isActive: true,
    });

    // 2. Insert Eceran Base Price Tier
    await db.insert(productPriceTiers).values({
      id: createId(),
      tenantId: user.tenantId,
      productId,
      productUnitId: null,
      tierName: 'ecer',
      minQty: 1,
      price: sellingPrice,
    });

    // 3. Optional Extra Unit (Satuan Bertingkat)
    if (row.extraUnitName && row.extraUnitConversion && row.extraUnitConversion > 1) {
      const unitId = createId();
      await db.insert(productUnits).values({
        id: unitId,
        tenantId: user.tenantId,
        productId,
        unitName: row.extraUnitName.trim().toLowerCase(),
        conversionQty: Number(row.extraUnitConversion),
      });

      await db.insert(productPriceTiers).values({
        id: createId(),
        tenantId: user.tenantId,
        productId,
        productUnitId: unitId,
        tierName: 'ecer',
        minQty: 1,
        price: Number(row.extraUnitPrice) || sellingPrice * Number(row.extraUnitConversion),
      });
    }

    // 4. Insert Initial Stock (Stored in Base Unit)
    await db.insert(outletStock).values({
      id: createId(),
      tenantId: user.tenantId,
      outletId: user.outletId,
      productId,
      currentStock: initialStock,
    });

    if (initialStock > 0) {
      await db.insert(stockMutations).values({
        id: createId(),
        tenantId: user.tenantId,
        outletId: user.outletId,
        productId,
        type: 'ADJUSTMENT',
        qtyChange: initialStock,
        stockBefore: 0,
        stockAfter: initialStock,
        notes: 'Bulk Import Excel Stok Awal',
      });
    }

    importedCount += 1;
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard');

  return { success: true, count: importedCount };
}

/**
 * 2. Export Products Data (For CSV / Excel generation)
 */
export async function exportProductsAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select({
      id: products.id,
      name: products.name,
      barcode: products.barcode,
      baseUnit: products.baseUnit,
      costPrice: products.costPrice,
      minStockAlert: products.minStockAlert,
    })
    .from(products)
    .where(and(eq(products.tenantId, user.tenantId), eq(products.isActive, true)))
    .orderBy(products.name);
}

/**
 * 3. Export Transactions History
 */
export async function exportTransactionsAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.tenantId, user.tenantId))
    .orderBy(desc(transactions.createdAt))
    .limit(500);
}
