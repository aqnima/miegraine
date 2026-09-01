'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah, formatRibuan, parseRibuan } from '@/lib/utils';
import { createDebtPaymentAction } from '@/lib/actions/debts';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Banknote,
  AlertCircle,
  Loader2,
  X,
  Check,
} from 'lucide-react';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    currentDebt: number;
  } | null;
  onSuccess: () => void;
}

export function DebtPaymentModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: DebtPaymentModalProps) {
  const toast = useToast();
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS'>('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      setAmountPaid(customer.currentDebt);
      setError(null);
    }
  }, [isOpen, customer]);

  if (!customer) return null;

  const currentDebt = customer.currentDebt || 0;
  const paying = Number(amountPaid) || 0;
  const remainingDebt = Math.max(0, currentDebt - paying);

  // Quick Preset Buttons
  const quickPresets = [
    { label: 'Lunas Semua', value: currentDebt },
    { label: '50% Saldo', value: Math.round(currentDebt / 2) },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 500.000', value: 500000 },
    { label: 'Rp 1.000.000', value: 1000000 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (paying <= 0) {
        throw new Error('Nominal cicilan harus lebih dari Rp 0.');
      }

      await createDebtPaymentAction({
        customerId: customer.id,
        amountPaid: paying,
        paymentMethod,
        notes,
      });

      toast.success(
        'Pembayaran Piutang Berhasil',
        `Penerimaan ${formatRupiah(paying)} dari ${customer.name} telah tercatat.`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Gagal memproses pembayaran piutang.';
      setError(msg);
      toast.error('Gagal Bayar Piutang', msg);
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
        form="debt-payment-form"
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-[#03B26C] hover:bg-[#029B5D] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Konfirmasi Pelunasan</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bayar / Cicil Piutang"
      description={customer.name}
      icon={Banknote}
      iconColor="text-[#03B26C]"
      iconBg="bg-[#E6FAF2]"
      maxWidth="md"
      footer={footer}
    >
      <form id="debt-payment-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Debt Banner */}
        <div className="p-4 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#6F7780] uppercase">
              Saldo Hutang Saat Ini
            </span>
            <p className="text-2xl font-extrabold text-[#F04452] tabular-nums font-mono mt-0.5">
              {formatRupiah(currentDebt)}
            </p>
          </div>
          <span className="px-3 py-1 bg-[#FEECED] text-[#F04452] rounded-xl font-bold text-xs">
            Belum Lunas
          </span>
        </div>

        {/* Amount to Pay */}
        <div className="space-y-2">
          <label className="block font-bold text-[#191F28]">
            Nominal yang Dibayarkan (Rp) *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-base font-bold text-[#6F7780] font-mono pointer-events-none select-none">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatRibuan(amountPaid)}
              onChange={(e) => setAmountPaid(parseRibuan(e.target.value))}
              placeholder="0"
              required
              className="w-full pl-12 pr-4 py-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-lg font-bold tabular-nums text-[#03B26C] focus:outline-none focus:ring-2 focus:ring-[#03B26C] focus:bg-white font-mono"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickPresets
              .filter((p) => p.value > 0 && p.value <= currentDebt)
              .map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAmountPaid(p.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[11px] font-bold text-[#191F28] transition-colors tabular-nums border border-[#E5E8EB]"
                >
                  {p.label}
                </button>
              ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-bold text-[#191F28] mb-1.5">Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'TRANSFER', 'QRIS'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === method
                    ? 'border-[#03B26C] bg-[#E6FAF2] text-[#03B26C]'
                    : 'border-[#E5E8EB] bg-white text-[#6F7780] hover:bg-[#F2F4F6]'
                }`}
              >
                {method === 'CASH' ? '💵 Tunai' : method === 'TRANSFER' ? '🏦 Transfer' : '📱 QRIS'}
              </button>
            ))}
          </div>
        </div>

        {/* Remaining Debt Calculation */}
        <div className="p-3.5 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] flex items-center justify-between">
          <span className="font-bold text-[#6F7780]">Sisa Saldo Hutang Setelah Pembayaran</span>
          <span className="font-extrabold text-lg text-[#191F28] tabular-nums font-mono">
            {formatRupiah(remainingDebt)}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold text-[#191F28] mb-1">Catatan (Opsional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="misal: Titip cicilan via transfer BCA"
            className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
          />
        </div>
      </form>
    </Modal>
  );
}
