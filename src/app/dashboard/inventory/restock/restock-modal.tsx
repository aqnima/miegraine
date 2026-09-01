'use client';

import React, { useState } from 'react';
import { formatRupiah, formatRibuan, parseRibuan } from '@/lib/utils';
import {
  createPurchaseOrderAction,
  createSupplierAction,
  PurchaseItemInput,
} from '@/lib/actions/inventory';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Plus,
  Trash2,
  Truck,
  Building,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Check,
} from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  suppliers: any[];
}

export function RestockModal({
  isOpen,
  onClose,
  products,
  suppliers: initialSuppliers,
}: RestockModalProps) {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Add Supplier
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  // Items in Purchase Order
  const [items, setItems] = useState<PurchaseItemInput[]>([
    {
      productId: products[0]?.id || '',
      unitName: products[0]?.baseUnit || 'pcs',
      conversionQty: 1,
      qty: 10,
      costPerUnit: products[0]?.costPrice || 0,
      subtotal: (products[0]?.costPrice || 0) * 10,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || '',
        unitName: defaultProd?.baseUnit || 'pcs',
        conversionQty: 1,
        qty: 1,
        costPerUnit: defaultProd?.costPrice || 0,
        subtotal: defaultProd?.costPrice || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemInput, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // When changing product, reset unit & cost
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        item.unitName = prod.baseUnit;
        item.conversionQty = 1;
        item.costPerUnit = prod.costPrice || 0;
      }
    }

    // When changing unit
    if (field === 'unitName') {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        if (value === prod.baseUnit) {
          item.conversionQty = 1;
        } else {
          const u = prod.units?.find((un: any) => un.unitName === value);
          item.conversionQty = u?.conversionQty || 1;
        }
      }
    }

    item.subtotal = item.qty * item.costPerUnit;
    updated[index] = item;
    setItems(updated);
  };

  const handleQuickAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName) return;
    const res = await createSupplierAction(newSupplierName, newSupplierPhone);
    if (res.success && res.id) {
      setSuppliers([...suppliers, { id: res.id, name: newSupplierName, phone: newSupplierPhone }]);
      setSelectedSupplierId(res.id);
      setShowAddSupplier(false);
      setNewSupplierName('');
      setNewSupplierPhone('');
      toast.success('Supplier Tersimpan', `Supplier "${newSupplierName}" siap digunakan.`);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (items.length === 0) {
        throw new Error('Tambahkan minimal 1 barang belanjaan.');
      }

      await createPurchaseOrderAction({
        supplierId: selectedSupplierId || undefined,
        paymentStatus,
        items,
        notes,
      });

      toast.success('Barang Masuk Tersimpan', 'Faktur restock supplier berhasil dicatat dan stok bertambah.');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Gagal mencatat pembelian barang masuk.';
      setError(msg);
      toast.error('Gagal Simpan Restock', msg);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-xs text-[#6F7780]">Total Faktur:</span>
        <span className="font-extrabold text-lg text-[#3182F6] tabular-nums font-mono">
          {formatRupiah(totalAmount)}
        </span>
      </div>

      <div className="flex items-center space-x-2.5 justify-end">
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
          form="restock-form"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Barang Masuk</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Kulakan & Faktur Masuk"
      description="Tambah stok barang masuk dari distributor & atur status hutang faktur"
      icon={Truck}
      maxWidth="3xl"
      footer={footer}
    >
      <form id="restock-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Supplier & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#F2F4F6] p-4 rounded-xl border border-[#E5E8EB]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#191F28]">Nama Supplier</label>
              <button
                type="button"
                onClick={() => setShowAddSupplier(!showAddSupplier)}
                className="text-[11px] font-bold text-[#3182F6] hover:underline"
              >
                + Tambah Supplier
              </button>
            </div>

            {!showAddSupplier ? (
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold"
              >
                <option value="">-- Tanpa Supplier / Beli Lepas --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Nama Supplier Baru"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs"
                />
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    placeholder="No. Telp / WA"
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddSupplier}
                    className="px-3 py-1.5 bg-[#3182F6] text-white rounded-xl font-bold text-xs flex-shrink-0"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSupplier(false)}
                    className="px-2 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#6F7780]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#191F28] mb-1">Status Pembayaran Faktur</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('PAID')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  paymentStatus === 'PAID'
                    ? 'border-[#03B26C] bg-[#E6FAF2] text-[#03B26C]'
                    : 'border-[#E5E8EB] bg-white text-[#6F7780]'
                }`}
              >
                ✓ Lunas Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('UNPAID')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  paymentStatus === 'UNPAID'
                    ? 'border-[#F04452] bg-[#FEECED] text-[#F04452]'
                    : 'border-[#E5E8EB] bg-white text-[#6F7780]'
                }`}
              >
                Hutang Dagang (Tempo)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-[#191F28]">Daftar Barang yang Dibeli</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#E8F3FF] text-[#3182F6] font-bold text-xs hover:bg-[#3182F6] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris Barang</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const prod = products.find((p) => p.id === item.productId);
              const availableUnits = prod
                ? [{ unitName: prod.baseUnit, conversionQty: 1 }, ...(prod.units || [])]
                : [];

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    {/* Product Selector */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Pilih Produk
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stok: {p.stock} {p.baseUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Selector */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Satuan Beli
                      </label>
                      <select
                        value={item.unitName}
                        onChange={(e) => handleItemChange(idx, 'unitName', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold uppercase"
                      >
                        {availableUnits.map((u: any) => (
                          <option key={u.unitName} value={u.unitName}>
                            {u.unitName} {u.conversionQty > 1 ? `(x${u.conversionQty})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qty */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Jumlah Beli
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRibuan(item.qty)}
                        onChange={(e) =>
                          handleItemChange(idx, 'qty', parseRibuan(e.target.value))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums"
                      />
                    </div>

                    {/* Cost Per Unit */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[#6F7780] mb-1">
                        Harga Kulak ({item.unitName})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatRibuan(item.costPerUnit)}
                        onChange={(e) =>
                          handleItemChange(idx, 'costPerUnit', parseRibuan(e.target.value))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums text-[#3182F6]"
                      />
                    </div>

                    {/* Delete */}
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

                  <div className="flex justify-between items-center text-[11px] text-[#6F7780] pt-1.5 border-t border-[#E5E8EB]/50">
                    <span>
                      Fisik Bertambah: <strong>{item.qty * item.conversionQty} {prod?.baseUnit}</strong> (Satuan Dasar)
                    </span>
                    <span>
                      Subtotal: <strong className="text-[#191F28]">{formatRupiah(item.subtotal)}</strong>
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
