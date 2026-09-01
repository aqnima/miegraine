'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import {
  Boxes,
  Search,
  Truck,
  ClipboardCheck,
  Package,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface InventoryClientViewProps {
  mutations: any[];
  summary: {
    totalAssetValue: number;
    totalItemsCount: number;
    lowStockCount: number;
  };
  lowStockProducts: any[];
}

export function InventoryClientView({
  mutations,
  summary,
  lowStockProducts,
}: InventoryClientViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredMutations = mutations.filter(({ mutation, productName }) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (productName && productName.toLowerCase().includes(q)) ||
      (mutation.notes && mutation.notes.toLowerCase().includes(q)) ||
      (mutation.referenceId && mutation.referenceId.toLowerCase().includes(q));

    const matchType = typeFilter === 'ALL' || mutation.type === typeFilter;

    return matchSearch && matchType;
  });

  const paginatedMutations = filteredMutations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'date',
      header: 'Tanggal & Waktu',
      render: ({ mutation }) => (
        <span className="text-[#6F7780] text-xs">{formatTanggal(mutation.createdAt)}</span>
      ),
    },
    {
      key: 'product',
      header: 'Nama Produk',
      render: ({ productName }) => (
        <span className="font-bold text-[#191F28] text-xs">{productName || 'Produk'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipe Mutasi',
      align: 'center',
      render: ({ mutation }) => {
        const typeMap: Record<string, { label: string; bg: string; text: string }> = {
          PURCHASE: { label: 'Beli Supplier', bg: 'bg-[#E8F3FF]', text: 'text-[#3182F6]' },
          SALE: { label: 'Jual Kasir', bg: 'bg-[#E6FAF2]', text: 'text-[#03B26C]' },
          ADJUSTMENT: { label: 'Stok Opname', bg: 'bg-[#FFF5E6]', text: 'text-[#FE9800]' },
          TRANSFER_IN: { label: 'Transfer Masuk', bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
          TRANSFER_OUT: { label: 'Transfer Keluar', bg: 'bg-[#FEECED]', text: 'text-[#F04452]' },
        };

        const config = typeMap[mutation.type] || {
          label: mutation.type,
          bg: 'bg-[#F2F4F6]',
          text: 'text-[#4E5968]',
        };

        return (
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'qtyChange',
      header: 'Perubahan Qty',
      align: 'center',
      render: ({ mutation, baseUnit }) => {
        const isPositive = mutation.qtyChange > 0;
        return (
          <span
            className={`font-bold tabular-nums text-xs font-mono ${
              isPositive ? 'text-[#03B26C]' : 'text-[#F04452]'
            }`}
          >
            {isPositive ? `+${mutation.qtyChange}` : mutation.qtyChange} {baseUnit}
          </span>
        );
      },
    },
    {
      key: 'stockAfter',
      header: 'Stok Akhir',
      align: 'center',
      render: ({ mutation, baseUnit }) => (
        <span className="font-bold text-[#191F28] tabular-nums text-xs font-mono">
          {mutation.stockAfter} {baseUnit}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Keterangan / Referensi',
      render: ({ mutation }) => (
        <span className="text-[#6F7780] text-xs">
          {mutation.notes || mutation.referenceId || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* 🚀 Unified Top Action Bar: Search & Filter (Left) + Action Buttons (Right) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search & Filter */}
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama barang atau keterangan mutasi..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Mutasi</option>
            <option value="PURCHASE">Beli Supplier</option>
            <option value="SALE">Jual Kasir</option>
            <option value="ADJUSTMENT">Stok Opname</option>
            <option value="TRANSFER_IN">Transfer Masuk</option>
            <option value="TRANSFER_OUT">Transfer Keluar</option>
          </select>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 flex-shrink-0">
          <Link
            href="/dashboard/products"
            className="h-10 inline-flex items-center space-x-2 bg-white hover:bg-[#F2F4F6] text-[#191F28] border border-[#E5E8EB] px-4 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Package className="w-4 h-4 text-[#3182F6]" />
            <span>Katalog Master Produk</span>
          </Link>

          <Link
            href="/dashboard/inventory/restock"
            className="h-10 inline-flex items-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Truck className="w-4 h-4" />
            <span>Barang Masuk (Supplier)</span>
          </Link>

          <Link
            href="/dashboard/inventory/opname"
            className="h-10 inline-flex items-center space-x-2 bg-white hover:bg-[#F2F4F6] text-[#191F28] border border-[#E5E8EB] px-4 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <ClipboardCheck className="w-4 h-4 text-[#3182F6]" />
            <span>Stok Opname</span>
          </Link>
        </div>
      </div>

      {/* 3 Reusable Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Nilai Aset Stok (HPP)"
          value={formatRupiah(summary.totalAssetValue)}
          icon={DollarSign}
          iconColor="text-[#3182F6]"
          subtitle="Dihitung dari Stok Fisik x Moving Average HPP"
        />

        <StatCard
          title="Total Produk Terdaftar"
          value={`${summary.totalItemsCount} SKU`}
          icon={Boxes}
          iconColor="text-[#03B26C]"
          valueColor="text-[#191F28]"
          subtitle="Semua kategori aktif"
        />

        <StatCard
          title="Peringatan Stok Menipis"
          value={`${summary.lowStockCount} Barang`}
          icon={AlertTriangle}
          iconColor={summary.lowStockCount > 0 ? 'text-[#F04452]' : 'text-[#03B26C]'}
          valueColor={summary.lowStockCount > 0 ? 'text-[#F04452]' : 'text-[#191F28]'}
          subtitle="Perlu restock dari supplier segera"
        />
      </div>

      {/* Low Stock Alert Section (If any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-[#FEECED] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-[#F04452] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Perhatian: {lowStockProducts.length} Produk Mencapai Batas Minimum Stok
            </h2>
            <Link
              href="/dashboard/inventory/restock"
              className="text-xs font-bold text-[#3182F6] hover:underline"
            >
              + Buat Order Restock
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[#FEECED]/40 border border-[#FEECED] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#191F28] line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-[#6F7780]">Min. Alert: {p.minStockAlert || 5} {p.baseUnit}</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-[#FEECED] text-[#F04452] font-bold tabular-nums">
                  Sisa {p.stock} {p.baseUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reusable Data Table with Pagination */}
      <DataTable
        columns={columns}
        data={paginatedMutations}
        keyExtractor={({ mutation }) => mutation.id}
        emptyTitle="Belum Ada Mutasi Stok"
        emptyMessage="Mutasi akan tercatat otomatis saat kasir menjual barang atau ada barang masuk supplier."
        emptyIcon={Boxes}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredMutations.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />
    </div>
  );
}
