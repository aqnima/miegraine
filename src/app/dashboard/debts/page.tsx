'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDebtsSummaryAction,
  getCustomersWithDebtsAction,
} from '@/lib/actions/debts';
import { DebtClientView } from './debt-client-view';

export default function DebtsPage() {
  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: summary = {
    totalActiveDebt: 0,
    debtorsCount: 0,
    overLimitCount: 0,
    totalCustomers: 0,
  } } = useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: () => getDebtsSummaryAction(),
    staleTime: 60 * 1000,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['debts', 'customers'],
    queryFn: () => getCustomersWithDebtsAction(),
    staleTime: 60 * 1000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <DebtClientView
        initialCustomers={customers}
        storeName={user?.tenantName || 'Toko Mie Graine'}
        summary={summary}
      />
    </div>
  );
}
