'use client';

import React, { useEffect, useState } from 'react';
import {
  Crown,
  LayoutDashboard,
  Building2,
  LogOut,
  Store,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SuperadminNav } from './superadmin-nav';
import { DashboardTopNavbar } from '@/components/ui/dashboard-top-navbar';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>({
    name: 'Superadmin',
    username: 'superadmin',
    role: 'superadmin',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role !== 'superadmin') {
            window.location.href = '/dashboard';
          } else {
            setUser(data.user);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F2F4F6] text-[#191F28] flex flex-col md:flex-row font-sans">
      {/* Sidebar with Independent Vertical Scroll */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E8EB] flex flex-col h-full flex-shrink-0">
        {/* Top Brand Logo Header (Fixed) */}
        <div className="flex-shrink-0">
          <div className="h-14 px-4 md:px-5 flex items-center border-b border-[#E5E8EB]">
            <Link href="/superadmin" className="flex items-center space-x-2.5">
              <Crown className="w-6 h-6 text-[#3182F6] stroke-[2.2] flex-shrink-0" />
              <div>
                <h1 className="font-extrabold text-base tracking-tight leading-tight">
                  <span className="text-[#3182F6]">Mie</span>
                  <span className="text-[#191F28]">graine</span>
                </h1>
              </div>
            </Link>
          </div>
        </div>

        {/* Dynamic Navigation Links (Independently Scrolling) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5">
          <SuperadminNav />
        </div>

        {/* Bottom 1-Row User Profile & Logout Button (Sticky at Bottom) */}
        <div className="flex-shrink-0 p-3.5 border-t border-[#E5E8EB] flex items-center justify-between gap-2 bg-white">
          <div className="flex items-center space-x-2.5 min-w-0 px-3.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F3FF] text-[#3182F6] font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-[#3182F6]/20">
              {(user.name === 'Superadmin Platform' ? 'Superadmin' : user.name).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#191F28] truncate">
                {user.name === 'Superadmin Platform' ? 'Superadmin' : user.name}
              </p>
              <p className="text-[10px] text-[#6F7780] font-medium truncate">@{user.username}</p>
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
        <DashboardTopNavbar portalType="superadmin" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
