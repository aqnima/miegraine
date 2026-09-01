'use client';

import React, { useState } from 'react';
import {
  updateTenantSubscriptionAction,
  impersonateTenantAction,
  createTenantManualAction,
  deleteTenantAction,
} from '@/lib/actions/superadmin';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal, ConfirmVariant } from '@/components/ui/confirm-modal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { TableActionButton } from '@/components/ui/table-action-button';
import { useToast } from '@/components/ui/toast';
import {
  Building2,
  Search,
  LogIn,
  Plus,
  Loader2,
  Trash2,
  Store,
  Power,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TenantsClientViewProps {
  initialTenants: any[];
}

export function TenantsClientView({ initialTenants }: TenantsClientViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'trial' | 'suspended'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: ConfirmVariant;
    confirmText?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'primary',
    onConfirm: async () => {},
  });

  const router = useRouter();
  const toast = useToast();

  const filtered = initialTenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      t.businessType.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter !== 'ALL' && t.subscriptionStatus !== statusFilter) return false;

    return true;
  });

  const handleToggleSuspend = (tenantId: string, currentStatus: string, tenantName: string) => {
    const isSuspended = currentStatus === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    const actionLabel = isSuspended ? 'Aktifkan Kembali' : 'Bekukan (Suspend)';

    setConfirmConfig({
      isOpen: true,
      title: `${actionLabel} Toko?`,
      description: `Apakah Anda yakin ingin ${actionLabel.toLowerCase()} akun toko "${tenantName}"?`,
      variant: isSuspended ? 'success' : 'warning',
      confirmText: actionLabel,
      onConfirm: async () => {
        setLoadingId(tenantId);
        try {
          await updateTenantSubscriptionAction(tenantId, 'starter', newStatus, 0);
          toast.success('Status Berhasil Diubah', `Toko "${tenantName}" kini berstatus ${newStatus.toUpperCase()}.`);
          router.refresh();
        } catch (err: any) {
          toast.error('Gagal Mengubah Status', err.message);
        } finally {
          setLoadingId(null);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleImpersonate = (tenantId: string, tenantName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Masuk sebagai Owner?',
      description: `Anda akan login langsung ke dashboard toko "${tenantName}" untuk keperluan bantuan teknis.`,
      variant: 'primary',
      confirmText: 'Masuk ke Toko',
      onConfirm: async () => {
        setLoadingId(tenantId);
        try {
          await impersonateTenantAction(tenantId);
        } catch (err: any) {
          toast.error('Gagal Masuk Toko', err.message);
          setLoadingId(null);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteTenant = (tenantId: string, tenantName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Toko Permanen?',
      description: `Seluruh data penjualan, produk, dan outlet toko "${tenantName}" akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan!`,
      variant: 'danger',
      confirmText: 'Hapus Permanen',
      onConfirm: async () => {
        setLoadingId(tenantId);
        try {
          await deleteTenantAction(tenantId);
          toast.success('Toko Dihapus', `Toko "${tenantName}" telah dihapus permanen.`);
          router.refresh();
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        } finally {
          setLoadingId(null);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await createTenantManualAction({
        storeName: formData.get('storeName')?.toString() || '',
        businessType: formData.get('businessType')?.toString() || 'general',
        ownerName: formData.get('ownerName')?.toString() || '',
        username: formData.get('username')?.toString() || '',
        password: formData.get('password')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        address: formData.get('address')?.toString() || '',
        plan: (formData.get('plan')?.toString() as 'starter' | 'pro') || 'pro',
        months: Number(formData.get('months')) || 1,
      });

      toast.success('Toko Klien Berhasil Didaftarkan', 'Akun owner toko baru telah aktif dan siap digunakan.');
      setIsAddModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat toko.');
      toast.error('Pendaftaran Gagal', err.message || 'Gagal membuat toko.');
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'store',
      header: 'Nama Toko & Tipe',
      render: (t) => (
        <div className="flex items-start space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-[#E8F3FF] text-[#3182F6] border border-[#3182F6]/20 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-[#191F28] text-sm">{t.name}</p>
            <p className="text-[10px] text-[#3182F6] uppercase font-mono mt-0.5 font-bold">
              {t.businessType} • {t.outletsCount} Cabang
            </p>
          </div>
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
      key: 'subscription',
      header: 'Paket & Masa Aktif',
      render: (t) => (
        <div>
          <p className="font-bold uppercase text-[#3182F6]">{t.subscriptionPlan}</p>
          <p className="text-[10px] text-[#6F7780]">
            {t.subscriptionExpiresAt
              ? `S.d ${formatTanggal(t.subscriptionExpiresAt)}`
              : 'Trial Aktif'}
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
      key: 'sales',
      header: 'Total Omzet Toko',
      align: 'right',
      render: (t) => (
        <div className="font-mono font-bold text-[#191F28] tabular-nums">
          {formatRupiah(t.totalSales)}
          <p className="text-[10px] text-[#6F7780] font-normal font-sans">
            {t.transactionsCount} Transaksi
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (t) => (
        <div className="flex items-center justify-center space-x-1.5">
          {/* Reusable Primary Impersonate Button */}
          <TableActionButton
            icon={LogIn}
            variant="primary"
            isLoading={loadingId === t.id}
            onClick={() => handleImpersonate(t.id, t.name)}
            tooltip="Masuk sebagai Owner Toko untuk Bantuan Teknis"
          />

          {/* Reusable Suspend / Power Toggle Button */}
          <TableActionButton
            icon={Power}
            variant={t.subscriptionStatus === 'suspended' ? 'success' : 'warning'}
            isLoading={loadingId === t.id}
            onClick={() => handleToggleSuspend(t.id, t.subscriptionStatus, t.name)}
            tooltip={
              t.subscriptionStatus === 'suspended'
                ? 'Aktifkan Akun Toko'
                : 'Bekukan (Suspend) Toko'
            }
          />

          {/* Reusable Delete Button */}
          <TableActionButton
            icon={Trash2}
            variant="ghost"
            isLoading={loadingId === t.id}
            onClick={() => handleDeleteTenant(t.id, t.name)}
            tooltip="Hapus Toko Permanen"
            className="hover:text-white hover:bg-[#F04452] hover:border-[#F04452]"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Search & Status Filter on Left, Add Button on Right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Search Input + Status Dropdown */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama toko / owner..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="trial">Uji Coba</option>
            <option value="suspended">Dibekukan</option>
          </select>
        </div>

        {/* Right: ONLY Add Store Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 inline-flex items-center space-x-1.5 px-4 bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Toko</span>
          </button>
        </div>
      </div>

      {/* Reusable Tenants Data Table */}
      <DataTable
        columns={columns}
        data={filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        keyExtractor={(t) => t.id}
        emptyTitle="Belum Ada Toko yang Sesuai"
        emptyMessage="Coba sesuaikan kata kunci pencarian atau filter status."
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

      {/* Reusable Add Tenant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Toko Klien Baru"
        description="Daftarkan toko secara manual dari Superadmin"
        icon={Store}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-3 bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 rounded-lg font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Nama Toko *</label>
              <input
                type="text"
                name="storeName"
                required
                placeholder="misal: Toko Berkah Abadi"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Tipe Bisnis / Sektor</label>
              <select
                name="businessType"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              >
                <option value="minimarket">Minimarket & Sembako</option>
                <option value="fnb">F&B, Kafe & Resto</option>
                <option value="pharmacy">Apotek & Toko Obat</option>
                <option value="workshop">Bengkel & Servis Kendaraan</option>
                <option value="fashion">Fashion & Butik Pakaian</option>
                <option value="building">Toko Bangunan & Material</option>
                <option value="atk">Toko ATK & Fotokopi</option>
                <option value="gadget">Toko HP & Gadget</option>
                <option value="electrical">Toko Listrik & Teknik</option>
                <option value="general">Ritel Umum & Serba Ada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Nama Pemilik (Owner) *</label>
              <input
                type="text"
                name="ownerName"
                required
                placeholder="Nama lengkap owner"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                name="phone"
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E8EB]">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Username Login *</label>
              <input
                type="text"
                name="username"
                required
                placeholder="username owner"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E8EB]">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Paket Langganan</label>
              <select
                name="plan"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-bold text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              >
                <option value="pro">Pro Plan - 1 Toko Mandiri (Rp 99.000 / bln)</option>
                <option value="ultra">Ultra Plan - Unlimited Toko (Rp 249.000 / bln)</option>
                <option value="starter">Starter Plan - Trial Free (7 Hari)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Durasi Langganan</label>
              <select
                name="months"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              >
                <option value="1">1 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="12">1 Tahun (12 Bulan)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E8EB] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#E5E8EB] text-[#6F7780] font-semibold hover:bg-[#F2F4F6]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Daftarkan Toko</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reusable Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
        isLoading={!!loadingId}
      />
    </div>
  );
}
