'use client';

import React from 'react';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { ReceiptData } from '@/lib/hardware/printer';

interface PosReceiptTemplateProps {
  receipt: ReceiptData | null;
}

export function PosReceiptTemplate({ receipt }: PosReceiptTemplateProps) {
  if (!receipt) return null;

  return (
    <div className="hidden print:block print:w-[58mm] font-mono text-[11px] text-black leading-tight p-1 bg-white">
      {/* Header */}
      <div className="text-center mb-2 pb-1 border-b border-black border-dashed">
        <h2 className="font-bold text-sm tracking-tight">{receipt.storeName.toUpperCase()}</h2>
        {receipt.storeAddress && <p className="text-[10px]">{receipt.storeAddress}</p>}
        {receipt.storePhone && <p className="text-[10px]">Telp: {receipt.storePhone}</p>}
      </div>

      {/* Meta Info */}
      <div className="text-[10px] space-y-0.5 mb-2 pb-1 border-b border-black border-dashed">
        <div className="flex justify-between">
          <span>No: {receipt.invoiceNo}</span>
          <span>{receipt.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: {receipt.cashierName}</span>
          {receipt.customerName && <span>Plg: {receipt.customerName}</span>}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1 mb-2 pb-1 border-b border-black border-dashed">
        {receipt.items.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <p className="font-semibold truncate">
              {item.name} ({item.qty} {item.unitName})
            </p>
            <div className="flex justify-between text-[10px]">
              <span>
                {item.qty} x {item.price.toLocaleString('id-ID')}
              </span>
              <span className="font-semibold">{item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Totals */}
      <div className="space-y-0.5 text-[10px] mb-2 pb-1 border-b border-black border-dashed font-semibold">
        <div className="flex justify-between text-xs font-bold pt-0.5">
          <span>TOTAL</span>
          <span>{formatRupiah(receipt.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar ({receipt.paymentMethod})</span>
          <span>{formatRupiah(receipt.paidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembalian</span>
          <span>{formatRupiah(receipt.changeAmount)}</span>
        </div>
        {receipt.remainingDebt && receipt.remainingDebt > 0 ? (
          <div className="flex justify-between text-red-600">
            <span>Sisa Piutang (Bon)</span>
            <span>{formatRupiah(receipt.remainingDebt)}</span>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="text-center text-[9px] pt-1 space-y-0.5">
        <p>{receipt.footerMessage || 'Terima kasih telah berbelanja'}</p>
        <p className="text-[8px] text-gray-500">Miegraine POS & Mini-ERP</p>
      </div>
    </div>
  );
}
