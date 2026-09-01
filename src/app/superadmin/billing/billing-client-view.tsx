'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { updateTenantSubscriptionAction } from '@/lib/actions/superadmin';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { TableActionButton } from '@/components/ui/table-action-button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  Building2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BillingClientViewProps {
  data: {
    tenants: any[];
    totalMRR: number;
    expiringSoonCount: number;
    expiredCount: number;
    activeCount: number;
  };
}

export function BillingClientView({ data }: BillingClientViewProps) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'expiring' | 'active' | 'expired'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  const router = useRouter();
  const toast = useToast();

  const filtered = (data?.tenants || []).filter((t: any) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterTab === 'expiring') return t.isExpiringSoon;
    if (filterTab === 'active') return t.subscriptionStatus === 'active';
    if (filterTab === 'expired') return t.isExpired || t.subscriptionStatus === 'suspended';

    return true;
  });

  const handleQuickExtend = (tenantId: string, tenantName: string, plan: 'starter' | 'pro', months: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Perpanjang Masa Sewa?',
      description: `Perpanjang masa aktif sewa toko "${tenantName}" sebanyak +${months} bulan?`,
      onConfirm: async () => {
        setLoadingId(tenantId);
        try {
          await updateTenantSubscriptionAction(tenantId, plan, 'active', months);
          toast.success('Sewa Berhasil Diperpanjang', `Masa aktif toko "${tenantName}" bertambah +${months} bulan.`);
          router.refresh();
        } catch (err: any) {
          toast.error('Gagal Memperpanjang', err.message);
        } finally {
          setLoadingId(null);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const generateWhatsAppReminder = (tenant: any) => {
    const text = encodeURIComponent(
      `Halo Kak ${tenant.ownerName} (${tenant.name}), kami dari Tim Billing Miegraine ingin menginformasikan bahwa masa aktif sewa aplikasi kasir toko Anda akan berakhir pada ${formatTanggal(
        tenant.subscriptionExpiresAt
      )}. Mohon konfirmasi untuk perpanjangan masa aktif agar operasional kasir tetap berjalan lancar. Terima kasih! 🙏`
    );
    return `https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'store',
      header: 'Nama Toko Klien',
      render: (t) => (
        <div className="flex items-start space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-[#E8F3FF] text-[#3182F6] border border-[#3182F6]/20 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-[#191F28] text-sm">{t.name}</p>
            <p className="text-[10px] text-[#6F7780] font-mono">
              Owner: {t.ownerName} ({t.phone || '-'})
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Paket & Tarif',
      render: (t) => (
        <div>
          <p className="font-bold uppercase text-[#3182F6]">{t.subscriptionPlan}</p>
          <p className="text-[10px] text-[#6F7780] font-mono font-bold">
            {formatRupiah(t.monthlyFee)} / bulan
          </p>
        </div>
      ),
    },
    {
      key: 'expiry',
      header: 'Jatuh Tempo Sewa',
      render: (t) => (
        <div>
          <p className="font-bold text-[#191F28]">
            {t.subscriptionExpiresAt ? formatTanggal(t.subscriptionExpiresAt) : '-'}
          </p>
          <p className="text-[10px] font-semibold">
            {t.isExpired ? (
              <span className="text-[#F04452]">Telah Kedaluwarsa</span>
            ) : t.isExpiringSoon ? (
              <span className="text-[#FE9800]">Sisa ≤ 7 Hari Lagi</span>
            ) : (
              <span className="text-[#03B26C]">Masa Aktif Aman</span>
            )}
          </p>
        </div>
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
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (t) => (
        <div className="flex items-center justify-center space-x-1.5">
          {/* WhatsApp Reminder Button */}
          {t.phone ? (
            <TableActionButton
              href={generateWhatsAppReminder(t)}
              icon={MessageCircle}
              variant="success"
              tooltip="Kirim Pengingat Tagihan via WhatsApp"
            />
          ) : (
            <TableActionButton
              icon={MessageCircle}
              variant="ghost"
              disabled
              tooltip="Nomor HP Tidak Tersedia"
            />
          )}

          {/* Quick Extend Button */}
          <TableActionButton
            icon={Calendar}
            variant="primary"
            isLoading={loadingId === t.id}
            onClick={() =>
              handleQuickExtend(t.id, t.name, t.subscriptionPlan as any, 1)
            }
            tooltip="Perpanjang Langganan +1 Bulan Cepat"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Top Search & Filter Bar */}
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
              placeholder="Cari toko, owner, no. hp..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs font-medium"
            />
          </div>

          <select
            value={filterTab}
            onChange={(e) => {
              setFilterTab(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="all">Semua Toko ({data.tenants.length})</option>
            <option value="expiring">Jatuh Tempo Segera ({data.expiringSoonCount})</option>
            <option value="active">Aktif Berlangganan ({data.activeCount})</option>
            <option value="expired">Kedaluwarsa ({data.expiredCount})</option>
          </select>
        </div>
      </div>

      {/* 2. 4 Reusable Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendapatan MRR"
          value={formatRupiah(data.totalMRR)}
          icon={CreditCard}
          iconColor="text-[#03B26C]"
          valueColor="text-[#03B26C]"
          subtitle="Estimasi sewa bulanan berjalan"
        />

        <StatCard
          title="Toko Aktif Berlangganan"
          value={`${data.activeCount} Toko`}
          icon={CheckCircle2}
          iconColor="text-[#3182F6]"
          valueColor="text-[#3182F6]"
          trend={{ text: 'Sewa Aktif Berjalan', isPositive: true }}
        />

        <StatCard
          title="Jatuh Tempo Segera (≤ 7 Hari)"
          value={`${data.expiringSoonCount} Toko`}
          icon={Clock}
          iconColor="text-[#FE9800]"
          valueColor="text-[#FE9800]"
          subtitle="Perlu dikirim reminder perpanjangan"
        />

        <StatCard
          title="Kedaluwarsa / Dibekukan"
          value={`${data.expiredCount} Toko`}
          icon={AlertTriangle}
          iconColor="text-[#F04452]"
          valueColor="text-[#F04452]"
          subtitle="Masa sewa habis belum diperpanjang"
        />
      </div>

      {/* 3. Reusable Data Table with Embedded Pagination */}
      <DataTable
        columns={columns}
        data={filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        keyExtractor={(t) => t.id}
        emptyTitle="Tidak Ada Data Toko"
        emptyMessage="Tidak ada toko yang cocok dengan filter yang dipilih."
        emptyIcon={Building2}
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

      {/* Reusable Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant="primary"
        confirmText="Perpanjang Sekarang"
        isLoading={!!loadingId}
      />
    </div>
  );
}
