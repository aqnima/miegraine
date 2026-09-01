import React from 'react';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { getActiveCashShiftAction } from '@/lib/actions/reports';
import { getSessionUser } from '@/lib/auth/session';
import { PosClient } from './pos-client';
import { redirect } from 'next/navigation';

export default async function PosPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [products, categories, activeShift] = await Promise.all([
    getProductsAction(),
    getCategoriesAction(),
    getActiveCashShiftAction(),
  ]);

  return (
    <PosClient
      products={products}
      categories={categories}
      storeName={user.tenantName}
      cashierName={user.name}
      businessType={user.businessType}
      activeShift={activeShift}
    />
  );
}
