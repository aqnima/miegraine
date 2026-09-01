'use client';

import React, { useEffect, useState } from 'react';
import { getPurchasesAction, getSuppliersAction } from '@/lib/actions/purchases';
import { getProductsAction } from '@/lib/actions/products';
import { PurchasesClientView } from './purchases-client-view';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getPurchasesAction(),
      getSuppliersAction(),
      getProductsAction(),
    ])
      .then(([p, s, prod]) => {
        if (p) setPurchases(p);
        if (s) setSuppliersList(s);
        if (prod) setAllProducts(prod);
      })
      .catch(() => {});
  }, []);

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
