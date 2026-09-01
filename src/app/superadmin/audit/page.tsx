'use client';

import React, { useEffect, useState } from 'react';
import { getSuperadminAuditLogsAction } from '@/lib/actions/superadmin';
import { AuditClientView } from './audit-client-view';

export default function SuperadminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getSuperadminAuditLogsAction()
      .then((data) => {
        if (data) setLogs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <AuditClientView logs={logs} />
    </div>
  );
}
