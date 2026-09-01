'use client';

import React, { useEffect, useState } from 'react';
import { getStockTransfersAction } from '@/lib/actions/stock-transfers';
import { getProductsAction } from '@/lib/actions/products';
import { TransfersClientView } from './transfers-client-view';

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [allOutlets, setAllOutlets] = useState<any[]>([
    { id: 'main', name: 'Toko Utama' },
  ]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentOutletId, setCurrentOutletId] = useState('main');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.outletId) setCurrentOutletId(data.user.outletId);
      })
      .catch(() => {});

    Promise.all([
      getStockTransfersAction(),
      getProductsAction(),
    ])
      .then(([t, p]) => {
        if (t) setTransfers(t);
        if (p) setAllProducts(p);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <TransfersClientView
        transfers={transfers}
        outlets={allOutlets}
        products={allProducts}
        currentOutletId={currentOutletId}
      />
    </div>
  );
}
