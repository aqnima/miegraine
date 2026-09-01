'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function InvoicePrintClient() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen bg-[#F2F4F6] p-4 sm:p-8">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold text-[#6F7780] hover:bg-[#F2F4F6]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="print-trigger inline-flex items-center space-x-2 px-5 py-2.5 bg-[#3182F6] hover:bg-[#2272EB] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Faktur A4 / PDF</span>
        </button>
      </div>

      {/* A4 Document Paper */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-[#E5E8EB] shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 font-sans text-xs">
        {/* Header Kop Surat */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-black">
          <div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight uppercase">
              Toko Mie Graine
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Faktur Penjualan & Surat Jalan Resmi
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold text-black font-mono">
              INV-{id || 'PREVIEW'}
            </h2>
            <p className="text-gray-600 text-xs">
              Tanggal: {formatTanggal(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Customer & Transaction Info */}
        <div className="grid grid-cols-2 gap-8 my-6">
          <div className="space-y-1">
            <p className="font-bold text-gray-500 uppercase text-[10px]">Tujuan Pengiriman / Pembeli:</p>
            <p className="font-bold text-sm text-black">Pelanggan Umum (Cash)</p>
          </div>

          <div className="text-right space-y-1">
            <p className="font-bold text-gray-500 uppercase text-[10px]">Metode Pembayaran:</p>
            <p className="font-bold text-sm text-black">TUNAI / CASH</p>
            <p className="text-gray-700">
              Status: <strong className="text-green-700">LUNAS</strong>
            </p>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end my-6">
          <div className="w-72 space-y-1.5 border-t border-gray-300 pt-3">
            <div className="flex justify-between font-extrabold text-base text-black pt-2 border-t-2 border-black">
              <span>TOTAL:</span>
              <span className="tabular-nums font-mono">{formatRupiah(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
