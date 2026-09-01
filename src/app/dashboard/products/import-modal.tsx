'use client';

import React, { useState } from 'react';
import { bulkImportProductsAction, BulkProductRow } from '@/lib/actions/bulk';
import { Modal } from '@/components/ui/modal';
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Check,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [previewRows, setPreviewRows] = useState<BulkProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleCsv = `Barcode,Nama Produk,Satuan Dasar,Harga Modal (HPP),Harga Jual Ecer,Stok Awal,Satuan Tambahan,Konversi,Harga Satuan Tambahan
8991001,Buku Tulis Sinar Dunia 38,pcs,3000,5000,100,pack,10,45000
8991002,Pulpen Snowman V-1 Hitam,pcs,2000,3500,240,lusin,12,38000
8991003,Kopi Kapal Api Special 65g,pcs,5500,7000,50,renceng,10,65000
8991004,Semen Tiga Roda 50kg,sak,55000,68000,80,,,`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Import_Produk_Miegraine.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseCsv = (text: string) => {
    setCsvText(text);
    setError(null);

    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setPreviewRows([]);
      return;
    }

    const rows: BulkProductRow[] = [];

    // Skip header line (index 0)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 5 && cols[1]) {
        rows.push({
          barcode: cols[0] || undefined,
          name: cols[1],
          baseUnit: cols[2] || 'pcs',
          costPrice: Number(cols[3]) || 0,
          sellingPrice: Number(cols[4]) || 0,
          initialStock: Number(cols[5]) || 0,
          extraUnitName: cols[6] || undefined,
          extraUnitConversion: Number(cols[7]) || undefined,
          extraUnitPrice: Number(cols[8]) || undefined,
        });
      }
    }

    setPreviewRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleParseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (previewRows.length === 0) {
      setError('Tidak ada data valid yang dapat diimpor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await bulkImportProductsAction(previewRows);
      if (res.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengimpor produk.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#E5E8EB] font-bold text-xs text-[#6F7780] hover:bg-[#F2F4F6] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        <span>Batal</span>
      </button>
      <button
        type="button"
        disabled={loading || previewRows.length === 0}
        onClick={handleSubmit}
        className="px-5 py-2 rounded-lg bg-[#03B26C] hover:bg-[#029B5D] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Memproses {previewRows.length} Produk...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Simpan & Terapkan {previewRows.length} Produk</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Produk dari Excel / CSV"
      description="Unggah ribuan produk, satuan bertingkat & saldo stok awal dalam 3 detik"
      icon={FileSpreadsheet}
      iconColor="text-[#03B26C]"
      iconBg="bg-[#E6FAF2]"
      maxWidth="2xl"
      footer={footer}
    >
      <div className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Download Sample & Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] flex flex-col justify-between space-y-2">
            <div>
              <h3 className="font-bold text-[#191F28]">1. Unduh Format Template Resmi</h3>
              <p className="text-[#6F7780] text-[11px] mt-0.5">
                Gunakan format kolom yang sesuai agar data terbaca sempurna.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-[#E8F3FF] text-[#3182F6] font-bold rounded-xl border border-[#E5E8EB] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template CSV / Excel</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#E8F3FF]/40 border border-[#3182F6]/20 flex flex-col justify-between space-y-2">
            <div>
              <h3 className="font-bold text-[#191F28]">2. Upload Berkas Anda</h3>
              <p className="text-[#6F7780] text-[11px] mt-0.5">
                Pilih file CSV / Spreadsheet yang telah Anda isi.
              </p>
            </div>
            <label className="cursor-pointer inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold rounded-xl transition-colors shadow-2xs">
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas CSV</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Smart Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#191F28] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#03B26C]" />
                Pratinjau Data Valid ({previewRows.length} Produk Siap Masuk)
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-[#E5E8EB] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2F4F6] text-[#6F7780] font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Nama Produk</th>
                    <th className="p-2.5">Satuan</th>
                    <th className="p-2.5">Modal HPP</th>
                    <th className="p-2.5">Harga Jual</th>
                    <th className="p-2.5">Stok Awal</th>
                    <th className="p-2.5">Satuan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EB]">
                  {previewRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#F2F4F6]/50">
                      <td className="p-2.5 font-bold text-[#191F28]">{r.name}</td>
                      <td className="p-2.5 uppercase font-bold text-[#3182F6]">{r.baseUnit}</td>
                      <td className="p-2.5 tabular-nums">Rp {r.costPrice.toLocaleString('id-ID')}</td>
                      <td className="p-2.5 tabular-nums font-bold text-[#03B26C]">
                        Rp {r.sellingPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 tabular-nums font-bold">{r.initialStock}</td>
                      <td className="p-2.5 text-[#6F7780]">
                        {r.extraUnitName
                          ? `${r.extraUnitName.toUpperCase()} (x${r.extraUnitConversion})`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
