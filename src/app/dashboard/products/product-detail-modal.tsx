'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { formatRupiah, formatTanggal, formatRibuan } from '@/lib/utils';
import {
  Package,
  QrCode,
  Tag,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Layers,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Percent,
  X,
} from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
}: ProductDetailModalProps) {
  if (!product) return null;

  const basePrice =
    product.priceTiers?.find(
      (t: any) => t.productUnitId === null && t.tierName === 'ecer'
    )?.price || 0;

  const grosirPriceTier = product.priceTiers?.find(
    (t: any) => t.productUnitId === null && t.tierName === 'grosir'
  );

  const costPrice = product.costPrice || 0;
  const profitMargin = basePrice - costPrice;
  const marginPercent = costPrice > 0 ? ((profitMargin / costPrice) * 100).toFixed(1) : '100';
  const isLowStock = product.stock <= (product.minStockAlert || 5);
  const isOutOfStock = product.stock <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Informasi Produk"
      description="Rincian lengkap spesifikasi, harga, konversi satuan, dan saldo stok"
      icon={Package}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center space-x-1.5"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 1. Header Produk Info */}
        <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3FF] text-[#3182F6]">
                {product.categoryName || 'Tanpa Kategori'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  product.isActive !== false
                    ? 'bg-[#E6FAF2] text-[#03B26C]'
                    : 'bg-[#FEECED] text-[#F04452]'
                }`}
              >
                {product.isActive !== false ? 'Aktif Dijual' : 'Non-Aktif'}
              </span>
              {product.hasImei && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#7E22CE] flex items-center space-x-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Tracking IMEI / Serial</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-[#191F28]">{product.name}</h3>
            {product.barcode ? (
              <p className="text-xs font-mono text-[#6F7780] flex items-center space-x-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#3182F6]" />
                <span>Barcode: <strong className="text-[#191F28]">{product.barcode}</strong></span>
              </p>
            ) : (
              <p className="text-xs text-[#6F7780] italic">Tidak menggunakan kode barcode</p>
            )}
          </div>

          <div className="text-left sm:text-right bg-white p-3 rounded-xl border border-[#E5E8EB] shadow-2xs flex-shrink-0">
            <p className="text-[10px] font-semibold text-[#6F7780]">Status Saldo Fisik</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`text-base font-extrabold tabular-nums font-mono ${
                  isOutOfStock
                    ? 'text-[#F04452]'
                    : isLowStock
                    ? 'text-[#FE9800]'
                    : 'text-[#03B26C]'
                }`}
              >
                {formatRibuan(product.stock)} {product.baseUnit}
              </span>
              {isLowStock && <AlertTriangle className="w-4 h-4 text-[#F04452]" />}
            </div>
            <p className="text-[10px] text-[#6F7780]">Min. Alert: {product.minStockAlert || 5} {product.baseUnit}</p>
          </div>
        </div>

        {/* 2. Ringkasan Finansial, HPP & Margin */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Modal HPP */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E8EB] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#6F7780]">
              <span className="text-[11px] font-semibold">Harga Modal (HPP)</span>
              <DollarSign className="w-3.5 h-3.5 text-[#6F7780]" />
            </div>
            <p className="text-sm font-extrabold font-mono text-[#191F28] tabular-nums">
              {formatRupiah(costPrice)}
            </p>
            <p className="text-[10px] text-[#6F7780]">Per {product.baseUnit}</p>
          </div>

          {/* Harga Jual Eceran */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E8EB] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#3182F6]">
              <span className="text-[11px] font-semibold">Harga Jual Eceran</span>
              <Tag className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-extrabold font-mono text-[#3182F6] tabular-nums">
              {formatRupiah(basePrice)}
            </p>
            <p className="text-[10px] text-[#6F7780]">Per {product.baseUnit}</p>
          </div>

          {/* Keuntungan / Margin */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E8EB] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#03B26C]">
              <span className="text-[11px] font-semibold">Margin Bersih</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-extrabold font-mono text-[#03B26C] tabular-nums">
              +{formatRupiah(profitMargin)}
            </p>
            <p className="text-[10px] font-bold text-[#03B26C]">
              Markup: {marginPercent}%
            </p>
          </div>
        </div>

        {/* 3. Daftar Multi-Satuan & Harga Bertingkat */}
        <div className="border border-[#E5E8EB] rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-2.5 bg-[#F8F9FA] border-b border-[#E5E8EB] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#3182F6]" />
              <h4 className="text-xs font-bold text-[#191F28]">Hierarki Multi-Satuan & Harga</h4>
            </div>
            <span className="text-[11px] text-[#6F7780]">
              {(product.units?.length || 0) + 1} Satuan Terdaftar
            </span>
          </div>

          <div className="divide-y divide-[#E5E8EB] text-xs">
            {/* Satuan Dasar / Terkecil */}
            <div className="p-3.5 flex items-center justify-between bg-[#F9FBFF]">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#191F28] uppercase">{product.baseUnit}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#E8F3FF] text-[#3182F6]">
                    Satuan Terkecil (Base Unit)
                  </span>
                </div>
                <p className="text-[11px] text-[#6F7780]">1 {product.baseUnit} = 1 Base Unit</p>
              </div>

              <div className="text-right">
                <p className="font-bold font-mono text-[#191F28] tabular-nums">
                  {formatRupiah(basePrice)}
                </p>
                <p className="text-[10px] text-[#6F7780]">Harga Eceran</p>
              </div>
            </div>

            {/* Satuan Konversi Lainnya */}
            {product.units && product.units.length > 0 ? (
              product.units.map((unit: any) => {
                const unitPrice =
                  product.priceTiers?.find(
                    (t: any) => t.productUnitId === unit.id && t.tierName === 'ecer'
                  )?.price || 0;

                return (
                  <div key={unit.id} className="p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#191F28] uppercase">{unit.unitName}</span>
                        {unit.barcode && (
                          <span className="text-[10px] font-mono text-[#6F7780] bg-[#F2F4F6] px-1.5 py-0.5 rounded">
                            {unit.barcode}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6F7780]">
                        1 {unit.unitName} = <strong>{unit.conversionQty}</strong> {product.baseUnit}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-[#3182F6] tabular-nums">
                        {formatRupiah(unitPrice)}
                      </p>
                      <p className="text-[10px] text-[#6F7780]">
                        @{formatRupiah(Math.round(unitPrice / (unit.conversionQty || 1)))} / {product.baseUnit}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>
        </div>

        {/* 4. Harga Grosir Tier (Jika Ada) */}
        {grosirPriceTier && (
          <div className="p-3.5 bg-[#FFF5E6] rounded-xl border border-[#FE9800]/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Tag className="w-4 h-4 text-[#FE9800] flex-shrink-0" />
              <div>
                <p className="font-bold text-[#191F28]">Skema Harga Grosir Aktif</p>
                <p className="text-[11px] text-[#6F7780]">
                  Min. Pembelian {grosirPriceTier.minQty || 1} {product.baseUnit}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold font-mono text-[#FE9800] tabular-nums text-sm">
                {formatRupiah(grosirPriceTier.price)}
              </p>
              <p className="text-[10px] text-[#6F7780]">per {product.baseUnit}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
