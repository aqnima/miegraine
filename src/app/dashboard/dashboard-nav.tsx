'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Layers,
  FileText,
  ShieldCheck,
  Users,
  Settings,
  TrendingUp,
  CreditCard,
  Truck,
  ShoppingBag,
  FileSpreadsheet,
  Wallet,
} from 'lucide-react';

interface DashboardNavProps {
  userRole: 'owner' | 'admin' | 'cashier' | 'superadmin';
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  const isOwner = userRole === 'owner' || userRole === 'superadmin';
  const isOwnerOrAdmin = isOwner || userRole === 'admin';

  const sections = [
    {
      groupTitle: 'Operasional',
      links: [
        {
          href: '/dashboard',
          label: 'Overview',
          icon: LayoutDashboard,
          isActive: pathname === '/dashboard',
        },
        {
          href: '/dashboard/pos',
          label: 'Kasir (POS)',
          icon: ShoppingCart,
          isActive: pathname.startsWith('/dashboard/pos'),
        },
        {
          href: '/dashboard/products',
          label: 'Master Produk',
          icon: Package,
          isActive: pathname.startsWith('/dashboard/products'),
        },
        {
          href: '/dashboard/inventory',
          label: 'Inventori & Stok',
          icon: Boxes,
          isActive: pathname.startsWith('/dashboard/inventory'),
        },
        ...(isOwnerOrAdmin
          ? [
              {
                href: '/dashboard/purchases',
                label: 'Pembelian (PO)',
                icon: ShoppingBag,
                isActive: pathname.startsWith('/dashboard/purchases'),
              },
              {
                href: '/dashboard/transfers',
                label: 'Mutasi Stok',
                icon: Truck,
                isActive: pathname.startsWith('/dashboard/transfers'),
              },
            ]
          : []),
        {
          href: '/dashboard/debts',
          label: 'Buku Piutang',
          icon: FileText,
          isActive: pathname.startsWith('/dashboard/debts'),
        },
      ],
    },
    ...(isOwnerOrAdmin
      ? [
          {
            groupTitle: 'Finansial & Laporan',
            links: [
              {
                href: '/dashboard/reports',
                label: 'Laba Rugi',
                icon: TrendingUp,
                isActive: pathname === '/dashboard/reports',
              },
              {
                href: '/dashboard/reports/sales',
                label: 'Rekap Penjualan',
                icon: CreditCard,
                isActive: pathname.startsWith('/dashboard/reports/sales'),
              },
              {
                href: '/dashboard/reports/inventory',
                label: 'Valuasi Stok',
                icon: Package,
                isActive: pathname.startsWith('/dashboard/reports/inventory'),
              },
              {
                href: '/dashboard/reports/export',
                label: 'Export Laporan',
                icon: FileSpreadsheet,
                isActive: pathname.startsWith('/dashboard/reports/export'),
              },
              ...(isOwner
                ? [
                    {
                      href: '/dashboard/billing',
                      label: 'Tagihan',
                      icon: Wallet,
                      isActive: pathname.startsWith('/dashboard/billing'),
                    },
                    {
                      href: '/dashboard/audit',
                      label: 'Audit Log',
                      icon: ShieldCheck,
                      isActive: pathname.startsWith('/dashboard/audit'),
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            groupTitle: 'Sistem',
            links: [
              {
                href: '/dashboard/users',
                label: 'Karyawan',
                icon: Users,
                isActive: pathname.startsWith('/dashboard/users'),
              },
              {
                href: '/dashboard/settings',
                label: 'Pengaturan',
                icon: Settings,
                isActive: pathname.startsWith('/dashboard/settings'),
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <nav className="space-y-4 text-xs font-semibold">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-1">
          <p className="text-[10px] font-extrabold text-[#6F7780] uppercase tracking-wider px-3.5 pb-1">
            {section.groupTitle}
          </p>
          {section.links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold relative overflow-hidden transition-colors ${
                  link.isActive
                    ? 'bg-[#E8F3FF] text-[#3182F6]'
                    : 'text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    link.isActive ? 'text-[#3182F6]' : 'text-[#6F7780]'
                  }`}
                />
                <span className="truncate">{link.label}</span>

                {/* Vertical Blue Indicator Pill */}
                {link.isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#3182F6] rounded-r-full pointer-events-none" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
