import React from 'react';
import { getPurchasesAction, getSuppliersAction } from '@/lib/actions/purchases';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { PurchasesClientView } from './purchases-client-view';

export default async function PurchasesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/dashboard');

  const [purchases, suppliersList, allProducts] = await Promise.all([
    getPurchasesAction(),
    getSuppliersAction(),
    db.select().from(products).where(eq(products.tenantId, user.tenantId)),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PurchasesClientView
        purchases={purchases}
        suppliers={suppliersList}
        products={allProducts}
      />
    </div>
  );
}
