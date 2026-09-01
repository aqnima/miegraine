import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * 1. Base Reusable Skeleton with Silky Shimmer Wave Animation
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-[#E5E8EB] relative overflow-hidden rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent ${className}`}
      {...props}
    />
  );
}

/**
 * 2. Reusable StatCard Bento Skeleton (Exact 1:1 match with real StatCard layout)
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between space-y-3 animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-36 mt-1" />
      </div>
      <div className="flex items-center space-x-2 pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * 3. Reusable DataTable Skeleton (Exact 1:1 match with real DataTable layout)
 */
export function DataTableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="p-4 bg-[#F2F4F6] border-b border-[#E5E8EB] flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton
            key={`header-${idx}`}
            className={`h-4 ${idx === 0 ? 'w-36' : 'w-24'}`}
          />
        ))}
      </div>

      {/* Table Body Rows Skeleton */}
      <div className="divide-y divide-[#E5E8EB]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`row-${rIdx}`}
            className="p-4 flex items-center justify-between gap-4"
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={`cell-${rIdx}-${cIdx}`}
                className="flex items-center space-x-2 flex-1"
              >
                {cIdx === 0 && <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />}
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-full max-w-[140px]" />
                  {cIdx === 0 && <Skeleton className="h-2.5 w-20" />}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Table Footer / Pagination Skeleton */}
      <div className="p-4 border-t border-[#E5E8EB] bg-white flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <div className="flex items-center space-x-1.5">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="w-12 h-7 rounded-md" />
          <Skeleton className="w-7 h-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Reusable Toolbar & Search Bar Skeleton
 */
export function TableToolbarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1">
        <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  );
}
