import React from 'react';
import { getProductsAction, getCategoriesAction } from '@/lib/actions/products';
import { getSessionUser } from '@/lib/auth/session';
import { ProductTable } from './product-table';
import { Package, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [products, categories] = await Promise.all([
    getProductsAction(),
    getCategoriesAction(),
  ]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Product Table Interactive */}
      <ProductTable
        initialProducts={products}
        categories={categories}
        businessType={user.businessType}
      />
    </div>
  );
}
