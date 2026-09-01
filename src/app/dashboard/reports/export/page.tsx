import React from 'react';
import {
  getProfitLossSummaryAction,
  getSalesReportBreakdownAction,
  getInventoryValuationAction,
} from '@/lib/actions/reports';
import { getSessionUser } from '@/lib/auth/session';
import { ExportReportClientView } from './export-report-client-view';
import { redirect } from 'next/navigation';

export default async function ExportReportPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  const [summary, salesBreakdown, inventoryValuation] = await Promise.all([
    getProfitLossSummaryAction(),
    getSalesReportBreakdownAction(),
    getInventoryValuationAction(),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ExportReportClientView
        summary={summary}
        salesBreakdown={salesBreakdown}
        inventoryValuation={inventoryValuation}
        tenantName={user.tenantName || 'Toko'}
      />
    </div>
  );
}
