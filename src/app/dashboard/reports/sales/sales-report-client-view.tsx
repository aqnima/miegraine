'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import {
  CreditCard,
  Users,
  Receipt,
  Banknote,
  QrCode,
  Calendar,
  Search,
  ExternalLink,
  ShoppingBag,
  FileText,
  User,
  Eye,
  X,
  Package,
  Clock,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import {
  getSalesReportBreakdownAction,
  getTransactionDetailAction,
} from '@/lib/actions/reports';
import Link from 'next/link';

interface SalesReportClientViewProps {
  salesBreakdown: {
    byPayment: any[];
    byCashier: any[];
    transactionsList?: any[];
  };
  tenantName: string;
}

export function SalesReportClientView({
  salesBreakdown: initialData,
  tenantName,
}: SalesReportClientViewProps) {
  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().slice(0, 10));

  // Modals
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [txDetail, setTxDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedCashier, setSelectedCashier] = useState<any | null>(null);

  // Search & Filter for Transaction List
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Pagination States
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);

  const [cashierPage, setCashierPage] = useState(1);
  const [cashierPageSize, setCashierPageSize] = useState(10);

  const byPayment = data?.byPayment || [];
  const byCashier = data?.byCashier || [];
  const allTransactions = data?.transactionsList || [];

  const handlePeriodChange = async (newPeriod: 'today' | '7days' | 'month' | 'last_month' | 'all' | 'custom') => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      try {
        const res = await getSalesReportBreakdownAction(newPeriod);
        setData(res);
        setTxPage(1);
        setCashierPage(1);
      } catch (err) {
        console.error('Failed to update sales breakdown:', err);
      }
    }
  };

  const handleApplyCustomDate = async () => {
    try {
      const res = await getSalesReportBreakdownAction('custom', customStart, customEnd);
      setData(res);
      setTxPage(1);
      setCashierPage(1);
    } catch (err) {
      console.error('Failed to update custom sales breakdown:', err);
    }
  };

  const handleOpenTxDetail = async (txId: string) => {
    setSelectedTxId(txId);
    setLoadingDetail(true);
    try {
      const res = await getTransactionDetailAction(txId);
      if (res && res.success && res.transaction) {
        setTxDetail({
          transaction: res.transaction,
          items: res.items || [],
        });
      } else {
        const localTx = allTransactions.find((t) => t.id === txId);
        if (localTx) {
          setTxDetail({
            transaction: localTx,
            items: [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load tx detail:', err);
      const localTx = allTransactions.find((t) => t.id === txId);
      if (localTx) {
        setTxDetail({
          transaction: localTx,
          items: [],
        });
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter Transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchSearch =
      tx.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.cashierName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchMethod =
      paymentFilter === 'ALL' || tx.paymentMethod === paymentFilter;

    return matchSearch && matchMethod;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (txPage - 1) * txPageSize,
    txPage * txPageSize
  );

  const paginatedCashiers = byCashier.slice(
    (cashierPage - 1) * cashierPageSize,
    cashierPage * cashierPageSize
  );

  // Method data mapping
  const cashData = (byPayment || []).find((p) => p && p.paymentMethod === 'CASH');
  const qrisData = (byPayment || []).find((p) => p && p.paymentMethod === 'QRIS');
  const transferData = (byPayment || []).find((p) => p && p.paymentMethod === 'TRANSFER');
  const debtData = (byPayment || []).find((p) => p && (p.paymentMethod === 'DEBT' || p.paymentMethod === 'DP'));

  // Transaction columns
  const txColumns: ColumnDef<any>[] = [
    {
      key: 'invoiceNo',
      header: 'No. Struk / Invoice',
      render: (tx) => (
        <div>
          <span className="font-mono font-bold text-[#191F28] text-xs">
            {tx.invoiceNo}
          </span>
          <p className="text-[10px] text-[#6F7780]">{formatTanggal(tx.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'cashier',
      header: 'Kasir & Pelanggan',
      render: (tx) => (
        <div>
          <p className="font-bold text-[#191F28] text-xs">{tx.cashierName || 'Kasir'}</p>
          <div className="flex items-center space-x-1 text-[10px] text-[#6F7780] mt-0.5">
            <User className="w-3 h-3 text-[#6F7780]" />
            <span>{tx.customerName ? tx.customerName : 'Umum (Walk-in)'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Metode Bayar',
      render: (tx) => {
        const method = tx.paymentMethod;
        const badgeMap: Record<string, { label: string; bg: string; text: string }> = {
          CASH: { label: 'Tunai', bg: 'bg-[#E6FAF2]', text: 'text-[#03B26C]' },
          QRIS: { label: 'QRIS', bg: 'bg-[#E8F3FF]', text: 'text-[#3182F6]' },
          TRANSFER: { label: 'Transfer', bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
          DEBT: { label: 'Kasbon', bg: 'bg-[#FFF5E6]', text: 'text-[#FE9800]' },
          DP: { label: 'DP / Uang Muka', bg: 'bg-[#FFF5E6]', text: 'text-[#FE9800]' },
        };
        const badge = badgeMap[method] || { label: method, bg: 'bg-[#F2F4F6]', text: 'text-[#4E5968]' };

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: 'Total Bayar',
      align: 'right',
      render: (tx) => (
        <div>
          <span className="font-mono font-extrabold text-[#191F28] tabular-nums text-xs">
            {formatRupiah(tx.total)}
          </span>
          {tx.discount > 0 && (
            <p className="text-[10px] text-[#F04452] font-mono">
              Hemat {formatRupiah(tx.discount)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'center',
      render: (tx) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            type="button"
            onClick={() => handleOpenTxDetail(tx.id)}
            className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
            title="Lihat Rincian Item Belanja"
          >
            <Eye className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/invoice/${tx.id}`}
            target="_blank"
            className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
            title="Lihat & Cetak Nota Struk"
          >
            <Receipt className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Top Header Toolbar: Date Filter (Uncarded, Clean) */}
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

      {/* 2. Reusable 4 Payment Method StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Uang Tunai Kasir"
          value={formatRupiah(cashData?.totalAmount || 0)}
          icon={Banknote}
          iconColor="text-[#03B26C]"
          valueColor="text-[#03B26C]"
          subtitle={`${cashData?.count || 0} transaksi tunai`}
        />

        <StatCard
          title="QRIS Digital"
          value={formatRupiah(qrisData?.totalAmount || 0)}
          icon={QrCode}
          iconColor="text-[#3182F6]"
          valueColor="text-[#3182F6]"
          subtitle={`${qrisData?.count || 0} transaksi digital`}
        />

        <StatCard
          title="Transfer Bank"
          value={formatRupiah(transferData?.totalAmount || 0)}
          icon={CreditCard}
          iconColor="text-[#7E22CE]"
          valueColor="text-[#7E22CE]"
          subtitle={`${transferData?.count || 0} transaksi transfer`}
        />

        <StatCard
          title="Kasbon / Piutang"
          value={formatRupiah(debtData?.totalAmount || 0)}
          icon={Receipt}
          iconColor="text-[#FE9800]"
          valueColor="text-[#FE9800]"
          subtitle={`${debtData?.count || 0} transaksi kasbon`}
        />
      </div>

      {/* 3. Section: Rincian Log Transaksi Penjualan (Per-Transaksi Struk) */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#191F28]">Rincian Transaksi Penjualan</h3>
              <p className="text-[11px] text-[#6F7780]">Daftar seluruh struk transaksi penjualan kasir pada periode ini</p>
            </div>
          </div>

          {/* Search + Filter Metode Bayar */}
          <div className="flex items-center space-x-2 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTxPage(1);
                }}
                placeholder="Cari no. invoice, kasir, pelanggan..."
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#E5E8EB] rounded-xl text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setTxPage(1);
              }}
              className="h-9 px-2.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="CASH">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="TRANSFER">Transfer</option>
              <option value="DEBT">Kasbon</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={txColumns}
          data={paginatedTransactions}
          keyExtractor={(item) => item.id}
          emptyTitle="Belum Ada Transaksi"
          emptyMessage="Belum ada transaksi penjualan tercatat pada periode ini."
          emptyIcon={ShoppingBag}
          pagination={{
            currentPage: txPage,
            pageSize: txPageSize,
            totalItems: filteredTransactions.length,
            onPageChange: setTxPage,
            onPageSizeChange: (size) => {
              setTxPageSize(size);
              setTxPage(1);
            },
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      </div>

      {/* 4. Section: Cashier Performance Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#191F28]">Performa Omzet Berdasarkan Kasir</h3>
            <p className="text-[11px] text-[#6F7780]">Rincian kontribusi omzet dan produktivitas masing-masing staf kasir</p>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'userName',
              header: 'Nama Kasir',
              render: (c) => (
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F2F4F6] text-[#4E5968] flex items-center justify-center font-bold text-xs">
                    {(c.userName || 'K').slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-bold text-[#191F28]">{c.userName || 'Kasir Toko'}</span>
                </div>
              ),
            },
            {
              key: 'count',
              header: 'Jumlah Transaksi Selesai',
              align: 'center',
              render: (c) => (
                <span className="font-semibold text-[#4E5968]">{c.count} Transaksi</span>
              ),
            },
            {
              key: 'totalAmount',
              header: 'Total Omzet Dihasilkan',
              align: 'right',
              render: (c) => (
                <span className="font-mono font-bold text-[#3182F6] tabular-nums text-sm">
                  {formatRupiah(c.totalAmount)}
                </span>
              ),
            },
            {
              key: 'action',
              header: 'Aksi',
              align: 'center',
              render: (c) => (
                <button
                  type="button"
                  onClick={() => setSelectedCashier(c)}
                  className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
                  title="Lihat Detail Performa Kasir"
                >
                  <Eye className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          data={paginatedCashiers}
          keyExtractor={(item, idx) => item.userId || String(idx)}
          emptyTitle="Belum Ada Transaksi Kasir"
          emptyMessage="Belum ada data transaksi kasir tercatat pada periode ini."
          emptyIcon={Users}
          pagination={{
            currentPage: cashierPage,
            pageSize: cashierPageSize,
            totalItems: byCashier.length,
            onPageChange: setCashierPage,
            onPageSizeChange: (size) => {
              setCashierPageSize(size);
              setCashierPage(1);
            },
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      </div>

      {/* MODAL 1: Detail Transaksi & Item Belanja */}
      <Modal
        isOpen={Boolean(selectedTxId)}
        onClose={() => {
          setSelectedTxId(null);
          setTxDetail(null);
        }}
        title={
          txDetail?.transaction?.invoiceNo
            ? `Rincian Transaksi #${txDetail.transaction.invoiceNo}`
            : 'Rincian Transaksi'
        }
        description="Detail barang yang dibeli dan status pembayaran kasir"
        maxWidth="2xl"
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-xs font-semibold text-[#6F7780]">
            Memuat data transaksi...
          </div>
        ) : txDetail ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] text-xs">
              <div>
                <p className="text-[10px] text-[#6F7780] font-semibold">Waktu Transaksi</p>
                <p className="font-bold text-[#191F28] mt-0.5">{formatTanggal(txDetail.transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#6F7780] font-semibold">Kasir</p>
                <p className="font-bold text-[#191F28] mt-0.5">{txDetail.transaction.cashierName || 'Kasir'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#6F7780] font-semibold">Pelanggan</p>
                <p className="font-bold text-[#191F28] mt-0.5">{txDetail.transaction.customerName || 'Umum (Walk-in)'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#6F7780] font-semibold">Metode Bayar</p>
                <p className="font-bold text-[#3182F6] mt-0.5">{txDetail.transaction.paymentMethod}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#E5E8EB] rounded-xl overflow-hidden">
              <div className="bg-[#F8F9FA] px-3.5 py-2 text-[11px] font-extrabold text-[#6F7780] grid grid-cols-12">
                <span className="col-span-6">Nama Barang</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Harga</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>
              <div className="divide-y divide-[#E5E8EB] max-h-60 overflow-y-auto">
                {txDetail.items?.map((item: any) => (
                  <div key={item.id} className="px-3.5 py-2.5 text-xs grid grid-cols-12 items-center">
                    <div className="col-span-6">
                      <p className="font-bold text-[#191F28]">{item.productName}</p>
                      {item.productSku && <p className="text-[10px] text-[#6F7780]">{item.productSku}</p>}
                    </div>
                    <span className="col-span-2 text-center font-semibold text-[#4E5968]">
                      {item.qty} {item.unitName || 'pcs'}
                    </span>
                    <span className="col-span-2 text-right font-mono text-[#6F7780]">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="col-span-2 text-right font-mono font-bold text-[#191F28]">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-[#6F7780]">
                <span>Subtotal Barang:</span>
                <span className="font-mono text-[#191F28]">{formatRupiah(txDetail.transaction.subtotal)}</span>
              </div>
              {txDetail.transaction.discount > 0 && (
                <div className="flex justify-between font-semibold text-[#F04452]">
                  <span>Diskon / Potongan:</span>
                  <span className="font-mono">-{formatRupiah(txDetail.transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-[#191F28] pt-1.5 border-t border-[#E5E8EB]">
                <span>Total Akhir:</span>
                <span className="font-mono text-[#3182F6]">{formatRupiah(txDetail.transaction.total)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#6F7780] pt-1">
                <span>Jumlah Dibayar:</span>
                <span className="font-mono text-[#191F28]">{formatRupiah(txDetail.transaction.paidAmount)}</span>
              </div>
              {txDetail.transaction.changeAmount > 0 && (
                <div className="flex justify-between font-semibold text-[#03B26C]">
                  <span>Kembalian:</span>
                  <span className="font-mono">+{formatRupiah(txDetail.transaction.changeAmount)}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E5E8EB]">
              <Link
                href={`/dashboard/invoice/${txDetail.transaction.id}`}
                target="_blank"
                className="h-9 px-3.5 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka / Cetak Struk</span>
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* MODAL 2: Detail Performa Kasir */}
      <Modal
        isOpen={Boolean(selectedCashier)}
        onClose={() => setSelectedCashier(null)}
        title={`Performa Kasir: ${selectedCashier?.userName || 'Kasir Toko'}`}
        description="Ringkasan produktivitas dan riwayat transaksi staf kasir"
        maxWidth="2xl"
      >
        {selectedCashier && (() => {
          const cashierTransactions = allTransactions.filter(
            (tx) =>
              (tx.userId && tx.userId === selectedCashier.userId) ||
              tx.cashierName === selectedCashier.userName
          );

          return (
            <div className="space-y-4">
              {/* Summary Profile & Stats Card */}
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#E5E8EB]">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] text-[#3182F6] font-extrabold text-sm flex items-center justify-center">
                    {(selectedCashier.userName || 'K').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#191F28]">{selectedCashier.userName || 'Kasir Toko'}</h4>
                    <p className="text-[11px] text-[#6F7780]">Staf Kasir Terdaftar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E8EB]">
                    <span className="font-semibold text-[#6F7780] block text-[10px]">Total Transaksi</span>
                    <span className="font-bold text-[#191F28] text-sm">{selectedCashier.count} Transaksi</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E8EB]">
                    <span className="font-semibold text-[#6F7780] block text-[10px]">Total Omzet</span>
                    <span className="font-bold font-mono text-[#3182F6] text-sm">{formatRupiah(selectedCashier.totalAmount)}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E8EB]">
                    <span className="font-semibold text-[#6F7780] block text-[10px]">Rata-rata per Struk</span>
                    <span className="font-mono text-[#191F28] font-bold text-sm">
                      {formatRupiah(Math.round(selectedCashier.totalAmount / (selectedCashier.count || 1)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-[#191F28] flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#3182F6]" />
                    <span>Riwayat Struk Kasir Ini ({cashierTransactions.length})</span>
                  </h5>
                  <span className="text-[10px] text-[#6F7780]">Periode Terpilih</span>
                </div>

                {cashierTransactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6F7780] bg-[#F8F9FA] rounded-xl border border-[#E5E8EB]">
                    Tidak ada transaksi tercatat untuk kasir ini pada periode terpilih.
                  </div>
                ) : (
                  <div className="border border-[#E5E8EB] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <div className="divide-y divide-[#E5E8EB]">
                      {cashierTransactions.map((tx) => (
                        <div key={tx.id} className="p-3 bg-white hover:bg-[#F8F9FA] transition-colors flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-[#191F28]">{tx.invoiceNo}</span>
                              <span className="text-[10px] text-[#6F7780]">• {formatTanggal(tx.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] text-[#6F7780] mt-0.5">
                              <User className="w-3 h-3 text-[#6F7780]" />
                              <span>{tx.customerName ? tx.customerName : 'Umum (Walk-in)'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="font-mono font-bold text-[#191F28] block">
                                {formatRupiah(tx.total)}
                              </span>
                              <span className="text-[10px] font-bold text-[#3182F6]">
                                {tx.paymentMethod}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleOpenTxDetail(tx.id)}
                                className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
                                title="Lihat Rincian Item Belanja"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/dashboard/invoice/${tx.id}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
                                title="Lihat & Cetak Nota Struk"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
