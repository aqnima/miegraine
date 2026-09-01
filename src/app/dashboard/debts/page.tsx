import React from 'react';
import {
  getDebtsSummaryAction,
  getCustomersWithDebtsAction,
} from '@/lib/actions/debts';
import { getSessionUser } from '@/lib/auth/session';
import { DebtClientView } from './debt-client-view';
import { redirect } from 'next/navigation';

export default async function DebtsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [summary, customers] = await Promise.all([
    getDebtsSummaryAction(),
    getCustomersWithDebtsAction(),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <DebtClientView
        initialCustomers={customers}
        storeName={user.tenantName}
        summary={summary}
      />
    </div>
  );
}
