'use client';

import React, { useState } from 'react';
import {
  createPurchaseAction,
  createSupplierAction,
} from '@/lib/actions/purchases';
import { formatRupiah, formatTanggal, formatRibuan, parseRibuan } from '@/lib/utils';
import {
  ShoppingBag,
  Plus,
  Building2,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Phone,
  MapPin,
  Mail,
  Receipt,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { SupplierModal } from './supplier-modal';
import { useToast } from '@/components/ui/toast';

interface PurchasesClientViewProps {
  purchases: any[];
  suppliers: any[];
  products: any[];
}

export function PurchasesClientView({
  purchases,
  suppliers: initialSuppliers,
  products,
}: PurchasesClientViewProps) {
  const toast = useToast();
  const [supplierList, setSupplierList] = useState(initialSuppliers);

  // Modal 1: Create Purchase
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Modal 2: Manage Supplier CRUD Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Purchase Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    initialSuppliers[0]?.id || ''
  );
  const [customSupplierName, setCustomSupplierName] = useState<string>(
    initialSuppliers[0]?.name || ''
  );
  const [invoiceNo, setInvoiceNo] = useState<string>(
    `INV-KUL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'TEMPO'>('CASH');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'DUE' | 'PARTIAL'>('PAID');
  const [dueDays, setDueDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPrice: number; batchNumber?: string; expiredDate?: string }[]
  >([{ productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.costPrice || 0 }]);

  // Tab 1: Purchases Search & Pagination
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('ALL');
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePageSize, setPurchasePageSize] = useState(10);

  // Tab 2: Suppliers Search & Pagination
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierPageSize, setSupplierPageSize] = useState(10);

  const filteredPurchases = purchases.filter((item) => {
    const q = purchaseSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (item.invoiceNo && item.invoiceNo.toLowerCase().includes(q)) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q));

    const matchStatus =
      purchaseStatusFilter === 'ALL' || item.paymentStatus === purchaseStatusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedPurchases = filteredPurchases.slice(
    (purchasePage - 1) * purchasePageSize,
    purchasePage * purchasePageSize
  );

  // Calculations
  const totalPurchaseSpend = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const tempoDebts = purchases
    .filter((p) => p.paymentStatus === 'DUE' || p.paymentMethod === 'TEMPO')
    .reduce((sum, p) => sum + (p.totalAmount - (p.paidAmount || 0)), 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.costPrice || 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const next = [...items];
    if (field === 'productId') {
      const found = products.find((p) => p.id === value);
      next[index] = {
        ...next[index],
        productId: value,
        unitPrice: found?.costPrice || 0,
      };
    } else {
      next[index] = { ...next[index], [field]: value };
    }
    setItems(next);
  };

  const totalCalculated = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPurchase(true);
    setPurchaseError(null);

    const supObj = supplierList.find((s) => s.id === selectedSupplierId);
    const finalSupplierName = supObj ? supObj.name : customSupplierName || 'Supplier Umum';

    try {
      await createPurchaseAction({
        supplierId: selectedSupplierId || undefined,
        supplierName: finalSupplierName,
        invoiceNo,
        purchaseDate,
        paymentMethod,
        paymentStatus: paymentMethod === 'TEMPO' ? 'DUE' : paymentStatus,
        paidAmount: paymentMethod === 'TEMPO' ? 0 : totalCalculated,
        dueDays: paymentMethod === 'TEMPO' ? dueDays : 0,
        notes,
        items,
      });
      toast.success('Faktur Kulakan Dicatat', `Faktur #${invoiceNo} (${finalSupplierName}) berhasil disimpan.`);
      setShowPurchaseModal(false);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mencatat pembelian kulakan.';
      setPurchaseError(msg);
      toast.error('Gagal Simpan Faktur', msg);
    } finally {
      setIsSubmittingPurchase(false);
    }
  };

  const purchaseColumns: ColumnDef<any>[] = [
    {
      key: 'invoiceNo',
      header: 'No. Faktur Beli',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#191F28]">{item.invoiceNo}</span>
          <p className="text-[10px] text-[#6F7780]">{formatTanggal(item.purchaseDate)}</p>
        </div>
      ),
    },
    {
      key: 'supplier',
      header: 'Nama Supplier / Distributor',
      render: (item) => (
        <div>
          <span className="font-bold text-xs text-[#191F28]">{item.supplierName}</span>
          <p className="text-[10px] text-[#6F7780]">{item.outletName || 'Cabang'}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Barang Masuk',
      render: (item) => (
        <div>
          <span className="font-bold text-xs text-[#191F28]">
            {item.totalItemsCount} Unit ({item.items.length} Item)
          </span>
          <p className="text-[10px] text-[#6F7780] truncate max-w-xs">
            {item.items.map((i: any) => `${i.productName} (${i.quantity} pcs)`).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'payment',
      header: 'Status Bayar',
      render: (item) => {
        const isPaid = item.paymentStatus === 'PAID';
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
              isPaid
                ? 'bg-[#E6FAF2] text-[#03B26C] border-[#03B26C]/20'
                : 'bg-[#FEECED] text-[#F04452] border-[#F04452]/20'
            }`}
          >
            {isPaid ? 'Lunas (Cash/Transfer)' : `Tempo Utang (${item.dueDays || 30} Hari)`}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Nilai Kulakan',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-xs text-[#191F28] tabular-nums">
          {formatRupiah(item.totalAmount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Toolbar: Search + Status Filter + Kelola Supplier + Catat Pembelian (Aligned) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={purchaseSearch}
              onChange={(e) => {
                setPurchaseSearch(e.target.value);
                setPurchasePage(1);
              }}
              placeholder="Cari no. faktur, nama supplier, catatan..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={purchaseStatusFilter}
            onChange={(e) => {
              setPurchaseStatusFilter(e.target.value);
              setPurchasePage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="ALL">Semua Status</option>
            <option value="PAID">Lunas</option>
            <option value="DUE">Utang Tempo</option>
            <option value="PARTIAL">Cicilan</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 justify-end flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowSupplierModal(true)}
            className="h-10 inline-flex items-center space-x-2 bg-white hover:bg-[#F2F4F6] text-[#191F28] px-4 rounded-xl font-bold text-xs transition-all border border-[#E5E8EB] shadow-2xs flex-shrink-0"
            title="Kelola Master Supplier (Tambah / Edit / Hapus Supplier)"
          >
            <Building2 className="w-4 h-4 text-[#3182F6]" />
            <span>Kelola Supplier ({supplierList.length})</span>
          </button>

          <button
            onClick={() => setShowPurchaseModal(true)}
            className="h-10 inline-flex items-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl font-bold text-xs transition-all shadow-2xs flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pembelian Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Pembelian Masuk"
          value={formatRupiah(totalPurchaseSpend)}
          icon={ShoppingBag}
          iconColor="text-[#3182F6]"
          subtitle={`${purchases.length} faktur kulakan tercatat`}
        />

        <StatCard
          title="Utang Dagang ke Supplier"
          value={formatRupiah(tempoDebts)}
          icon={Clock}
          iconColor={tempoDebts > 0 ? 'text-[#F04452]' : 'text-[#03B26C]'}
          valueColor={tempoDebts > 0 ? 'text-[#F04452]' : 'text-[#191F28]'}
          subtitle="Pembelian tempo yang belum lunas"
        />

        <StatCard
          title="Total Rekanan Supplier"
          value={`${supplierList.length} Supplier`}
          icon={Building2}
          iconColor="text-[#FE9800]"
          subtitle="Distributor & sales aktif"
        />
      </div>

      {/* Single Purchases Data Table with Pagination */}
      <DataTable
        columns={purchaseColumns}
        data={paginatedPurchases}
        keyExtractor={(item) => item.id}
        emptyTitle="Belum Ada Faktur Pembelian"
        emptyMessage="Klik 'Catat Pembelian Baru' untuk mencatat barang masuk dari distributor."
        emptyIcon={ShoppingBag}
        pagination={{
          currentPage: purchasePage,
          pageSize: purchasePageSize,
          totalItems: filteredPurchases.length,
          onPageChange: setPurchasePage,
          onPageSizeChange: (size) => {
            setPurchasePageSize(size);
            setPurchasePage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Modal 1: Catat Faktur Pembelian */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Catat Faktur Pembelian Kulakan"
        description="Input faktur kulakan dari supplier & perbarui harga pokok (HPP)"
        icon={ShoppingBag}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowPurchaseModal(false)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] font-bold text-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="purchase-form"
              disabled={isSubmittingPurchase}
              className="px-5 py-2 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 active:scale-98"
            >
              {isSubmittingPurchase ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Faktur...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Simpan & Update Stok</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {purchaseError && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#FEECED] text-[#F04452] text-xs font-semibold">
            {purchaseError}
          </div>
        )}

        <form id="purchase-form" onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                Mitra Supplier *
              </label>
              {supplierList.length > 0 ? (
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    const s = supplierList.find((x) => x.id === e.target.value);
                    if (s) setCustomSupplierName(s.name);
                  }}
                  className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                >
                  {supplierList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Nama Supplier"
                  value={customSupplierName}
                  onChange={(e) => setCustomSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                No. Faktur / Invoice *
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                Tanggal Pembelian *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191F28] mb-1">
                Metode Pembayaran *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              >
                <option value="CASH">Tunai (Lunas Langsung)</option>
                <option value="TRANSFER">Transfer Bank (Lunas Langsung)</option>
                <option value="TEMPO">Tempo / Utang Dagang (Bayar Nanti)</option>
              </select>
            </div>

            {paymentMethod === 'TEMPO' && (
              <div>
                <label className="block text-xs font-semibold text-[#191F28] mb-1">
                  Jatuh Tempo Pembayaran (Hari) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRibuan(dueDays)}
                  onChange={(e) => setDueDays(parseRibuan(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2 pt-2 border-t border-[#E5E8EB]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#191F28]">
                Daftar Barang Masuk & Harga Beli Baru (HPP) *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[#3182F6] hover:text-[#2272EB] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Barang</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.baseUnit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRibuan(item.quantity)}
                    onChange={(e) =>
                      handleItemChange(idx, 'quantity', parseRibuan(e.target.value))
                    }
                    placeholder="Qty"
                    className="w-20 px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRibuan(item.unitPrice)}
                    onChange={(e) =>
                      handleItemChange(idx, 'unitPrice', parseRibuan(e.target.value))
                    }
                    placeholder="Harga Beli"
                    className="w-28 px-3 py-2 bg-[#F2F4F6] border border-[#E5E8EB] rounded-lg text-xs font-mono font-bold text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />

                  <span className="w-24 text-right font-mono font-bold text-xs text-[#191F28] tabular-nums flex-shrink-0">
                    {formatRupiah((item.quantity || 0) * (item.unitPrice || 0))}
                  </span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="w-8 h-8 rounded-lg text-[#F04452] hover:bg-[#FEECED] flex items-center justify-center flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex items-center justify-between">
              <span className="text-xs font-bold text-[#6F7780]">Total Faktur Kulakan:</span>
              <span className="text-base font-black font-mono text-[#3182F6] tabular-nums">
                {formatRupiah(totalCalculated)}
              </span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Master Supplier CRUD Modal */}
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        suppliers={supplierList}
        onSuppliersChange={(updated) => setSupplierList(updated)}
      />
    </div>
  );
}
