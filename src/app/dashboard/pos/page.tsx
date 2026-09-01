'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { getActiveCashShiftAction } from '@/lib/actions/reports';
import { PosClient } from './pos-client';

export default function PosPage() {
  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsAction(),
    staleTime: 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategoriesAction(),
    staleTime: 60 * 1000,
  });

  const { data: activeShift = null } = useQuery({
    queryKey: ['cash-shift', 'active'],
    queryFn: () => getActiveCashShiftAction(),
    staleTime: 30 * 1000,
  });

  return (
    <PosClient
      products={products}
      categories={categories}
      storeName={user?.tenantName || 'Toko Mie Graine'}
      cashierName={user?.name || 'Kasir'}
      businessType={user?.businessType || 'fnb'}
      activeShift={activeShift}
    />
  );
}
