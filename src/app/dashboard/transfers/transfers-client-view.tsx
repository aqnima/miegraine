'use client';

import React, { useState } from 'react';
import {
  createStockTransferAction,
  confirmStockTransferAction,
} from '@/lib/actions/stock-transfers';
import { formatTanggal, formatRibuan, parseRibuan } from '@/lib/utils';
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Search,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal, AlertModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';

interface TransfersClientViewProps {
  transfers: any[];
  outlets: any[];
  products: any[];
  currentOutletId: string;
}

export function TransfersClientView({
  transfers,
  outlets,
  products,
  currentOutletId,
}: TransfersClientViewProps) {
  const toast = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [transferToConfirm, setTransferToConfirm] = useState<any | null>(null);

  // Form State for Transfer Items
  const [sourceOutletId, setSourceOutletId] = useState<string>(
    currentOutletId || (outlets[0]?.id ?? '')
  );
  const [targetOutletId, setTargetOutletId] = useState<string>(
    outlets.find((o) => o.id !== (currentOutletId || outlets[0]?.id))?.id ?? ''
  );
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;
  const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;

  const filteredTransfers = transfers.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (item.transferNo && item.transferNo.toLowerCase().includes(q)) ||
      (item.sourceOutletName && item.sourceOutletName.toLowerCase().includes(q)) ||
      (item.targetOutletName && item.targetOutletName.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createStockTransferAction({
        sourceOutletId,
        targetOutletId,
        items,
        notes,
      });
      toast.success('Surat Jalan Dibuat', 'Transfer barang berhasil dicatat dan sedang dalam perjalanan.');
      setShowCreateModal(false);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat surat transfer stok.';
      setErrorMsg(msg);
      toast.error('Gagal Buat Transfer', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeConfirmReceive = async () => {
    if (!transferToConfirm) return;
    setConfirmingId(transferToConfirm.id);
    try {
      await confirmStockTransferAction(transferToConfirm.id);
      toast.success('Transfer Diterima!', 'Stok barang telah disinkronkan ke cabang tujuan.');
      setTransferToConfirm(null);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal konfirmasi penerimaan stok transfer.';
      setTransferToConfirm(null);
      setAlertError(msg);
      toast.error('Gagal Terima Transfer', msg);
    } finally {
      setConfirmingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'transferNo',
      header: 'No. Surat Jalan',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#191F28]">{item.transferNo}</span>
          <p className="text-[10px] text-[#6F7780]">{formatTanggal(item.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Rute Transfer',
      render: (item) => (
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-[#191F28]">{item.sourceOutletName}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#3182F6]" />
          <span className="font-bold text-[#3182F6]">{item.targetOutletName}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Barang yang Dikirim',
      render: (item) => (
        <div>
          <span className="font-bold text-xs text-[#191F28]">
            {item.totalItemsCount} Unit ({item.items.length} Item)
          </span>
          <p className="text-[10px] text-[#6F7780] truncate max-w-xs">
            {item.items.map((i: any) => `${i.productName} (${i.quantity} ${i.unitName})`).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const isCompleted = item.status === 'COMPLETED';
        const isCancelled = item.status === 'CANCELLED';

        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
              isCompleted
                ? 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20'
                : isCancelled
                ? 'bg-[#FEECED] text-[#F04452] border-[#F04452]/20'
                : 'bg-[#FFF5E6] text-[#FE9800] border-[#FE9800]/20'
            }`}
          >
            {isCompleted ? 'Selesai Diterima' : isCancelled ? 'Dibatalkan' : 'Dalam Perjalanan'}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'center',
      render: (item) => {
        if (item.status === 'IN_TRANSIT') {
          return (
            <button
              onClick={() => setTransferToConfirm(item)}
              disabled={confirmingId === item.id}
              className="p-1.5 rounded-lg text-white bg-[#03B26C] hover:bg-[#029B5E] transition-colors inline-flex items-center justify-center shadow-2xs active:scale-98"
              title="Konfirmasi Terima Barang"
            >
              <Check className="w-4 h-4" />
            </button>
          );
        }
        return (
          <span className="text-[11px] font-semibold text-[#6F7780]">
            -
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Toolbar: Search + Filter + Action Button (Aligned) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no. transfer, cabang, catatan..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Status</option>
            <option value="IN_TRANSIT">Sedang Dikirim ({inTransitCount})</option>
            <option value="COMPLETED">Selesai Diterima ({completedCount})</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 inline-flex items-center justify-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl font-bold text-xs transition-all shadow-2xs flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Jalan Transfer</span>
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Riwayat Transfer"
          value={`${transfers.length} Mutasi`}
          icon={Truck}
          iconColor="text-[#3182F6]"
          subtitle="Seluruh pengiriman barang antar-cabang"
        />

        <StatCard
          title="Dalam Perjalanan (In Transit)"
          value={`${inTransitCount} Pengiriman`}
          icon={Clock}
          iconColor={inTransitCount > 0 ? 'text-[#FE9800]' : 'text-[#6F7780]'}
          valueColor={inTransitCount > 0 ? 'text-[#FE9800]' : 'text-[#191F28]'}
          subtitle="Menunggu konfirmasi terima di cabang tujuan"
        />

        <StatCard
          title="Transfer Selesai Diterima"
          value={`${completedCount} Selesai`}
          icon={CheckCircle2}
          iconColor="text-[#03B26C]"
          subtitle="Stok telah disinkronkan ke cabang tujuan"
        />
      </div>

      {/* DataTable of Transfers */}
      <DataTable
        columns={columns}
        data={paginatedTransfers}
        keyExtractor={(item) => item.id}
        emptyTitle="Belum Ada Transfer Stok"
        emptyMessage="Klik tombol '+ Buat Surat Jalan Transfer' untuk mengirim stok barang antar cabang."
        emptyIcon={Truck}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredTransfers.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Reusable Modal Buat Transfer Stok */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Surat Jalan Transfer Stok"
        description="Transfer & kirim stok barang antar cabang toko"
        icon={Truck}
        maxWidth="xl"
        footer={
          <div className="flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] text-[#4E5968] font-bold text-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="transfer-form"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Transfer...</span>
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5" />
                  <span>Kirim Transfer Stok</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEECED] text-[#F04452] text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form id="transfer-form" onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Cabang Asal (Pengirim) *
              </label>
              <select
                value={sourceOutletId}
                onChange={(e) => setSourceOutletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} {o.isMain ? '(Pusat)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Cabang Tujuan (Penerima) *
              </label>
              <select
                value={targetOutletId}
                onChange={(e) => setTargetOutletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} {o.isMain ? '(Pusat)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Dynamic List */}
          <div className="space-y-2 pt-2 border-t border-[#E5E8EB]">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#191F28]">
                Daftar Produk yang Ditransfer *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[#3182F6] hover:text-[#2272EB] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.baseUnit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRibuan(item.quantity)}
                    onChange={(e) =>
                      handleItemChange(idx, 'quantity', parseRibuan(e.target.value))
                    }
                    placeholder="Qty"
                    className="w-24 px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl font-mono font-bold text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="w-8 h-8 rounded-xl text-[#F04452] hover:bg-[#FEECED] flex items-center justify-center flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#191F28] mb-1">
              Catatan / Keterangan Driver Pengirim
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="misal: Dikirim via kurir toko motor Beat / Mobil Pickup..."
              className="w-full px-3.5 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Receiving Transfer */}
      <ConfirmModal
        isOpen={!!transferToConfirm}
        onClose={() => setTransferToConfirm(null)}
        onConfirm={executeConfirmReceive}
        isLoading={!!confirmingId}
        title="Konfirmasi Penerimaan Stok?"
        description={
          <span>
            Apakah barang fisik dengan nomor surat jalan <strong>"{transferToConfirm?.transferNo}"</strong> dari cabang <strong>{transferToConfirm?.sourceOutletName}</strong> sudah tiba dan dicek lengkap? Stok di cabang Anda akan otomatis bertambah.
          </span>
        }
        confirmText="Ya, Terima & Update Stok"
        cancelText="Batal"
        variant="success"
      />

      {/* Error Alert Modal */}
      <AlertModal
        isOpen={!!alertError}
        onClose={() => setAlertError(null)}
        title="Gagal Memproses"
        description={alertError || ''}
      />
    </div>
  );
}
