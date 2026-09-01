'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPurchaseOrdersAction,
  getSuppliersAction,
} from '@/lib/actions/inventory';
import { getProductsAction } from '@/lib/actions/products';
import { RestockClientView } from './restock-client-view';

export default function RestockPage() {
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['inventory', 'purchaseOrders'],
    queryFn: () => getPurchaseOrdersAction(),
    staleTime: 60 * 1000,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['inventory', 'suppliers'],
    queryFn: () => getSuppliersAction(),
    staleTime: 60 * 1000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsAction(),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <RestockClientView
        initialOrders={purchaseOrders}
        suppliers={suppliers}
        products={products}
      />
    </div>
  );
}
