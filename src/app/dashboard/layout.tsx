'use client';

import React, { useEffect, useState } from 'react';
import {
  Crown,
  LogOut,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

import { DashboardNav } from './dashboard-nav';
import { DashboardTopNavbar } from '@/components/ui/dashboard-top-navbar';
import { OutletSwitcher } from '@/components/dashboard/outlet-switcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>({
    name: 'Owner Toko',
    username: 'owner',
    role: 'owner',
    tenantName: 'Toko Mie Graine',
    outletName: 'Toko Utama',
  });
  const [tenantInfo, setTenantInfo] = useState<any>({
    status: 'active',
    plan: 'starter',
    expiresAt: null,
  });
  const [tenantOutlets, setTenantOutlets] = useState<any[]>([
    { id: 'main', name: 'Toko Utama', isMain: true },
  ]);
  const [settingsInfo, setSettingsInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('__miegraine_cached_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {}

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          try {
            sessionStorage.setItem('__miegraine_cached_user', JSON.stringify(data.user));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const daysLeft = 14;
  const isExpiringSoon = false;
  const isImpersonating = false;

  const roleLabel =
    user.role === 'owner'
      ? 'Pemilik (Owner)'
      : user.role === 'admin'
      ? 'Admin Cabang'
      : user.role === 'cashier'
      ? 'Kasir'
      : 'Superadmin';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F2F4F6] text-[#191F28] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation with Independent Vertical Scroll */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E8EB] flex flex-col h-full flex-shrink-0">
        {/* Top Header & Outlet Switcher (Fixed) */}
        <div className="flex-shrink-0">
          {/* Top Brand Logo Header (Exact h-14 matching Top Navbar with Full-Width Divider) */}
          <div className="h-14 px-4 md:px-5 flex items-center border-b border-[#E5E8EB]">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <Crown className="w-6 h-6 text-[#3182F6] stroke-[2.2] flex-shrink-0" />
              <div>
                <h1 className="font-extrabold text-base tracking-tight leading-tight">
                  <span className="text-[#3182F6]">Mie</span>
                  <span className="text-[#191F28]">graine</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Multi-Outlet & Subscription Plan Interactive Switcher Badge */}
          <OutletSwitcher
            tenantName={user.tenantName || 'Toko'}
            currentOutletId={user.outletId || ''}
            currentOutletName={user.outletName || 'Toko Utama'}
            outlets={tenantOutlets || []}
            userRole={user.role || 'owner'}
            plan={tenantInfo?.plan || 'starter'}
            planStatus={tenantInfo?.status || 'trial'}
            daysLeft={daysLeft}
          />
        </div>

        {/* Scrollable Navigation Links (Independently Scrolling) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 pt-2">
          <DashboardNav userRole={user.role} />
        </div>

        {/* Bottom 1-Row User Profile & Logout Button (Sticky at Bottom) */}
        <div className="flex-shrink-0 p-3.5 border-t border-[#E5E8EB] flex items-center justify-between gap-2 bg-white">
          <div className="flex items-center space-x-2.5 min-w-0 px-3.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F3FF] text-[#3182F6] font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-[#3182F6]/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#191F28] truncate">{user.name}</p>
              <p className="text-[10px] text-[#6F7780] font-medium truncate">@{user.username} • {roleLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg bg-[#F2F4F6] hover:bg-[#FEECED] text-[#6F7780] hover:text-[#F04452] flex items-center justify-center transition-colors border border-[#E5E8EB]"
            title="Keluar Akun (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area with Top Navbar (Edge-to-Edge) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DashboardTopNavbar portalType="tenant" storeName={user.tenantName} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full">
          {/* 1. Global Broadcast Announcement from Superadmin */}
          {settingsInfo?.isBroadcastActive && settingsInfo?.broadcastBanner && (
            <div className="mb-4 p-3.5 bg-[#FFF5E6] border border-[#FE9800]/40 rounded-xl flex items-center space-x-3 text-xs text-[#9E5F00] shadow-2xs">
              <Radio className="w-4 h-4 text-[#FE9800] flex-shrink-0 animate-pulse" />
              <span className="font-bold">{settingsInfo.broadcastBanner}</span>
            </div>
          )}

          {/* 2. Subscription Status Alert Banner */}
          {tenantInfo?.status === 'suspended' ? (
            <div className="mb-4 p-4 bg-[#FEECED] border border-[#F04452]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-[#F04452] flex-shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-[#F04452]">
                    Akun Toko Dinonaktifkan / Dibekukan
                  </p>
                  <p className="text-[11px] text-[#6F7780]">
                    Masa sewa toko telah berakhir atau ditangguhkan. Pembuatan transaksi kasir ditutup sementara.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${settingsInfo?.supportPhone || '6281234567890'}?text=${encodeURIComponent(`Halo Support Miegraine, saya ingin konfirmasi perpanjangan sewa toko "${user.tenantName}"`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#F04452] hover:bg-[#D6303E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 flex-shrink-0"
              >
                <span>Hubungi CS Perpanjangan</span>
              </a>
            </div>
          ) : isExpiringSoon ? (
            <div className="mb-4 p-3.5 bg-[#FFF9E6] border border-[#FE9800]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#FE9800] flex-shrink-0" />
                <p className="text-xs font-semibold text-[#9E5F00]">
                  Masa sewa toko Anda tersisa <strong>{daysLeft} hari lagi</strong> ({tenantInfo?.plan?.toUpperCase()} Plan).
                </p>
              </div>
              <a
                href={`https://wa.me/${settingsInfo?.supportPhone || '6281234567890'}?text=${encodeURIComponent(`Halo Support Miegraine, saya ingin perpanjang paket sewa toko "${user.tenantName}"`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#FE9800] hover:underline flex-shrink-0"
              >
                Perpanjang Sekarang ➔
              </a>
            </div>
          ) : null}

          {/* 3. Impersonation Banner Indicator */}
          {isImpersonating && (
            <div className="mb-4 p-3 bg-[#E8F3FF] border border-[#3182F6]/30 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#3182F6] animate-ping" />
                <p className="text-xs font-semibold text-[#3182F6]">
                  Anda sedang dalam sesi <strong>Bantuan Superadmin (Impersonasi)</strong>.
                </p>
              </div>
              <Link
                href="/superadmin/tenants"
                className="text-[11px] font-bold text-[#3182F6] hover:underline"
              >
                Kembali ke Superadmin ➔
              </Link>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
