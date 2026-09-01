import React from 'react';
import { getSuperadminBillingAction } from '@/lib/actions/superadmin';
import { getSessionUser } from '@/lib/auth/session';
import { BillingClientView } from './billing-client-view';
import { redirect } from 'next/navigation';

export default async function SuperadminBillingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const billingData = await getSuperadminBillingAction();

  return (
    <div className="max-w-6xl mx-auto">
      <BillingClientView data={billingData} />
    </div>
  );
}
