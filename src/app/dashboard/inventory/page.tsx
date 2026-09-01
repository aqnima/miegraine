'use client';

import React, { useEffect, useState } from 'react';
import {
  getInventorySummaryAction,
  getStockMutationsAction,
} from '@/lib/actions/inventory';
import { getProductsAction } from '@/lib/actions/products';
import { InventoryClientView } from './inventory-client-view';

export default function InventoryPage() {
  const [summary, setSummary] = useState<any>({
    totalProducts: 0,
    totalStockPieces: 0,
    totalAssetValue: 0,
    lowStockCount: 0,
  });
  const [mutations, setMutations] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getInventorySummaryAction(),
      getStockMutationsAction(),
      getProductsAction(),
    ])
      .then(([s, m, p]) => {
        if (s) setSummary(s);
        if (m) setMutations(m);
        if (p) {
          setLowStockProducts(p.filter((item) => item.stock <= (item.minStockAlert || 5)));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <InventoryClientView
      mutations={mutations}
      summary={summary}
      lowStockProducts={lowStockProducts}
    />
  );
}
