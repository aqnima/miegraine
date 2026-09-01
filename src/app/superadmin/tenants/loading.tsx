import React from 'react';
import { TableToolbarSkeleton, DataTableSkeleton } from '@/components/ui/skeleton';

export default function TenantsLoading() {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Toolbar Skeleton */}
      <TableToolbarSkeleton />

      {/* Tenants Table Skeleton */}
      <DataTableSkeleton rows={6} columns={6} />
    </div>
  );
}
