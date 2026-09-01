'use client';

import React, { useEffect, useState } from 'react';
import { getInventoryValuationAction } from '@/lib/actions/reports';
import { InventoryReportClientView } from './inventory-report-client-view';

export default function InventoryReportPage() {
  const [valuation, setValuation] = useState<any>({
    totalProductsCount: 0,
    totalStockQty: 0,
    totalAssetCostValue: 0,
    items: [],
  });
  const [tenantName, setTenantName] = useState('Toko Mie Graine');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.tenantName) setTenantName(data.user.tenantName);
      })
      .catch(() => {});

    getInventoryValuationAction()
      .then((data) => {
        if (data) setValuation(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <InventoryReportClientView
        valuation={valuation}
        tenantName={tenantName}
      />
    </div>
  );
}
