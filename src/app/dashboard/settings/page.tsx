'use client';

import React, { useEffect, useState } from 'react';
import { SettingsClientView } from './settings-client-view';

export default function SettingsPage() {
  const [user, setUser] = useState<any>({
    name: 'Owner Toko',
    tenantName: 'Toko Mie Graine',
    role: 'owner',
    businessType: 'fnb',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <SettingsClientView user={user} />
    </div>
  );
}
