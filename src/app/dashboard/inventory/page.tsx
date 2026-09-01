import React from 'react';
import {
  getInventorySummaryAction,
  getStockMutationsAction,
} from '@/lib/actions/inventory';
import { getProductsAction } from '@/lib/actions/products';
import { getSessionUser } from '@/lib/auth/session';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import {
  Boxes,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { InventoryClientView } from './inventory-client-view';

export default async function InventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [summary, mutations, products] = await Promise.all([
    getInventorySummaryAction(),
    getStockMutationsAction(),
    getProductsAction(),
  ]);

  const lowStockProducts = products.filter(
    (p) => p.stock <= (p.minStockAlert || 5)
  );

  return (
    <InventoryClientView
      mutations={mutations}
      summary={summary}
      lowStockProducts={lowStockProducts}
    />
  );
}
