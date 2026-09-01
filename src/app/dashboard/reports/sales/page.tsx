'use client';

import React, { useEffect, useState } from 'react';
import { getSalesReportBreakdownAction } from '@/lib/actions/reports';
import { SalesReportClientView } from './sales-report-client-view';

export default function SalesReportPage() {
  const [salesBreakdown, setSalesBreakdown] = useState<any>({
    byPayment: [],
    byCashier: [],
    transactionsList: [],
  });
  const [tenantName, setTenantName] = useState('Toko Mie Graine');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.tenantName) setTenantName(data.user.tenantName);
      })
      .catch(() => {});

    getSalesReportBreakdownAction()
      .then((data) => {
        if (data) setSalesBreakdown(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SalesReportClientView
        salesBreakdown={salesBreakdown}
        tenantName={tenantName}
      />
    </div>
  );
}
