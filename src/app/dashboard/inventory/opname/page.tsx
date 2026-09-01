import React from 'react';
import { getProductsAction } from '@/lib/actions/products';
import { getSessionUser } from '@/lib/auth/session';
import { OpnameClientView } from './opname-client-view';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function OpnamePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const products = await getProductsAction();

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Opname Interactive Client View */}
      <OpnameClientView products={products} />
    </div>
  );
}
