'use client';

import React, { useState } from 'react';
import { loginAction } from '@/lib/actions/auth';
import { Store, KeyRound, User, ArrowRight, Sparkles, AlertCircle, Loader2, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirectPath, setRedirectPath] = useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success && result.redirectTo) {
      window.location.href = result.redirectTo;
    } else {
      setError(result.error || 'Gagal login. Periksa username dan password Anda.');
      setLoading(false);
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col justify-center items-center p-4">
      {/* Brand Logo Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-2">
          <Crown className="w-8 h-8 text-[#3182F6] stroke-[2.2]" />
          <span className="font-extrabold text-2xl tracking-tight">
            <span className="text-[#3182F6]">Mie</span>
            <span className="text-[#191F28]">graine</span>
          </span>
        </Link>
        <p className="text-xs text-[#6F7780] font-medium">Masuk ke Sistem Kasir & Mini-ERP</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-xl p-7 border border-[#E5E8EB] shadow-xs">
        <h2 className="text-xl font-bold text-[#191F28] mb-1">Selamat Datang Kembali</h2>
        <p className="text-xs text-[#6F7780] mb-6">
          Masukkan username dan password Anda untuk memulai shift atau melihat laporan.
        </p>

        {error && (
          <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-lg bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {redirectPath && <input type="hidden" name="redirect" value={redirectPath} />}
          <div>
            <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7780]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: bos_utama atau kasir1"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191F28] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7780]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-sm text-[#191F28] placeholder-[#6F7780] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#3182F6] hover:bg-[#2272EB] active:bg-[#1B64DA] text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts Picker for Bos Besar */}
        <div className="mt-5 pt-4 border-t border-[#E5E8EB]">
          <p className="text-[11px] font-bold text-[#6F7780] mb-2 uppercase tracking-wider text-center">
            Pilih Akun Demo (1-Klik Langsung Terisi):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('owner', 'admin123')}
              className="px-2 py-2 rounded-md bg-[#E8F3FF] hover:bg-[#3182F6] text-[#3182F6] hover:text-white text-[11px] font-bold transition-all border border-[#3182F6]/20"
            >
              👑 Owner
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('kasir', '123456')}
              className="px-2 py-2 rounded-md bg-[#E6FAF2] hover:bg-[#03B26C] text-[#03B26C] hover:text-white text-[11px] font-bold transition-all border border-[#03B26C]/20"
            >
              🛒 Kasir
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin', '123456')}
              className="px-2 py-2 rounded-md bg-[#FFF5E6] hover:bg-[#FE9800] text-[#FE9800] hover:text-white text-[11px] font-bold transition-all border border-[#FE9800]/20"
            >
              👔 Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('superadmin', 'superadmin123')}
              className="px-2 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-bold transition-all border border-slate-700 shadow-2xs"
            >
              ⚡ Superadmin
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-5 pt-4 border-t border-[#E5E8EB] text-center">
          <p className="text-xs text-[#6F7780]">
            Ingin membuat toko baru sendiri?{' '}
            <Link href="/register" className="font-bold text-[#3182F6] hover:underline">
              Daftar Toko (1 Menit)
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
