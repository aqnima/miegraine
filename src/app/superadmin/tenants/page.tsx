'use client';

import React, { useEffect, useState } from 'react';
import { getAllTenantsAction } from '@/lib/actions/superadmin';
import { TenantsClientView } from './tenants-client-view';

export default function TenantsManagementPage() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    getAllTenantsAction()
      .then((data) => {
        if (data) setTenants(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <TenantsClientView initialTenants={tenants} />
    </div>
  );
}
