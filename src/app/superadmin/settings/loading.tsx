import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Card 1 Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
          <Skeleton className="w-5 h-5 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>

      {/* Card 2 Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
          <Skeleton className="w-5 h-5 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>

      {/* Card 3 Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E8EB] shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E8EB]">
          <Skeleton className="w-5 h-5 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
  );
}
