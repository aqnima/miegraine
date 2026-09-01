'use client';

import React, { useState, useRef, useEffect } from 'react';
import { switchOutletAction, createOutletAction } from '@/lib/actions/outlets';
import { createStoreRequestAction } from '@/lib/actions/store-requests';
import {
  Store,
  ChevronsUpDown,
  Check,
  Plus,
  Loader2,
  Building2,
  MapPin,
  Phone,
  X,
  Sparkles,
  Crown,
  Send,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Sprout,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { AlertModal } from '@/components/ui/confirm-modal';

export interface OutletItem {
  id: string;
  name: string;
  isMain: boolean;
  address?: string | null;
  phone?: string | null;
}

interface OutletSwitcherProps {
  tenantName: string;
  currentOutletId?: string;
  currentOutletName?: string;
  outlets: OutletItem[];
  userRole: string;
  plan?: 'starter' | 'pro' | 'ultra' | string;
  planStatus?: string;
  daysLeft?: number;
}

export function OutletSwitcher({
  tenantName,
  currentOutletId,
  currentOutletName = 'Toko Utama',
  outlets = [],
  userRole,
  plan = 'starter',
  planStatus = 'trial',
  daysLeft,
}: OutletSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Modal 1: Add Branch (Outlet)
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [isCreatingOutlet, setIsCreatingOutlet] = useState(false);
  const [outletError, setOutletError] = useState<string | null>(null);

  // Modal 2: Request New Store (Multi-Store)
  const [showStoreRequestModal, setShowStoreRequestModal] = useState(false);
  const [isSubmittingStoreReq, setIsSubmittingStoreReq] = useState(false);
  const [storeReqSuccess, setStoreReqSuccess] = useState(false);
  const [storeReqError, setStoreReqError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOwnerOrSuper = userRole === 'owner' || userRole === 'superadmin';

  // Plan styling helper
  const normalizedPlan = (plan || 'starter').toLowerCase();
  const planBadge =
    normalizedPlan === 'ultra' ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#F3E8FF] text-[#9333EA] border border-[#9333EA]/30 tracking-wider">
        <Zap className="w-2.5 h-2.5 fill-[#9333EA]" />
        <span>ULTRA</span>
      </span>
    ) : normalizedPlan === 'pro' ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#E8F3FF] text-[#3182F6] border border-[#3182F6]/30 tracking-wider">
        <Star className="w-2.5 h-2.5 fill-[#3182F6]" />
        <span>PRO</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#FFF5E6] text-[#FE9800] border border-[#FE9800]/30 tracking-wider">
        <Sprout className="w-2.5 h-2.5" />
        <span>STARTER</span>
      </span>
    );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectOutlet = async (outlet: OutletItem) => {
    if (outlet.id === currentOutletId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(outlet.id);
    try {
      await switchOutletAction(outlet.id);
      setIsOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      setSwitchError(err instanceof Error ? err.message : 'Gagal berganti cabang toko.');
      setIsSwitching(null);
    }
  };

  const handleCreateOutlet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingOutlet(true);
    setOutletError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await createOutletAction(formData);
      setShowAddOutletModal(false);
      window.location.reload();
    } catch (err: unknown) {
      setOutletError(err instanceof Error ? err.message : 'Gagal menambah cabang.');
      setIsCreatingOutlet(false);
    }
  };

  const handleStoreRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingStoreReq(true);
    setStoreReqError(null);

    const form = e.currentTarget;
    const storeName = form.storeName.value;
    const businessType = form.businessType.value;
    const requestedPlan = form.requestedPlan.value;
    const ownerPhone = form.ownerPhone?.value || '';

    try {
      await createStoreRequestAction({
        storeName,
        businessType,
        requestedPlan,
        ownerPhone,
      });
      setStoreReqSuccess(true);
      setTimeout(() => {
        setStoreReqSuccess(false);
        setShowStoreRequestModal(false);
      }, 2500);
    } catch (err: unknown) {
      setStoreReqError(err instanceof Error ? err.message : 'Gagal mengajukan pembukaan toko baru.');
    } finally {
      setIsSubmittingStoreReq(false);
    }
  };

  return (
    <div className="relative px-4 md:px-5 pt-3 pb-1" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 rounded-lg bg-[#F2F4F6] hover:bg-[#E8F3FF] border border-[#E5E8EB] hover:border-[#3182F6]/30 flex items-center justify-between text-xs transition-all text-left group"
        title="Klik untuk ganti cabang atau kelola paket toko"
      >
        <div className="flex items-center space-x-2 truncate min-w-0">
          <div className="w-7 h-7 rounded-md bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#3182F6] group-hover:text-white transition-colors">
            <Store className="w-4 h-4" />
          </div>
          <div className="truncate min-w-0">
            <div className="flex items-center space-x-1.5 truncate">
              <p className="font-bold text-[#191F28] truncate text-[11px] leading-tight">
                {tenantName}
              </p>
              {planBadge}
            </div>
            <p className="text-[10px] text-[#6F7780] group-hover:text-[#3182F6] font-medium truncate transition-colors mt-0.5">
              {currentOutletName}
            </p>
          </div>
        </div>

        <ChevronsUpDown className="w-3.5 h-3.5 text-[#8B95A1] group-hover:text-[#3182F6] flex-shrink-0 ml-1 transition-colors" />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-4 right-4 top-full mt-1.5 bg-white rounded-xl border border-[#E5E8EB] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#E5E8EB]">
          {/* 1. Subscription Info Card */}
          <div className="p-3 bg-[#F8F9FA] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7780]">
                Paket Langganan
              </span>
              {planBadge}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#191F28] text-xs">
                {normalizedPlan === 'ultra'
                  ? 'Ultra Multi-Toko'
                  : normalizedPlan === 'pro'
                  ? 'Pro (1 Toko Mandiri)'
                  : 'Starter Free Trial'}
              </span>
              {daysLeft !== undefined && daysLeft > 0 ? (
                <span className="text-[10px] text-[#6F7780] font-semibold">
                  Sisa {daysLeft} Hari
                </span>
              ) : null}
            </div>

            {/* Link to Billing Page for Owner */}
            {isOwnerOrSuper && (
              <div className="pt-1 flex items-center justify-between gap-1 text-[11px]">
                <Link
                  href="/dashboard/billing"
                  onClick={() => setIsOpen(false)}
                  className="text-[#3182F6] hover:text-[#2272EB] font-bold inline-flex items-center space-x-1"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Lihat Tagihan & Masa Sewa</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* 2. Outlets Section */}
          <div className="p-2 space-y-1">
            <div className="px-1.5 py-1 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F7780]">
                Cabang Toko Aktif ({outlets.length})
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {outlets.map((outlet) => {
                const isSelected = outlet.id === currentOutletId;
                const isLoadingThis = isSwitching === outlet.id;

                return (
                  <button
                    key={outlet.id}
                    type="button"
                    disabled={isSwitching !== null}
                    onClick={() => handleSelectOutlet(outlet)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#E8F3FF] text-[#3182F6] font-bold'
                        : 'hover:bg-[#F2F4F6] text-[#191F28]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0">
                      <Building2
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isSelected ? 'text-[#3182F6]' : 'text-[#8B95A1]'
                        }`}
                      />
                      <div className="truncate min-w-0">
                        <p className="truncate text-xs font-semibold leading-tight">
                          {outlet.name}
                        </p>
                        {outlet.isMain && (
                          <span className="text-[9px] font-bold text-[#3182F6] uppercase tracking-wide">
                            (Pusat Utama)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#3182F6] animate-spin" />
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#3182F6] stroke-[3]" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons Footer */}
            {isOwnerOrSuper && (
              <div className="pt-1.5 border-t border-[#E5E8EB] space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowAddOutletModal(true);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E8F3FF] text-[#3182F6] text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors border border-[#E5E8EB]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Cabang Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowStoreRequestModal(true);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-[#F2F4F6] text-[#4E5968] text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Crown className="w-3 h-3 text-[#FE9800]" />
                  <span>+ Ajukan Buka Toko Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Tambah Cabang Toko */}
      {/* Modal 1: Tambah Cabang Outlet Baru */}
      <Modal
        isOpen={showAddOutletModal}
        onClose={() => setShowAddOutletModal(false)}
        title="Tambah Cabang Outlet Baru"
        description="Daftarkan lokasi outlet baru untuk inventaris & kasir"
        icon={Building2}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddOutletModal(false)}
              className="px-4 py-2 rounded-lg bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="add-outlet-form"
              disabled={isCreatingOutlet}
              className="px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 active:scale-98"
            >
              {isCreatingOutlet ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Cabang</span>
              )}
            </button>
          </div>
        }
      >
        {outletError && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#FEECED] text-[#F04452] text-xs font-semibold">
            {outletError}
          </div>
        )}

        <form id="add-outlet-form" onSubmit={handleCreateOutlet} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#191F28] mb-1">
              Nama Cabang *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="misal: Cabang Pasar Baru / Outlet Mall"
              className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191F28] mb-1">
              Alamat Cabang
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#8B95A1] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                name="address"
                placeholder="misal: Jl. Boulevard No. 88"
                className="w-full pl-8 pr-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191F28] mb-1">
              Nomor Telepon / WA Cabang
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#8B95A1] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                name="phone"
                placeholder="08123456789"
                className="w-full pl-8 pr-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Pengajuan Buka Toko Baru */}
      <Modal
        isOpen={showStoreRequestModal}
        onClose={() => setShowStoreRequestModal(false)}
        title="Pengajuan Pembukaan Toko Baru"
        description="Toko baru akan langsung terhubung ke akun Anda setelah disetujui Superadmin"
        icon={Crown}
        maxWidth="lg"
        footer={
          !storeReqSuccess ? (
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowStoreRequestModal(false)}
                className="px-4 py-2 rounded-lg bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="store-request-form"
                disabled={isSubmittingStoreReq}
                className="px-4 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 active:scale-98"
              >
                {isSubmittingStoreReq ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim Pengajuan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pengajuan Toko</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowStoreRequestModal(false)}
                className="px-5 py-2 rounded-lg bg-[#3182F6] text-white font-bold text-xs"
              >
                Selesai
              </button>
            </div>
          )
        }
      >
        {storeReqSuccess ? (
          <div className="p-4 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-[#E6FAF2] text-[#03B26C] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-base text-[#191F28]">Pengajuan Berhasil Terkirim!</h4>
            <p className="text-xs text-[#6F7780] max-w-sm mx-auto">
              Pengajuan toko baru Anda telah masuk ke antrean Superadmin. Tim support akan memproses aktivasi toko Anda.
            </p>
          </div>
        ) : (
          <form id="store-request-form" onSubmit={handleStoreRequest} className="space-y-3.5 text-xs">
            {storeReqError && (
              <div className="p-2.5 rounded-lg bg-[#FEECED] text-[#F04452] text-xs font-semibold">
                {storeReqError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                Nama Bisnis / Toko Baru *
              </label>
              <input
                type="text"
                name="storeName"
                required
                placeholder="misal: Toko Berkah Sentosa / Senja Coffee"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1">
                  Kategori / Sektor Usaha *
                </label>
                <select
                  name="businessType"
                  className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
                >
                  <option value="minimarket">Minimarket & Sembako</option>
                  <option value="fnb">F&B, Kafe & Resto</option>
                  <option value="pharmacy">Apotek & Toko Obat</option>
                  <option value="workshop">Bengkel & Servis</option>
                  <option value="fashion">Fashion & Butik</option>
                  <option value="building">Toko Bangunan</option>
                  <option value="atk">Toko ATK & Fotokopi</option>
                  <option value="gadget">Toko HP & Gadget</option>
                  <option value="electrical">Toko Listrik</option>
                  <option value="general">Ritel Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1">
                  Pilihan Paket Toko *
                </label>
                <select
                  name="requestedPlan"
                  defaultValue={normalizedPlan === 'ultra' ? 'ultra' : 'pro'}
                  className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
                >
                  <option value="pro">Pro Plan - Rp 99.000 / bln</option>
                  <option value="ultra">Ultra Plan - Rp 249.000 / bln</option>
                  <option value="starter">Starter Trial (7 Hari)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                No. WhatsApp Konfirmasi Owner *
              </label>
              <input
                type="text"
                name="ownerPhone"
                required
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Switch Outlet Error Alert Modal */}
      <AlertModal
        isOpen={!!switchError}
        onClose={() => setSwitchError(null)}
        title="Gagal Berganti Cabang"
        description={switchError || ''}
      />
    </div>
  );
}
