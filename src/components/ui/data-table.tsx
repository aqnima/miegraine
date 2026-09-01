import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Pagination, PaginationProps } from './pagination';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  pagination?: PaginationProps;
  className?: string;
}

export function DataTable<T>({
  columns = [],
  data = [],
  keyExtractor,
  emptyTitle = 'Tidak Ada Data',
  emptyMessage = 'Belum ada data untuk ditampilkan saat ini.',
  emptyIcon: EmptyIcon = Inbox,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E8EB] shadow-xs overflow-hidden transition-all duration-200 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#F2F4F6] text-[#6F7780] font-semibold border-b border-[#E5E8EB]">
            <tr>
              {safeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 ${getAlignClass(col.align)} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E8EB]">
            {safeData.length === 0 ? (
              <tr>
                <td colSpan={safeColumns.length || 1} className="p-12 text-center text-[#6F7780]">
                  <EmptyIcon className="w-8 h-8 mx-auto mb-2 text-[#B0B8C1]" />
                  <p className="font-bold text-sm text-[#191F28]">{emptyTitle}</p>
                  <p className="text-xs text-[#6F7780] mt-1">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              safeData.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className="hover:bg-[#F2F4F6]/60 transition-colors duration-150"
                >
                  {safeColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-4 ${getAlignClass(col.align)} ${col.className || ''}`}
                    >
                      {col.render(item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Embedded Table Pagination Footer */}
      {pagination && (
        <div className="p-4 border-t border-[#E5E8EB] bg-white">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
