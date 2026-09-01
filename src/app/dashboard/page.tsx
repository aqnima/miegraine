import React from 'react';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import {
  transactions,
  customers,
  users,
  products,
  outletStock,
  tenants,
} from '@/lib/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { BUSINESS_PRESETS } from '@/lib/constants/business-presets';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import {
  DollarSign,
  PackageCheck,
  CreditCard,
  Package,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Receipt,
  ShoppingCart,
  Sprout,
  Star,
  Zap,
  Truck,
  ShoppingBag,
  TrendingUp,
  Layers,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { RevenueTrendChart } from '@/components/dashboard/revenue-trend-chart';
import Link from 'next/link';

export default async function DashboardHomePage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return null;

  const preset = (user?.businessType && BUSINESS_PRESETS[user.businessType])
    ? BUSINESS_PRESETS[user.businessType]
    : BUSINESS_PRESETS.general;

  // 0. Fetch 7-Day Weekly Sales Trend (Direct Server DB Query)
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const trendDays: Array<{
    dateStr: string;
    dayLabel: string;
    shortDate: string;
    totalRevenue: number;
    txCount: number;
    isToday: boolean;
  }> = [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  let weeklyTrend = {
    days: trendDays,
    total7DayRevenue: 0,
    maxRevenue: 1,
  };

  try {
    const tx7Days = await db
      .select({
        total: transactions.total,
        createdAt: transactions.createdAt,
        paymentStatus: transactions.paymentStatus,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, user.tenantId),
          gte(transactions.createdAt, sevenDaysAgo)
        )
      );

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = dayNames[d.getDay()];
      const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const matchingTx = (tx7Days || []).filter((t) => {
        if (!t?.createdAt) return false;
        const txTime = t.createdAt instanceof Date ? t.createdAt.getTime() : new Date(t.createdAt).getTime();
        return !isNaN(txTime) && txTime >= startOfDay.getTime() && txTime <= endOfDay.getTime();
      });

      const totalRevenue = matchingTx.reduce((sum, t) => sum + (t?.total || 0), 0);
      const txCount = matchingTx.length;

      trendDays.push({
        dateStr,
        dayLabel,
        shortDate,
        totalRevenue,
        txCount,
        isToday: i === 0,
      });
    }

    const total7DayRevenue = trendDays.reduce((sum, d) => sum + d.totalRevenue, 0);
    const maxRevenue = Math.max(...trendDays.map((d) => d.totalRevenue), 1);

    weeklyTrend = {
      days: trendDays,
      total7DayRevenue,
      maxRevenue,
    };
  } catch (error) {
    console.error('Error fetching weekly trend:', error);
  }

  // 0. Fetch Tenant Subscription Plan
  let currentPlan = 'starter';
  try {
    const tenantQuery = await db
      .select({
        plan: tenants.subscriptionPlan,
      })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);
    if (tenantQuery && tenantQuery.length > 0) {
      currentPlan = tenantQuery[0].plan || 'starter';
    }
  } catch {}

  // 1. Fetch Today's Completed Sales & Count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayOmzet = 0;
  let todayCount = 0;

  try {
    const todayTransactions = await db
      .select({
        id: transactions.id,
        total: transactions.total,
        paymentStatus: transactions.paymentStatus,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, user.tenantId),
          gte(transactions.createdAt, today)
        )
      );

    todayOmzet = (todayTransactions || []).reduce((acc, t) => acc + (t?.total || 0), 0);
    todayCount = (todayTransactions || []).length;
  } catch {
    todayOmzet = 0;
    todayCount = 0;
  }

  // 2. Fetch Active Debts Summary
  let totalActiveDebt = 0;
  let debtorsCount = 0;

  try {
    const allDebtors = await db
      .select({ currentDebt: customers.currentDebt })
      .from(customers)
      .where(and(eq(customers.tenantId, user.tenantId), gte(customers.currentDebt, 1)));

    totalActiveDebt = (allDebtors || []).reduce((acc, c) => acc + (c?.currentDebt || 0), 0);
    debtorsCount = (allDebtors || []).length;
  } catch {
    totalActiveDebt = 0;
    debtorsCount = 0;
  }

  // 3. Fetch Products & Low Stock Summary
  let activeProductsList: any[] = [];
  let lowStockCount = 0;

  try {
    activeProductsList = await db
      .select({
        id: products.id,
        minStockAlert: products.minStockAlert,
        stock: outletStock.currentStock,
      })
      .from(products)
      .leftJoin(
        outletStock,
        and(
          eq(outletStock.productId, products.id),
          user.outletId ? eq(outletStock.outletId, user.outletId) : eq(products.tenantId, user.tenantId)
        )
      )
      .where(and(eq(products.tenantId, user.tenantId), eq(products.isActive, true)));

    lowStockCount = (activeProductsList || []).filter(
      (p) => (p?.stock || 0) <= (p?.minStockAlert || 5)
    ).length;
  } catch {
    activeProductsList = [];
    lowStockCount = 0;
  }

  // 4. Fetch Recent 5 Transactions
  let recentTxList: any[] = [];
  try {
    recentTxList = await db
      .select({
        transaction: transactions,
        customerName: customers.name,
        cashierName: users.name,
      })
      .from(transactions)
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.tenantId, user.tenantId))
      .orderBy(desc(transactions.createdAt))
      .limit(5);
  } catch {
    recentTxList = [];
  }

  const recentColumns: ColumnDef<any>[] = [
    {
      key: 'invoiceNo',
      header: 'No. Struk & Waktu',
      render: (item) => (
        <div>
          <p className="font-bold text-[#191F28] font-mono text-xs">{item.transaction?.invoiceNo || '-'}</p>
          <p className="text-[10px] text-[#6F7780]">{formatTanggal(item.transaction?.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Pelanggan / Kasir',
      render: (item) => (
        <div>
          <p className="font-bold text-[#191F28] text-xs">{item.customerName || 'Pelanggan Umum'}</p>
          <p className="text-[10px] text-[#6F7780]">Kasir: {item.cashierName || 'Staf'}</p>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Metode Bayar',
      align: 'center',
      render: (item) => {
        const pm = item.transaction?.paymentMethod || 'CASH';
        let badgeColor = 'bg-[#E8F3FF] text-[#3182F6] border-[#3182F6]/20';
        if (pm === 'DEBT') badgeColor = 'bg-[#FFF5E6] text-[#FE9800] border-[#FE9800]/20';
        else if (pm === 'QRIS') badgeColor = 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20';

        return (
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
            {pm === 'CASH' ? 'Tunai' : pm}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: 'Total Bayar',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-[#191F28] text-xs tabular-nums">
          {formatRupiah(item.transaction?.total || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => {
        const isVoid = item.transaction?.status === 'VOID';
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              isVoid
                ? 'bg-[#FEECED] text-[#F04452] border-[#F04452]/20'
                : 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20'
            }`}
          >
            {isVoid ? 'Batal (Void)' : 'Selesai'}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'center',
      render: (item) => (
        <Link
          href={`/dashboard/invoice/${item.transaction?.id}`}
          className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
          title="Lihat Nota"
        >
          <Receipt className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Hero Banner (100% Solid Flat Blue Theme) */}
      <div className="bg-[#3182F6] text-white p-6 md:p-8 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          {/* Solid Information Chips */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="inline-flex items-center space-x-1.5 bg-[#2272EB] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Sektor: {preset.name}</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 bg-[#2272EB] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              <Building2 className="w-3.5 h-3.5 text-white" />
              <span>Cabang: {user.outletName || 'Toko Utama'}</span>
            </div>

            <Link href="/dashboard/billing">
              {currentPlan === 'ultra' ? (
                <div className="inline-flex items-center space-x-1.5 bg-[#9333EA] text-white px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Paket ULTRA</span>
                </div>
              ) : currentPlan === 'pro' ? (
                <div className="inline-flex items-center space-x-1.5 bg-white text-[#3182F6] px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide">
                  <Star className="w-3.5 h-3.5 fill-[#3182F6]" />
                  <span>Paket PRO</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 bg-[#FE9800] text-white px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Paket STARTER</span>
                </div>
              )}
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Selamat Datang, {user.name}
          </h1>
          <p className="text-xs text-white mt-1 leading-relaxed">
            Ringkasan performa penjualan dan inventaris toko <strong className="font-bold underline decoration-white/40 underline-offset-2">{user.tenantName}</strong> secara realtime.
          </p>
        </div>

        {/* Solid Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/pos"
            className="inline-flex items-center space-x-2 bg-white hover:bg-[#F2F4F6] text-[#3182F6] px-5 py-2.5 rounded-lg font-extrabold text-xs transition-all shadow-xs active:scale-98"
          >
            <ShoppingCart className="w-4 h-4 text-[#3182F6]" />
            <span>Buka Kasir POS</span>
          </Link>
          <Link
            href="/dashboard/inventory"
            className="inline-flex items-center space-x-2 bg-[#2272EB] hover:bg-[#1B64DA] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all"
          >
            <Package className="w-4 h-4 text-white" />
            <span>Kelola Produk</span>
          </Link>
        </div>
      </div>

      {/* 4 Standardized Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Omzet Penjualan Hari Ini"
          value={formatRupiah(todayOmzet)}
          icon={DollarSign}
          iconColor="text-[#3182F6]"
          valueColor="text-[#191F28]"
          trend={{
            text: todayCount > 0 ? `${todayCount} Transaksi Selesai` : 'Shift Kasir Aktif',
            isPositive: true,
          }}
        />

        <StatCard
          title="Total Transaksi Hari Ini"
          value={`${todayCount} Nota`}
          icon={PackageCheck}
          iconColor="text-[#03B26C]"
          valueColor="text-[#03B26C]"
          subtitle="Nota kasir berhasil diproses"
        />

        <StatCard
          title="Buku Piutang Belum Lunas"
          value={formatRupiah(totalActiveDebt)}
          icon={CreditCard}
          iconColor="text-[#FE9800]"
          valueColor="text-[#FE9800]"
          subtitle={`${debtorsCount} Pelanggan bersaldo tempo`}
        />

        <StatCard
          title="Master Produk & Stok"
          value={`${activeProductsList.length} Produk`}
          icon={Package}
          iconColor="text-[#3182F6]"
          valueColor="text-[#191F28]"
          subtitle={
            lowStockCount > 0
              ? `${lowStockCount} produk stok menipis`
              : 'Stok barang aman & termonitor'
          }
        />
      </div>

      {/* 1 Row: Revenue Trend Chart on Left + 4 Quick Operations Modules on Right (Strictly Aligned) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: 7-Day Revenue Trend Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <RevenueTrendChart data={weeklyTrend} />
        </div>

        {/* Right: 1 Unified Quick Access Operations Card (4 cols) */}
        <div className="lg:col-span-4 h-full bg-white p-5 md:p-6 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E8EB] flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#3182F6]" />
              <h3 className="font-bold text-sm text-[#191F28]">Pintasan Operasional</h3>
            </div>
            <span className="text-[10px] font-bold text-[#6F7780] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
              4 Modul
            </span>
          </div>

          {/* 4 Items Evenly Filling the Height */}
          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {/* 1. Pembelian PO */}
            <Link
              href="/dashboard/purchases"
              className="p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E8F3FF] border border-[#E5E8EB] hover:border-[#3182F6]/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white text-[#3182F6] flex items-center justify-center flex-shrink-0 border border-[#3182F6]/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors truncate">
                    Pembelian (PO)
                  </p>
                  <p className="text-[11px] text-[#6F7780] truncate mt-0.5">
                    Kulakan & faktur distributor
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8B95A1] group-hover:text-[#3182F6] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* 2. Mutasi Stok */}
            <Link
              href="/dashboard/transfers"
              className="p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E6FAF2] border border-[#E5E8EB] hover:border-[#03B26C]/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white text-[#03B26C] flex items-center justify-center flex-shrink-0 border border-[#03B26C]/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#191F28] group-hover:text-[#03B26C] transition-colors truncate">
                    Mutasi Stok
                  </p>
                  <p className="text-[11px] text-[#6F7780] truncate mt-0.5">
                    Transfer & surat jalan cabang
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8B95A1] group-hover:text-[#03B26C] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* 3. Laba Rugi & HPP */}
            <Link
              href="/dashboard/reports"
              className="p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#FFF5E6] border border-[#E5E8EB] hover:border-[#FE9800]/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white text-[#FE9800] flex items-center justify-center flex-shrink-0 border border-[#FE9800]/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#191F28] group-hover:text-[#FE9800] transition-colors truncate">
                    Laba Rugi & HPP
                  </p>
                  <p className="text-[11px] text-[#6F7780] truncate mt-0.5">
                    Analisis margin profit & beban
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8B95A1] group-hover:text-[#FE9800] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* 4. Multi-Satuan */}
            <Link
              href="/dashboard/multiunit"
              className="p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#F3E8FF] border border-[#E5E8EB] hover:border-[#9333EA]/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white text-[#9333EA] flex items-center justify-center flex-shrink-0 border border-[#9333EA]/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#191F28] group-hover:text-[#9333EA] transition-colors truncate">
                    Multi-Satuan
                  </p>
                  <p className="text-[11px] text-[#6F7780] truncate mt-0.5">
                    Konversi eceran pcs, dus, rim
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8B95A1] group-hover:text-[#9333EA] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent 5 Transactions Section Wrapped in 1 Unified Card */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 md:p-6 pb-4 flex items-center justify-between border-b border-[#E5E8EB]">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-[#3182F6]" />
            <h2 className="font-bold text-sm md:text-base text-[#191F28]">Daftar Transaksi Kasir Terkini</h2>
          </div>
          <Link
            href="/dashboard/reports/sales"
            className="text-xs font-bold text-[#3182F6] hover:text-[#2272EB] flex items-center space-x-1 transition-colors group"
          >
            <span>Lihat Semua Rekap Penjualan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Embedded Table Content */}
        <DataTable
          columns={recentColumns}
          data={recentTxList}
          keyExtractor={(item) => item.transaction?.id || String(Math.random())}
          emptyTitle="Belum Ada Transaksi Kasir"
          emptyMessage="Buka menu POS Kasir untuk memulai transaksi kasir pertama Anda."
          emptyIcon={ShoppingCart}
          className="border-0 shadow-none rounded-none"
        />
      </div>

      {/* Preset & Business Configuration Card */}
      <div className="bg-white rounded-xl p-6 md:p-7 border border-[#E5E8EB] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E8EB]">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#3182F6]" />
              <h2 className="text-base font-bold text-[#191F28]">
                Konfigurasi Sektor: {preset.name}
              </h2>
            </div>
            <p className="text-xs text-[#6F7780] mt-0.5">
              {preset.description || 'Sistem kasir dan inventaris telah disesuaikan otomatis dengan alur bisnis Anda.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/multiunit"
              className="px-3 py-1.5 rounded-lg bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] font-bold text-xs transition-colors border border-[#E5E8EB]"
            >
              Atur Satuan
            </Link>
            <Link
              href="/dashboard/inventory"
              className="px-3 py-1.5 rounded-lg bg-[#E8F3FF] hover:bg-[#D4E8FF] text-[#3182F6] font-bold text-xs transition-colors border border-[#3182F6]/20"
            >
              Katalog Produk
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Multi-Units Box */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#191F28] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#03B26C]" />
                  Satuan Multi-Unit Baku
                </span>
                <span className="text-[10px] font-bold text-[#3182F6] bg-[#E8F3FF] px-2 py-0.5 rounded-md">
                  {preset.defaultUnits?.length || 0} Satuan
                </span>
              </div>
              <p className="text-xs text-[#6F7780] mb-3">
                Konversi otomatis stok saat kulakan dan penjualan kasir:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(preset.defaultUnits || []).map((u) => (
                  <div
                    key={u.name}
                    className="p-2.5 rounded-lg bg-white border border-[#E5E8EB] flex items-center justify-between"
                  >
                    <span className="font-extrabold text-xs text-[#191F28] uppercase font-mono">
                      {u.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#6F7780]">
                      {u.isBase ? 'Satuan Dasar' : `Isi ${u.conversion} unit`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Default Categories Box */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#191F28] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#03B26C]" />
                  Kategori Master Produk
                </span>
                <span className="text-[10px] font-bold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md border border-[#E5E8EB]">
                  {preset.defaultCategories?.length || 0} Kategori
                </span>
              </div>
              <p className="text-xs text-[#6F7780] mb-3">
                Pengelompokan barang untuk mempermudah pencarian kasir:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(preset.defaultCategories || []).map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E8EB] text-xs font-semibold text-[#191F28] shadow-2xs"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
