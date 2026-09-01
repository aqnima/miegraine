'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenantsClientView } from './tenants-client-view';

export default function TenantsManagementPage() {
  const { data: tenants = [] } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/tenants');
      if (!res.ok) throw new Error('Gagal memuat daftar toko');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <TenantsClientView initialTenants={tenants} />
    </div>
  );
}
