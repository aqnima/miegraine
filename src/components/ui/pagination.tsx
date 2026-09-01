'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F7780] select-none ${className}`}
    >
      {/* Left: Simple Data Limit Dropdown & Counter */}
      <div className="flex items-center space-x-2">
        <span className="text-[#6F7780]">Tampilkan</span>
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-[#F2F4F6] hover:bg-[#E5E8EB] border border-[#E5E8EB] rounded-md text-xs font-bold text-[#191F28] focus:outline-none focus:ring-1 focus:ring-[#3182F6] cursor-pointer transition-colors"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono font-bold text-[#191F28]">{pageSize}</span>
        )}
        <span className="text-[#6F7780]">
          dari <strong className="text-[#191F28] font-mono font-bold">{totalItems}</strong> data
        </span>
      </div>

      {/* Right: Clean Icon-Only Navigation Buttons (No text) */}
      <div className="flex items-center space-x-1.5">
        {/* Tombol Sebelumnya (Icon Only) */}
        <button
          type="button"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className="w-7 h-7 rounded-md border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] disabled:opacity-35 disabled:pointer-events-none text-[#191F28] flex items-center justify-center transition-colors shadow-2xs"
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Indikator Halaman Aktif */}
        <div className="px-2.5 py-1 bg-[#F2F4F6] rounded-md text-xs font-bold text-[#191F28] font-mono">
          {safeCurrentPage} / {totalPages}
        </div>

        {/* Tombol Selanjutnya (Icon Only) */}
        <button
          type="button"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className="w-7 h-7 rounded-md border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] disabled:opacity-35 disabled:pointer-events-none text-[#191F28] flex items-center justify-center transition-colors shadow-2xs"
          title="Halaman Berikutnya"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
