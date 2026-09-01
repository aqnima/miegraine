'use server';

import { db } from '@/lib/db';
import {
  transactions,
  transactionItems,
  customers,
  outletStock,
  stockMutations,
  products,
  tenants,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CartItemInput {
  productId: string;
  name: string;
  unitName: string;
  conversionQty: number;
  qty: number;
  pricePerUnit: number;
  costPrice: number;
  subtotal: number;
  imei?: string;
}

export interface CheckoutInput {
  customerId?: string;
  items: CartItemInput[];
  discount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBT' | 'DP';
  paidAmount: number;
  notes?: string;
}

/**
 * 1. Process Checkout & Record Transaction in D1 Database
 */
export async function createTransactionAction(input: CheckoutInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!user.outletId) throw new Error('Kasir harus terhubung ke cabang toko.');

  // Check Tenant Subscription Status
  const currentTenant = await db
    .select({
      status: tenants.subscriptionStatus,
      expiresAt: tenants.subscriptionExpiresAt,
    })
    .from(tenants)
    .where(eq(tenants.id, user.tenantId))
    .limit(1);

  if (currentTenant[0]?.status === 'suspended') {
    throw new Error('Akses transaksi dibekukan: Masa sewa toko telah dinonaktifkan. Silakan hubungi Superadmin.');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('Keranjang belanja kosong.');
  }


  const transactionId = createId();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV-${todayStr}-${randomSuffix}`;

  const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Number(input.discount) || 0;
  const total = Math.max(0, subtotal - discount);
  const paidAmount = Number(input.paidAmount) || 0;
  const changeAmount = paidAmount >= total ? paidAmount - total : 0;
  const remainingDebt = total > paidAmount ? total - paidAmount : 0;

  const paymentStatus =
    remainingDebt === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID';

  // 1. Insert Transaction Record
  await db.insert(transactions).values({
    id: transactionId,
    tenantId: user.tenantId,
    outletId: user.outletId,
    userId: user.userId,
    customerId: input.customerId || null,
    invoiceNo,
    subtotal,
    discount,
    total,
    paidAmount,
    changeAmount,
    remainingDebt,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    notes: input.notes || null,
  });

  // 2. Process Items, Deduct Stock (Base Unit Rule), and Log Mutations
  for (const item of input.items) {
    await db.insert(transactionItems).values({
      id: createId(),
      transactionId,
      productId: item.productId,
      unitName: item.unitName,
      conversionQty: item.conversionQty,
      qty: item.qty,
      pricePerUnit: item.pricePerUnit,
      costPrice: item.costPrice,
      subtotal: item.subtotal,
      imeiList: item.imei || null,
    });

    // Base Unit Deduction: total physical base units = qty * conversionQty
    const baseQtyDeduction = item.qty * item.conversionQty;

    // Get current stock
    const currentStockRecord = await db
      .select()
      .from(outletStock)
      .where(
        and(
          eq(outletStock.productId, item.productId),
          eq(outletStock.outletId, user.outletId)
        )
      )
      .limit(1);

    const oldStock = currentStockRecord[0]?.currentStock || 0;
    const newStock = oldStock - baseQtyDeduction;

    if (currentStockRecord.length > 0) {
      await db
        .update(outletStock)
        .set({ currentStock: newStock })
        .where(eq(outletStock.id, currentStockRecord[0].id));
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
      type: 'SALE',
      qtyChange: -baseQtyDeduction,
      stockBefore: oldStock,
      stockAfter: newStock,
      referenceId: invoiceNo,
      notes: `Penjualan kasir #${invoiceNo} (${item.qty} ${item.unitName})`,
    });
  }

  // 3. Update Customer Debt if any remaining debt (DP or Full Debt)
  if (remainingDebt > 0 && input.customerId) {
    await db
      .update(customers)
      .set({
        currentDebt: sql`${customers.currentDebt} + ${remainingDebt}`,
      })
      .where(
        and(
          eq(customers.id, input.customerId),
          eq(customers.tenantId, user.tenantId)
        )
      );
  }

  revalidatePath('/dashboard/pos');
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');

  return {
    success: true,
    invoiceNo,
    transactionId,
    total,
    paidAmount,
    changeAmount,
    remainingDebt,
  };
}

/**
 * 2. Fetch Customers for POS selection
 */
export async function getCustomersAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, user.tenantId));
}

/**
 * 3. Quick Add Customer from POS Modal
 */
export async function createCustomerQuickAction(name: string, phone?: string, debtLimit?: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const id = createId();
  await db.insert(customers).values({
    id,
    tenantId: user.tenantId,
    name: name.trim(),
    phone: phone?.trim() || null,
    debtLimit: Number(debtLimit) || 0,
    currentDebt: 0,
  });

  return { success: true, id, name };
}
