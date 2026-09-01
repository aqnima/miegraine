'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { ExpenseModal } from './expense-modal';
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Plus,
  Package,
  Award,
  ArrowUpRight,
  Layers,
  Sparkles,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  Building2,
  Receipt,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { useRouter } from 'next/navigation';

interface ReportsClientViewProps {
  summary: {
    totalOmzet: number;
    totalDiskon: number;
    totalHpp: number;
    labaKotor: number;
    totalBebanOperasional: number;
    labaBersih: number;
    grossMargin: string;
    netMargin: string;
    totalTransactions: number;
  };
  topProducts: any[];
  salesBreakdown: {
    byPayment: any[];
    byCashier: any[];
  };
  inventoryValuation: {
    totalProductsCount: number;
    totalStockQty: number;
    totalAssetCostValue: number;
    stockItems?: any[];
  };
  recentExpenses: any[];
  tenantName: string;
}

export function ReportsClientView({
  summary,
  topProducts,
  salesBreakdown,
  inventoryValuation,
  recentExpenses,
  tenantName,
}: ReportsClientViewProps) {
  const [activeTab, setActiveTab] = useState<'pnl' | 'sales' | 'inventory' | 'export'>('pnl');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const router = useRouter();

  // Tab 2 Cashier Table Pagination
  const [cashierPage, setCashierPage] = useState(1);
  const [cashierPageSize, setCashierPageSize] = useState(10);
  const paginatedCashiers = (salesBreakdown?.byCashier || []).slice(
    (cashierPage - 1) * cashierPageSize,
    cashierPage * cashierPageSize
  );

  // Tab 3 Inventory Table Pagination
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(10);
  const stockItems = inventoryValuation?.stockItems || [];
  const paginatedStockItems = stockItems.slice(
    (inventoryPage - 1) * inventoryPageSize,
    inventoryPage * inventoryPageSize
  );

  // Helper for Exporting CSV to Excel
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      '\uFEFF' + rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPnL = () => {
    const rows = [
      ['LAPORAN LABA RUGI & FINANSIAL TOKO', tenantName],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      [],
      ['Komponen Finansial', 'Nominal (Rp)'],
      ['Total Omzet Penjualan', summary.totalOmzet.toString()],
      ['Total Diskon Diberikan', summary.totalDiskon.toString()],
      ['Total HPP (Modal Pokok)', summary.totalHpp.toString()],
      ['Laba Kotor (Gross Profit)', summary.labaKotor.toString()],
      ['Total Beban Operasional', summary.totalBebanOperasional.toString()],
      ['Laba Bersih (Net Profit)', summary.labaBersih.toString()],
      ['Gross Profit Margin', `${summary.grossMargin}%`],
      ['Net Profit Margin', `${summary.netMargin}%`],
      ['Total Transaksi Selesai', summary.totalTransactions.toString()],
    ];
    downloadCSV(`Laporan_Laba_Rugi_${tenantName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleExportSales = () => {
    const rows = [
      ['REKAP METODE PEMBAYARAN & KASIR', tenantName],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      [],
      ['Metode Pembayaran', 'Jumlah Transaksi', 'Total Omzet (Rp)'],
      ...salesBreakdown.byPayment.map((p) => [
        p.paymentMethod || 'CASH',
        p.count?.toString() || '0',
        p.totalAmount?.toString() || '0',
      ]),
      [],
      ['Nama Kasir', 'Jumlah Transaksi', 'Total Omzet Dihasilkan (Rp)'],
      ...salesBreakdown.byCashier.map((c) => [
        c.userName || 'Kasir',
        c.count?.toString() || '0',
        c.totalAmount?.toString() || '0',
      ]),
    ];
    downloadCSV(`Rekap_Penjualan_${tenantName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleExportInventory = () => {
    const rows = [
      ['VALUASI ASET STOK & INVENTARIS', tenantName],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      [],
      ['Total SKU / Jenis Produk', inventoryValuation.totalProductsCount.toString()],
      ['Total Fisik Unit Stok', inventoryValuation.totalStockQty.toString()],
      ['Total Nilai Modal Aset (HPP)', inventoryValuation.totalAssetCostValue.toString()],
      [],
      ['Nama Produk', 'Stok Fisik', 'Satuan', 'HPP Modal (Rp)', 'Total Nilai Aset (Rp)'],
      ...(inventoryValuation.stockItems || []).map((item) => [
        item.productName,
        item.currentStock?.toString() || '0',
        item.baseUnit || 'pcs',
        item.costPrice?.toString() || '0',
        ((item.currentStock || 0) * (item.costPrice || 0)).toString(),
      ]),
    ];
    downloadCSV(`Valuasi_Stok_${tenantName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Toolbar: Report Type Selector + Action Button (Aligned) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full h-10 px-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-bold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer"
          >
            <option value="pnl">Laporan Laba Rugi & HPP (P&L)</option>
            <option value="sales">Rekap Penjualan & Kasir</option>
            <option value="inventory">Valuasi Aset Stok Gudang</option>
            <option value="export">Export Excel & Backup Data</option>
          </select>
        </div>

        <button
          onClick={() => setIsExpenseOpen(true)}
          className="h-10 inline-flex items-center justify-center space-x-2 bg-[#F04452] hover:bg-[#D93846] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Biaya Operasional</span>
        </button>
      </div>

      {/* TAB 1: LABA RUGI & HPP */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Omzet Penjualan"
              value={formatRupiah(summary.totalOmzet)}
              icon={DollarSign}
              iconColor="text-[#3182F6]"
              subtitle={`${summary.totalTransactions} transaksi tercatat`}
            />

            <StatCard
              title="Total HPP Modal Pokok"
              value={formatRupiah(summary.totalHpp)}
              icon={Layers}
              iconColor="text-[#FE9800]"
              subtitle="Modal dasar barang terjual"
            />

            <StatCard
              title="Beban Operasional Toko"
              value={formatRupiah(summary.totalBebanOperasional)}
              icon={TrendingDown}
              iconColor="text-[#F04452]"
              subtitle={`${recentExpenses.length} pos biaya dicatat`}
            />

            <StatCard
              title="Laba Bersih Realtime"
              value={formatRupiah(summary.labaBersih)}
              icon={TrendingUp}
              iconColor={summary.labaBersih >= 0 ? 'text-[#03B26C]' : 'text-[#F04452]'}
              valueColor={summary.labaBersih >= 0 ? 'text-[#03B26C]' : 'text-[#F04452]'}
              subtitle={`Margin Bersih: ${summary.netMargin}%`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#3182F6]" />
                  <h3 className="font-bold text-sm text-[#191F28]">Produk Terlaris</h3>
                </div>
                <span className="text-[11px] font-semibold text-[#6F7780]">Paling Banyak Terjual</span>
              </div>

              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6F7780]">Belum ada transaksi produk.</div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA] text-xs">
                      <div className="flex items-center space-x-3 truncate">
                        <span className="w-6 h-6 rounded-full bg-[#E8F3FF] text-[#3182F6] font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-[#191F28] truncate">{p.productName || 'Produk'}</p>
                          <p className="text-[10px] text-[#6F7780]">
                            {p.totalQty} {p.baseUnit || p.unitName || 'pcs'} terjual
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#191F28] tabular-nums">
                        {formatRupiah(p.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-[#F04452]" />
                  <h3 className="font-bold text-sm text-[#191F28]">Biaya Operasional Terakhir</h3>
                </div>
                <span className="text-[11px] font-semibold text-[#6F7780]">Kas Keluar</span>
              </div>

              {recentExpenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6F7780]">Belum ada biaya operasional dicatat.</div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {recentExpenses.map((e) => (
                    <div key={e.id} className="p-3 rounded-lg bg-[#F8F9FA] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#191F28]">{e.category}</p>
                        <p className="text-[10px] text-[#6F7780]">
                          {e.description || 'Pengeluaran kas'} • {formatTanggal(e.createdAt)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-[#F04452] tabular-nums">
                        -{formatRupiah(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP PENJUALAN & KASIR */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs">
            <h3 className="font-bold text-sm text-[#191F28] mb-4">Metode Pembayaran Transaksi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['CASH', 'QRIS', 'TRANSFER', 'DEBT'].map((method) => {
                const found = salesBreakdown.byPayment.find((p) => p.paymentMethod === method);
                const total = found?.totalAmount || 0;
                const count = found?.count || 0;

                return (
                  <div key={method} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7780]">
                      {method === 'CASH'
                        ? 'Tunai Kasir'
                        : method === 'QRIS'
                        ? 'QRIS Digital'
                        : method === 'TRANSFER'
                        ? 'Transfer Bank'
                        : 'Kasbon / Piutang'}
                    </span>
                    <p className="font-black text-lg text-[#191F28] font-mono tabular-nums">
                      {formatRupiah(total)}
                    </p>
                    <p className="text-[11px] text-[#6F7780] font-semibold">{count} Transaksi</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cashier Performance Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#191F28]">Performa Omzet Kasir</h3>
            <DataTable
              columns={[
                {
                  key: 'userName',
                  header: 'Nama Kasir',
                  render: (c) => (
                    <span className="font-bold text-[#191F28]">{c.userName || 'Kasir'}</span>
                  ),
                },
                {
                  key: 'count',
                  header: 'Jumlah Transaksi',
                  align: 'center',
                  render: (c) => (
                    <span className="font-semibold text-[#4E5968]">{c.count} Transaksi</span>
                  ),
                },
                {
                  key: 'totalAmount',
                  header: 'Total Omzet Dihasilkan',
                  align: 'right',
                  render: (c) => (
                    <span className="font-mono font-bold text-[#3182F6] tabular-nums">
                      {formatRupiah(c.totalAmount)}
                    </span>
                  ),
                },
              ]}
              data={paginatedCashiers}
              keyExtractor={(item, idx) => item.userId || String(idx)}
              emptyTitle="Belum Ada Transaksi Kasir"
              emptyMessage="Belum ada performa kasir tercatat pada periode ini."
              emptyIcon={Users}
              pagination={{
                currentPage: cashierPage,
                pageSize: cashierPageSize,
                totalItems: (salesBreakdown?.byCashier || []).length,
                onPageChange: setCashierPage,
                onPageSizeChange: (size) => {
                  setCashierPageSize(size);
                  setCashierPage(1);
                },
                pageSizeOptions: [10, 25, 50, 100],
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 3: VALUASI ASET STOK */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Jenis SKU Produk"
              value={`${inventoryValuation.totalProductsCount} Produk`}
              icon={Package}
              iconColor="text-[#3182F6]"
              subtitle="Katalog master produk aktif"
            />

            <StatCard
              title="Total Fisik Barang di Rak"
              value={`${inventoryValuation.totalStockQty.toLocaleString('id-ID')} Unit`}
              icon={Layers}
              iconColor="text-[#FE9800]"
              subtitle="Jumlah seluruh stok di cabang"
            />

            <StatCard
              title="Total Nilai Modal Aset (HPP)"
              value={formatRupiah(inventoryValuation.totalAssetCostValue)}
              icon={DollarSign}
              iconColor="text-[#03B26C]"
              subtitle="Modal yang tertanam dalam stok barang"
            />
          </div>

          {/* Stock Valuation Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#191F28]">Daftar Nilai Modal Stok per Produk</h3>
            <DataTable
              columns={[
                {
                  key: 'productName',
                  header: 'Nama Produk',
                  render: (item) => (
                    <span className="font-bold text-[#191F28]">{item.productName}</span>
                  ),
                },
                {
                  key: 'currentStock',
                  header: 'Stok Fisik',
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
                  header: 'Total Nilai Aset',
                  align: 'right',
                  render: (item) => (
                    <span className="font-mono font-bold text-[#191F28] tabular-nums">
                      {formatRupiah((item.currentStock || 0) * (item.costPrice || 0))}
                    </span>
                  ),
                },
              ]}
              data={paginatedStockItems}
              keyExtractor={(item, idx) => item.productId || String(idx)}
              emptyTitle="Belum Ada Data Stok"
              emptyMessage="Belum ada data stok produk tercatat di cabang ini."
              emptyIcon={Layers}
              pagination={{
                currentPage: inventoryPage,
                pageSize: inventoryPageSize,
                totalItems: stockItems.length,
                onPageChange: setInventoryPage,
                onPageSizeChange: (size) => {
                  setInventoryPageSize(size);
                  setInventoryPage(1);
                },
                pageSizeOptions: [10, 25, 50, 100],
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT EXCEL & CETAK LAPORAN */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-xl border border-[#E5E8EB] shadow-xs">
            <div className="flex items-center space-x-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-[#03B26C]" />
              <h2 className="text-base font-bold text-[#191F28]">Unduh File Laporan Excel (.csv)</h2>
            </div>
            <p className="text-xs text-[#6F7780] mb-6">
              File hasil unduhan kompatibel penuh dengan Microsoft Excel, Google Sheets, dan Numbers untuk pembukuan akuntansi toko.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-[#191F28]">1. Laporan Laba Rugi</h3>
                  <p className="text-xs text-[#6F7780] mt-1">
                    Rekap omzet, diskon, HPP modal, beban biaya operasional, dan laba bersih.
                  </p>
                </div>
                <button
                  onClick={handleExportPnL}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#03B26C] hover:bg-[#029B5E] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Laba Rugi</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-[#191F28]">2. Rekap Penjualan & Kasir</h3>
                  <p className="text-xs text-[#6F7780] mt-1">
                    Rekapitulasi metode bayar (Tunai, QRIS, Transfer, Piutang) dan omzet kasir.
                  </p>
                </div>
                <button
                  onClick={handleExportSales}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Penjualan</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-[#191F28]">3. Valuasi Nilai Stok</h3>
                  <p className="text-xs text-[#6F7780] mt-1">
                    Daftar seluruh produk beserta jumlah stok fisik dan valuasi modal aset HPP.
                  </p>
                </div>
                <button
                  onClick={handleExportInventory}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#FE9800] hover:bg-[#E68A00] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Stok</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Biaya Operasional */}
      <ExpenseModal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} />
    </div>
  );
}
