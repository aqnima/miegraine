'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export function SuperadminNav() {
  const pathname = usePathname();

  const sections = [
    {
      groupTitle: 'Operasional',
      links: [
        {
          href: '/superadmin',
          label: 'Overview',
          icon: LayoutDashboard,
          isActive: pathname === '/superadmin',
        },
        {
          href: '/superadmin/tenants',
          label: 'Kelola Toko',
          icon: Building2,
          isActive: pathname.startsWith('/superadmin/tenants'),
        },
        {
          href: '/superadmin/billing',
          label: 'Tagihan',
          icon: CreditCard,
          isActive: pathname.startsWith('/superadmin/billing'),
        },
      ],
    },
    {
      groupTitle: 'Sistem',
      links: [
        {
          href: '/superadmin/audit',
          label: 'Log Aktivitas',
          icon: ShieldCheck,
          isActive: pathname.startsWith('/superadmin/audit'),
        },
        {
          href: '/superadmin/settings',
          label: 'Pengaturan',
          icon: Settings,
          isActive: pathname.startsWith('/superadmin/settings'),
        },
      ],
    },
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
