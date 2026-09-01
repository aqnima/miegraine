'use client';

import React, { useState } from 'react';
import { createExpenseAction } from '@/lib/actions/reports';
import { formatRibuan, parseRibuan } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  TrendingDown,
  AlertCircle,
  Loader2,
  X,
  Check,
  Banknote,
  CreditCard,
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const toast = useToast();
  const [category, setCategory] = useState('Listrik & Air');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Listrik & Air',
    'Gaji Karyawan',
    'Sewa Ruko/Gudang',
    'Plastik & Kemasan',
    'Bensin & Transportasi',
    'Prive Pemilik',
    'Konsumsi & Kebersihan',
    'Lain-lain',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!amount || Number(amount) <= 0) {
        throw new Error('Nominal pengeluaran harus lebih dari Rp 0.');
      }

      await createExpenseAction({
        category,
        amount: Number(amount),
        paymentMethod,
        description: description || undefined,
      });

      toast.success('Pengeluaran Dicatat', `Biaya operasional ${category} telah disimpan.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Gagal mencatat pengeluaran kas.';
      setError(msg);
      toast.error('Gagal Simpan Biaya', msg);
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
        form="expense-form"
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-[#F04452] hover:bg-[#D93846] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Pengeluaran</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Beban Operasional"
      description="Kas keluar untuk biaya rutin toko"
      icon={TrendingDown}
      iconColor="text-[#F04452]"
      iconBg="bg-[#FEECED]"
      maxWidth="md"
      footer={footer}
    >
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Kategori Pengeluaran</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Nominal Kas Keluar (Rp) *</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-base font-bold text-[#6F7780] font-mono pointer-events-none select-none">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatRibuan(amount)}
              onChange={(e) => setAmount(parseRibuan(e.target.value))}
              placeholder="0"
              required
              className="w-full pl-12 pr-4 py-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-lg font-bold tabular-nums text-[#F04452] focus:outline-none focus:ring-2 focus:ring-[#F04452] focus:bg-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1.5">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                paymentMethod === 'CASH'
                  ? 'border-[#F04452] bg-[#FEECED] text-[#F04452]'
                  : 'border-[#E5E8EB] bg-white text-[#6F7780] hover:bg-[#F2F4F6]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Kas Tunai (Laci)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                paymentMethod === 'TRANSFER'
                  ? 'border-[#3182F6] bg-[#E8F3FF] text-[#3182F6]'
                  : 'border-[#E5E8EB] bg-white text-[#6F7780] hover:bg-[#F2F4F6]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Transfer Bank</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Keterangan / Rincian</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="misal: Beli token listrik PLN 200rb"
            className="w-full px-3.5 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
