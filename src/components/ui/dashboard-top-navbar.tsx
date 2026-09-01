'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Clock,
  Calendar,
  Sun,
  Moon,
  ChevronRight,
  Wifi,
  Sparkles,
  Maximize,
  Minimize,
} from 'lucide-react';

interface DashboardTopNavbarProps {
  portalType?: 'superadmin' | 'tenant';
  storeName?: string;
}

export function DashboardTopNavbar({
  portalType = 'superadmin',
  storeName,
}: DashboardTopNavbarProps) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Real-Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      setDateStr(now.toLocaleDateString('id-ID', options));
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}.${minutes}.${seconds} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse Pathname to Breadcrumb
  const getBreadcrumbs = () => {
    if (portalType === 'superadmin') {
      if (pathname === '/superadmin') return ['Superadmin', 'Overview'];
      if (pathname.includes('/tenants')) return ['Superadmin', 'Kelola Toko'];
      if (pathname.includes('/billing')) return ['Superadmin', 'Tagihan'];
      if (pathname.includes('/audit')) return ['Superadmin', 'Log Aktivitas'];
      if (pathname.includes('/settings')) return ['Superadmin', 'Pengaturan'];
      return ['Superadmin', 'Overview'];
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return [storeName || 'Toko', 'Overview'];

    const sub = segments[1];
    const sub2 = segments[2];

    if (sub === 'reports') {
      if (sub2 === 'sales') return [storeName || 'Toko', 'Rekap Penjualan'];
      if (sub2 === 'inventory') return [storeName || 'Toko', 'Valuasi Stok'];
      if (sub2 === 'export') return [storeName || 'Toko', 'Export Laporan'];
      return [storeName || 'Toko', 'Laba Rugi'];
    }

    const subMap: Record<string, string> = {
      pos: 'Kasir (POS)',
      products: 'Master Produk',
      inventory: 'Inventori & Stok',
      purchases: 'Pembelian (PO)',
      transfers: 'Mutasi Stok',
      debts: 'Buku Piutang',
      billing: 'Tagihan',
      audit: 'Audit Log',
      users: 'Karyawan',
      settings: 'Pengaturan',
      outlets: 'Cabang Toko',
    };

    return [storeName || 'Toko', subMap[sub] || sub];
  };

  const breadcrumbs = getBreadcrumbs();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E5E8EB] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-200">
      {/* Left: Breadcrumbs / Address Path */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <span className="text-[#6F7780]">{breadcrumbs[0]}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#B0B8C1]" />
        <span className="text-[#191F28] font-bold">{breadcrumbs[1]}</span>
      </div>

      {/* Right: Outline Actions & Outline Live Clock Container */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Fullscreen Button (Outline Container) */}
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] text-[#6F7780] hover:text-[#191F28] flex items-center justify-center transition-colors shadow-2xs"
          title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
        >
          {isFullscreen ? (
            <Minimize className="w-3.5 h-3.5" />
          ) : (
            <Maximize className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Theme Switcher Button (Outline Container) */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-8 h-8 rounded-lg border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] text-[#6F7780] hover:text-[#3182F6] flex items-center justify-center transition-colors shadow-2xs"
          title={isDark ? 'Mode Gelap Aktif (Klik untuk Mode Terang)' : 'Mode Terang Aktif'}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-[#3182F6]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#FE9800]" />
          )}
        </button>

        {/* Live Clock & Full Date (Outline Container) */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#E5E8EB] bg-white text-xs font-mono tabular-nums shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#3182F6] flex-shrink-0" />
          <span className="text-[#6F7780] font-sans font-medium text-[11px]">{dateStr}</span>
          <span className="text-[#D1D6DB]">•</span>
          <span className="font-extrabold text-[#191F28] text-xs font-mono">{timeStr || '--.--.-- WIB'}</span>
        </div>
      </div>
    </header>
  );
}
