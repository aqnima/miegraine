import React from 'react';
import {
  StatCardSkeleton,
  TableToolbarSkeleton,
  DataTableSkeleton,
} from '@/components/ui/skeleton';

export default function BillingLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toolbar Skeleton */}
      <TableToolbarSkeleton />

      {/* 4 Bento StatCard Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table Skeleton */}
      <DataTableSkeleton rows={5} columns={5} />
    </div>
  );
}
