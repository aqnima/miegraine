'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { Package, Layers, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';

interface InventoryReportClientViewProps {
  valuation: {
    totalProductsCount: number;
    totalStockQty: number;
    totalAssetCostValue: number;
    stockItems?: any[];
  };
  tenantName: string;
}

export function InventoryReportClientView({
  valuation,
  tenantName,
}: InventoryReportClientViewProps) {
  const stockItems = valuation.stockItems || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedItems = stockItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'productName',
      header: 'Nama Produk',
      render: (item) => (
        <span className="font-bold text-[#191F28]">{item.productName}</span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stok Fisik Tersedia',
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-[#4E5968]">
          {item.currentStock} {item.baseUnit || 'pcs'}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: 'Modal Pokok (HPP)',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-[#6F7780] tabular-nums">
          {formatRupiah(item.costPrice)}
        </span>
      ),
    },
    {
      key: 'totalAsset',
      header: 'Total Nilai Aset Modal',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-[#191F28] tabular-nums">
          {formatRupiah((item.currentStock || 0) * (item.costPrice || 0))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Jenis SKU Produk"
          value={`${valuation.totalProductsCount} Produk`}
          icon={Package}
          iconColor="text-[#3182F6]"
          subtitle="Katalog master produk aktif"
        />

        <StatCard
          title="Total Fisik Barang di Rak"
          value={`${valuation.totalStockQty.toLocaleString('id-ID')} Unit`}
          icon={Layers}
          iconColor="text-[#FE9800]"
          subtitle="Jumlah seluruh stok di cabang"
        />

        <StatCard
          title="Total Nilai Modal Aset (HPP)"
          value={formatRupiah(valuation.totalAssetCostValue)}
          icon={DollarSign}
          iconColor="text-[#03B26C]"
          valueColor="text-[#03B26C]"
          subtitle="Modal yang tertanam dalam stok barang"
        />
      </div>

      {/* Product Stock Valuation Table */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#3182F6]" />
          <h3 className="font-bold text-sm text-[#191F28]">Daftar Nilai Modal Stok per Produk</h3>
        </div>

        <DataTable
          columns={columns}
          data={paginatedItems}
          keyExtractor={(item, idx) => item.productId || String(idx)}
          emptyTitle="Belum Ada Data Stok"
          emptyMessage="Belum ada data stok produk tercatat di cabang toko ini."
          emptyIcon={Layers}
          pagination={{
            currentPage,
            pageSize,
            totalItems: stockItems.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      </div>
    </div>
  );
}
