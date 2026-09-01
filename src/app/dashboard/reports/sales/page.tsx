import React from 'react';
import { getSalesReportBreakdownAction } from '@/lib/actions/reports';
import { getSessionUser } from '@/lib/auth/session';
import { SalesReportClientView } from './sales-report-client-view';
import { redirect } from 'next/navigation';

export default async function SalesReportPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  let salesBreakdown: {
    byPayment: { paymentMethod: string; totalAmount: number; count: number }[];
    byCashier: { userId: string; userName: string; totalAmount: number; count: number }[];
    transactionsList: Awaited<ReturnType<typeof getSalesReportBreakdownAction>>['transactionsList'];
  } = {
    byPayment: [],
    byCashier: [],
    transactionsList: [],
  };

  try {
    salesBreakdown = await getSalesReportBreakdownAction();
  } catch (err) {
    console.error('Error fetching sales breakdown in page:', err);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SalesReportClientView
        salesBreakdown={salesBreakdown}
        tenantName={user.tenantName || 'Toko'}
      />
    </div>
  );
}
