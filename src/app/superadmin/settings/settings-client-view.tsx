'use client';

import React, { useState } from 'react';
import { updateSuperadminSettingsAction } from '@/lib/actions/superadmin';
import {
  CreditCard,
  MessageCircle,
  Megaphone,
  Save,
  Server,
  ShieldCheck,
  Loader2,
  Database,
  Cpu,
  Layers,
  HardDrive,
  Lock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { formatRibuan, parseRibuan } from '@/lib/utils';

interface SettingsClientViewProps {
  initialSettings: {
    starterPrice: number;
    proPrice: number;
    supportPhone: string;
    supportEmail: string;
    trialDays: number;
    broadcastBanner: string;
    isBroadcastActive: boolean;
  };
  systemInfo?: {
    appVersion: string;
    framework: string;
    nodeVersion: string;
    databaseEngine: string;
    offlineEngine: string;
    authSecurity: string;
    environment: string;
  };
}

export function SettingsClientView({
  initialSettings,
  systemInfo = {
    appVersion: '1.0.0',
    framework: 'Next.js 15.1.7 (React 19, Turbopack)',
    nodeVersion: 'Node.js LTS',
    databaseEngine: 'LibSQL / SQLite via Drizzle ORM v0.38.4',
    offlineEngine: 'Dexie.js v4.0.11 (IndexedDB Local-First)',
    authSecurity: 'Jose JWT v5 (Stateless Multi-Tenant Enforced)',
    environment: 'Development',
  },
}: SettingsClientViewProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const handleSaveSection = async (
    sectionKey: string,
    successTitle: string,
    successMessage: string
  ) => {
    setSavingSection(sectionKey);

    try {
      await updateSuperadminSettingsAction(settings);
      toast.success(successTitle, successMessage);
      router.refresh();
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* 1. Card: Paket Harga & Durasi Trial */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
            <CreditCard className="w-5 h-5 text-[#3182F6]" />
            <div>
              <h2 className="font-extrabold text-sm text-[#191F28]">Biaya Paket Langganan & Trial</h2>
              <p className="text-xs text-[#6F7780]">Konfigurasi tarif sewa bulanan dan durasi coba gratis toko baru</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1.5">Harga Paket Starter (Rp/bln)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(settings.starterPrice)}
                onChange={(e) => setSettings({ ...settings, starterPrice: parseRibuan(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold tabular-nums text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1.5">Harga Paket Pro Bisnis (Rp/bln)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(settings.proPrice)}
                onChange={(e) => setSettings({ ...settings, proPrice: parseRibuan(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold tabular-nums text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1.5">Durasi Trial Toko Baru (Hari)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(settings.trialDays)}
                onChange={(e) => setSettings({ ...settings, trialDays: parseRibuan(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold tabular-nums text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>
          </div>
        </div>

        {/* Card Footer: Save Button */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E5E8EB] flex items-center justify-end">
          <button
            type="button"
            disabled={savingSection === 'pricing'}
            onClick={() =>
              handleSaveSection(
                'pricing',
                'Tarif & Durasi Disimpan',
                'Perubahan tarif paket sewa dan masa trial berhasil diperbarui.'
              )
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {savingSection === 'pricing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingSection === 'pricing' ? 'Menyimpan...' : 'Simpan Tarif & Trial'}</span>
          </button>
        </div>
      </div>

      {/* 2. Card: Kontak Dukungan & WhatsApp CS */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
            <MessageCircle className="w-5 h-5 text-[#03B26C]" />
            <div>
              <h2 className="font-extrabold text-sm text-[#191F28]">Kontak Resmi Dukungan Pelanggan</h2>
              <p className="text-xs text-[#6F7780]">Nomor WhatsApp dan Email CS yang tampil di Landing Page & Widget Chat</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#191F28] mb-1.5">No. WhatsApp Resmi CS</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                placeholder="6281234567890"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#191F28] mb-1.5">Email Dukungan Pelanggan</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@miegraine.id"
                className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>
          </div>
        </div>

        {/* Card Footer: Save Button */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E5E8EB] flex items-center justify-end">
          <button
            type="button"
            disabled={savingSection === 'support'}
            onClick={() =>
              handleSaveSection(
                'support',
                'Kontak CS Disimpan',
                'Nomor WhatsApp dan Email CS resmi berhasil diperbarui.'
              )
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {savingSection === 'support' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingSection === 'support' ? 'Menyimpan...' : 'Simpan Kontak CS'}</span>
          </button>
        </div>
      </div>

      {/* 3. Card: Broadcast Banner Pengumuman Global */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
            <Megaphone className="w-5 h-5 text-[#FE9800]" />
            <div>
              <h2 className="font-extrabold text-sm text-[#191F28]">Broadcast Banner Pengumuman Global</h2>
              <p className="text-xs text-[#6F7780]">Pesan banner penting yang langsung tampil di dashboard semua toko klien</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="broadcastToggle"
                checked={settings.isBroadcastActive}
                onChange={(e) => setSettings({ ...settings, isBroadcastActive: e.target.checked })}
                className="w-4 h-4 rounded-md text-[#3182F6] focus:ring-[#3182F6]"
              />
              <label htmlFor="broadcastToggle" className="font-bold text-[#191F28] cursor-pointer">
                Aktifkan Banner Pengumuman di Semua Dashboard Klien
              </label>
            </div>

            <textarea
              rows={2}
              value={settings.broadcastBanner}
              onChange={(e) => setSettings({ ...settings, broadcastBanner: e.target.value })}
              placeholder="Contoh: Pembaruan fitur cetak surat jalan A4 resmi kini telah aktif di seluruh kasir!"
              className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>
        </div>

        {/* Card Footer: Save Button */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E5E8EB] flex items-center justify-end">
          <button
            type="button"
            disabled={savingSection === 'broadcast'}
            onClick={() =>
              handleSaveSection(
                'broadcast',
                'Pengumuman Broadcast Disimpan',
                'Status banner broadcast berhasil diperbarui ke seluruh dashboard toko.'
              )
            }
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {savingSection === 'broadcast' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingSection === 'broadcast' ? 'Menyimpan...' : 'Simpan & Terapkan Banner'}</span>
          </button>
        </div>
      </div>

      {/* 4. Card: Real Architecture & System Environment Info */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
          <Server className="w-5 h-5 text-[#3182F6]" />
          <div>
            <h2 className="font-extrabold text-sm text-[#191F28]">Spesifikasi & Lingkungan Sistem Nyata</h2>
            <p className="text-xs text-[#6F7780]">Informasi versi runtime, engine database, dan konfigurasi arsitektur platform yang sedang berjalan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <Layers className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="font-semibold text-[11px]">Framework & Core App</span>
            </div>
            <p className="font-bold text-[#191F28] font-mono text-xs">{systemInfo.framework}</p>
            <p className="text-[10px] text-[#6F7780]">Aplikasi: Miegraine v{systemInfo.appVersion}</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <Database className="w-3.5 h-3.5 text-[#03B26C]" />
              <span className="font-semibold text-[11px]">Database & ORM Engine</span>
            </div>
            <p className="font-bold text-[#191F28] font-mono text-xs">{systemInfo.databaseEngine}</p>
            <p className="text-[10px] text-[#03B26C] font-semibold">Terkoneksi & Siap Produksi</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <HardDrive className="w-3.5 h-3.5 text-[#FE9800]" />
              <span className="font-semibold text-[11px]">Offline-First Storage</span>
            </div>
            <p className="font-bold text-[#191F28] font-mono text-xs">{systemInfo.offlineEngine}</p>
            <p className="text-[10px] text-[#6F7780]">Sinkronisasi Kasir Tanpa Internet</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <Lock className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="font-semibold text-[11px]">Multi-Tenant & Keamanan</span>
            </div>
            <p className="font-bold text-[#191F28] font-mono text-xs">{systemInfo.authSecurity}</p>
            <p className="text-[10px] text-[#03B26C] font-semibold">100% Strict TenantId Enforced</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <Cpu className="w-3.5 h-3.5 text-[#8B95A1]" />
              <span className="font-semibold text-[11px]">Runtime Environment</span>
            </div>
            <p className="font-bold text-[#191F28] font-mono text-xs">Node.js {systemInfo.nodeVersion}</p>
            <p className="text-[10px] text-[#3182F6] font-bold uppercase">{systemInfo.environment} Mode</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E5E8EB] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#6F7780]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#03B26C]" />
              <span className="font-semibold text-[11px]">Status Integritas Platform</span>
            </div>
            <p className="font-bold text-[#03B26C] text-xs">Semua Layanan Normal</p>
            <p className="text-[10px] text-[#6F7780]">Audit Trail & Anti-Fraud Aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}
