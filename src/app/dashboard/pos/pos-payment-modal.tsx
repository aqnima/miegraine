'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah, formatTanggal, formatRibuan, parseRibuan } from '@/lib/utils';
import {
  createTransactionAction,
  getCustomersAction,
  createCustomerQuickAction,
  CartItemInput,
} from '@/lib/actions/transactions';
import { printViaBluetooth, ReceiptData } from '@/lib/hardware/printer';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  Banknote,
  Printer,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Plus,
} from 'lucide-react';

interface PosPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemInput[];
  subtotal: number;
  discount: number;
  total: number;
  storeName: string;
  storePhone?: string;
  cashierName: string;
  businessType?: string;
  onSuccess: (receipt: ReceiptData) => void;
}

export function PosPaymentModal({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  total,
  storeName,
  storePhone,
  cashierName,
  businessType = 'general',
  onSuccess,
}: PosPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DEBT' | 'DP'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number | ''>(total);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // Preset-Specific States
  const [tableNumber, setTableNumber] = useState('');
  const [diningOption, setDiningOption] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Quick Customer Add Modal State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaidAmount(total);
      setError(null);
      getCustomersAction().then((cust) => setCustomers(cust || []));
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const currentPaid = Number(paidAmount) || 0;
  const changeAmount = currentPaid >= total ? currentPaid - total : 0;
  const remainingDebt = total > currentPaid ? total - currentPaid : 0;

  // Quick Cash Denominations
  const quickCashButtons = [
    { label: 'Uang Pas', value: total },
    { label: '10.000', value: 10000 },
    { label: '20.000', value: 20000 },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
    { label: '200.000', value: 200000 },
    { label: '500.000', value: 500000 },
  ];

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) return;
    const res = await createCustomerQuickAction(newCustomerName, newCustomerPhone);
    if (res.success && res.id) {
      setCustomers([...customers, { id: res.id, name: res.name, phone: newCustomerPhone }]);
      setSelectedCustomerId(res.id);
      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    }
  };

  const handleProcessPayment = async (printMode: 'browser' | 'bluetooth' = 'browser') => {
    setLoading(true);
    setError(null);

    try {
      if ((paymentMethod === 'DEBT' || paymentMethod === 'DP') && !selectedCustomerId) {
        throw new Error('Pilih nama pelanggan untuk mencatat transaksi bon/DP.');
      }

      if (paymentMethod === 'CASH' && currentPaid < total) {
        throw new Error('Nominal uang tunai kurang dari total belanja.');
      }

      const res = await createTransactionAction({
        customerId: selectedCustomerId || undefined,
        items,
        discount,
        paymentMethod,
        paidAmount: paymentMethod === 'DEBT' ? 0 : currentPaid,
      });

      if (res.success) {
        const customer = customers.find((c) => c.id === selectedCustomerId);
        const receipt: ReceiptData = {
          storeName,
          storePhone,
          invoiceNo: res.invoiceNo,
          date: formatTanggal(new Date()),
          cashierName,
          customerName: customer?.name,
          items: items.map((i) => ({
            name: i.name,
            unitName: i.unitName,
            qty: i.qty,
            price: i.pricePerUnit,
            subtotal: i.subtotal,
          })),
          subtotal,
          discount,
          total,
          paidAmount: paymentMethod === 'DEBT' ? 0 : currentPaid,
          changeAmount: res.changeAmount,
          remainingDebt: res.remainingDebt,
          paymentMethod,
        };

        if (printMode === 'bluetooth') {
          await printViaBluetooth(receipt);
        } else {
          // Native browser print
          setTimeout(() => {
            window.print();
          }, 300);
        }

        onSuccess(receipt);
        toast.success('Transaksi Berhasil!', `Struk #${res.invoiceNo} telah tercatat.`);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses transaksi.');
      toast.error('Transaksi Gagal', err.message || 'Gagal memproses transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleProcessPayment('bluetooth')}
        className="w-full py-3 px-4 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-[#E5E8EB] disabled:opacity-50 active:scale-98"
      >
        <Smartphone className="w-4 h-4 text-[#3182F6]" />
        <span>Cetak Bluetooth</span>
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleProcessPayment('browser')}
        className="w-full py-3 px-4 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <Printer className="w-4 h-4" />
            <span>Bayar & Cetak Struk</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembayaran Transaksi"
      description={`${items.length} Barang di Keranjang`}
      icon={Banknote}
      iconColor="text-[#03B26C]"
      iconBg="bg-[#E6FAF2]"
      maxWidth="lg"
      footer={footer}
    >
      <div className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[#FEECED] text-[#F04452] border border-[#F04452]/20 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Big Total Banner */}
        <div className="p-4 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] text-center">
          <p className="text-xs font-semibold text-[#6F7780] uppercase tracking-wider">
            Total Tagihan
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#191F28] tabular-nums mt-1 font-mono tracking-tight">
            {formatRupiah(total)}
          </p>
        </div>

        {/* Preset-Adaptive Dynamic Fields */}
        {businessType === 'fnb' && (
          <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#3182F6] uppercase tracking-wider">
              Meja & Layanan Kafe/Resto
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#6F7780] mb-0.5">Nomor Meja</label>
                <input
                  type="text"
                  placeholder="Contoh: Meja 05"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#3182F6]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#6F7780] mb-0.5">Tipe Pesanan</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setDiningOption('dine_in')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border transition-colors ${
                      diningOption === 'dine_in'
                        ? 'bg-[#3182F6] text-white border-[#3182F6]'
                        : 'bg-white text-[#6F7780] border-[#E5E8EB]'
                    }`}
                  >
                    Dine-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiningOption('takeaway')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border transition-colors ${
                      diningOption === 'takeaway'
                        ? 'bg-[#3182F6] text-white border-[#3182F6]'
                        : 'bg-white text-[#6F7780] border-[#E5E8EB]'
                    }`}
                  >
                    Bungkus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {businessType === 'automotive' && (
          <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E8EB] space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#3182F6] uppercase tracking-wider">
              Data Kendaraan Servis
            </span>
            <div>
              <label className="block text-[10px] text-[#6F7780] mb-0.5">Nomor Polisi (Plat)</label>
              <input
                type="text"
                placeholder="Contoh: B 1234 CD / D 8888 XY"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E8EB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#3182F6] uppercase"
              />
            </div>
          </div>
        )}

        {/* Customer Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#191F28] flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#3182F6]" />
              <span>Pelanggan / Member (Opsional)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="text-[11px] font-bold text-[#3182F6] hover:underline"
            >
              + Pelanggan Baru
            </button>
          </div>

          {!showAddCustomer ? (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white"
            >
              <option value="">-- Umum / Tanpa Nama Pelanggan --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} {c.currentDebt > 0 ? `[Hutang: ${formatRupiah(c.currentDebt)}]` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-[#F2F4F6] rounded-xl border border-[#E5E8EB] space-y-2">
              <input
                type="text"
                placeholder="Nama Lengkap Pelanggan"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="No. WhatsApp / HP"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                />
                <button
                  type="button"
                  onClick={handleQuickAddCustomer}
                  className="px-4 py-2 bg-[#3182F6] text-white rounded-xl font-bold text-xs flex-shrink-0"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-3 py-2 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#6F7780]"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="block font-bold text-[#191F28]">Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CASH', label: '💵 Tunai' },
              { id: 'DEBT', label: '📝 Bon / Hutang' },
              { id: 'DP', label: '💳 Titip DP' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(m.id as any);
                  if (m.id === 'DEBT') setPaidAmount(0);
                  if (m.id === 'CASH') setPaidAmount(total);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === m.id
                    ? 'border-[#3182F6] bg-[#E8F3FF] text-[#3182F6] shadow-xs'
                    : 'border-[#E5E8EB] bg-white text-[#6F7780] hover:bg-[#F2F4F6]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Input (Cash / DP) */}
        {paymentMethod !== 'DEBT' && (
          <div className="space-y-2">
            <label className="block font-bold text-[#191F28]">
              {paymentMethod === 'DP' ? 'Nominal DP yang Diterima (Rp)' : 'Uang Tunai Diterima (Rp)'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg font-bold text-[#6F7780] font-mono pointer-events-none select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatRibuan(paidAmount)}
                onChange={(e) => setPaidAmount(parseRibuan(e.target.value))}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xl font-bold tabular-nums text-[#3182F6] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white font-mono"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickCashButtons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPaidAmount(btn.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[11px] font-bold text-[#191F28] transition-colors tabular-nums border border-[#E5E8EB]"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Change or Remaining Debt Preview */}
        <div className="p-4 rounded-xl bg-[#F2F4F6] border border-[#E5E8EB] flex items-center justify-between">
          {paymentMethod === 'DEBT' || (paymentMethod === 'DP' && remainingDebt > 0) ? (
            <>
              <span className="font-bold text-[#6F7780]">Sisa Piutang (Bon)</span>
              <span className="font-extrabold text-xl text-[#FE9800] tabular-nums font-mono">
                {formatRupiah(remainingDebt)}
              </span>
            </>
          ) : (
            <>
              <span className="font-bold text-[#6F7780]">Kembalian Kasir</span>
              <span className="font-extrabold text-2xl text-[#03B26C] tabular-nums font-mono">
                {formatRupiah(changeAmount)}
              </span>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
