import React from 'react';
import { getInventoryValuationAction } from '@/lib/actions/reports';
import { getSessionUser } from '@/lib/auth/session';
import { InventoryReportClientView } from './inventory-report-client-view';
import { redirect } from 'next/navigation';

export default async function InventoryReportPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  const valuation = await getInventoryValuationAction();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <InventoryReportClientView
        valuation={valuation}
        tenantName={user.tenantName || 'Toko'}
      />
    </div>
  );
}
