import React from 'react';
import { getSuperadminAuditLogsAction } from '@/lib/actions/superadmin';
import { getSessionUser } from '@/lib/auth/session';
import { AuditClientView } from './audit-client-view';
import { redirect } from 'next/navigation';

export default async function SuperadminAuditPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const logs = await getSuperadminAuditLogsAction();

  return (
    <div className="max-w-6xl mx-auto">
      <AuditClientView logs={logs} />
    </div>
  );
}
