'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllTenantsAction } from '@/lib/actions/superadmin';
import { TenantsClientView } from './tenants-client-view';

export default function TenantsManagementPage() {
  const { data: tenants = [] } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => getAllTenantsAction(),
    staleTime: 60 * 1000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <TenantsClientView initialTenants={tenants} />
    </div>
  );
}
