'use client';

import React, { useEffect, useState } from 'react';
import {
  getProfitLossSummaryAction,
  getTopSellingProductsAction,
  getRecentExpensesAction,
} from '@/lib/actions/reports';
import { PnLClientView } from './pnl-client-view';

export default function ReportsPnLPage() {
  const [summary, setSummary] = useState<any>({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    txCount: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [tenantName, setTenantName] = useState('Toko Mie Graine');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.tenantName) setTenantName(data.user.tenantName);
      })
      .catch(() => {});

    Promise.all([
      getProfitLossSummaryAction(),
      getTopSellingProductsAction(8),
      getRecentExpensesAction(),
    ])
      .then(([s, p, e]) => {
        if (s) setSummary(s);
        if (p) setTopProducts(p);
        if (e) setRecentExpenses(e);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PnLClientView
        summary={summary}
        topProducts={topProducts}
        recentExpenses={recentExpenses}
        tenantName={tenantName}
      />
    </div>
  );
}
