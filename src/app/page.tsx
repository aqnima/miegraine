'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  ShoppingCart,
  Boxes,
  FileText,
  Printer,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Layers,
  Hammer,
  BookOpen,
  MapPin,
  Mail,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { FloatingWhatsapp } from '@/components/ui/floating-whatsapp';

export default function HomePage() {
  const verticals = [
    {
      icon: ShoppingCart,
      color: 'bg-[#E8F3FF] text-[#3182F6]',
      title: 'Minimarket & Kelontong',
      desc: 'Scan barcode super cepat 0ms, cetak struk thermal 58mm/80mm & rekap kas laci kasir.',
    },
    {
      icon: Hammer,
      color: 'bg-[#FFF5E6] text-[#FE9800]',
      title: 'Toko Bangunan & Material',
      desc: 'Satuan bertingkat (Sak isi 50Kg, Batang 6M), buku piutang bon & cetak surat jalan A4.',
    },
    {
      icon: BookOpen,
      color: 'bg-[#E6FAF2] text-[#03B26C]',
      title: 'Toko ATK & Fotokopi',
      desc: 'Hierarki konversi Dus ke Pack ke Pcs, tier harga grosir & pencarian nama instan.',
    },
    {
      icon: Smartphone,
      color: 'bg-[#E8F3FF] text-[#3182F6]',
      title: 'Toko HP & Gadget',
      desc: 'Pencatatan nomor IMEI & Serial Number unik per unit, anti tertukar saat klaim garansi.',
    },
    {
      icon: Zap,
      color: 'bg-[#FFF5E6] text-[#FE9800]',
      title: 'Toko Listrik & Elektronik',
      desc: 'Satuan Rol/Meter, tier harga borongan proyek & monitoring stok otomatis.',
    },
    {
      icon: Boxes,
      color: 'bg-[#E8F3FF] text-[#3182F6]',
      title: 'Distributor & Grosir Umum',
      desc: 'Solusi lengkap dengan konfigurasi fleksibel yang disesuaikan dengan alur toko Anda.',
    },
  ];

  const features = [
    {
      icon: Layers,
      title: 'Multi-Satuan Bertingkat & Base Unit',
      desc: 'Stok fisik selalu akurat di satuan terkecil. Mau jual per Dus, Sak, atau Eceran, kuantitas stok terpotong presisi tanpa selisih.',
    },
    {
      icon: Printer,
      title: 'Cetak Bluetooth, USB & Laci Kasir',
      desc: 'Langsung cetak struk thermal via Web Bluetooth dari tablet/smartphone atau kabel USB di PC kasir dengan auto kick cash drawer.',
    },
    {
      icon: FileText,
      title: 'Buku Piutang Digital & Tagihan WhatsApp',
      desc: 'Catat transaksi tempo/DP 1-klik, tetapkan batas plafon kredit pelanggan, dan kirim rincian nota tagihan resmi langsung ke WhatsApp.',
    },
    {
      icon: ShieldCheck,
      title: 'Audit Log Anti-Fraud & Blind Close Shift',
      desc: 'Cegah kecurangan internal dengan verifikasi hitung kas laci tertutup (Blind Cash Count) dan jejak digital permanen pembatalan transaksi.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#191F28] flex flex-col font-sans selection:bg-[#3182F6] selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E8EB] transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group transition-transform duration-200 hover:scale-[1.02]">
            <Crown className="w-6 h-6 text-[#3182F6] stroke-[2.2] flex-shrink-0 transition-transform duration-300 group-hover:rotate-6" />
            <div>
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-[#3182F6]">Mie</span>
                <span className="text-[#191F28]">graine</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-[#4E5968]">
            <a href="#solusi" className="hover:text-[#3182F6] transition-colors duration-150 py-1">
              Solusi Sektor
            </a>
            <a href="#fitur" className="hover:text-[#3182F6] transition-colors duration-150 py-1">
              Fitur Unggulan
            </a>
            <a href="#harga" className="hover:text-[#3182F6] transition-colors duration-150 py-1">
              Paket Harga
            </a>
            <a href="#kontak" className="hover:text-[#3182F6] transition-colors duration-150 py-1">
              Kontak & Bantuan
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#333D4B] hover:bg-[#F2F4F6] hover:text-[#3182F6] transition-all duration-150"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] active:scale-[0.98] text-white text-xs font-bold transition-all duration-150 shadow-xs hover:shadow-sm"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <ScrollReveal direction="up" delay={0}>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#191F28] tracking-tight leading-tight sm:leading-tight">
            Kelola Toko, Stok, dan Keuangan dalam Satu Sistem Terpadu
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <p className="mt-5 text-sm sm:text-base text-[#6F7780] max-w-2xl mx-auto leading-relaxed">
            Aplikasi kasir berkecepatan tinggi dengan manajemen multi-satuan presisi, buku piutang digital, dan laporan laba rugi otomatis untuk segala jenis toko ritel.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] active:scale-[0.98] text-white font-extrabold text-sm shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Daftarkan Toko Anda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-[#F2F4F6] active:scale-[0.98] text-[#191F28] font-bold text-sm border border-[#E5E8EB] shadow-xs hover:shadow-sm transition-all duration-200"
            >
              Masuk ke Portal Toko
            </Link>
          </div>
        </ScrollReveal>

        {/* Badges */}
        <ScrollReveal direction="up" delay={300}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-[#6F7780]">
            <span className="flex items-center gap-1.5 transition-transform duration-200 hover:scale-105">
              <CheckCircle2 className="w-4 h-4 text-[#03B26C]" /> Tanpa Kartu Kredit
            </span>
            <span className="flex items-center gap-1.5 transition-transform duration-200 hover:scale-105">
              <CheckCircle2 className="w-4 h-4 text-[#03B26C]" /> Aplikasi PWA di HP & Tablet
            </span>
            <span className="flex items-center gap-1.5 transition-transform duration-200 hover:scale-105">
              <CheckCircle2 className="w-4 h-4 text-[#03B26C]" /> Latensi Rendah &lt;50ms Edge
            </span>
          </div>
        </ScrollReveal>

        {/* Live UI Mockup Preview */}
        <ScrollReveal direction="up" delay={350}>
          <div className="mt-12 text-left bg-white rounded-xl border border-[#E5E8EB] shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Mockup Window Header */}
            <div className="bg-[#F2F4F6] px-4 py-2.5 border-b border-[#E5E8EB] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F04452]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FE9800]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#03B26C]" />
                <span className="ml-2 text-[11px] font-bold text-[#6F7780]">
                  Miegraine POS Terminal v2.4 (Ultra-Fast 0ms)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-[#03B26C] bg-[#E6FAF2] px-2 py-0.5 rounded-md border border-[#03B26C]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#03B26C] animate-pulse" />
                <span>Printer Thermal Ready</span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Column 1 & 2: Cart Items */}
              <div className="md:col-span-2 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E8EB] text-[#6F7780] font-semibold text-[11px]">
                  <span>ITEM BELANJA KASIR</span>
                  <span>SUBTOTAL</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F2F4F6]/60 border border-[#E5E8EB] hover:bg-white hover:border-[#3182F6] transition-all">
                  <div>
                    <div className="font-bold text-[#191F28]">Indomie Goreng Spesial</div>
                    <div className="text-[11px] text-[#6F7780] flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded-sm bg-[#E8F3FF] text-[#3182F6] font-bold text-[10px]">
                        1 Dus (40 Pcs)
                      </span>
                      <span>• @ Rp 118.000</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#191F28] tabular-nums">
                    Rp 118.000
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F2F4F6]/60 border border-[#E5E8EB] hover:bg-white hover:border-[#3182F6] transition-all">
                  <div>
                    <div className="font-bold text-[#191F28]">Semen Tiga Roda 50Kg</div>
                    <div className="text-[11px] text-[#6F7780] flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded-sm bg-[#FFF5E6] text-[#FE9800] font-bold text-[10px]">
                        2 Sak
                      </span>
                      <span>• @ Rp 67.000</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#191F28] tabular-nums">
                    Rp 134.000
                  </span>
                </div>
              </div>

              {/* Column 3: Quick Pay Box */}
              <div className="bg-[#F2F4F6] p-4 rounded-lg border border-[#E5E8EB] flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#6F7780] uppercase tracking-wider">
                    Total Transaksi
                  </span>
                  <div className="text-xl font-extrabold text-[#191F28] mt-1 tabular-nums font-mono">
                    Rp 252.000
                  </div>
                  <p className="text-[10px] text-[#03B26C] font-semibold mt-1">
                    ✓ Stok multi-satuan sinkron otomatis
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    className="w-full py-2.5 bg-[#3182F6] text-white rounded-lg font-bold text-xs shadow-xs hover:bg-[#2272EB] transition-colors flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Bayar & Cetak Struk</span>
                  </button>
                  <div className="text-[10px] text-center text-[#6F7780]">
                    Shortcut: Tekan <kbd className="px-1 py-0.5 bg-white border border-[#D1D6DB] rounded-sm font-mono text-[9px]">Ctrl+Enter</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Store Verticals Section */}
      <section id="solusi" className="py-20 px-4 sm:px-6 bg-white border-y border-[#E5E8EB] scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191F28] tracking-tight">
                Didesain Khusus untuk Berbagai Sektor Ritel
              </h2>
              <p className="text-xs sm:text-sm text-[#6F7780] mt-1.5">
                Pilih tipe bisnismu saat mendaftar, sistem otomatis mengaktifkan fitur dan alur kerja yang relevan.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {verticals.map((v, idx) => {
              const Icon = v.icon;
              return (
                <ScrollReveal key={idx} direction="up" delay={idx * 75}>
                  <div className="group h-full p-6 rounded-xl bg-[#F2F4F6]/60 border border-[#E5E8EB] hover:bg-white hover:border-[#3182F6] hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className={`w-10 h-10 rounded-lg ${v.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xs mb-3.5`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm text-[#191F28] group-hover:text-[#3182F6] transition-colors duration-200">
                        {v.title}
                      </h3>
                      <p className="text-xs text-[#6F7780] leading-relaxed mt-1">
                        {v.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Killer Features Bento Grid */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-16">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191F28] tracking-tight">
              Standar Pengelolaan Bisnis Kelas Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7780] mt-1.5">
              Teknologi canggih dengan antarmuka yang intuitif dan mudah dipahami staf.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                <div className="group h-full bg-white p-7 rounded-xl border border-[#E5E8EB] shadow-xs hover:border-[#3182F6] hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-2xs mb-3.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-[#191F28] group-hover:text-[#3182F6] transition-colors duration-200">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[#6F7780] leading-relaxed mt-1">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 px-4 sm:px-6 bg-white border-t border-[#E5E8EB] scroll-mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191F28] tracking-tight">
              Pilihan Paket Investasi Bisnis
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7780] mt-1.5 mb-14">
              Mulai eksplorasi gratis 14 hari penuh dengan seluruh fitur aktif.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left items-stretch">
            {/* Starter Plan */}
            <ScrollReveal direction="up" delay={100} className="h-full">
              <div className="h-full p-7 rounded-xl bg-white border border-[#E5E8EB] shadow-xs hover:shadow-md hover:border-[#3182F6]/50 hover:-translate-y-1 flex flex-col justify-between transition-all duration-300">
                <div>
                  <div className="min-h-[90px]">
                    <span className="text-xs font-bold text-[#6F7780] uppercase tracking-wider">
                      Paket Starter
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#191F28] mt-1 tabular-nums font-mono">
                      Rp 99.000 <span className="text-xs font-normal text-[#6F7780] font-sans">/ bulan</span>
                    </h3>
                    <p className="text-xs text-[#6F7780] mt-1.5 leading-relaxed">
                      Optimal untuk toko mandiri 1 cabang & kasir ritel
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#E5E8EB]">
                    <ul className="space-y-3 text-xs text-[#333D4B]">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>1 Outlet Toko & Kasir Tanpa Batas</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Master Produk & Multi-Satuan Bertingkat</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Cetak Struk Bluetooth & USB Laci Kasir</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Buku Piutang & Nota Digital WhatsApp</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E8EB]">
                  <Link
                    href="/register"
                    className="block w-full text-center py-3 rounded-lg bg-[#F2F4F6] hover:bg-[#E8F3FF] active:scale-[0.98] text-[#191F28] hover:text-[#3182F6] font-bold text-xs border border-[#E5E8EB] transition-all duration-200"
                  >
                    Pilih Paket Starter
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Pro Plan */}
            <ScrollReveal direction="up" delay={200} className="h-full">
              <div className="h-full p-7 rounded-xl bg-white border-2 border-[#3182F6] shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between relative transition-all duration-300">
                <span className="absolute -top-3 right-6 bg-[#3182F6] text-white text-[10px] font-bold px-3 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                  Paling Diminati
                </span>

                <div>
                  <div className="min-h-[90px]">
                    <span className="text-xs font-bold text-[#3182F6] uppercase tracking-wider">
                      Paket Pro Bisnis
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#191F28] mt-1 tabular-nums font-mono">
                      Rp 199.000 <span className="text-xs font-normal text-[#6F7780] font-sans">/ bulan</span>
                    </h3>
                    <p className="text-xs text-[#6F7780] mt-1.5 leading-relaxed">
                      Untuk toko berkembang & grosir multi-cabang
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#E5E8EB]">
                    <ul className="space-y-3 text-xs text-[#333D4B]">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Hingga 5 Outlet Cabang Terintegrasi</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Audit Log Forensik Anti-Fraud & Blind Count</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Bulk Import Excel & Generator Barcode</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                        <span>Faktur & Surat Jalan Resmi A4 / PDF</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#3182F6]/20">
                  <Link
                    href="/register"
                    className="block w-full text-center py-3 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] active:scale-[0.98] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    Mulai Uji Coba Pro Bebas Biaya
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Comprehensive Enterprise Multi-Column Footer */}
      <footer id="kontak" className="mt-auto bg-[#F2F4F6] border-t border-[#E5E8EB] pt-14 pb-8 px-4 sm:px-6 text-xs text-[#6F7780] scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Column 1: Brand & Identity */}
              <div className="space-y-3.5">
                <div className="flex items-center space-x-2.5">
                  <Crown className="w-6 h-6 text-[#3182F6] stroke-[2.2] flex-shrink-0" />
                  <span className="font-extrabold text-base tracking-tight">
                    <span className="text-[#3182F6]">Mie</span>
                    <span className="text-[#191F28]">graine</span>
                  </span>
                </div>
                <p className="text-xs text-[#6F7780] leading-relaxed">
                  Platform kasir pintar berkecepatan tinggi dan sistem manajemen ritel modern untuk minimarket, toko bangunan, ATK, gadget, dan grosir di seluruh Indonesia.
                </p>
              </div>

              {/* Column 2: Solusi Sektor Ritel */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#191F28] text-xs uppercase tracking-wider">
                  Solusi Sektor Ritel
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Minimarket & Toko Kelontong
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Toko Bangunan & Bahan Material
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Toko ATK & Layanan Fotokopi
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Toko Handphone & Gadget (IMEI)
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Distributor & Toko Grosir
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Fitur Utama */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#191F28] text-xs uppercase tracking-wider">
                  Fitur Unggulan
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Point of Sale (POS Cepat 0ms)
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Manajemen Multi-Satuan Bertingkat
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Cetak Struk Bluetooth & USB Laci
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Buku Piutang Bon & Nota WhatsApp
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#3182F6] hover:translate-x-1 transition-all duration-150 inline-block">
                      Audit Log Forensik Anti-Fraud
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Kontak & Kantor */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#191F28] text-xs uppercase tracking-wider">
                  Kontak & Dukungan
                </h4>
                <div className="space-y-2.5 text-xs text-[#333D4B]">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[#3182F6] flex-shrink-0 mt-0.5" />
                    <span>Jakarta, Indonesia</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#3182F6] flex-shrink-0" />
                    <a href="mailto:support@miegraine.id" className="hover:text-[#3182F6] transition-colors duration-150">
                      support@miegraine.id
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-[#03B26C] flex-shrink-0" />
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-[#03B26C] font-semibold transition-colors duration-150">
                      WhatsApp: +62 812-3456-7890
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-[#6F7780]">
                    <Clock className="w-4 h-4 text-[#6F7780] flex-shrink-0" />
                    <span>Senin – Minggu: 08.00 – 22.00 WIB</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-[#E5E8EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p>© 2026 Miegraine. Platform Kasir & Manajemen Bisnis Ritel Terpadu. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hover:text-[#3182F6] font-semibold transition-colors duration-150">
                Masuk Akun
              </Link>
              <Link href="/register" className="hover:text-[#3182F6] font-semibold text-[#3182F6] transition-colors duration-150">
                Daftar Toko Baru
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 💬 Floating WhatsApp CTA Widget */}
      <FloatingWhatsapp />
    </div>
  );
}
