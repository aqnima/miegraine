'use client';

import React, { useState } from 'react';
import { registerTenantAction } from '@/lib/actions/auth';
import { BUSINESS_PRESETS, getAllPresets } from '@/lib/constants/business-presets';
import {
  Crown,
  ShoppingCart,
  Hammer,
  BookOpen,
  Smartphone,
  Zap,
  Boxes,
  Loader2,
  Store,
  User,
  KeyRound,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Coffee,
  Pill,
  Wrench,
  Shirt,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = getAllPresets();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return <ShoppingCart className="w-5 h-5 text-[#3182F6]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#FE9800]" />;
      case 'Pill':
        return <Pill className="w-5 h-5 text-[#03B26C]" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#3182F6]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#FE9800]" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-[#FE9800]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#03B26C]" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-[#3182F6]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#FE9800]" />;
      default:
        return <Boxes className="w-5 h-5 text-[#3182F6]" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('businessType', selectedType);

    const result = await registerTenantAction(formData);

    if (result.success && result.redirectTo) {
      window.location.href = result.redirectTo;
    } else {
      setError(result.error || 'Gagal mendaftar. Silakan cek data Anda.');
      setLoading(false);
    }
  };

  const activePreset = BUSINESS_PRESETS[selectedType];

  return (
    <div className="min-h-screen bg-[#F2F4F6] py-10 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-3">
          <Crown className="w-8 h-8 text-[#3182F6] stroke-[2.2]" />
          <span className="font-extrabold text-2xl tracking-tight">
            <span className="text-[#3182F6]">Mie</span>
            <span className="text-[#191F28]">graine</span>
          </span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#191F28] tracking-tight">
          Pendaftaran Toko & Smart Onboarding
        </h1>
        <p className="text-xs md:text-sm text-[#6F7780] mt-1">
          Pilih tipe usaha Anda. Sistem akan otomatis mengatur satuan, template struk, dan shortcut kasir yang optimal.
        </p>
      </div>

      {/* Main Registration Container */}
      <div className="w-full max-w-4xl bg-white rounded-xl p-6 md:p-8 border border-[#E5E8EB] shadow-xs">
        {error && (
          <div className="mb-6 flex items-start space-x-2.5 p-3 rounded-lg bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Business Vertical */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#191F28] mb-3">
              Langkah 1: Pilih Kategori Usaha Anda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {presets.map((preset) => {
                const isSelected = selectedType === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedType(preset.id)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-[#3182F6] bg-[#E8F3FF]/40 shadow-xs ring-2 ring-[#3182F6]/30'
                        : 'border-[#E5E8EB] bg-[#F2F4F6]/50 hover:bg-[#F2F4F6] hover:border-[#D1D6DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center border border-[#E5E8EB] shadow-xs">
                        {getIcon(preset.icon)}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#3182F6]" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-[#191F28]">{preset.name}</h3>
                    <p className="text-[11px] text-[#6F7780] mt-1 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Active Preset Summary Banner */}
            {activePreset && (
              <div className="mt-4 p-3 rounded-lg bg-[#F2F4F6] border border-[#E5E8EB] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#191F28]">
                  Preset Satuan Otomatis: <strong className="text-[#3182F6]">{activePreset.defaultUnits.map(u => u.name).join(', ')}</strong>
                </span>
                <span className="text-[#6F7780]">
                  Kategori Awal: {activePreset.defaultCategories.slice(0, 3).join(', ')}...
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Store & Owner Information */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#191F28] mb-3">
              Langkah 2: Data Toko & Akun Pemilik (Owner)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Nama Toko / Bisnis
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="storeName"
                    placeholder="misal: Toko Berkah Jaya"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Nama Lengkap Pemilik (Owner)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="misal: Budi Santoso"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Username Login Owner
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    placeholder="misal: budi_owner"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 8 karakter (huruf & angka)"
                    minLength={8}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Nomor WhatsApp / Telp (Opsional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="misal: 08123456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
                  Alamat Toko (Opsional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#6F7780] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="address"
                    placeholder="misal: Jl. Sudirman No. 45"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3182F6] hover:bg-[#2272EB] active:bg-[#1B64DA] text-white font-semibold py-3.5 px-6 rounded-lg text-base flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan Toko Anda...</span>
              </>
            ) : (
              <>
                <span>Daftar & Inisialisasi Toko Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#6F7780]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-[#3182F6] hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="mt-8 text-center text-xs text-[#6F7780]">
        <p>© 2026 Miegraine. Platform Kasir & Manajemen Bisnis Ritel Terpadu.</p>
      </div>
    </div>
  );
}
