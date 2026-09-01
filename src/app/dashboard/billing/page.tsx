'use client';

import React, { useEffect, useState } from 'react';
import { BillingClientView } from './billing-client-view';

export default function DashboardBillingPage() {
  const [user, setUser] = useState<any>({
    name: 'Owner Toko',
    tenantName: 'Toko Mie Graine',
    role: 'owner',
  });
  const [tenant, setTenant] = useState<any>({
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
  });
  const [settings, setSettings] = useState<any>({
    starterPrice: 0,
    proPrice: 99000,
    ultraPrice: 249000,
    supportPhone: '6281234567890',
    supportEmail: 'support@miegraine.id',
  });
  const [daysLeft, setDaysLeft] = useState(14);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <BillingClientView
      user={user}
      tenant={tenant}
      settings={settings}
      daysLeft={daysLeft}
      isExpired={isExpired}
    />
  );
}
