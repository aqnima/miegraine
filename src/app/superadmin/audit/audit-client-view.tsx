'use client';

import React, { useState } from 'react';
import { formatTanggal } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import {
  ShieldCheck,
  Search,
  Building2,
  AlertTriangle,
  FileText,
  Activity,
} from 'lucide-react';

interface AuditClientViewProps {
  logs: any[];
}

export function AuditClientView({ logs }: AuditClientViewProps) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.reason || '').toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filterAction !== 'ALL' && l.action !== filterAction) return false;

    return true;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ACTION_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    TRANSACTION_VOID: {
      label: 'Void Nota',
      bg: 'bg-[#FEECED]',
      text: 'text-[#F04452]',
      border: 'border-[#F04452]/25',
    },
    STOCK_ADJUSTMENT: {
      label: 'Koreksi Stok',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
    PRICE_OVERRIDE: {
      label: 'Ubah Harga',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
    SUPERADMIN_IMPERSONATION: {
      label: 'Impersonasi Support',
      bg: 'bg-[#F3E8FF]',
      text: 'text-[#7E22CE]',
      border: 'border-[#7E22CE]/25',
    },
    SUBSCRIPTION_UPDATE: {
      label: 'Update Paket',
      bg: 'bg-[#E8F3FF]',
      text: 'text-[#3182F6]',
      border: 'border-[#3182F6]/25',
    },
    TENANT_CREATE: {
      label: 'Toko Baru',
      bg: 'bg-[#E6FAF2]',
      text: 'text-[#03B26C]',
      border: 'border-[#03B26C]/25',
    },
    TENANT_DELETE: {
      label: 'Hapus Toko',
      bg: 'bg-[#FEECED]',
      text: 'text-[#F04452]',
      border: 'border-[#F04452]/25',
    },
    TENANT_SUSPEND: {
      label: 'Suspend Toko',
      bg: 'bg-[#FEECED]',
      text: 'text-[#F04452]',
      border: 'border-[#F04452]/25',
    },
    TENANT_REACTIVATE: {
      label: 'Aktivasi Toko',
      bg: 'bg-[#E6FAF2]',
      text: 'text-[#03B26C]',
      border: 'border-[#03B26C]/25',
    },
    SHIFT_DISCREPANCY: {
      label: 'Selisih Kas',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'time',
      header: 'Waktu Kejadian',
      render: (l) => {
        const d = l.createdAt ? new Date(l.createdAt) : null;
        if (!d || isNaN(d.getTime())) {
          return <span className="text-[#6F7780] text-xs">-</span>;
        }
        const dateStr = new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(d);
        const timeStr = new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(d);

        return (
          <div className="text-[#6F7780] whitespace-nowrap">
            <p className="font-bold text-[#191F28] text-xs">{dateStr}</p>
            <p className="text-[11px] font-mono text-[#6F7780] mt-0.5">
              {timeStr} WIB
            </p>
          </div>
        );
      },
    },
    {
      key: 'tenant',
      header: 'Toko Klien',
      render: (l) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[#191F28] text-xs truncate max-w-[140px] sm:max-w-[180px]">
            {l.tenantName}
          </span>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Pelaku (User)',
      render: (l) => {
        const role = (l.userRole || '').toLowerCase();
        let roleBadge = 'bg-[#F2F4F6] text-[#4E5968] border-[#E5E8EB]';
        if (role === 'superadmin') roleBadge = 'bg-[#F3E8FF] text-[#7E22CE] border-[#7E22CE]/20';
        else if (role === 'owner') roleBadge = 'bg-[#E8F3FF] text-[#3182F6] border-[#3182F6]/20';
        else if (role === 'admin') roleBadge = 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20';
        else if (role === 'cashier') roleBadge = 'bg-[#FFF5E6] text-[#FE9800] border-[#FE9800]/20';

        const userName = l.userName === 'Superadmin Platform' ? 'Superadmin' : l.userName;

        return (
          <div>
            <p className="font-bold text-[#191F28] text-xs">{userName}</p>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border mt-0.5 ${roleBadge}`}>
              {l.userRole}
            </span>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Jenis Aksi',
      align: 'center',
      render: (l) => {
        const conf = ACTION_CONFIG[l.action] || {
          label: l.action.replace(/_/g, ' '),
          bg: 'bg-[#F2F4F6]',
          text: 'text-[#4E5968]',
          border: 'border-[#E5E8EB]',
        };

        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap ${conf.bg} ${conf.text} ${conf.border}`}
          >
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: 'Detail & Keterangan',
      render: (l) => {
        const cleanReason = (l.reason || 'Aktivitas sistem tercatat')
          .replace(/Superadmin Platform/g, 'Superadmin')
          .replace(/Superadmin Superadmin/g, 'Superadmin');

        return (
          <div className="text-[#333D4B] min-w-[200px]">
            <p className="font-medium text-xs leading-relaxed">{cleanReason}</p>
            {l.resourceId && (
              <span className="inline-block px-1.5 py-0.5 rounded bg-[#F2F4F6] text-[#6F7780] text-[10px] font-mono mt-1 border border-[#E5E8EB]">
                {l.resourceType} #{l.resourceId.slice(0, 12)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const criticalCount = logs.filter(
    (l) =>
      l.action.includes('VOID') ||
      l.action.includes('DELETE') ||
      l.action.includes('IMPERSONATION')
  ).length;

  const stockAdjustmentCount = logs.filter(
    (l) => l.action.includes('STOCK') || l.action.includes('ADJUSTMENT')
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari toko, staf, aksi, atau alasan..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs font-medium"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Jenis Aksi</option>
            <option value="TRANSACTION_VOID">Pembatalan (Void)</option>
            <option value="STOCK_ADJUSTMENT">Koreksi Stok</option>
            <option value="PRICE_OVERRIDE">Override Harga</option>
            <option value="SUPERADMIN_IMPERSONATION">Impersonasi Support</option>
            <option value="SUBSCRIPTION_UPDATE">Pembaruan Langganan</option>
            <option value="TENANT_CREATE">Pendaftaran Toko</option>
            <option value="TENANT_DELETE">Penghapusan Toko</option>
          </select>
        </div>
      </div>

      {/* 3 Essential Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Log Terdata"
          value={`${logs.length} Peristiwa`}
          icon={Activity}
          iconColor="text-[#3182F6]"
          valueColor="text-[#191F28]"
          subtitle="Aktivitas terekam di sistem"
        />

        <StatCard
          title="Aksi Kritis & Keamanan"
          value={`${criticalCount} Peristiwa`}
          icon={AlertTriangle}
          iconColor="text-[#F04452]"
          valueColor="text-[#F04452]"
          subtitle="Void nota, impersonasi, hapus toko"
        />

        <StatCard
          title="Koreksi Stok & Opname"
          value={`${stockAdjustmentCount} Penyesuaian`}
          icon={FileText}
          iconColor="text-[#FE9800]"
          valueColor="text-[#FE9800]"
          subtitle="Penyesuaian stok fisik gudang"
        />
      </div>


      {/* Reusable Audit Data Table with Embedded Pagination */}
      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(l) => l.id}
        emptyTitle="Belum Ada Log Aktivitas Khusus"
        emptyMessage="Seluruh aktivitas sensitif seperti void nota atau koreksi stok akan otomatis terekam di sini."
        emptyIcon={ShieldCheck}
        pagination={{
          currentPage,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          },
        }}
      />
    </div>
  );
}
