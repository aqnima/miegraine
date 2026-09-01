'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogsAction } from '@/lib/actions/audit';
import { AuditClientView } from './audit-client-view';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getAuditLogsAction()
      .then((data) => {
        if (data) setLogs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <AuditClientView initialLogs={logs} />
    </div>
  );
}
