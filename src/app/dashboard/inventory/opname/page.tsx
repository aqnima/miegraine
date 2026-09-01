'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsAction } from '@/lib/actions/products';
import { OpnameClientView } from './opname-client-view';

export default function OpnamePage() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsAction(),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <OpnameClientView products={products} />
    </div>
  );
}
