import React from 'react';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { tenants, platformSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { BillingClientView } from './billing-client-view';

export default async function DashboardBillingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'owner' && user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // 1. Fetch Tenant Subscription Details
  const tenantQuery = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, user.tenantId))
    .limit(1);

  const tenant = tenantQuery[0];

  // 2. Fetch Global Platform Settings (Prices & Support Phone)
  const settingsQuery = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 'global'))
    .limit(1);

  const settings = settingsQuery[0] || {
    starterPrice: 0,
    proPrice: 99000,
    ultraPrice: 249000,
    supportPhone: '6281234567890',
    supportEmail: 'support@miegraine.id',
  };

  const now = new Date();
  let daysLeft = 0;
  let isExpired = false;

  if (tenant?.subscriptionExpiresAt) {
    const diff = tenant.subscriptionExpiresAt.getTime() - now.getTime();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) {
      isExpired = true;
      daysLeft = 0;
    }
  }

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
