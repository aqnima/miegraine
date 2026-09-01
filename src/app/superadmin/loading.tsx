import React from 'react';
import { Skeleton, StatCardSkeleton, DataTableSkeleton } from '@/components/ui/skeleton';

export default function SuperadminLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg flex-shrink-0" />
      </div>

      {/* 4 StatCard Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Recent Clients Table Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <DataTableSkeleton rows={5} columns={6} />
      </div>
    </div>
  );
}
