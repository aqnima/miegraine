'use server';

import { db } from '@/lib/db';
import {
  customers,
  debtPayments,
  transactions,
  transactionItems,
  users,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreateDebtPaymentInput {
  customerId: string;
  transactionId?: string;
  amountPaid: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'QRIS';
  notes?: string;
}

/**
 * 1. Fetch Debts Executive Summary
 */
export async function getDebtsSummaryAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const allCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, user.tenantId));

  let totalActiveDebt = 0;
  let debtorsCount = 0;
  let overLimitCount = 0;

  for (const c of allCustomers) {
    const debt = c.currentDebt || 0;
    if (debt > 0) {
      totalActiveDebt += debt;
      debtorsCount += 1;

      if (c.debtLimit && c.debtLimit > 0 && debt > c.debtLimit) {
        overLimitCount += 1;
      }
    }
  }

  return {
    totalActiveDebt,
    debtorsCount,
    overLimitCount,
    totalCustomers: allCustomers.length,
  };
}

/**
 * 2. Fetch Customers with Debts
 */
export async function getCustomersWithDebtsAction(searchQuery?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const all = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, user.tenantId))
    .orderBy(desc(customers.currentDebt));

  if (searchQuery) {
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery))
    );
  }

  return all;
}

/**
 * 3. Fetch Specific Customer Unpaid Transactions & Payment History
 */
export async function getCustomerDebtDetailsAction(customerId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Customer Profile
  const customer = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.tenantId, user.tenantId)))
    .limit(1);

  if (!customer[0]) throw new Error('Pelanggan tidak ditemukan.');

  // Unpaid Invoices
  const unpaidInvoices = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.customerId, customerId),
        eq(transactions.tenantId, user.tenantId),
        sql`${transactions.remainingDebt} > 0`
      )
    )
    .orderBy(desc(transactions.createdAt));

  // Payment History
  const payments = await db
    .select({
      payment: debtPayments,
      receiverName: users.name,
    })
    .from(debtPayments)
    .leftJoin(users, eq(debtPayments.userId, users.id))
    .where(and(eq(debtPayments.customerId, customerId), eq(debtPayments.tenantId, user.tenantId)))
    .orderBy(desc(debtPayments.createdAt))
    .limit(30);

  return {
    customer: customer[0],
    unpaidInvoices,
    payments,
  };
}

/**
 * 4. Process Debt Repayment / Installment (1-Click)
 */
export async function createDebtPaymentAction(input: CreateDebtPaymentInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const amountPaid = Number(input.amountPaid) || 0;
  if (amountPaid <= 0) {
    throw new Error('Nominal pembayaran cicilan harus lebih besar dari Rp 0.');
  }

  const paymentId = createId();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const receiptNo = `KW-${todayStr}-${randomSuffix}`;

  // 1. Insert Debt Payment Record
  await db.insert(debtPayments).values({
    id: paymentId,
    tenantId: user.tenantId,
    outletId: user.outletId || user.tenantId,
    customerId: input.customerId,
    userId: user.userId,
    amount: amountPaid,
    paymentMethod: input.paymentMethod,
    notes: input.notes || null,
  });

  // 2. Reduce Customer Total Debt
  await db
    .update(customers)
    .set({
      currentDebt: sql`MAX(0, ${customers.currentDebt} - ${amountPaid})`,
    })
    .where(and(eq(customers.id, input.customerId), eq(customers.tenantId, user.tenantId)));

  // 3. If tied to a specific transaction, reduce transaction remainingDebt
  if (input.transactionId) {
    const tx = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, input.transactionId),
          eq(transactions.tenantId, user.tenantId)
        )
      )
      .limit(1);

    if (tx[0]) {
      const newRemaining = Math.max(0, (tx[0].remainingDebt || 0) - amountPaid);
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIAL';

      await db
        .update(transactions)
        .set({
          remainingDebt: newRemaining,
          paymentStatus: newStatus,
        })
        .where(eq(transactions.id, input.transactionId));
    }
  }

  revalidatePath('/dashboard/debts');
  revalidatePath('/dashboard');

  return {
    success: true,
    receiptNo,
    amountPaid,
  };
}

/**
 * 5. Create Master Customer
 */
export async function createCustomerAction(
  name: string,
  phone?: string,
  address?: string,
  debtLimit?: number
) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const id = createId();
  await db.insert(customers).values({
    id,
    tenantId: user.tenantId,
    name: name.trim(),
    phone: phone?.trim() || null,
    address: address?.trim() || null,
    debtLimit: Number(debtLimit) || 0,
    currentDebt: 0,
  });

  revalidatePath('/dashboard/debts');
  return { success: true, id };
}
