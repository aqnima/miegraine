'use client';

import React, { useEffect, useState } from 'react';
import {
  getProfitLossSummaryAction,
  getSalesReportBreakdownAction,
  getInventoryValuationAction,
} from '@/lib/actions/reports';
import { ExportReportClientView } from './export-report-client-view';

export default function ExportReportPage() {
  const [summary, setSummary] = useState<any>(null);
  const [salesBreakdown, setSalesBreakdown] = useState<any>(null);
  const [inventoryValuation, setInventoryValuation] = useState<any>(null);
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
      getSalesReportBreakdownAction(),
      getInventoryValuationAction(),
    ])
      .then(([s, sb, iv]) => {
        if (s) setSummary(s);
        if (sb) setSalesBreakdown(sb);
        if (iv) setInventoryValuation(iv);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ExportReportClientView
        summary={summary}
        salesBreakdown={salesBreakdown}
        inventoryValuation={inventoryValuation}
        tenantName={tenantName}
      />
    </div>
  );
}
