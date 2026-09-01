import React from 'react';
import { getPurchaseOrdersAction, getSuppliersAction } from '@/lib/actions/inventory';
import { getProductsAction } from '@/lib/actions/products';
import { getSessionUser } from '@/lib/auth/session';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { RestockClientView } from './restock-client-view';
import { Truck, ArrowLeft, Plus, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RestockPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [purchaseOrders, suppliers, products] = await Promise.all([
    getPurchaseOrdersAction(),
    getSuppliersAction(),
    getProductsAction(),
  ]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Restock Interactive Client View */}
      <RestockClientView
        initialOrders={purchaseOrders}
        suppliers={suppliers}
        products={products}
      />
    </div>
  );
}
