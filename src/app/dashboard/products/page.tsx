'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { ProductTable } from './product-table';

export default function ProductsPage() {
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

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <ProductTable
        initialProducts={products}
        categories={categories}
        businessType={user?.businessType || 'general'}
      />
    </div>
  );
}
