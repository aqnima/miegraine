'use client';

import React, { useState } from 'react';
import { createStockOpnameAction, OpnameItemInput } from '@/lib/actions/inventory';
import { formatRibuan, parseRibuan } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Plus,
  Trash2,
  ClipboardCheck,
  AlertTriangle,
  Loader2,
  X,
  Check,
} from 'lucide-react';

interface OpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

export function OpnameModal({ isOpen, onClose, products }: OpnameModalProps) {
  const toast = useToast();
  const [items, setItems] = useState<OpnameItemInput[]>([
    {
      productId: products[0]?.id || '',
      systemStock: products[0]?.stock || 0,
      physicalStock: products[0]?.stock || 0,
      reason: 'SALAH_HITUNG',
      notes: '',
    },
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || '',
        systemStock: defaultProd?.stock || 0,
        physicalStock: defaultProd?.stock || 0,
        reason: 'SALAH_HITUNG',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OpnameItemInput, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        item.systemStock = prod.stock || 0;
        item.physicalStock = prod.stock || 0;
      }
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (items.length === 0) {
        throw new Error('Daftar barang opname tidak boleh kosong.');
      }

      await createStockOpnameAction({
        items,
        notes,
      });

      toast.success('Stok Opname Berhasil', 'Penyesuaian stok fisik telah disinkronkan ke sistem.');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Gagal menyimpan stok opname.';
      setError(msg);
      toast.error('Gagal Simpan Opname', msg);
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
        type="submit"
        form="opname-form"
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Penyesuaian Stok</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stok Opname / Penyesuaian Fisik"
      description="Sesuaikan stok fisik gudang dengan sistem & catat alasan selisih"
      icon={ClipboardCheck}
      maxWidth="2xl"
      footer={footer}
    >
      <form id="opname-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-[#191F28]">Daftar Barang Opname</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#E8F3FF] text-[#3182F6] font-bold text-xs hover:bg-[#3182F6] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const prod = products.find((p) => p.id === item.productId);
              const diff = item.physicalStock - item.systemStock;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    {/* Product Selector */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Nama Produk
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stok Sistem: {p.stock} {p.baseUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Physical Stock Input */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Stok Fisik Nyata ({prod?.baseUnit || 'Base'})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRibuan(item.physicalStock)}
                        onChange={(e) =>
                          handleItemChange(idx, 'physicalStock', parseRibuan(e.target.value))
                        }
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums text-[#3182F6]"
                      />
                    </div>

                    {/* Reason */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Alasan Selisih
                      </label>
                      <select
                        value={item.reason}
                        onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold"
                      >
                        <option value="SALAH_HITUNG">Salah Hitung</option>
                        <option value="RUSAK">Barang Rusak</option>
                        <option value="HILANG">Barang Hilang</option>
                        <option value="KADALUARSA">Kadaluarsa</option>
                        <option value="LAINNYA">Lainnya</option>
                      </select>
                    </div>

                    {/* Remove */}
                    <div className="sm:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 rounded-xl bg-[#FEECED] text-[#F04452] hover:bg-[#F04452] hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-[#E5E8EB]">
                    <span className="text-[#6F7780]">
                      Sistem: {item.systemStock} {prod?.baseUnit} ➔ Fisik: {item.physicalStock} {prod?.baseUnit}
                    </span>
                    <span
                      className={`font-bold ${
                        diff === 0
                          ? 'text-[#03B26C]'
                          : diff > 0
                          ? 'text-[#3182F6]'
                          : 'text-[#F04452]'
                      }`}
                    >
                      Selisih: {diff > 0 ? `+${diff}` : diff} {prod?.baseUnit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
