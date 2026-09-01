'use client';

import React, { useState } from 'react';
import { formatRupiah, formatRibuan, parseRibuan } from '@/lib/utils';
import { openCashShiftAction, closeCashShiftBlindAction } from '@/lib/actions/reports';
import { Modal } from '@/components/ui/modal';
import {
  Lock,
  Unlock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  X,
  Check,
} from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: any | null;
  onSuccess: () => void;
}

export function ShiftModal({
  isOpen,
  onClose,
  activeShift,
  onSuccess,
}: ShiftModalProps) {
  const [startingCash, setStartingCash] = useState<number | ''>(100000);
  const [actualCashCount, setActualCashCount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const isClosing = !!activeShift;

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await openCashShiftAction(Number(startingCash) || 0);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuka shift kasir.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (actualCashCount === '') {
        throw new Error('Hitung dan masukkan nominal uang fisik nyata di laci.');
      }

      const res = await closeCashShiftBlindAction(Number(actualCashCount), notes);
      setReconciliationResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menutup shift kasir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isClosing ? 'Tutup Shift Kasir (Blind Count)' : 'Buka Shift Kasir Baru'}
      description={
        isClosing
          ? 'Rekonsiliasi fisik uang laci tanpa intip sistem'
          : 'Input modal awal uang receh di laci kasir'
      }
      icon={isClosing ? Lock : Unlock}
      iconColor={isClosing ? 'text-[#FE9800]' : 'text-[#3182F6]'}
      iconBg={isClosing ? 'bg-[#FFF5E6]' : 'bg-[#E8F3FF]'}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {reconciliationResult ? (
          /* Reconciliation Result View */
          <div className="space-y-3.5">
            <div
              className={`p-4 rounded-xl border text-center ${
                reconciliationResult.isBalanced
                  ? 'bg-[#E6FAF2] border-[#03B26C]/30 text-[#03B26C]'
                  : 'bg-[#FEECED] border-[#F04452]/30 text-[#F04452]'
              }`}
            >
              {reconciliationResult.isBalanced ? (
                <CheckCircle2 className="w-8 h-8 mx-auto mb-1.5" />
              ) : (
                <AlertTriangle className="w-8 h-8 mx-auto mb-1.5" />
              )}
              <h3 className="font-extrabold text-base text-[#191F28]">
                {reconciliationResult.isBalanced
                  ? 'Kas Laci Seimbang (Pass)'
                  : 'Terdapat Selisih Kasir!'}
              </h3>
              <p className="text-xs font-mono font-bold mt-1">
                Selisih: {formatRupiah(reconciliationResult.difference)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2F4F6] space-y-2 border border-[#E5E8EB]">
              <div className="flex justify-between text-[#6F7780]">
                <span>Modal Awal Shift:</span>
                <span className="font-bold text-[#191F28] tabular-nums font-mono">
                  {formatRupiah(reconciliationResult.startingCash)}
                </span>
              </div>
              <div className="flex justify-between text-[#6F7780]">
                <span>Total Penjualan Tunai:</span>
                <span className="font-bold text-[#191F28] tabular-nums font-mono">
                  {formatRupiah(reconciliationResult.totalCashSales)}
                </span>
              </div>
              <div className="flex justify-between text-[#6F7780] pt-1 border-t border-[#E5E8EB]">
                <span>Seharusnya di Laci (Sistem):</span>
                <span className="font-bold text-[#3182F6] tabular-nums font-mono">
                  {formatRupiah(reconciliationResult.expectedCash)}
                </span>
              </div>
              <div className="flex justify-between text-[#6F7780]">
                <span>Uang Fisik Dihitung Kasir:</span>
                <span className="font-bold text-[#191F28] tabular-nums font-mono">
                  {formatRupiah(reconciliationResult.actualCash)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold rounded-xl text-xs transition-colors"
            >
              Tutup Jendela Laporan
            </button>
          </div>
        ) : !isClosing ? (
          /* Open Shift Form */
          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1">
                Modal Awal Uang Laci (Uang Kembalian) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-base font-bold text-[#6F7780] font-mono pointer-events-none select-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRibuan(startingCash)}
                  onChange={(e) => setStartingCash(parseRibuan(e.target.value))}
                  placeholder="0"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-lg font-bold tabular-nums text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
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
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Membuka...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Shift Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Close Shift Blind Count Form */
          <form onSubmit={handleCloseShift} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#FFF5E6] border border-[#FE9800]/30 text-[#191F28]">
              <p className="font-bold text-xs flex items-center gap-1.5 text-[#FE9800]">
                <Banknote className="w-4 h-4" />
                Aturan Blind Cash Reconciliation
              </p>
              <p className="text-[11px] text-[#6F7780] mt-1">
                Hitung seluruh uang fisik (kertas & koin) yang ada di laci kasir saat ini, lalu masukkan totalnya tanpa melihat angka perkiraan sistem.
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#191F28] mb-1">
                Total Uang Fisik Hasil Hitungan Kasir (Rp) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-base font-bold text-[#6F7780] font-mono pointer-events-none select-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRibuan(actualCashCount)}
                  onChange={(e) => setActualCashCount(parseRibuan(e.target.value))}
                  placeholder="0"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-lg font-bold tabular-nums text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#FE9800] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1">Catatan Tutup Shift</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: Shift pagi lancar, kas diserahkan ke Pak Rudi"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FE9800] focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
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
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-[#FE9800] hover:bg-[#E68A00] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Merekonsiliasi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Hitung & Tutup Shift</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
