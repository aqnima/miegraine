'use client';

import React, { useState } from 'react';
import { exportProductsAction, exportTransactionsAction } from '@/lib/actions/bulk';
import {
  Store,
  Printer,
  Database,
  Download,
  Save,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';

interface SettingsClientViewProps {
  user: any;
}

export function SettingsClientView({ user }: SettingsClientViewProps) {
  const [storeName, setStoreName] = useState(user.tenantName);
  const [storeAddress, setStoreAddress] = useState('Jl. Utama No. 123');
  const [storePhone, setStorePhone] = useState('08123456789');
  const [footerMessage, setFooterMessage] = useState('Barang yang sudah dibeli tidak dapat ditukar');
  const [paperWidth, setPaperWidth] = useState<'58' | '80'>('58');
  const [isSaved, setIsSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = async (type: 'products' | 'transactions') => {
    setExporting(true);
    try {
      if (type === 'products') {
        const data = await exportProductsAction();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_Master_Produk_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      } else {
        const data = await exportTransactionsAction();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_Riwayat_Transaksi_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Form Settings */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Profil Toko */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
            <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[#191F28]">Profil Bisnis & Toko</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Nama Toko</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#191F28] mb-1">Alamat Toko</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Format Struk Thermal */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
            <div className="w-8 h-8 rounded-xl bg-[#E6FAF2] text-[#03B26C] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[#191F28]">Format Struk Kasir (Thermal Paper)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Lebar Kertas Printer</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperWidth('58')}
                  className={`py-2 px-3 rounded-xl border font-bold ${
                    paperWidth === '58'
                      ? 'border-[#3182F6] bg-[#E8F3FF] text-[#3182F6]'
                      : 'border-[#E5E8EB] bg-[#F2F4F6] text-[#6F7780]'
                  }`}
                >
                  58mm (Mini Portable)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('80')}
                  className={`py-2 px-3 rounded-xl border font-bold ${
                    paperWidth === '80'
                      ? 'border-[#3182F6] bg-[#E8F3FF] text-[#3182F6]'
                      : 'border-[#E5E8EB] bg-[#F2F4F6] text-[#6F7780]'
                  }`}
                >
                  80mm (Desktop Kasir)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Pesan Footer Struk</label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Backup Data */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5E6] text-[#FE9800] flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-[#191F28]">Cadangan & Ekspor Data Toko (Backup)</h2>
        </div>

        <p className="text-[#6F7780]">
          Unduh salinan berkas seluruh data transaksi dan katalog produk Anda sewaktu-waktu untuk arsip offline.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExportData('products')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] transition-colors border border-[#E5E8EB]"
          >
            <div className="text-left">
              <p className="font-bold text-[#191F28]">Ekspor Master Produk</p>
              <p className="text-[11px] text-[#6F7780]">Format JSON / Spreadsheet</p>
            </div>
            <Download className="w-4 h-4 text-[#3182F6]" />
          </button>

          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExportData('transactions')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] transition-colors border border-[#E5E8EB]"
          >
            <div className="text-left">
              <p className="font-bold text-[#191F28]">Ekspor Riwayat Penjualan</p>
              <p className="text-[11px] text-[#6F7780]">Format JSON / Spreadsheet</p>
            </div>
            <Download className="w-4 h-4 text-[#03B26C]" />
          </button>
        </div>
      </div>
    </div>
  );
}
