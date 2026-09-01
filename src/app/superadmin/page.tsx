'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import {
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SuperadminOverviewPage() {
  const { data: analytics = {
    totalTenants: 1,
    activeTenantsCount: 1,
    totalGMV: 15450000,
    totalTransactionsCount: 128,
    mrr: 99000,
    suspendedCount: 0,
  } } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/stats');
      if (!res.ok) throw new Error('Gagal memuat statistik');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const { data: tenantsList = [] } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/tenants');
      if (!res.ok) throw new Error('Gagal memuat daftar toko');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const recentColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Nama Toko & Sektor',
      render: (t) => (
        <div>
          <p className="font-bold text-[#191F28] text-sm">{t.name}</p>
          <p className="text-[10px] text-[#3182F6] uppercase font-mono mt-0.5 font-bold">
            {t.businessType} • {t.outletsCount} Cabang
          </p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner Toko',
      render: (t) => (
        <div>
          <p className="font-bold text-[#191F28]">{t.ownerName}</p>
          <p className="text-[10px] text-[#6F7780]">@{t.ownerUsername}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Tanggal Daftar',
      render: (t) => (
        <span className="text-[#6F7780]">{formatTanggal(t.createdAt)}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Paket Langganan',
      render: (t) => (
        <span className="uppercase font-bold text-[#3182F6]">{t.subscriptionPlan}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => (
        <span
          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${
            t.subscriptionStatus === 'active'
              ? 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20'
              : t.subscriptionStatus === 'trial'
              ? 'bg-[#E8F3FF] text-[#3182F6] border-[#3182F6]/20'
              : 'bg-[#FEECED] text-[#F04452] border-[#F04452]/20'
          }`}
        >
          {t.subscriptionStatus === 'active'
            ? 'AKTIF'
            : t.subscriptionStatus === 'trial'
            ? 'UJI COBA'
            : 'DIBEKUKAN'}
        </span>
      ),
    },
    {
      key: 'sales',
      header: 'Total Penjualan',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-[#191F28] tabular-nums">
          {formatRupiah(t.totalSales)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Hero Banner (100% Solid Flat Blue Theme) */}
      <div className="bg-[#3182F6] text-white p-6 md:p-8 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          {/* Solid Information Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="inline-flex items-center space-x-1.5 bg-[#2272EB] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Platform Superadmin Master</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 bg-[#2272EB] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              <Building2 className="w-3.5 h-3.5 text-white" />
              <span>{analytics.totalTenants} Klien Toko Terdaftar</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Ringkasan Bisnis & Pendapatan SaaS
          </h1>
          <p className="text-xs text-white mt-1 leading-relaxed">
            Monitoring omzet transaksi toko klien, status sewa langganan, dan pertumbuhan pendapatan bulanan platform.
          </p>
        </div>

        {/* Solid Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/superadmin/tenants"
            className="inline-flex items-center space-x-2 bg-white hover:bg-[#F2F4F6] text-[#3182F6] px-5 py-2.5 rounded-lg font-extrabold text-xs transition-all shadow-xs active:scale-98"
          >
            <span>Kelola Klien Toko</span>
            <ArrowUpRight className="w-4 h-4 text-[#3182F6]" />
          </Link>
          <Link
            href="/superadmin/billing"
            className="inline-flex items-center space-x-2 bg-[#2272EB] hover:bg-[#1B64DA] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Faktur & Tagihan</span>
          </Link>
        </div>
      </div>

      {/* 4 Reusable Bento Global Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Toko Terdaftar"
          value={`${analytics.totalTenants} Toko`}
          icon={Building2}
          iconColor="text-[#3182F6]"
          valueColor="text-[#191F28]"
          trend={{
            text: `${analytics.activeTenantsCount} Berlangganan Aktif`,
            isPositive: true,
          }}
        />

        <StatCard
          title="Global GMV Transaksi Toko"
          value={formatRupiah(analytics.totalGMV)}
          icon={DollarSign}
          iconColor="text-[#FE9800]"
          valueColor="text-[#3182F6]"
          subtitle={`${analytics.totalTransactionsCount} Total Nota Diproses`}
        />

        <StatCard
          title="Estimasi MRR (Pendapatan)"
          value={formatRupiah(analytics.mrr)}
          icon={TrendingUp}
          iconColor="text-[#03B26C]"
          valueColor="text-[#03B26C]"
          subtitle="Pendapatan berulang bulanan"
        />

        <StatCard
          title="Toko Suspended / Expired"
          value={`${analytics.suspendedCount} Toko`}
          icon={ShieldCheck}
          iconColor="text-[#F04452]"
          valueColor="text-[#F04452]"
          subtitle="Perlu konfirmasi perpanjangan sewa"
        />
      </div>

      {/* Recent 5 Clients Section Wrapped in 1 Unified Card */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 md:p-6 pb-4 flex items-center justify-between border-b border-[#E5E8EB]">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#3182F6]" />
            <h2 className="font-bold text-sm md:text-base text-[#191F28]">Daftar 5 Toko Klien Terkini</h2>
          </div>
          <Link
            href="/superadmin/tenants"
            className="text-xs font-bold text-[#3182F6] hover:text-[#2272EB] flex items-center space-x-1 transition-colors group"
          >
            <span>Kelola Semua Klien ({tenantsList.length})</span>
            <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
          </Link>
        </div>

        {/* Embedded Table Content */}
        <DataTable
          columns={recentColumns}
          data={tenantsList.slice(0, 5)}
          keyExtractor={(t) => t.id}
          emptyTitle="Belum Ada Toko Terdaftar"
          emptyMessage="Daftarkan toko klien pertama melalui menu Kelola Toko."
          emptyIcon={Building2}
          className="border-0 shadow-none rounded-none"
        />
      </div>
    </div>
  );
}
