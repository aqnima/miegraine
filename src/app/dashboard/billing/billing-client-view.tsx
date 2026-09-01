'use client';

import React, { useState } from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import {
  CreditCard,
  Crown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Store,
  PhoneCall,
  Check,
  QrCode,
  Wallet,
  Sprout,
  Star,
  Zap,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

interface BillingClientViewProps {
  user: any;
  tenant: any;
  settings: any;
  daysLeft: number;
  isExpired: boolean;
}

export function BillingClientView({
  user,
  tenant,
  settings,
  daysLeft,
  isExpired,
}: BillingClientViewProps) {
  const currentPlan = (tenant?.subscriptionPlan || 'starter').toLowerCase();
  const status = tenant?.subscriptionStatus || 'trial';

  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<string | null>(null);

  const cleanSupportPhone = (settings.supportPhone || '6281234567890').replace(/[^0-9]/g, '');
  const waPhone = cleanSupportPhone.startsWith('0')
    ? '62' + cleanSupportPhone.slice(1)
    : cleanSupportPhone;

  const handleWhatsAppConfirm = (planName: string, price: number) => {
    const message = `Halo Tim Support Miegraine, saya Owner "${user.name}" dari toko "${tenant?.name || user.tenantName}". Saya ingin konfirmasi perpanjangan / upgrade paket langganan ke *${planName.toUpperCase()}* (${formatRupiah(price)}/bulan). Mohon diproses. Terima kasih!`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      tagline: 'Masa Percobaan Free Trial',
      price: 0,
      period: '7 Hari',
      badgeLabel: 'STARTER',
      icon: Sprout,
      badgeColor: 'bg-[#FFF5E6] text-[#FE9800] border-[#FE9800]/30',
      isCurrent: currentPlan === 'starter',
      features: [
        'Maksimal 1 Toko & 1 Cabang',
        'Layar Kasir POS Cepat',
        'Katalog Master Produk (Maks 30)',
        'Buku Piutang & Kas Harian',
        'Support Standar Chat',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      tagline: 'Solusi Lengkap Bisnis Tunggal',
      price: settings.proPrice || 99000,
      period: '/ bulan',
      badgeLabel: 'PALING POPULER',
      icon: Star,
      badgeColor: 'bg-[#E8F3FF] text-[#3182F6] border-[#3182F6]/30',
      isCurrent: currentPlan === 'pro',
      isPopular: true,
      features: [
        '1 Toko Mandiri + Multi-Cabang',
        'Unlimited Transaksi Kasir POS',
        'Unlimited Master Produk & Stok',
        'Laporan Laba Rugi & HPP Otomatis',
        'Audit Log Forensik Anti-Fraud',
        'Buku Piutang & Multi-Satuan',
        'Dukungan WhatsApp Prioritas',
      ],
    },
    {
      id: 'ultra',
      name: 'Ultra Plan',
      tagline: 'Multi-Toko Franchise & VIP',
      price: settings.ultraPrice || 249000,
      period: '/ bulan',
      badgeLabel: 'UNLIMITED TOKO',
      icon: Zap,
      badgeColor: 'bg-[#F3E8FF] text-[#9333EA] border-[#9333EA]/30',
      isCurrent: currentPlan === 'ultra',
      features: [
        'BEBAS BUKA BANYAK TOKO (Unlimited Toko)',
        'Unlimited Cabang di Seluruh Toko',
        'Konsolidasi Seluruh Laporan Bisnis',
        '1 Akun Login untuk Semua Brand',
        'Akses Fitur Terbaru Lebih Awal',
        'Dedicated VIP Account Manager',
        'Backup Cloud Prioritas 24/7',
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Action Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => handleWhatsAppConfirm(currentPlan === 'starter' ? 'Pro Plan' : currentPlan, currentPlan === 'ultra' ? 249000 : 99000)}
          className="inline-flex items-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Hubungi CS Pembayaran</span>
        </button>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Paket Langganan Aktif"
          value={
            currentPlan === 'ultra'
              ? 'Ultra VIP'
              : currentPlan === 'pro'
              ? 'Pro Plan'
              : 'Starter Trial'
          }
          icon={Crown}
          iconColor={
            currentPlan === 'ultra'
              ? 'text-[#9333EA]'
              : currentPlan === 'pro'
              ? 'text-[#3182F6]'
              : 'text-[#FE9800]'
          }
          valueColor="text-[#191F28]"
          subtitle={
            currentPlan === 'ultra'
              ? 'Multi-Toko & Unlimited Cabang'
              : currentPlan === 'pro'
              ? '1 Toko Mandiri'
              : 'Masa Uji Coba Gratis'
          }
        />

        <StatCard
          title="Masa Sewa Tersisa"
          value={isExpired ? 'Kedaluwarsa' : `${daysLeft} Hari Lagi`}
          icon={Clock}
          iconColor={isExpired ? 'text-[#F04452]' : daysLeft <= 7 ? 'text-[#FE9800]' : 'text-[#03B26C]'}
          valueColor={isExpired ? 'text-[#F04452]' : daysLeft <= 7 ? 'text-[#FE9800]' : 'text-[#03B26C]'}
          subtitle={
            tenant?.subscriptionExpiresAt
              ? `Berakhir pada: ${formatTanggal(tenant.subscriptionExpiresAt)}`
              : 'Akun aktif'
          }
        />

        <StatCard
          title="Status Akun Toko"
          value={
            status === 'active'
              ? 'Aktif Berlangganan'
              : status === 'trial'
              ? 'Masa Uji Coba'
              : 'Perlu Perpanjangan'
          }
          icon={ShieldCheck}
          iconColor={status === 'active' ? 'text-[#03B26C]' : 'text-[#FE9800]'}
          valueColor={status === 'active' ? 'text-[#03B26C]' : 'text-[#191F28]'}
          subtitle={`Terdaftar sejak: ${formatTanggal(tenant?.createdAt)}`}
        />
      </div>

      {/* 3-Tier Subscription Pricing Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#191F28]">Pilihan Paket & Upgrade</h2>
          <p className="text-xs text-[#6F7780] mt-0.5">
            Pilih paket yang sesuai dengan skala dan rencana pertumbuhan bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => {
            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all shadow-xs relative ${
                  p.isCurrent
                    ? 'border-[#3182F6] ring-2 ring-[#3182F6]/20 bg-[#FBFDFF]'
                    : p.isPopular
                    ? 'border-[#3182F6]/50 shadow-md'
                    : 'border-[#E5E8EB]'
                }`}
              >
                {/* Plan Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${p.badgeColor}`}>
                      <p.icon className="w-3 h-3" />
                      <span>{p.badgeLabel}</span>
                    </span>
                    {p.isCurrent && (
                      <span className="text-[10px] font-bold text-[#03B26C] flex items-center gap-1 bg-[#E6FAF2] px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Paket Anda
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-[#191F28]">{p.name}</h3>
                  <p className="text-xs text-[#6F7780] mt-0.5">{p.tagline}</p>

                  <div className="mt-4 pb-4 border-b border-[#E5E8EB]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#191F28] font-mono tabular-nums">
                        {formatRupiah(p.price)}
                      </span>
                      <span className="text-xs text-[#6F7780] font-medium">{p.period}</span>
                    </div>
                  </div>

                  {/* Feature Bullet List */}
                  <div className="py-4 space-y-2.5">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0 mt-0.5" />
                        <span className="text-[#333D4B] leading-tight font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-4 border-t border-[#E5E8EB]">
                  {p.isCurrent ? (
                    <button
                      onClick={() => handleWhatsAppConfirm(p.name, p.price)}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#E8F3FF] hover:bg-[#3182F6] text-[#3182F6] hover:text-white font-bold text-xs transition-colors text-center"
                    >
                      Perpanjang Paket Ini
                    </button>
                  ) : (
                    <button
                      onClick={() => handleWhatsAppConfirm(p.name, p.price)}
                      className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 ${
                        p.id === 'ultra'
                          ? 'bg-[#9333EA] hover:bg-[#7E22CE] text-white shadow-xs'
                          : 'bg-[#3182F6] hover:bg-[#2272EB] text-white shadow-xs'
                      }`}
                    >
                      <span>Pilih & Upgrade</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Confirmation & Bank Transfer Guide Card */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-[#E5E8EB] shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="w-5 h-5 text-[#3182F6]" />
          <h2 className="text-base font-bold text-[#191F28]">Panduan Pembayaran & Perpanjangan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#3182F6] text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-xs text-[#191F28]">Transfer Bank / QRIS</h3>
            <p className="text-xs text-[#6F7780] leading-relaxed">
              Lakukan pembayaran sesuai harga paket yang dipilih ke rekening resmi Superadmin Miegraine.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#3182F6] text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-xs text-[#191F28]">Kirim Bukti Pembayaran</h3>
            <p className="text-xs text-[#6F7780] leading-relaxed">
              Klik tombol WhatsApp untuk mengirimkan bukti transfer dan menyebutkan nama toko Anda.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#03B26C] text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-xs text-[#191F28]">Aktivasi Instan</h3>
            <p className="text-xs text-[#6F7780] leading-relaxed">
              Superadmin akan langsung memverifikasi dan memperpanjang masa aktif toko Anda dalam hitungan menit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
