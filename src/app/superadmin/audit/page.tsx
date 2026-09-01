'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditClientView } from './audit-client-view';

export default function SuperadminAuditPage() {
  const { data: logs = [] } = useQuery({
    queryKey: ['superadmin', 'audit'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/audit');
      if (!res.ok) throw new Error('Gagal memuat log aktivitas');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <AuditClientView logs={logs} />
    </div>
  );
}
