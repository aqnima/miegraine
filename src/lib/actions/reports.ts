'use server';

import { db } from '@/lib/db';
import {
  transactions,
  transactionItems,
  cashFlows,
  cashShifts,
  products,
  outletStock,
  users,
  customers,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreateExpenseInput {
  category: string;
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  description?: string;
}

/**
 * 1. Calculate Realtime Profit & Loss Summary (Omzet, HPP, Laba Kotor, Biaya, Laba Bersih)
 */
export async function getProfitLossSummaryAction(
  period: 'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom' = 'month',
  customStart?: string,
  customEnd?: string
) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  const now = new Date();

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === '7days') {
    startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (period === 'custom' && customStart && customEnd) {
    startDate = new Date(`${customStart}T00:00:00`);
    endDate = new Date(`${customEnd}T23:59:59.999`);
  }

  // 1. Transactions with date filter
  const txConditions = [eq(transactions.tenantId, user.tenantId)];
  if (startDate) txConditions.push(gte(transactions.createdAt, startDate));
  if (endDate) txConditions.push(lte(transactions.createdAt, endDate));

  const txList = await db
    .select({
      total: transactions.total,
      discount: transactions.discount,
      id: transactions.id,
    })
    .from(transactions)
    .where(and(...txConditions));

  const totalOmzet = txList.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalDiskon = txList.reduce((sum, t) => sum + (t.discount || 0), 0);

  // 2. Total HPP from Transaction Items
  const items = await db
    .select({
      costPrice: transactionItems.costPrice,
      qty: transactionItems.qty,
      conversionQty: transactionItems.conversionQty,
    })
    .from(transactionItems)
    .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
    .where(and(...txConditions));

  const totalHpp = items.reduce(
    (sum, i) => sum + (i.costPrice || 0) * (i.qty || 0) * (i.conversionQty || 1),
    0
  );

  const labaKotor = Math.max(0, totalOmzet - totalHpp);

  // 3. Operational Expenses with date filter
  const expConditions = [
    eq(cashFlows.tenantId, user.tenantId),
    eq(cashFlows.type, 'OUT'),
  ];
  if (startDate) expConditions.push(gte(cashFlows.createdAt, startDate));
  if (endDate) expConditions.push(lte(cashFlows.createdAt, endDate));

  const expenses = await db
    .select()
    .from(cashFlows)
    .where(and(...expConditions));

  const totalBebanOperasional = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const labaBersih = labaKotor - totalBebanOperasional;

  const grossMargin = totalOmzet > 0 ? ((labaKotor / totalOmzet) * 100).toFixed(1) : '0';
  const netMargin = totalOmzet > 0 ? ((labaBersih / totalOmzet) * 100).toFixed(1) : '0';

  // 4. Breakdown expenses by category
  const categoryMap: Record<string, number> = {};
  for (const exp of expenses) {
    const cat = exp.category || 'Lain-lain';
    categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amount || 0);
  }

  const expenseBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalBebanOperasional > 0
          ? Number(((amount / totalBebanOperasional) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalOmzet,
    totalDiskon,
    totalHpp,
    labaKotor,
    totalBebanOperasional,
    labaBersih,
    grossMargin,
    netMargin,
    totalTransactions: txList.length,
    expenseBreakdown,
  };
}

/**
 * 2. Record Operational Expense (Kas Keluar)
 */
export async function createExpenseAction(input: CreateExpenseInput) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const amount = Number(input.amount) || 0;
  if (amount <= 0) throw new Error('Nominal biaya operasional harus lebih dari Rp 0.');

  const id = createId();

  await db.insert(cashFlows).values({
    id,
    tenantId: user.tenantId,
    outletId: user.outletId || user.tenantId,
    type: 'OUT',
    category: input.category.trim(),
    amount,
    description: input.description?.trim() || null,
  });

  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard');
  return { success: true, id };
}

/**
 * 3. Fetch Top Selling Products
 */
export async function getTopSellingProductsAction(limit: number = 5) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select({
      productId: transactionItems.productId,
      unitName: transactionItems.unitName,
      totalQty: sql<number>`SUM(${transactionItems.qty})`,
      totalRevenue: sql<number>`SUM(${transactionItems.subtotal})`,
      productName: products.name,
      baseUnit: products.baseUnit,
    })
    .from(transactionItems)
    .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
    .leftJoin(products, eq(transactionItems.productId, products.id))
    .where(eq(transactions.tenantId, user.tenantId))
    .groupBy(transactionItems.productId)
    .orderBy(desc(sql`SUM(${transactionItems.qty})`))
    .limit(limit);
}

