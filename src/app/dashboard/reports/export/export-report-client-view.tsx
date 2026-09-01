'use client';

import React from 'react';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';

interface ExportReportClientViewProps {
  summary: any;
  salesBreakdown: any;
  inventoryValuation: any;
  tenantName: string;
}

export function ExportReportClientView({
  summary,
  salesBreakdown,
  inventoryValuation,
  tenantName,
}: ExportReportClientViewProps) {
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
      ...salesBreakdown.byPayment.map((p: any) => [
        p.paymentMethod || 'CASH',
        p.count?.toString() || '0',
        p.totalAmount?.toString() || '0',
      ]),
      [],
      ['Nama Kasir', 'Jumlah Transaksi', 'Total Omzet Dihasilkan (Rp)'],
      ...salesBreakdown.byCashier.map((c: any) => [
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
      ...(inventoryValuation.stockItems || []).map((item: any) => [
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
    <div className="space-y-5">

      {/* 3 Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#E6FAF2] text-[#03B26C] flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#191F28]">1. Laporan Laba Rugi</h3>
            <p className="text-xs text-[#6F7780] mt-1">
              Rekapitulasi omzet, potongan diskon, HPP modal pokok, biaya operasional, dan laba bersih.
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

        <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#191F28]">2. Rekap Penjualan & Kasir</h3>
            <p className="text-xs text-[#6F7780] mt-1">
              Data transaksi per metode pembayaran (Tunai, QRIS, Transfer, Piutang) dan performa omzet kasir.
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

        <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF5E6] text-[#FE9800] flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#191F28]">3. Valuasi Nilai Stok</h3>
            <p className="text-xs text-[#6F7780] mt-1">
              Daftar seluruh SKU produk beserta jumlah stok fisik dan total valuasi modal aset (HPP).
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
  );
}
