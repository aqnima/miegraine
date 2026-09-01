'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BillingClientView } from './billing-client-view';

export default function SuperadminBillingPage() {
  const { data: billingData = {
    tenants: [],
    totalMRR: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    activeCount: 0,
  } } = useQuery({
    queryKey: ['superadmin', 'billing'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/billing');
      if (!res.ok) throw new Error('Gagal memuat billing');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <BillingClientView data={billingData} />
    </div>
  );
}
