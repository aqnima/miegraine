'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Boxes,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';

interface UnitItem {
  id: string;
  name: string;
  symbol: string;
  category: 'unit' | 'weight' | 'volume' | 'length' | 'package';
  description?: string;
}

const DEFAULT_UNITS: UnitItem[] = [
  { id: 'pcs', name: 'Pieces / Buah', symbol: 'pcs', category: 'unit', description: 'Satuan standar perorangan / butir / biji' },
  { id: 'dus', name: 'Dus / Karton', symbol: 'dus', category: 'package', description: 'Kemasan kardus / box distributor' },
  { id: 'pack', name: 'Pack / Bungkus', symbol: 'pack', category: 'package', description: 'Kemasan sachet / pak kecil' },
  { id: 'lusin', name: 'Lusin (12 Pcs)', symbol: 'lsn', category: 'package', description: 'Setara 12 pieces' },
  { id: 'kodi', name: 'Kodi (20 Pcs)', symbol: 'kodi', category: 'package', description: 'Setara 20 pieces (pakaian / tekstil)' },
  { id: 'gross', name: 'Gross (144 Pcs)', symbol: 'grs', category: 'package', description: 'Setara 12 lusin / 144 pieces' },
  { id: 'bal', name: 'Bal / Karung', symbol: 'bal', category: 'package', description: 'Kemasan bal karung besar' },
  { id: 'kg', name: 'Kilogram', symbol: 'kg', category: 'weight', description: 'Satuan berat standar (1000 gram)' },
  { id: 'gram', name: 'Gram', symbol: 'gr', category: 'weight', description: 'Satuan berat kecil' },
  { id: 'liter', name: 'Liter', symbol: 'lt', category: 'volume', description: 'Satuan volume cairan' },
  { id: 'meter', name: 'Meter', symbol: 'm', category: 'length', description: 'Satuan panjang kain / kabel' },
  { id: 'roll', name: 'Roll / Gulung', symbol: 'roll', category: 'package', description: 'Kemasan gulungan pita / kawat / plastik' },
  { id: 'botol', name: 'Botol', symbol: 'btl', category: 'unit', description: 'Kemasan botol' },
  { id: 'porsi', name: 'Porsi / Piring', symbol: 'prsi', category: 'unit', description: 'Satuan sajian makanan & minuman' },
];

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnitModal({ isOpen, onClose }: UnitModalProps) {
  const [units, setUnits] = useState<UnitItem[]>(DEFAULT_UNITS);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State for Add Custom Unit
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [category, setCategory] = useState<'unit' | 'package' | 'weight' | 'volume' | 'length'>('package');
  const [description, setDescription] = useState('');

  const toast = useToast();

  const filteredUnits = units.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q) ||
      (u.description && u.description.toLowerCase().includes(q))
    );
  });

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      toast.warning('Peringatan', 'Nama satuan dan simbol singkatan wajib diisi.');
      return;
    }

    const newUnit: UnitItem = {
      id: symbol.toLowerCase().trim(),
      name: name.trim(),
      symbol: symbol.toLowerCase().trim(),
      category,
      description: description.trim() || undefined,
    };

    setUnits([newUnit, ...units]);
    setName('');
    setSymbol('');
    setDescription('');
    setIsAdding(false);
    toast.success('Satuan Tersimpan', `Master satuan "${newUnit.name}" siap digunakan pada multi-satuan produk.`);
  };

  const handleDeleteUnit = (id: string, unitName: string) => {
    setUnits(units.filter((u) => u.id !== id));
    toast.info('Satuan Dihapus', `Satuan "${unitName}" telah dinonaktifkan.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Master Satuan & Kemasan (Multi-Satuan)"
      description="Daftar standar satuan dasar dan kemasan grosir untuk konversi otomatis"
      icon={Scale}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] rounded-xl text-xs font-bold transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Tutup</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-[#E8F3FF] border border-[#BCE0FD] flex items-start space-x-3">
          <Info className="w-4 h-4 text-[#3182F6] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#191F28] space-y-0.5">
            <p className="font-bold">Konversi Multi-Satuan Otomatis</p>
            <p className="text-[#4E5968] text-[11px]">
              Setiap satuan di bawah dapat Anda gunakan saat input produk (contoh: Beli 1 <strong>Dus</strong> isi 24 <strong>Pcs</strong>, jual grosir per <strong>Pack</strong>). Kasir & Stok otomatis menyesuaikan konversinya.
            </p>
          </div>
        </div>

        {/* Top Action & Search Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari satuan (Pcs, Dus, Kg, Liter...)"
              className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] placeholder:text-[#8B95A1]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`h-9 inline-flex items-center space-x-1.5 px-3.5 rounded-xl font-bold text-xs transition-all ${
              isAdding
                ? 'bg-[#F2F4F6] text-[#4E5968]'
                : 'bg-[#3182F6] hover:bg-[#2272EB] text-white shadow-2xs'
            }`}
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAdding ? 'Batal' : 'Tambah Satuan Kustom'}</span>
          </button>
        </div>

        {/* Inline Add Form */}
        {isAdding && (
          <form onSubmit={handleAddUnit} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191F28] flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-[#3182F6]" />
                Tambah Satuan / Kemasan Baru
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Nama Satuan *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Galon / Slop"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Simbol / Singkatan *</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Contoh: gln / slp"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Kategori Satuan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-9 px-2 bg-white border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                >
                  <option value="package">Kemasan / Grosir</option>
                  <option value="unit">Satuan Tunggal</option>
                  <option value="weight">Timbangan (Berat)</option>
                  <option value="volume">Takaran (Cairan)</option>
                  <option value="length">Ukuran (Panjang)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Keterangan / Penggunaan (Opsional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Kemasan 1 slop rokok isi 10 bungkus"
                className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Satuan</span>
              </button>
            </div>
          </form>
        )}

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredUnits.map((u) => {
            const badgeColor =
              u.category === 'package'
                ? 'bg-[#E8F3FF] text-[#3182F6]'
                : u.category === 'weight'
                ? 'bg-[#FFF5E6] text-[#FE9800]'
                : u.category === 'volume'
                ? 'bg-[#F3E8FF] text-[#7E22CE]'
                : 'bg-[#E6FAF2] text-[#03B26C]';

            return (
              <div
                key={u.id}
                className="p-3 rounded-xl border border-[#E5E8EB] bg-white hover:border-[#3182F6]/30 hover:bg-[#F8F9FA] transition-all flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs uppercase flex-shrink-0 ${badgeColor}`}>
                    {u.symbol}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#191F28] truncate">{u.name}</p>
                    <p className="text-[11px] text-[#6F7780] truncate">{u.description || `Satuan standar (${u.category})`}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteUnit(u.id, u.name)}
                  className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#F04452] hover:bg-[#FEECED] transition-colors flex-shrink-0"
                  title="Hapus Satuan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
