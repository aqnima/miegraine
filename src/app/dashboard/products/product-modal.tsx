'use client';

import React, { useState } from 'react';
import { createProductAction, ProductUnitInput } from '@/lib/actions/products';
import { formatRibuan, parseRibuan } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Plus,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Smartphone,
  Tag,
  DollarSign,
  Boxes,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categories: Category[];
  businessType: string;
}

export function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  businessType,
}: ProductModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [baseUnit, setBaseUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [initialStock, setInitialStock] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(5);

  // Smart Toggles
  const [enableMultiUnit, setEnableMultiUnit] = useState(
    businessType === 'atk' || businessType === 'building' || businessType === 'electrical'
  );
  const [enableGrosir, setEnableGrosir] = useState(false);
  const [minGrosirQty, setMinGrosirQty] = useState<number | ''>(10);
  const [grosirPrice, setGrosirPrice] = useState<number | ''>('');
  const [hasImei, setHasImei] = useState(businessType === 'gadget');

  // Multi-Units Array
  const [units, setUnits] = useState<ProductUnitInput[]>([
    {
      unitName: 'dus',
      conversionQty: 24,
      barcode: '',
      price: 0,
      grosirPrice: 0,
      minGrosirQty: 5,
    },
  ]);

  if (!isOpen) return null;

  const handleAddUnit = () => {
    setUnits([
      ...units,
      {
        unitName: '',
        conversionQty: 12,
        barcode: '',
        price: 0,
      },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleUnitChange = (index: number, field: keyof ProductUnitInput, value: any) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    setUnits(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name || !baseUnit || sellingPrice === '') {
        throw new Error('Nama produk, satuan dasar, dan harga jual wajib diisi.');
      }

      await createProductAction({
        name,
        barcode: barcode || undefined,
        categoryId: categoryId || undefined,
        baseUnit,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        grosirPrice: enableGrosir && grosirPrice !== '' ? Number(grosirPrice) : undefined,
        minGrosirQty: enableGrosir && minGrosirQty !== '' ? Number(minGrosirQty) : undefined,
        initialStock: Number(initialStock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        hasImei,
        units: enableMultiUnit ? units.filter((u) => u.unitName && u.conversionQty > 0) : [],
      });

      const createdProductName = name;

      // Reset form fields for clean next use
      setName('');
      setBarcode('');
      setCostPrice('');
      setSellingPrice('');
      setInitialStock('');

      toast.success('Produk Berhasil Ditambahkan', `"${createdProductName}" siap dijual di kasir.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan produk.');
      toast.error('Gagal Menyimpan Produk', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-[#E5E8EB] text-xs font-bold text-[#6F7780] hover:bg-[#F2F4F6] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        <span>Batal</span>
      </button>
      <button
        type="submit"
        form="product-form"
        disabled={loading}
        className="px-6 py-2.5 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Produk</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Produk Baru"
      description="Input detail barang, multi-satuan & harga jual"
      icon={Package}
      maxWidth="2xl"
      footer={footer}
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#191F28] flex items-center space-x-1.5">
            <Tag className="w-4 h-4 text-[#3182F6]" />
            <span>Informasi Dasar Barang</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#191F28] mb-1">Nama Produk *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Indomie Goreng Spesial 85g / Semen Tiga Roda"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Barcode / SKU (Opsional)
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan / ketik barcode produk"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="space-y-3 pt-3 border-t border-[#E5E8EB]">
          <h3 className="font-bold text-sm text-[#191F28] flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-[#03B26C]" />
            <span>Harga & Stok Utama (Eceran)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Satuan Dasar (Eceran) *
              </label>
              <input
                type="text"
                required
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
                placeholder="pcs / kg / botol / lembar"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Harga Beli / HPP (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(costPrice)}
                onChange={(e) => setCostPrice(parseRibuan(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Harga Jual Eceran (Rp) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formatRibuan(sellingPrice)}
                onChange={(e) => setSellingPrice(parseRibuan(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold tabular-nums font-mono text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Stok Awal di Toko</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(initialStock)}
                onChange={(e) => setInitialStock(parseRibuan(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Peringatan Stok Menipis
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(minStockAlert)}
                onChange={(e) => setMinStockAlert(parseRibuan(e.target.value))}
                placeholder="5"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Smart Features (Grosir & IMEI) */}
        <div className="space-y-3 pt-3 border-t border-[#E5E8EB]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Grosir Toggle */}
            <div className="p-3.5 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGrosir}
                  onChange={(e) => setEnableGrosir(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3182F6] focus:ring-[#3182F6]"
                />
                <span className="font-bold text-xs text-[#191F28]">Aktifkan Harga Grosir Bertingkat</span>
              </label>
              {enableGrosir && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-[#6F7780] mb-0.5">Min. Qty Beli</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatRibuan(minGrosirQty)}
                      onChange={(e) => setMinGrosirQty(parseRibuan(e.target.value))}
                      placeholder="10"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6F7780] mb-0.5">Harga Satuan Grosir</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatRibuan(grosirPrice)}
                      onChange={(e) => setGrosirPrice(parseRibuan(e.target.value))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums text-[#03B26C]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* IMEI Tracking Toggle */}
            <div className="p-3.5 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] space-y-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasImei}
                  onChange={(e) => setHasImei(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3182F6] focus:ring-[#3182F6]"
                />
                <span className="font-bold text-xs text-[#191F28] flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#3182F6]" />
                  Lacak Nomor Seri / IMEI
                </span>
              </label>
              <p className="text-[10px] text-[#6F7780] pl-6">
                Wajibkan kasir scan nomor seri/IMEI unik tiap unit keluar.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Multi-Unit Conversions */}
        <div className="space-y-3 pt-3 border-t border-[#E5E8EB]">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableMultiUnit}
                onChange={(e) => setEnableMultiUnit(e.target.checked)}
                className="w-4 h-4 rounded text-[#3182F6] focus:ring-[#3182F6]"
              />
              <span className="font-bold text-sm text-[#191F28] flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#3182F6]" />
                Multi-Satuan Bertingkat (Dus, Lusin, Slop, Sak)
              </span>
            </label>

            {enableMultiUnit && (
              <button
                type="button"
                onClick={handleAddUnit}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#E8F3FF] text-[#3182F6] font-bold text-xs hover:bg-[#3182F6] hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Satuan</span>
              </button>
            )}
          </div>

          {enableMultiUnit && (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {units.map((unit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#6F7780] mb-0.5">Nama Satuan</label>
                      <input
                        type="text"
                        value={unit.unitName}
                        onChange={(e) => handleUnitChange(idx, 'unitName', e.target.value)}
                        placeholder="misal: dus / pack / sak"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold uppercase"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#6F7780] mb-0.5">
                        Isi Konversi ({baseUnit})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRibuan(unit.conversionQty)}
                        onChange={(e) =>
                          handleUnitChange(idx, 'conversionQty', parseRibuan(e.target.value))
                        }
                        placeholder="24"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#6F7780] mb-0.5">Harga Jual per {unit.unitName || 'Satuan'}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRibuan(unit.price)}
                        onChange={(e) =>
                          handleUnitChange(idx, 'price', parseRibuan(e.target.value))
                        }
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums text-[#3182F6]"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-end space-x-1">
                      <div className="flex-1">
                        <label className="block text-[10px] text-[#6F7780] mb-0.5">Barcode Khusus</label>
                        <input
                          type="text"
                          value={unit.barcode || ''}
                          onChange={(e) => handleUnitChange(idx, 'barcode', e.target.value)}
                          placeholder="Barcode Dus"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-mono"
                        />
                      </div>
                      {units.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(idx)}
                          className="p-2 rounded-xl bg-[#FEECED] text-[#F04452] hover:bg-[#F04452] hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
