'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatRupiah, formatRibuan, parseRibuan } from '@/lib/utils';
import { CartItemInput } from '@/lib/actions/transactions';
import { PosPaymentModal } from './pos-payment-modal';
import { PosReceiptTemplate } from './pos-receipt-template';
import { ShiftModal } from './shift-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Modal } from '@/components/ui/modal';
import { ReceiptData } from '@/lib/hardware/printer';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Maximize2,
  Minimize2,
  Package,
  Layers,
  Sparkles,
  QrCode,
  Tag,
  CheckCircle2,
  Share2,
  Printer,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Store,
  Clock,
  User,
  Zap,
  AlertCircle,
  X,
} from 'lucide-react';

interface PosClientProps {
  products: any[];
  categories: any[];
  storeName: string;
  storePhone?: string;
  cashierName: string;
  businessType: string;
  activeShift?: any | null;
}

export function PosClient({
  products,
  categories,
  storeName,
  storePhone,
  cashierName,
  businessType,
  activeShift: initialShift,
}: PosClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<CartItemInput[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<any | null>(initialShift || null);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Mobile Bottom Drawer State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Clock for POS Terminal Header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts (F2 = Focus search, Enter = Pay, Esc = Exit Kiosk/Drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      }
      if (e.key === 'Escape') {
        if (isMobileCartOpen) setIsMobileCartOpen(false);
        if (isKioskMode) setIsKioskMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isMobileCartOpen, isKioskMode]);

  // Filter & Sort Products A-Z Case-Insensitively
  const filteredProducts = products
    .filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
      return matchSearch && matchCategory;
    })
    .sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base', numeric: true })
    );

  // Fast Barcode Scanner Support (Auto Add on Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const q = search.trim().toLowerCase();
      const exactMatch = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === q) ||
          p.name.toLowerCase() === q
      );

      if (exactMatch) {
        e.preventDefault();
        handleAddToCart(exactMatch);
        setSearch('');
      } else if (filteredProducts.length === 1) {
        e.preventDefault();
        handleAddToCart(filteredProducts[0]);
        setSearch('');
      }
    }
  };

  // Add Product to Cart
  const handleAddToCart = (product: any) => {
    const basePriceTier =
      product.priceTiers?.find(
        (t: any) => t.productUnitId === null && t.tierName === 'ecer'
      )?.price || 0;

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.unitName === product.baseUnit
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      updated[existingIndex].subtotal =
        updated[existingIndex].qty * updated[existingIndex].pricePerUnit;
      setCart(updated);
    } else {
      const newItem: CartItemInput = {
        productId: product.id,
        name: product.name,
        unitName: product.baseUnit,
        conversionQty: 1,
        qty: 1,
        pricePerUnit: basePriceTier,
        costPrice: product.costPrice || 0,
        subtotal: basePriceTier,
      };
      setCart([...cart, newItem]);
    }
  };

  // Change Unit for Cart Item
  const handleUnitChange = (index: number, newUnitName: string) => {
    const item = cart[index];
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    let newPrice = 0;
    let newConversion = 1;

    if (newUnitName === product.baseUnit) {
      newPrice =
        product.priceTiers?.find(
          (t: any) => t.productUnitId === null && t.tierName === 'ecer'
        )?.price || 0;
      newConversion = 1;
    } else {
      const selectedUnit = product.units?.find((u: any) => u.unitName === newUnitName);
      if (selectedUnit) {
        newConversion = selectedUnit.conversionQty;
        newPrice =
          product.priceTiers?.find(
            (t: any) => t.productUnitId === selectedUnit.id && t.tierName === 'ecer'
          )?.price || 0;
      }
    }

    const updated = [...cart];
    updated[index] = {
      ...item,
      unitName: newUnitName,
      conversionQty: newConversion,
      pricePerUnit: newPrice,
      subtotal: item.qty * newPrice,
    };
    setCart(updated);
  };

  // Update Item Quantity
  const handleQtyChange = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      updated[index].qty = newQty;
      updated[index].subtotal = newQty * updated[index].pricePerUnit;
      setCart(updated);
    }
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setShowClearConfirm(true);
  };

  // Calculations & Validations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Safe discount handler: discount can NEVER exceed subtotal
  const handleDiscountChange = (val: number) => {
    const safeVal = Math.max(0, Math.min(val, subtotal));
    setDiscount(safeVal);
  };

  // Auto-cap discount if items are removed or subtotal is reduced
  useEffect(() => {
    if (discount > subtotal) {
      setDiscount(subtotal);
    }
  }, [subtotal, discount]);

  const total = Math.max(0, subtotal - discount);

  const toggleKioskMode = () => {
    if (!isKioskMode) {
      setIsKioskMode(true);
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsKioskMode(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const generateWhatsAppLink = () => {
    if (!lastReceipt) return '';
    const itemsText = lastReceipt.items
      .map((i) => `- ${i.name} (${i.qty} ${i.unitName}): Rp ${i.subtotal.toLocaleString('id-ID')}`)
      .join('\n');

    const msg = `*NOTA TRANSAKSI - ${lastReceipt.storeName.toUpperCase()}*\nNo: ${lastReceipt.invoiceNo}\nTgl: ${lastReceipt.date}\nKasir: ${lastReceipt.cashierName}\n\n${itemsText}\n------------------------\n*Total: Rp ${lastReceipt.total.toLocaleString('id-ID')}*\nBayar (${lastReceipt.paymentMethod}): Rp ${lastReceipt.paidAmount.toLocaleString('id-ID')}\nKembalian: Rp ${lastReceipt.changeAmount.toLocaleString('id-ID')}\n\nTerima kasih telah berbelanja! 🙏`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className={isKioskMode ? 'fixed inset-0 z-50 bg-[#F2F4F6] p-4 sm:p-6 overflow-y-auto space-y-3' : 'space-y-3'}>
      {/* 1. Top Professional POS Status & Header Bar */}
      <header className="bg-white px-4 py-3 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#3182F6] text-white flex items-center justify-center font-bold shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm sm:text-base text-[#191F28] tracking-tight">
                POS Kasir
              </h1>
              <span className="text-xs text-[#6F7780] font-medium">• {storeName}</span>
              {isKioskMode && (
                <span className="text-[10px] font-mono font-bold bg-[#E8F3FF] text-[#3182F6] px-2 py-0.5 rounded-full">
                  Mode Kiosk POS
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-[#6F7780] mt-0.5">
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3 text-[#3182F6]" />
                <strong className="text-[#191F28]">{cashierName}</strong>
              </span>
              {currentTime && (
                <span className="flex items-center space-x-1 font-mono text-[#6F7780]">
                  <Clock className="w-3 h-3" />
                  <span>{currentTime} WIB</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Tools & Shift */}
        <div className="flex items-center space-x-2">
          {/* Shift Status Button */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className={`h-10 inline-flex items-center space-x-1.5 px-3.5 rounded-xl font-bold text-xs transition-all border shadow-2xs ${
              activeShift
                ? 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/30 hover:bg-[#03B26C] hover:text-white'
                : 'bg-[#FFF5E6] text-[#FE9800] border-[#FE9800]/30 hover:bg-[#FE9800] hover:text-white'
            }`}
          >
            {activeShift ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{activeShift ? 'Shift Aktif' : 'Buka Shift'}</span>
          </button>

          {/* Quick WhatsApp Share (Only when last receipt exists) */}
          {lastReceipt && (
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 inline-flex items-center space-x-1.5 px-3.5 rounded-xl bg-[#E6FAF2] text-[#03B26C] font-bold text-xs hover:bg-[#03B26C] hover:text-white transition-colors border border-[#03B26C]/20 shadow-2xs"
              title="Kirim Nota Transaksi Terakhir ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nota Terakhir</span>
            </a>
          )}

          {/* Kiosk Mode Toggle */}
          <button
            onClick={toggleKioskMode}
            className={`h-10 inline-flex items-center space-x-1.5 px-3.5 rounded-xl font-bold text-xs transition-all border shadow-2xs ${
              isKioskMode
                ? 'bg-[#3182F6] text-white border-[#3182F6] hover:bg-[#2272EB]'
                : 'bg-white text-[#4E5968] hover:bg-[#F2F4F6] border-[#E5E8EB]'
            }`}
            title="Mode Kasir Standalone Kiosk (Menutup Menu Dashboard)"
          >
            {isKioskMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isKioskMode ? 'Keluar Kiosk' : 'Layar Kiosk POS'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pb-20 lg:pb-0 items-start">
        {/* LEFT COLUMN (7 Cols / ~58% width): Search, Category Chips & Product Grid */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Search & Category Filter Card */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E8EB] shadow-xs space-y-3">
            {/* Search Input with Shortcut Badge & Clear Button */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#6F7780] absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Ketik nama produk atau scan barcode... (Tekan [F2])"
                className="w-full h-10 pl-10 pr-20 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white transition-all shadow-2xs placeholder:text-[#8B95A1]"
              />
              <div className="absolute right-3 flex items-center space-x-1.5">
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="p-1 rounded-md text-[#6F7780] hover:text-[#191F28] hover:bg-[#E5E8EB]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold bg-white border border-[#E5E8EB] px-1.5 py-0.5 rounded text-[#6F7780] shadow-2xs">
                  F2
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center space-x-1.5 ${
                  selectedCategory === ''
                    ? 'bg-[#3182F6] text-white shadow-xs'
                    : 'bg-[#F2F4F6] text-[#6F7780] hover:bg-[#E5E8EB] hover:text-[#191F28]'
                }`}
              >
                <span>Semua Kategori</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedCategory === '' ? 'bg-white/20 text-white' : 'bg-[#E5E8EB] text-[#6F7780]'}`}>
                  {products.length}
                </span>
              </button>

              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-[#3182F6] text-white font-bold shadow-xs'
                        : 'bg-[#F2F4F6] text-[#6F7780] hover:bg-[#E5E8EB] hover:text-[#191F28]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E5E8EB] text-[#6F7780]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid Card List (1 Baris 4 Item di Layar Lebar) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 max-h-[65vh] overflow-y-auto overflow-x-hidden p-0.5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-10 text-center text-[#6F7780] border border-[#E5E8EB] shadow-xs">
                <Package className="w-10 h-10 mx-auto mb-2 text-[#B0B8C1]" />
                <p className="font-bold text-sm text-[#191F28]">Produk Tidak Ditemukan</p>
                <p className="text-xs text-[#6F7780] mt-0.5">
                  Coba gunakan kata kunci pencarian atau kategori lain.
                </p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const basePrice =
                  p.priceTiers?.find(
                    (t: any) => t.productUnitId === null && t.tierName === 'ecer'
                  )?.price || 0;

                const inCartItem = cart.find((item) => item.productId === p.id);
                const inCartQty = inCartItem?.qty || 0;
                const isLowStock = p.stock <= (p.minStockAlert || 5);
                const isOutOfStock = p.stock <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className={`group cursor-pointer bg-white p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none shadow-2xs hover:shadow-sm active:scale-[0.98] ${
                      inCartQty > 0
                        ? 'border-[#3182F6] ring-2 ring-[#3182F6]/20 bg-[#F8FAFF]'
                        : 'border-[#E5E8EB] hover:border-[#3182F6]/60'
                    }`}
                  >
                    <div>
                      {/* Unit & In-Cart Badge Header Row */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E8F3FF] text-[#3182F6] uppercase tracking-wide truncate">
                            {p.baseUnit}
                          </span>
                          {p.units && p.units.length > 0 && (
                            <span
                              className="text-[9px] font-semibold text-[#03B26C] bg-[#E6FAF2] px-1.5 py-0.5 rounded-md truncate"
                              title="Tersedia pilihan satuan kemasan lain"
                            >
                              Multi-Satuan
                            </span>
                          )}
                        </div>

                        {inCartQty > 0 && (
                          <span className="bg-[#3182F6] text-white text-[11px] font-mono font-black px-2 py-0.5 rounded-full flex items-center shadow-2xs flex-shrink-0 animate-in zoom-in-75">
                            {inCartQty}x
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-xs sm:text-sm text-[#191F28] group-hover:text-[#3182F6] line-clamp-2 leading-snug transition-colors min-h-[2.25rem]">
                        {p.name}
                      </h3>

                      {/* Barcode / SKU */}
                      <p className="text-[10px] text-[#6F7780] font-mono mt-1 truncate">
                        {p.barcode || 'Tanpa Barcode'}
                      </p>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="mt-3 pt-2.5 border-t border-[#E5E8EB] flex items-center justify-between">
                      <p className="font-extrabold text-xs sm:text-sm text-[#3182F6] font-mono tabular-nums">
                        {formatRupiah(basePrice)}
                      </p>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold tabular-nums font-mono ${
                            isOutOfStock
                              ? 'text-[#F04452] bg-[#FEECED] px-1.5 py-0.5 rounded-md'
                              : isLowStock
                              ? 'text-[#FE9800] bg-[#FFF5E6] px-1.5 py-0.5 rounded-md'
                              : 'text-[#6F7780]'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Stok: ${p.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT COLUMN (5 Cols / ~42% width): Live Order Cart & Instant Checkout Terminal */}
        <section className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col h-[78vh] overflow-hidden sticky top-20">
            {/* Cart Top Header */}
            <div className="p-3.5 border-b border-[#E5E8EB] flex items-center justify-between bg-[#F8F9FA]/80">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-[#3182F6]" />
                <span className="font-bold text-xs text-[#191F28]">
                  Keranjang Belanja
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#E8F3FF] text-[#3182F6] px-1.5 py-0.2 rounded-full">
                  {totalItemsCount} item
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] font-bold text-[#F04452] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-3 overflow-y-auto divide-y divide-[#E5E8EB]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6F7780]">
                  <div className="w-12 h-12 rounded-xl bg-[#F2F4F6] flex items-center justify-center text-[#B0B8C1] mb-2">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-[#191F28]">Keranjang Masih Kosong</p>
                  <p className="text-[11px] text-[#6F7780] mt-0.5 max-w-[200px]">
                    Klik produk di katalog atau scan barcode untuk menambah belanjaan.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="py-2.5 space-y-1.5 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-[#191F28] line-clamp-1">
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#191F28] tabular-nums flex-shrink-0">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        {/* Unit Switcher Dropdown */}
                        <select
                          value={item.unitName}
                          onChange={(e) => handleUnitChange(idx, e.target.value)}
                          className="px-2 py-0.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-[11px] font-bold text-[#3182F6] focus:outline-none focus:ring-1 focus:ring-[#3182F6]"
                        >
                          <option value={product?.baseUnit}>
                            {product?.baseUnit?.toUpperCase()} (Dasar)
                          </option>
                          {product?.units?.map((u: any) => (
                            <option key={u.id} value={u.unitName}>
                              {u.unitName.toUpperCase()} (x{u.conversionQty})
                            </option>
                          ))}
                        </select>

                        {/* Quantity Counter */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(idx, -1)}
                            className="w-6 h-6 rounded-md bg-[#F2F4F6] hover:bg-[#E5E8EB] active:scale-95 text-[#4E5968] flex items-center justify-center font-bold transition-all"
                            title="Kurangi Qty"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="w-7 text-center font-mono font-bold text-xs tabular-nums text-[#191F28]">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQtyChange(idx, 1)}
                            className="w-6 h-6 rounded-md bg-[#3182F6] text-white hover:bg-[#2272EB] active:scale-95 flex items-center justify-center font-bold transition-all"
                            title="Tambah Qty"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-[#6F7780] hover:text-[#F04452] hover:bg-[#FEECED] rounded-md ml-1 transition-colors"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Summary & Sticky Checkout Action */}
            <div className="p-4 border-t border-[#E5E8EB] bg-[#F8F9FA] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6F7780]">
                  <span>Subtotal Belanja</span>
                  <span className="font-mono font-bold text-[#191F28] tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[#6F7780] items-center">
                  <span>Diskon Potongan (Rp)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRibuan(discount)}
                    onChange={(e) => handleDiscountChange(parseRibuan(e.target.value))}
                    placeholder="0"
                    className="w-28 px-2.5 py-1 bg-white border border-[#E5E8EB] rounded-lg text-right text-xs font-mono font-bold tabular-nums text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />
                </div>

                <div className="flex justify-between text-sm font-extrabold text-[#191F28] pt-2 border-t border-[#E5E8EB]">
                  <span>Total Bayar</span>
                  <span className="text-lg font-black text-[#3182F6] tabular-nums font-mono">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {/* Instant Pay Action Button with Shortcut Badge */}
              <button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] active:bg-[#1B64DA] text-white font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
              >
                <span>Bayar Transaksi</span>
                <span className="text-xs font-mono bg-white/20 px-1.5 py-0.5 rounded text-white">
                  Enter ↵
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Mobile Portrait Sticky Floating Bottom Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E5E8EB] p-3 shadow-lg z-40">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(!isMobileCartOpen)}
            className="flex items-center space-x-2 text-left"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-[#3182F6]" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F04452] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] text-[#6F7780] font-semibold">Total Tagihan</p>
              <p className="font-extrabold text-sm text-[#191F28] tabular-nums font-mono">
                {formatRupiah(total)}
              </p>
            </div>
          </button>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-[#3182F6] text-white font-bold text-xs shadow-xs disabled:opacity-40"
          >
            Bayar ({totalItemsCount})
          </button>
        </div>
      </div>

      {/* Mobile Cart Modal Drawer */}
      <Modal
        isOpen={isMobileCartOpen}
        onClose={() => setIsMobileCartOpen(false)}
        title={`Keranjang Belanja (${totalItemsCount})`}
        size="md"
        footer={
          <div className="w-full space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#6F7780]">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#191F28] tabular-nums">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#6F7780] items-center">
                <span>Diskon (Rp)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRibuan(discount)}
                  onChange={(e) => handleDiscountChange(parseRibuan(e.target.value))}
                  placeholder="0"
                  className="w-28 px-2.5 py-1 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-right text-xs font-mono font-bold tabular-nums text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#191F28] pt-1.5 border-t border-[#E5E8EB]">
                <span>Total Bayar</span>
                <span className="text-base font-black text-[#3182F6] tabular-nums font-mono">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="py-2.5 px-3 rounded-xl bg-[#FEECED] text-[#F04452] font-bold text-xs hover:bg-[#FDD8DA] transition-colors disabled:opacity-40"
              >
                Kosongkan
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  setIsMobileCartOpen(false);
                  setIsPaymentModalOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#3182F6] text-white font-bold text-xs hover:bg-[#2272EB] shadow-xs disabled:opacity-40"
              >
                Lanjut Bayar ➔
              </button>
            </div>
          </div>
        }
      >
        <div className="divide-y divide-[#E5E8EB] -mx-4 sm:-mx-6 px-4 sm:px-6">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-[#6F7780]">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-[#D1D6DB]" />
              <p className="font-bold text-xs text-[#191F28]">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div key={idx} className="py-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#191F28]">{item.name}</span>
                    <span className="font-mono font-bold text-xs text-[#191F28] tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <select
                      value={item.unitName}
                      onChange={(e) => handleUnitChange(idx, e.target.value)}
                      className="px-2 py-0.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-[11px] font-bold text-[#3182F6]"
                    >
                      <option value={product?.baseUnit}>
                        {product?.baseUnit?.toUpperCase()} (Dasar)
                      </option>
                      {product?.units?.map((u: any) => (
                        <option key={u.id} value={u.unitName}>
                          {u.unitName.toUpperCase()} (x{u.conversionQty})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(idx, -1)}
                        className="w-6 h-6 rounded-md bg-[#F2F4F6] hover:bg-[#E5E8EB] flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(idx, 1)}
                        className="w-6 h-6 rounded-md bg-[#3182F6] text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-[#6F7780] hover:text-[#F04452] ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Payment Modal */}
      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cart}
        subtotal={subtotal}
        discount={discount}
        total={total}
        storeName={storeName}
        storePhone={storePhone}
        cashierName={cashierName}
        businessType={businessType}
        onSuccess={(receipt) => {
          setLastReceipt(receipt);
          setCart([]);
          setDiscount(0);
        }}
      />

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        activeShift={activeShift}
        onSuccess={() => {
          setActiveShift(activeShift ? null : { status: 'OPEN' });
        }}
      />

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          setCart([]);
          setShowClearConfirm(false);
        }}
        title="Kosongkan Keranjang Belanja?"
        description="Semua daftar item barang belanjaan di keranjang kasir saat ini akan dibatalkan."
        confirmText="Ya, Kosongkan"
        cancelText="Kembali"
        variant="danger"
      />

      {/* Print Template (Hidden on Screen, Visible on Print) */}
      <PosReceiptTemplate receipt={lastReceipt} />
    </div>
  );
}
