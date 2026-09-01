import React from 'react';
import { getSessionUser } from '@/lib/auth/session';
import { exportProductsAction, exportTransactionsAction } from '@/lib/actions/bulk';
import { SettingsClientView } from './settings-client-view';
import { Settings, Shield, Store, Printer, Database, Download } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  if (user.role !== 'owner' && user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Settings Client View */}
      <SettingsClientView user={user} />
    </div>
  );
}
