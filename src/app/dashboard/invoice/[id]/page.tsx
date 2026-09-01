import React from 'react';
import { db } from '@/lib/db';
import { transactions, transactionItems, products, customers, tenants } from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { Printer, ArrowLeft, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { id } = await params;

  const txRecord = await db
    .select({
      tx: transactions,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
      tenantName: tenants.name,
    })
    .from(transactions)
    .leftJoin(customers, eq(transactions.customerId, customers.id))
    .leftJoin(tenants, eq(transactions.tenantId, tenants.id))
    .where(and(eq(transactions.id, id), eq(transactions.tenantId, user.tenantId)))
    .limit(1);

  if (!txRecord[0]) notFound();

  const data = txRecord[0];
  const items = await db
    .select({
      item: transactionItems,
      productName: products.name,
    })
    .from(transactionItems)
    .leftJoin(products, eq(transactionItems.productId, products.id))
    .where(eq(transactionItems.transactionId, id));

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
          onClick={() => {}}
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
              {data.tenantName}
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Faktur Penjualan & Surat Jalan Resmi
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold text-black font-mono">
              {data.tx.invoiceNo}
            </h2>
            <p className="text-gray-600 text-xs">
              Tanggal: {formatTanggal(data.tx.createdAt)}
            </p>
          </div>
        </div>

        {/* Customer & Transaction Info */}
        <div className="grid grid-cols-2 gap-8 my-6">
          <div className="space-y-1">
            <p className="font-bold text-gray-500 uppercase text-[10px]">Tujuan Pengiriman / Pembeli:</p>
            <p className="font-bold text-sm text-black">{data.customerName || 'Pelanggan Umum (Cash)'}</p>
            {data.customerPhone && <p className="text-gray-700">Telp: {data.customerPhone}</p>}
            {data.customerAddress && <p className="text-gray-700">{data.customerAddress}</p>}
          </div>

          <div className="text-right space-y-1">
            <p className="font-bold text-gray-500 uppercase text-[10px]">Metode Pembayaran:</p>
            <p className="font-bold text-sm text-black">{data.tx.paymentMethod}</p>
            <p className="text-gray-700">
              Status:{' '}
              <strong
                className={data.tx.paymentStatus === 'PAID' ? 'text-green-700' : 'text-orange-700'}
              >
                {data.tx.paymentStatus === 'PAID' ? 'LUNAS' : 'TEMPO / DP'}
              </strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left my-6 border border-gray-300">
          <thead className="bg-gray-100 border-b border-gray-300 font-bold text-black">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Deskripsi Barang</th>
              <th className="p-3 text-center">Satuan</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Harga Satuan</th>
              <th className="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((i, idx) => (
              <tr key={i.item.id}>
                <td className="p-3 text-gray-600">{idx + 1}</td>
                <td className="p-3 font-semibold text-black">{i.productName || 'Produk'}</td>
                <td className="p-3 text-center uppercase font-bold text-gray-700">
                  {i.item.unitName}
                </td>
                <td className="p-3 text-center font-bold">{i.item.qty}</td>
                <td className="p-3 text-right tabular-nums">
                  {formatRupiah(i.item.pricePerUnit)}
                </td>
                <td className="p-3 text-right font-bold tabular-nums">
                  {formatRupiah(i.item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="flex justify-end my-6">
          <div className="w-72 space-y-1.5 border-t border-gray-300 pt-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold tabular-nums">{formatRupiah(data.tx.subtotal)}</span>
            </div>
            {data.tx.discount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Diskon:</span>
                <span className="text-red-600 tabular-nums">-{formatRupiah(data.tx.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-black pt-2 border-t-2 border-black">
              <span>TOTAL:</span>
              <span className="tabular-nums font-mono">{formatRupiah(data.tx.total)}</span>
            </div>
            <div className="flex justify-between text-gray-700 pt-1">
              <span>Dibayar:</span>
              <span className="font-semibold tabular-nums">{formatRupiah(data.tx.paidAmount)}</span>
            </div>
            {data.tx.remainingDebt > 0 && (
              <div className="flex justify-between text-orange-700 font-bold">
                <span>Sisa Bon / Tempo:</span>
                <span className="tabular-nums">{formatRupiah(data.tx.remainingDebt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-6 border-t border-gray-200 text-center">
          <div className="space-y-12">
            <p className="font-semibold text-gray-700">Penerima / Pembeli</p>
            <p className="text-gray-500">( ........................................ )</p>
          </div>
          <div className="space-y-12">
            <p className="font-semibold text-gray-700">Bagian Pengiriman</p>
            <p className="text-gray-500">( ........................................ )</p>
          </div>
          <div className="space-y-12">
            <p className="font-semibold text-gray-700">Hormat Kami (Kasir)</p>
            <p className="font-bold text-black">{user.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
