'use server';

import { db } from '@/lib/db';
import {
  auditLogs,
  transactions,
  transactionItems,
  outletStock,
  stockMutations,
  users,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface LogAuditInput {
  action:
    | 'TRANSACTION_VOID'
    | 'MANUAL_DISCOUNT'
    | 'PRICE_OVERRIDE'
    | 'STOCK_ADJUSTMENT'
    | 'PRODUCT_PRICE_CHANGE'
    | 'SHIFT_DISCREPANCY'
    | 'DEBT_ADJUSTMENT';
  resourceType: 'TRANSACTION' | 'PRODUCT' | 'CUSTOMER_DEBT' | 'SHIFT' | 'INVENTORY';
  resourceId?: string;
  oldData?: any;
  newData?: any;
  reason?: string;
}

/**
 * 1. Log Audit Event (Immutable Audit Trail)
 */
export async function logAuditEventAction(input: LogAuditInput) {
  const user = await getSessionUser();
  if (!user) return;

  const id = createId();

  await db.insert(auditLogs).values({
    id,
    tenantId: user.tenantId,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    outletId: user.outletId || null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId || null,
    oldData: input.oldData ? JSON.stringify(input.oldData) : null,
    newData: input.newData ? JSON.stringify(input.newData) : null,
    reason: input.reason?.trim() || null,
  });
}

/**
 * 2. Fetch Audit Logs for Owner Dashboard
 */
export async function getAuditLogsAction(actionFilter?: string, limit: number = 50) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'owner' && user.role !== 'superadmin') {
    throw new Error('Hanya Pemilik Toko (Owner) yang berhak melihat Audit Log.');
  }

  const conditions = [eq(auditLogs.tenantId, user.tenantId)];
  if (actionFilter) {
    conditions.push(eq(auditLogs.action, actionFilter));
  }

  return db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * 3. Void Transaction with Audit Trail & Stock Return
 */
export async function voidTransactionAction(transactionId: string, reason: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  if (!reason || reason.trim().length < 5) {
    throw new Error('Alasan pembatalan struk (void) wajib diisi minimal 5 karakter.');
  }

  // 1. Get Transaction Details
  const txRecord = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.tenantId, user.tenantId)))
    .limit(1);

  if (!txRecord[0]) throw new Error('Transaksi tidak ditemukan.');
  const tx = txRecord[0];

  if (tx.paymentStatus === 'VOID') {
    throw new Error('Transaksi sudah berstatus batal (VOID) sebelumnya.');
  }

  // 2. Get Transaction Items to Return Physical Stock
  const items = await db
    .select()
    .from(transactionItems)
    .where(eq(transactionItems.transactionId, transactionId));

  for (const item of items) {
    const returnBaseQty = item.qty * item.conversionQty;

    // Return to Outlet Stock
    if (tx.outletId) {
      const stockRec = await db
        .select()
        .from(outletStock)
        .where(
          and(
            eq(outletStock.productId, item.productId),
            eq(outletStock.outletId, tx.outletId)
          )
        )
        .limit(1);

      const oldStock = stockRec[0]?.currentStock || 0;
      const newStock = oldStock + returnBaseQty;

      if (stockRec.length > 0) {
        await db
          .update(outletStock)
          .set({ currentStock: newStock })
          .where(eq(outletStock.id, stockRec[0].id));
      }

      // Record Stock Mutation (Return)
      await db.insert(stockMutations).values({
        id: createId(),
        tenantId: user.tenantId,
        outletId: tx.outletId,
        productId: item.productId,
        type: 'ADJUSTMENT_IN',
        qtyChange: returnBaseQty,
        stockBefore: oldStock,
        stockAfter: newStock,
        referenceId: tx.invoiceNo,
        notes: `Pengembalian stok dari Void Nota #${tx.invoiceNo} (${reason})`,
      });
    }
  }

  // 3. Update Transaction status to VOID
  await db
    .update(transactions)
    .set({
      paymentStatus: 'VOID',
      notes: sql`COALESCE(notes || ' | ', '') || 'DIBATALKAN (VOID): ' || ${reason}`,
    })
    .where(eq(transactions.id, transactionId));

  // 4. Log to Immutable Audit Trail
  await logAuditEventAction({
    action: 'TRANSACTION_VOID',
    resourceType: 'TRANSACTION',
    resourceId: transactionId,
    oldData: { invoiceNo: tx.invoiceNo, total: tx.total, itemsCount: items.length },
    newData: { status: 'VOID', reason },
    reason,
  });

  revalidatePath('/dashboard/pos');
  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard/audit');
  revalidatePath('/dashboard/inventory');

  return { success: true, invoiceNo: tx.invoiceNo };
}
