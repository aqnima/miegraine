import React from 'react';
import { getAuditLogsAction } from '@/lib/actions/audit';
import { getSessionUser } from '@/lib/auth/session';
import { AuditClientView } from './audit-client-view';
import { Shield, Lock, AlertTriangle, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  if (user.role !== 'owner' && user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const logs = await getAuditLogsAction();

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Audit Log Client View */}
      <AuditClientView initialLogs={logs} />
    </div>
  );
}
