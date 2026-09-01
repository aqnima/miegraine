'use client';

import React, { useEffect, useState } from 'react';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { ProductTable } from './product-table';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [businessType, setBusinessType] = useState('general');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.businessType) setBusinessType(data.user.businessType);
      })
      .catch(() => {});

    Promise.all([
      getProductsAction(),
      getCategoriesAction(),
    ])
      .then(([p, c]) => {
        if (p) setProducts(p);
        if (c) setCategories(c);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <ProductTable
        initialProducts={products}
        categories={categories}
        businessType={businessType}
      />
    </div>
  );
}
