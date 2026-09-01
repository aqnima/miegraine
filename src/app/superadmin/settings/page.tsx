'use client';

import React, { useEffect, useState } from 'react';
import { getSuperadminSettingsAction } from '@/lib/actions/superadmin';
import { SettingsClientView } from './settings-client-view';

export default function SuperadminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    starterPrice: 99000,
    proPrice: 199000,
    enterprisePrice: 499000,
    trialDays: 14,
    supportPhone: '6281234567890',
    supportEmail: 'support@miegraine.id',
    broadcastBanner: '',
    isBroadcastActive: false,
  });

  const systemInfo = {
    appVersion: '1.0.0',
    framework: 'Next.js 16 (React 19, Turbopack)',
    nodeVersion: 'v20.x Edge Runtime',
    databaseEngine: 'Cloudflare D1 / SQLite via Drizzle ORM',
    offlineEngine: 'Dexie.js v4 (IndexedDB Local-First)',
    authSecurity: 'Jose JWT v5 (Stateless Multi-Tenant Enforced)',
    environment: 'Cloudflare Pages Production',
  };

  useEffect(() => {
    getSuperadminSettingsAction()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <SettingsClientView initialSettings={settings} systemInfo={systemInfo} />
    </div>
  );
}