/**
 * 4. Fetch Active Cash Shift for Current User
 */
export async function getActiveCashShiftAction() {
  const user = await getSessionUser();
  if (!user || !user.outletId) return null;

  const shift = await db
    .select()
    .from(cashShifts)
    .where(
      and(
        eq(cashShifts.tenantId, user.tenantId),
        eq(cashShifts.userId, user.userId),
        eq(cashShifts.outletId, user.outletId),
        eq(cashShifts.status, 'OPEN')
      )
    )
    .orderBy(desc(cashShifts.openedAt))
    .limit(1);

  return shift[0] || null;
}

/**
 * 5. Open Cashier Shift (Input Modal Awal Laci)
 */
export async function openCashShiftAction(startingCash: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!user.outletId) throw new Error('Cabang aktif tidak ditemukan.');

  // Check if already open
  const existing = await getActiveCashShiftAction();
  if (existing) throw new Error('Shift kasir masih aktif.');

  const shiftId = createId();
  const startCash = Number(startingCash) || 0;

  await db.insert(cashShifts).values({
    id: shiftId,
    tenantId: user.tenantId,
    outletId: user.outletId,
    userId: user.userId,
    startingCash: startCash,
    expectedCash: startCash,
    actualCash: null,
    discrepancy: 0,
    status: 'OPEN',
  });

  revalidatePath('/dashboard/pos');
  return { success: true, shiftId };
}

/**
 * 6. Close Cashier Shift (Blind Cash Count & Reconciliation)
 */
