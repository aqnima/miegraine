import React from 'react';
import {
  getProfitLossSummaryAction,
  getTopSellingProductsAction,
  getRecentExpensesAction,
} from '@/lib/actions/reports';
import { getSessionUser } from '@/lib/auth/session';
import { PnLClientView } from './pnl-client-view';
import { redirect } from 'next/navigation';

export default async function ReportsPnLPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  const [summary, topProducts, recentExpenses] = await Promise.all([
    getProfitLossSummaryAction(),
    getTopSellingProductsAction(8),
    getRecentExpensesAction(),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PnLClientView
        summary={summary}
        topProducts={topProducts}
        recentExpenses={recentExpenses}
        tenantName={user.tenantName || 'Toko'}
      />
    </div>
  );
}
