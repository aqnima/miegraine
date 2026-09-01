'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { DebtPaymentModal } from './debt-payment-modal';
import { CustomerModal } from './customer-modal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import {
  Search,
  Plus,
  Users,
  Banknote,
  AlertTriangle,
  Share2,
  Phone,
  CheckCircle2,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DebtClientViewProps {
  initialCustomers: any[];
  storeName: string;
  summary: {
    totalActiveDebt: number;
    debtorsCount: number;
    overLimitCount: number;
    totalCustomers: number;
  };
}

export function DebtClientView({ initialCustomers, storeName, summary }: DebtClientViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAS_DEBT' | 'CLEAR'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  const filteredCustomers = initialCustomers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));

    const debt = c.currentDebt || 0;
    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'HAS_DEBT'
        ? debt > 0
        : debt === 0;

    return matchSearch && matchStatus;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setIsPaymentOpen(true);
  };

  const generateWhatsAppReminder = (customer: any) => {
    const debtStr = formatRupiah(customer.currentDebt || 0);
    const msg = `Halo Bapak/Ibu *${customer.name}*,\n\nKami dari *${storeName.toUpperCase()}* menginformasikan catatan saldo tagihan bon Anda saat ini sebesar *${debtStr}*.\n\nMohon konfirmasi pembayaran atau pelunasan saat berkunjung ke toko kami. Terima kasih atas kerja samanya! 🙏`;

    const phone = customer.phone ? customer.phone.replace(/^0/, '62').replace(/\D/g, '') : '';
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'customer',
      header: 'Nama Pelanggan & Kontak',
      render: (c) => (
        <div className="flex items-start space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-[#191F28] text-sm">{c.name}</p>
            <p className="font-mono text-[11px] text-[#6F7780] mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {c.phone || 'Tanpa Kontak'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'limit',
      header: 'Batas Limit Kredit',
      render: (c) => (
        <span className="font-semibold text-[#6F7780] tabular-nums font-mono">
          {c.debtLimit > 0 ? formatRupiah(c.debtLimit) : 'Tanpa Batas'}
        </span>
      ),
    },
    {
      key: 'debt',
      header: 'Saldo Hutang Aktif',
      render: (c) => {
        const debt = c.currentDebt || 0;
        return (
          <span
            className={`font-extrabold text-sm tabular-nums font-mono ${
              debt > 0 ? 'text-[#F04452]' : 'text-[#03B26C]'
            }`}
          >
            {formatRupiah(debt)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status Limit',
      render: (c) => {
        const debt = c.currentDebt || 0;
        const limit = c.debtLimit || 0;
        const isOverLimit = limit > 0 && debt > limit;
        const isNearLimit = limit > 0 && debt >= limit * 0.8 && !isOverLimit;

        if (debt === 0) {
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FAF2] text-[#03B26C]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Lunas</span>
            </span>
          );
        }
        if (isOverLimit) {
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEECED] text-[#F04452]">
              <AlertTriangle className="w-3 h-3" />
              <span>Lewat Limit!</span>
            </span>
          );
        }
        if (isNearLimit) {
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5E6] text-[#FE9800]">
              <Clock className="w-3 h-3" />
              <span>Mendekati Limit</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F4F6] text-[#6F7780]">
            <span>Dalam Batas Aman</span>
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'center',
      render: (c) => {
        const debt = c.currentDebt || 0;
        if (debt === 0) {
          return <span className="text-[11px] font-semibold text-[#8B95A1]">-</span>;
        }

        return (
          <div className="flex items-center justify-center space-x-1.5">
            <a
              href={generateWhatsAppReminder(c)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#E6FAF2] text-[#03B26C] hover:bg-[#03B26C] hover:text-white font-bold text-xs transition-all border border-[#03B26C]/20"
              title="Kirim Tagihan via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Tagih WA</span>
            </a>

            <button
              onClick={() => handleOpenPayment(c)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#03B26C] hover:bg-[#029B5D] text-white font-bold text-xs transition-all shadow-2xs active:scale-98"
              title="Catat Pelunasan Bon"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Bayar</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Top Header Toolbar: Search + Filter Dropdown + Add Customer (Aligned at top) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama atau WhatsApp pelanggan..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Status Bon</option>
            <option value="HAS_DEBT">Punya Tagihan Bon</option>
            <option value="CLEAR">Lunas (Saldo Rp 0)</option>
          </select>
        </div>

        <button
          onClick={() => setIsCustomerOpen(true)}
          className="h-10 inline-flex items-center justify-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Pelanggan Baru</span>
        </button>
      </div>

      {/* 2. Reusable 3 StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Piutang Belum Tertagih"
          value={formatRupiah(summary.totalActiveDebt)}
          icon={CreditCard}
          iconColor="text-[#F04452]"
          valueColor="text-[#F04452]"
          subtitle="Akumulasi saldo kasbon seluruh pelanggan"
        />

        <StatCard
          title="Pelanggan dengan Saldo Bon"
          value={`${summary.debtorsCount} Orang`}
          icon={Users}
          iconColor="text-[#FE9800]"
          subtitle={`Dari total ${summary.totalCustomers} pelanggan terdaftar`}
        />

        <StatCard
          title="Melebihi Batas Limit"
          value={`${summary.overLimitCount} Pelanggan`}
          icon={AlertTriangle}
          iconColor="text-[#F04452]"
          valueColor="text-[#F04452]"
          subtitle="Perlu penagihan sebelum transaksi baru"
        />
      </div>

      {/* 3. Reusable Data Table with Pagination */}
      <DataTable
        columns={columns}
        data={paginatedCustomers}
        keyExtractor={(item) => item.id}
        emptyTitle="Belum Ada Pelanggan"
        emptyMessage="Klik 'Tambah Pelanggan Baru' untuk membuat buku catatan bon pelanggan."
        emptyIcon={Users}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredCustomers.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Debt Payment Modal */}
      <DebtPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