export async function closeCashShiftBlindAction(
  actualCashCount: number,
  notes?: string
) {
  const user = await getSessionUser();
  if (!user || !user.outletId) throw new Error('Unauthorized');

  const activeShift = await getActiveCashShiftAction();
  if (!activeShift) throw new Error('Tidak ada shift aktif yang perlu ditutup.');

  const actualCash = Number(actualCashCount) || 0;

  // Calculate Cash Sales during this shift
  const cashSales = await db
    .select({
      totalPaid: sql<number>`SUM(${transactions.paidAmount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.tenantId, user.tenantId),
        eq(transactions.userId, user.userId),
        eq(transactions.outletId, user.outletId),
        eq(transactions.paymentMethod, 'CASH'),
        gte(transactions.createdAt, activeShift.openedAt!)
      )
    );

  const totalCashSales = cashSales[0]?.totalPaid || 0;
  const expectedCash = (activeShift.startingCash || 0) + totalCashSales;
  const discrepancy = actualCash - expectedCash;

  // Update Shift to CLOSED
  await db
    .update(cashShifts)
    .set({
      expectedCash,
      actualCash,
      discrepancy,
      status: 'CLOSED',
      closedAt: new Date(),
    })
    .where(eq(cashShifts.id, activeShift.id));

  revalidatePath('/dashboard/pos');
  revalidatePath('/dashboard/reports');
  revalidatePath('/dashboard');

  return {
    success: true,
    startingCash: activeShift.startingCash,
    totalCashSales,
    expectedCash,
    actualCash,
    difference: discrepancy,
    isBalanced: discrepancy === 0,
  };
}

/**
 * 7. Fetch Sales Breakdown by Payment Method & Cashier
 */
export async function getSalesReportBreakdownAction(
  period: 'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom' = 'month',
  customStart?: string,
  customEnd?: string
) {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    const now = new Date();

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === '7days') {
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(`${customStart}T00:00:00`);
      endDate = new Date(`${customEnd}T23:59:59.999`);
    }

    const txConditions = [eq(transactions.tenantId, user.tenantId)];
    if (startDate) txConditions.push(gte(transactions.createdAt, startDate));
    if (endDate) txConditions.push(lte(transactions.createdAt, endDate));

    // 1. Fetch raw transactions
    const rawTransactions = await db
      .select({
        id: transactions.id,
        invoiceNo: transactions.invoiceNo,
        subtotal: transactions.subtotal,
        discount: transactions.discount,
        total: transactions.total,
        paidAmount: transactions.paidAmount,
        changeAmount: transactions.changeAmount,
        remainingDebt: transactions.remainingDebt,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        userId: transactions.userId,
        cashierName: users.name,
        customerName: customers.name,
        customerPhone: customers.phone,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .where(and(...txConditions))
      .orderBy(desc(transactions.createdAt))
      .limit(200);

    // 2. Aggregate by payment and by cashier safely in JS
    const paymentMap: Record<string, { totalAmount: number; count: number }> = {};
    const cashierMap: Record<string, { userId: string; userName: string; totalAmount: number; count: number }> = {};

    for (const tx of rawTransactions) {
      const pm = String(tx.paymentMethod || 'CASH');
      if (!paymentMap[pm]) {
        paymentMap[pm] = { totalAmount: 0, count: 0 };
      }
      paymentMap[pm].totalAmount += Number(tx.total) || 0;
      paymentMap[pm].count += 1;

      const cId = String(tx.userId || 'unknown');
      const cName = String(tx.cashierName || 'Kasir Toko');
      if (!cashierMap[cId]) {
        cashierMap[cId] = { userId: cId, userName: cName, totalAmount: 0, count: 0 };
      }
      cashierMap[cId].totalAmount += Number(tx.total) || 0;
      cashierMap[cId].count += 1;
    }

    const byPayment = Object.keys(paymentMap).map((key) => ({
      paymentMethod: key,
      totalAmount: paymentMap[key].totalAmount,
      count: paymentMap[key].count,
    }));

    const byCashier = Object.values(cashierMap);

    // 3. Transactions List
    const transactionsList = rawTransactions.map((tx) => ({
      id: String(tx.id),
      invoiceNo: String(tx.invoiceNo),
      subtotal: Number(tx.subtotal) || 0,
      discount: Number(tx.discount) || 0,
      total: Number(tx.total) || 0,
      paidAmount: Number(tx.paidAmount) || 0,
      changeAmount: Number(tx.changeAmount) || 0,
      remainingDebt: Number(tx.remainingDebt) || 0,
      paymentMethod: String(tx.paymentMethod || 'CASH'),
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
      userId: String(tx.userId || ''),
      cashierName: String(tx.cashierName || 'Kasir'),
      customerName: String(tx.customerName || 'Umum (Walk-in)'),
      customerPhone: String(tx.customerPhone || ''),
    }));

    return {
      byPayment,
      byCashier,
      transactionsList,
    };
  } catch (err) {
    console.error('Error in getSalesReportBreakdownAction:', err);
    return {
      byPayment: [],
      byCashier: [],
      transactionsList: [],
    };
  }
}

/**
 * 7b. Fetch Single Transaction Details with Items
 */
export async function getTransactionDetailAction(transactionId: string) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const tx = await db
      .select({
        id: transactions.id,
        invoiceNo: transactions.invoiceNo,
        subtotal: transactions.subtotal,
        discount: transactions.discount,
        total: transactions.total,
        paidAmount: transactions.paidAmount,
        changeAmount: transactions.changeAmount,
        remainingDebt: transactions.remainingDebt,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        customerName: customers.name,
        customerPhone: customers.phone,
        cashierName: users.name,
      })
      .from(transactions)
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(and(eq(transactions.id, transactionId), eq(transactions.tenantId, user.tenantId)))
      .limit(1);

    if (!tx || !tx[0]) {
      return { success: false, error: 'Transaksi tidak ditemukan' };
    }

    const rawItems = await db
      .select({
        id: transactionItems.id,
        productId: transactionItems.productId,
        unitName: transactionItems.unitName,
        qty: transactionItems.qty,
        pricePerUnit: transactionItems.pricePerUnit,
        subtotal: transactionItems.subtotal,
        productName: products.name,
        productBarcode: products.barcode,
      })
      .from(transactionItems)
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(eq(transactionItems.transactionId, transactionId));

    const items = (rawItems || []).map((item) => ({
      id: String(item.id || ''),
      productName: String(item.productName || 'Produk Toko'),
      productSku: String(item.productBarcode || ''),
      unitName: String(item.unitName || 'pcs'),
      qty: Number(item.qty) || 0,
      price: Number(item.pricePerUnit) || 0,
      subtotal: Number(item.subtotal) || 0,
    }));

    const transactionRecord = {
      id: String(tx[0].id || ''),
      invoiceNo: String(tx[0].invoiceNo || ''),
      subtotal: Number(tx[0].subtotal) || 0,
      discount: Number(tx[0].discount) || 0,
      total: Number(tx[0].total) || 0,
      paidAmount: Number(tx[0].paidAmount) || 0,
      changeAmount: Number(tx[0].changeAmount) || 0,
      remainingDebt: Number(tx[0].remainingDebt) || 0,
      paymentMethod: String(tx[0].paymentMethod || 'CASH'),
      createdAt: tx[0].createdAt ? new Date(tx[0].createdAt).toISOString() : new Date().toISOString(),
      customerName: String(tx[0].customerName || 'Umum (Walk-in)'),
      customerPhone: String(tx[0].customerPhone || ''),
      cashierName: String(tx[0].cashierName || 'Kasir'),
    };

    return {
      success: true,
      transaction: transactionRecord,
      items,
    };
  } catch (err: any) {
    console.error('Error in getTransactionDetailAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memuat detail transaksi',
    };
  }
}

/**
 * 8. Fetch Inventory Valuation (Nilai Aset Modal vs Potensi Omzet)
 */
export async function getInventoryValuationAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const prods = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.tenantId, user.tenantId));

  const stockItems = await db
    .select({
      productId: outletStock.productId,
      currentStock: outletStock.currentStock,
      costPrice: products.costPrice,
      productName: products.name,
      baseUnit: products.baseUnit,
    })
    .from(outletStock)
    .innerJoin(products, eq(outletStock.productId, products.id))
    .where(eq(outletStock.tenantId, user.tenantId));

  const totalStockQty = stockItems.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const totalAssetCostValue = stockItems.reduce(
    (sum, item) => sum + (item.currentStock || 0) * (item.costPrice || 0),
    0
  );

  return {
    totalProductsCount: prods.length,
    totalStockQty,
    totalAssetCostValue,
    stockItems: stockItems.slice(0, 30),
  };
}

/**
 * 9. Fetch Recent Operational Expenses
 */
export async function getRecentExpensesAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  return db
    .select()
    .from(cashFlows)
    .where(and(eq(cashFlows.tenantId, user.tenantId), eq(cashFlows.type, 'OUT')))
    .orderBy(desc(cashFlows.createdAt))
    .limit(20);
}

/**
 * 10. Fetch 7-Day Sales Trend (Weekly Analytics)
 */
export async function getWeeklySalesTrendAction() {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fallbackDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    fallbackDays.push({
      dateStr: d.toISOString().slice(0, 10),
      dayLabel: dayNames[d.getDay()],
      shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
      totalRevenue: 0,
      txCount: 0,
      isToday: i === 0,
    });
  }

  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { days: fallbackDays, total7DayRevenue: 0, maxRevenue: 1 };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const txList = await db
      .select({
        total: transactions.total,
        createdAt: transactions.createdAt,
        paymentStatus: transactions.paymentStatus,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, user.tenantId),
          gte(transactions.createdAt, sevenDaysAgo)
        )
      );

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = dayNames[d.getDay()];
      const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const matchingTx = (txList || []).filter((t) => {
        if (!t?.createdAt) return false;
        const txTime = t.createdAt instanceof Date ? t.createdAt.getTime() : new Date(t.createdAt).getTime();
        return !isNaN(txTime) && txTime >= startOfDay.getTime() && txTime <= endOfDay.getTime();
      });

      const totalRevenue = matchingTx.reduce((sum, t) => sum + (t?.total || 0), 0);
      const txCount = matchingTx.length;

      days.push({
        dateStr,
        dayLabel,
        shortDate,
        totalRevenue,
        txCount,
        isToday: i === 0,
      });
    }

    const total7DayRevenue = days.reduce((sum, d) => sum + d.totalRevenue, 0);
    const maxRevenue = Math.max(...days.map((d) => d.totalRevenue), 1);

    return {
      days,
      total7DayRevenue,
      maxRevenue,
    };
  } catch (error) {
    console.error('getWeeklySalesTrendAction error:', error);
    return {
      days: fallbackDays,
      total7DayRevenue: 0,
      maxRevenue: 1,
    };
  }
}

