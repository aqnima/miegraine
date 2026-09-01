'use client';

import React, { useEffect, useState } from 'react';
import {
  getDebtsSummaryAction,
  getCustomersWithDebtsAction,
} from '@/lib/actions/debts';
import { DebtClientView } from './debt-client-view';

export default function DebtsPage() {
  const [summary, setSummary] = useState<any>({
    totalOutstanding: 0,
    debtorsCount: 0,
    repaidThisMonth: 0,
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [storeName, setStoreName] = useState('Toko Mie Graine');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.tenantName) setStoreName(data.user.tenantName);
      })
      .catch(() => {});

    Promise.all([
      getDebtsSummaryAction(),
      getCustomersWithDebtsAction(),
    ])
      .then(([s, c]) => {
        if (s) setSummary(s);
        if (c) setCustomers(c);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <DebtClientView
        initialCustomers={customers}
        storeName={storeName}
        summary={summary}
      />
    </div>
  );
}
