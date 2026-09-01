'use client';

import React, { useEffect, useState } from 'react';
import { getSuperadminBillingAction } from '@/lib/actions/superadmin';
import { BillingClientView } from './billing-client-view';

export default function SuperadminBillingPage() {
  const [billingData, setBillingData] = useState<any>({
    tenants: [],
    summary: {
      totalRevenue: 0,
      activeCount: 1,
      expiringCount: 0,
      suspendedCount: 0,
    },
    settings: {
      starterPrice: 99000,
      proPrice: 199000,
      enterprisePrice: 499000,
    },
  });

  useEffect(() => {
    getSuperadminBillingAction()
      .then((data) => {
        if (data) setBillingData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <BillingClientView data={billingData} />
    </div>
  );
}
