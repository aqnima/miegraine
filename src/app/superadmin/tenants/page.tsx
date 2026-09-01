import React from 'react';
import { getAllTenantsAction } from '@/lib/actions/superadmin';
import { getSessionUser } from '@/lib/auth/session';
import { TenantsClientView } from './tenants-client-view';
import { Building2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function TenantsManagementPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const tenants = await getAllTenantsAction();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tenants Table & Actions */}
      <TenantsClientView initialTenants={tenants} />
    </div>
  );
}
