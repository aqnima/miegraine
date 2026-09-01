'use client';

import React, { useState } from 'react';
import { OpnameModal } from './opname-modal';
import { ClipboardCheck, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OpnameClientViewProps {
  products: any[];
}

export function OpnameClientView({ products }: OpnameClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#6F7780]">
          Total {products.length} Master Produk Terdaftar
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 inline-flex items-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Stok Opname Baru</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E8EB] shadow-xs flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-sm text-[#191F28]">Panduan Audit Fisik (Stok Opname)</h3>
          <p className="text-[#6F7780]">
            Saat Anda memasukkan angka stok fisik nyata, sistem akan secara otomatis menyesuaikan saldo inventori dan mencatat selisih (*Plus / Minus*) ke dalam **Kartu Mutasi Stok** dengan keterangan alasan yang jelas.
          </p>
        </div>
      </div>

      {/* Modal */}
      <OpnameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
      />
    </div>
  );
}
