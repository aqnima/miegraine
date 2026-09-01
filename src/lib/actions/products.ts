'use server';

import { db } from '@/lib/db';
import {
  products,
  categories,
  productUnits,
  productPriceTiers,
  outletStock,
  stockMutations,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, like, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ProductUnitInput {
  unitName: string;
  conversionQty: number;
  barcode?: string;
  price: number;
  grosirPrice?: number;
  minGrosirQty?: number;
}

export interface CreateProductInput {
  name: string;
  categoryId?: string;
  barcode?: string;
  baseUnit: string;
  costPrice: number;
  sellingPrice: number;
  grosirPrice?: number;
  minGrosirQty?: number;
  initialStock?: number;
  minStockAlert?: number;
  hasImei?: boolean;
  units?: ProductUnitInput[];
}

/**
 * 1. Fetch All Products with Units, Tier Prices, and Stock per Outlet
 */
export async function getProductsAction(searchQuery?: string, categoryId?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const conditions = [
    eq(products.tenantId, user.tenantId),
    eq(products.isActive, true),
  ];

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  const rawProducts = await db
    .select({
      product: products,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  // Filter search in-memory or query
  const filtered = searchQuery
    ? rawProducts.filter(
        (p) =>
          p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.product.barcode && p.product.barcode.includes(searchQuery))
      )
    : rawProducts;

  // Enrich with units, price tiers, and stock
  const enrichedProducts = await Promise.all(
    filtered.map(async ({ product, categoryName }) => {
      const units = await db
        .select()
        .from(productUnits)
        .where(eq(productUnits.productId, product.id));

      const priceTiers = await db
        .select()
        .from(productPriceTiers)
        .where(eq(productPriceTiers.productId, product.id));

      // Get outlet stock for current user's outlet
      const stock = user.outletId
        ? await db
            .select()
            .from(outletStock)
            .where(
              and(
                eq(outletStock.productId, product.id),
                eq(outletStock.outletId, user.outletId)
              )
            )
            .limit(1)
        : [];

      return {
        ...product,
        categoryName: categoryName || 'Tanpa Kategori',
        stock: stock[0]?.currentStock || 0,
        units,
        priceTiers,
      };
    })
  );

  // Sort A-Z case-insensitively (handles uppercase & lowercase seamlessly)
  enrichedProducts.sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base', numeric: true })
  );

  return enrichedProducts;
}

/**
 * 2. Fetch All Categories for Current Tenant
 */
export async function getCategoriesAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, user.tenantId));
}

/**
 * 3. Create a New Category
 */
export async function createCategoryAction(name: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const id = createId();
  await db.insert(categories).values({
    id,
    tenantId: user.tenantId,
    name: name.trim(),
  });

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/pos');
  return { success: true, id };
}

/**
 * 3b. Update an Existing Category
 */
export async function updateCategoryAction(id: string, name: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const trimmed = name.trim();
  if (!trimmed) throw new Error('Nama kategori tidak boleh kosong.');

  await db
    .update(categories)
    .set({ name: trimmed })
    .where(
      and(
        eq(categories.id, id),
        eq(categories.tenantId, user.tenantId)
      )
    );

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/pos');
  return { success: true };
}

/**
 * 3c. Delete a Category
 */
export async function deleteCategoryAction(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Unset category from existing products
  await db
    .update(products)
    .set({ categoryId: null })
    .where(
      and(
        eq(products.categoryId, id),
        eq(products.tenantId, user.tenantId)
      )
    );

  // 2. Delete the category
  await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, id),
        eq(categories.tenantId, user.tenantId)
      )
    );

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/pos');
  return { success: true };
}

/**
 * 4. Create Product with Multi-Satuan and Base Unit Rule
 */
export async function createProductAction(input: CreateProductInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const productId = createId();
  const initialStock = Number(input.initialStock) || 0;
  const costPrice = Number(input.costPrice) || 0;
  const sellingPrice = Number(input.sellingPrice) || 0;
  const minStockAlert = Number(input.minStockAlert) || 5;

  // 1. Insert Base Product
  await db.insert(products).values({
    id: productId,
    tenantId: user.tenantId,
    categoryId: input.categoryId || null,
    name: input.name.trim(),
    barcode: input.barcode?.trim() || null,
    baseUnit: input.baseUnit.trim().toLowerCase(),
    costPrice,
    minStockAlert,
    hasImei: input.hasImei || false,
    isActive: true,
  });

  // 2. Insert Base Unit Price Tier (Eceran)
  await db.insert(productPriceTiers).values({
    id: createId(),
    tenantId: user.tenantId,
    productId,
    productUnitId: null, // null = Base Unit
    tierName: 'ecer',
    minQty: 1,
    price: sellingPrice,
  });

  // 3. Insert Base Unit Grosir Tier (Optional)
  if (input.grosirPrice && input.minGrosirQty && input.minGrosirQty > 1) {
    await db.insert(productPriceTiers).values({
      id: createId(),
      tenantId: user.tenantId,
      productId,
      productUnitId: null,
      tierName: 'grosir',
      minQty: Number(input.minGrosirQty),
      price: Number(input.grosirPrice),
    });
  }

  // 4. Insert Multi-Satuan (Units) and their respective price tiers
  if (input.units && input.units.length > 0) {
    for (const unit of input.units) {
      if (!unit.unitName || !unit.conversionQty) continue;

      const unitId = createId();
      await db.insert(productUnits).values({
        id: unitId,
        tenantId: user.tenantId,
        productId,
        unitName: unit.unitName.trim().toLowerCase(),
        conversionQty: Number(unit.conversionQty),
        barcode: unit.barcode?.trim() || null,
      });

      // Price for this multi-unit
      await db.insert(productPriceTiers).values({
        id: createId(),
        tenantId: user.tenantId,
        productId,
        productUnitId: unitId,
        tierName: 'ecer',
        minQty: 1,
        price: Number(unit.price),
      });

      if (unit.grosirPrice && unit.minGrosirQty && unit.minGrosirQty > 1) {
        await db.insert(productPriceTiers).values({
          id: createId(),
          tenantId: user.tenantId,
          productId,
          productUnitId: unitId,
          tierName: 'grosir',
          minQty: Number(unit.minGrosirQty),
          price: Number(unit.grosirPrice),
        });
      }
    }
  }

  // 5. Initialize Stock in Outlet (Always stored in Base Unit)
  if (user.outletId) {
    await db.insert(outletStock).values({
      id: createId(),
      tenantId: user.tenantId,
      outletId: user.outletId,
      productId,
      currentStock: initialStock,
    });

    // Record initial stock mutation
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
        notes: 'Stok awal pendaftaran master barang',
      });
    }
  }

  revalidatePath('/dashboard/products');
  return { success: true, productId };
}

/**
 * 5. Delete / Deactivate Product
 */
export async function deleteProductAction(productId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await db
    .update(products)
    .set({ isActive: false })
    .where(and(eq(products.id, productId), eq(products.tenantId, user.tenantId)));

  revalidatePath('/dashboard/products');
  return { success: true };
}
