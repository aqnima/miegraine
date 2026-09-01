'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getInventorySummaryAction,
  getStockMutationsAction,
} from '@/lib/actions/inventory';
import { getProductsAction } from '@/lib/actions/products';
import { InventoryClientView } from './inventory-client-view';

export default function InventoryPage() {
  const { data: summary = {
    totalAssetValue: 0,
    totalItemsCount: 0,
    lowStockCount: 0,
  } } = useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => getInventorySummaryAction(),
    staleTime: 60 * 1000,
  });

  const { data: mutations = [] } = useQuery({
    queryKey: ['inventory', 'mutations'],
    queryFn: () => getStockMutationsAction(),
    staleTime: 60 * 1000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsAction(),
    staleTime: 60 * 1000,
  });

  const lowStockProducts = products.filter(
    (item) => item.stock <= (item.minStockAlert || 5)
  );

  return (
    <InventoryClientView
      mutations={mutations}
      summary={summary}
      lowStockProducts={lowStockProducts}
    />
  );
}
