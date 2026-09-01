'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { ExpenseModal } from './expense-modal';
import { getProfitLossSummaryAction } from '@/lib/actions/reports';
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Plus,
  Award,
  Layers,
  Calendar,
  PieChart,
  Receipt,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { useRouter } from 'next/navigation';

interface PnLClientViewProps {
  summary: {
    totalOmzet: number;
    totalDiskon: number;
    totalHpp: number;
    labaKotor: number;
    totalBebanOperasional: number;
    labaBersih: number;
    grossMargin: string;
    netMargin: string;
    totalTransactions: number;
    expenseBreakdown?: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  topProducts: any[];
  recentExpenses: any[];
  tenantName: string;
}

export function PnLClientView({
  summary: initialSummary,
  topProducts,
  recentExpenses,
  tenantName,
}: PnLClientViewProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().slice(0, 10));
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const router = useRouter();

  const handlePeriodChange = async (newPeriod: 'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom') => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      try {
        const res = await getProfitLossSummaryAction(newPeriod);
        setSummary(res);
      } catch (err) {
        console.error('Failed to update PnL summary:', err);
      }
    }
  };

  const handleApplyCustomDate = async () => {
    try {
      const res = await getProfitLossSummaryAction('custom', customStart, customEnd);
      setSummary(res);
    } catch (err) {
      console.error('Failed to update custom PnL summary:', err);
    }
  };

  const expenseBreakdown = summary.expenseBreakdown || [];

  return (
    <div className="space-y-5">
      {/* 1. Top Header Toolbar: Date Filter + Add Expense Button (Uncarded, Clean) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#6F7780] mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#3182F6]" />
            Periode:
          </span>

          {[
            { key: 'today', label: 'Hari Ini' },
            { key: '7days', label: '7 Hari Terakhir' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'last_month', label: 'Bulan Lalu' },
            { key: 'all', label: 'Semua' },
            { key: 'custom', label: 'Kustom' },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePeriodChange(p.key as any)}
              className={`h-10 px-3.5 rounded-xl text-xs font-bold transition-all ${
                period === p.key
                  ? 'bg-[#3182F6] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E8EB] text-[#4E5968] hover:bg-[#F2F4F6] shadow-2xs'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2.5 justify-end">
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-2 bg-[#F04452] hover:bg-[#D93846] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-98 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kas Keluar / Biaya</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Row */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5 p-3 bg-white rounded-xl border border-[#E5E8EB] shadow-2xs animate-in fade-in-50 text-xs">
          <span className="font-bold text-[#6F7780]">Dari:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="h-9 px-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <span className="font-bold text-[#6F7780]">Sampai:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="h-9 px-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <button
            type="button"
            onClick={handleApplyCustomDate}
            className="h-9 px-4 bg-[#3182F6] text-white rounded-lg font-bold text-xs hover:bg-[#2272EB] transition-all shadow-2xs"
          >
            Terapkan Filter
          </button>
        </div>
      )}

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Omzet Penjualan"
          value={formatRupiah(summary.totalOmzet)}
          icon={DollarSign}
          iconColor="text-[#3182F6]"
          subtitle={`${summary.totalTransactions} transaksi tercatat`}
        />

        <StatCard
          title="Total HPP Modal Pokok"
          value={formatRupiah(summary.totalHpp)}
          icon={Layers}
          iconColor="text-[#FE9800]"
          subtitle="Modal dasar barang terjual"
        />

        <StatCard
          title="Beban Operasional Toko"
          value={formatRupiah(summary.totalBebanOperasional)}
          icon={TrendingDown}
          iconColor="text-[#F04452]"
          subtitle={`${expenseBreakdown.length} kategori pengeluaran`}
        />

        <StatCard
          title="Laba Bersih Realtime"
          value={formatRupiah(summary.labaBersih)}
          icon={TrendingUp}
          iconColor={summary.labaBersih >= 0 ? 'text-[#03B26C]' : 'text-[#F04452]'}
          valueColor={summary.labaBersih >= 0 ? 'text-[#03B26C]' : 'text-[#F04452]'}
          subtitle={`Margin Kotor: ${summary.grossMargin}% | Bersih: ${summary.netMargin}%`}
        />
      </div>

      {/* 3. Grid: Breakdown Biaya, Top Products & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom 1: Proporsi Biaya Operasional (Expense Breakdown) */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-[#F04452]" />
                <h3 className="font-bold text-sm text-[#191F28]">Proporsi Beban Kas</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#6F7780]">Struktur Biaya</span>
            </div>

            {expenseBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6F7780]">Belum ada data beban operasional.</div>
            ) : (
              <div className="space-y-3">
                {expenseBreakdown.map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#191F28]">{b.category}</span>
                      <span className="font-mono text-[#6F7780]">{formatRupiah(b.amount)} ({b.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F2F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F04452] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, b.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E8EB] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#6F7780]">Total Pengeluaran:</span>
            <span className="font-bold font-mono text-[#F04452]">{formatRupiah(summary.totalBebanOperasional)}</span>
          </div>
        </div>

        {/* Kolom 2: Top Selling Products */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E8EB] shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#3182F6]" />
              <h3 className="font-bold text-sm text-[#191F28]">Produk Terlaris</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#6F7780]">Kuantitas Terjual</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6F7780]">Belum ada transaksi produk.</div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FA] text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-[#E8F3FF] text-[#3182F6] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-[#191F28] truncate">{p.productName || 'Produk'}</p>
                      <p className="text-[10px] text-[#6F7780]">
                        {p.totalQty} {p.baseUnit || p.unitName || 'pcs'} terjual
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#191F28] tabular-nums">
                    {formatRupiah(p.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 3: Recent Expenses List */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E8EB] shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-[#F04452]" />
              <h3 className="font-bold text-sm text-[#191F28]">Kas Keluar Terakhir</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#6F7780]">Histori Biaya</span>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6F7780]">Belum ada biaya operasional dicatat.</div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {recentExpenses.map((e) => (
                <div key={e.id} className="p-2.5 rounded-lg bg-[#F8F9FA] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#191F28] truncate">{e.category}</p>
                    <p className="text-[10px] text-[#6F7780] truncate">
                      {e.description || 'Pengeluaran kas'} • {formatTanggal(e.createdAt)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#F04452] tabular-nums flex-shrink-0">
                    -{formatRupiah(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
