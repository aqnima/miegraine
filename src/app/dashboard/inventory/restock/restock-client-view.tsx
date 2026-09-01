'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { RestockModal } from './restock-modal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Truck, Plus, FileText, CheckCircle2, Clock } from 'lucide-react';

interface RestockClientViewProps {
  initialOrders: any[];
  suppliers: any[];
  products: any[];
}

export function RestockClientView({
  initialOrders,
  suppliers,
  products,
}: RestockClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedOrders = initialOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'poNumber',
      header: 'No. Faktur (PO)',
      render: ({ po }) => (
        <span className="font-mono font-bold text-[#191F28] text-xs">{po.poNumber}</span>
      ),
    },
    {
      key: 'supplier',
      header: 'Nama Supplier',
      render: ({ supplierName }) => (
        <span className="font-semibold text-[#333D4B] text-xs">
          {supplierName || 'Tanpa Supplier (Lepas)'}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Tanggal Masuk',
      render: ({ po }) => (
        <span className="text-[#6F7780] text-xs">{formatTanggal(po.purchaseDate)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total Belanja',
      render: ({ po }) => (
        <span className="font-extrabold text-[#3182F6] tabular-nums font-mono text-xs">
          {formatRupiah(po.totalAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Pembayaran',
      render: ({ po }) => {
        if (po.paymentStatus === 'PAID') {
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6FAF2] text-[#03B26C]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Lunas (Kas Keluar)</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF5E6] text-[#FE9800]">
            <Clock className="w-3 h-3" />
            <span>Hutang Tempo</span>
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#6F7780]">
          Total {initialOrders.length} Riwayat Faktur Pembelian
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 inline-flex items-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Faktur Masuk Baru</span>
        </button>
      </div>

      {/* Reusable Data Table with Pagination */}
      <DataTable
        columns={columns}
        data={paginatedOrders}
        keyExtractor={(item) => item.po.id}
        emptyTitle="Belum Ada Riwayat Pembelian"
        emptyMessage="Klik tombol 'Catat Faktur Masuk Baru' saat Anda menerima barang dari supplier."
        emptyIcon={Truck}
        pagination={{
          currentPage,
          pageSize,
          totalItems: initialOrders.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Restock Modal Form */}
      <RestockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        suppliers={suppliers}
      />
    </div>
  );
}
