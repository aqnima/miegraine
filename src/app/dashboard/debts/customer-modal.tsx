'use client';

import React, { useState } from 'react';
import { createCustomerAction } from '@/lib/actions/debts';
import { formatRibuan, parseRibuan } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Users, AlertCircle, Loader2, X, Check } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [debtLimit, setDebtLimit] = useState<number | ''>(5000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name) throw new Error('Nama pelanggan wajib diisi.');

      await createCustomerAction(
        name,
        phone || undefined,
        address || undefined,
        debtLimit !== '' ? Number(debtLimit) : 0
      );

      toast.success('Pelanggan Tersimpan', `Pelanggan "${name}" berhasil didaftarkan ke buku piutang.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Gagal menyimpan data pelanggan.';
      setError(msg);
      toast.error('Gagal Simpan Pelanggan', msg);
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
        form="customer-form"
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
            <span>Simpan Pelanggan</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pelanggan Baru"
      description="Daftarkan buku bon & batas kredit pelanggan"
      icon={Users}
      maxWidth="md"
      footer={footer}
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Nama Lengkap *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="misal: Pak Budi Santoso (Toko Berkah)"
            required
            className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">No. WhatsApp / Telepon</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
            className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Batas Plafon Hutang / Bon (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatRibuan(debtLimit)}
            onChange={(e) => setDebtLimit(parseRibuan(e.target.value))}
            placeholder="5.000.000"
            className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-bold font-mono tabular-nums text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
          />
          <p className="text-[11px] text-[#6F7780] mt-1">
            Kasir akan diberi peringatan jika hutang pelanggan melebihi batas ini.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Alamat (Opsional)</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat rumah / ruko toko pelanggan"
            className="w-full px-3.5 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
