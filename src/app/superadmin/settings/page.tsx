import React from 'react';
import { getSuperadminSettingsAction } from '@/lib/actions/superadmin';
import { getSessionUser } from '@/lib/auth/session';
import { SettingsClientView } from './settings-client-view';
import { redirect } from 'next/navigation';

export default async function SuperadminSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const settings = await getSuperadminSettingsAction();

  const systemInfo = {
    appVersion: '1.0.0',
    framework: 'Next.js 15.1.7 (React 19, Turbopack)',
    nodeVersion: process.version,
    databaseEngine: 'LibSQL / SQLite via Drizzle ORM v0.38.4',
    offlineEngine: 'Dexie.js v4.0.11 (IndexedDB Local-First)',
    authSecurity: 'Jose JWT v5 (Stateless Multi-Tenant Enforced)',
    environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <SettingsClientView initialSettings={settings} systemInfo={systemInfo} />
    </div>
  );
}
