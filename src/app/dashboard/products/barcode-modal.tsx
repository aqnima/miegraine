'use client';

import React, { useState } from 'react';
import { formatRupiah, formatRibuan, parseRibuan } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import {
  Printer,
  QrCode,
  X,
} from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

export function BarcodeModal({ isOpen, onClose, products }: BarcodeModalProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [printCopies, setPrintCopies] = useState<number>(6);

  if (!isOpen) return null;

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const price =
    product?.priceTiers?.find(
      (t: any) => t.productUnitId === null && t.tierName === 'ecer'
    )?.price || 0;

  const handlePrint = () => {
    window.print();
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#E5E8EB] font-bold text-xs text-[#6F7780] hover:bg-[#F2F4F6] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        <span>Tutup</span>
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 active:scale-98"
      >
        <Printer className="w-4 h-4" />
        <span>Cetak {printCopies} Lembar Label</span>
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Label Barcode & Rak"
      description="Stiker barcode siap tempel di rak / kemasan produk"
      icon={QrCode}
      maxWidth="xl"
      footer={footer}
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#191F28] mb-1">Pilih Produk</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#191F28] mb-1">Jumlah Label</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatRibuan(printCopies)}
              onChange={(e) => setPrintCopies(Math.min(50, Math.max(1, parseRibuan(e.target.value) || 1)))}
              className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
            />
          </div>
        </div>

        {/* Preview Grid */}
        {product && (
          <div className="space-y-2 pt-2 border-t border-[#E5E8EB]">
            <label className="font-bold text-sm text-[#191F28]">Pratinjau Label Stiker</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2 bg-[#F2F4F6] rounded-xl border border-[#E5E8EB]">
              {Array.from({ length: printCopies }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-black/80 rounded-lg text-center space-y-1 shadow-2xs font-mono"
                >
                  <p className="font-bold text-[10px] truncate">{product.name}</p>
                  {/* Simulated Code-128 Bars */}
                  <div className="flex justify-center space-x-0.5 py-1">
                    <div className="w-1 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                    <div className="w-1.5 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                    <div className="w-2 h-6 bg-black" />
                    <div className="w-1 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                    <div className="w-1.5 h-6 bg-black" />
                    <div className="w-1 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                  </div>
                  <p className="text-[9px] text-gray-700">{product.barcode || `MGR-${product.id.slice(0, 6)}`}</p>
                  <p className="font-extrabold text-xs text-black border-t border-black/30 pt-0.5">
                    {formatRupiah(price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
