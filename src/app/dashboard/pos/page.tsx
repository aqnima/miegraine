'use client';

import React, { useEffect, useState } from 'react';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { getActiveCashShiftAction } from '@/lib/actions/reports';
import { PosClient } from './pos-client';

export default function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [user, setUser] = useState<any>({
    tenantName: 'Toko Mie Graine',
    name: 'Kasir',
    businessType: 'fnb',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    Promise.all([
      getProductsAction(),
      getCategoriesAction(),
      getActiveCashShiftAction(),
    ])
      .then(([p, c, s]) => {
        if (p) setProducts(p);
        if (c) setCategories(c);
        if (s) setActiveShift(s);
      })
      .catch(() => {});
  }, []);

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
