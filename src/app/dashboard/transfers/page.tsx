import React from 'react';
import { getStockTransfersAction } from '@/lib/actions/stock-transfers';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { outlets, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { TransfersClientView } from './transfers-client-view';

export default async function StockTransfersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  const [transfers, allOutlets, allProducts] = await Promise.all([
    getStockTransfersAction(),
    db.select().from(outlets).where(eq(outlets.tenantId, user.tenantId)),
    db.select().from(products).where(eq(products.tenantId, user.tenantId)),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <TransfersClientView
        transfers={transfers}
        outlets={allOutlets}
        products={allProducts}
        currentOutletId={user.outletId || ''}
      />
    </div>
  );
}
