'use client';

import React, { useState } from 'react';
import { formatTanggal } from '@/lib/utils';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import {
  Shield,
  Search,
  Eye,
  FileCode,
  ShieldAlert,
  X,
} from 'lucide-react';

interface AuditClientViewProps {
  initialLogs: any[];
}

export function AuditClientView({ initialLogs }: AuditClientViewProps) {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const actionTypes = [
    { value: '', label: 'Semua Event' },
    { value: 'TRANSACTION_VOID', label: 'Batal Struk (Void)' },
    { value: 'STOCK_ADJUSTMENT', label: 'Koreksi Stok Opname' },
    { value: 'PRODUCT_PRICE_CHANGE', label: 'Ubah Harga Master' },
    { value: 'MANUAL_DISCOUNT', label: 'Diskon Manual Kasir' },
    { value: 'SHIFT_DISCREPANCY', label: 'Selisih Kas Kasir' },
  ];

  const filteredLogs = initialLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase())) ||
      (log.resourceId && log.resourceId.includes(search));
    const matchAction = selectedAction ? log.action === selectedAction : true;
    return matchSearch && matchAction;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ACTION_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    TRANSACTION_VOID: {
      label: 'Batal Struk (Void)',
      bg: 'bg-[#FEECED]',
      text: 'text-[#F04452]',
      border: 'border-[#F04452]/25',
    },
    STOCK_ADJUSTMENT: {
      label: 'Koreksi Stok',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
    PRODUCT_PRICE_CHANGE: {
      label: 'Ubah Harga Master',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
    MANUAL_DISCOUNT: {
      label: 'Diskon Manual',
      bg: 'bg-[#E8F3FF]',
      text: 'text-[#3182F6]',
      border: 'border-[#3182F6]/25',
    },
    SHIFT_DISCREPANCY: {
      label: 'Selisih Kas',
      bg: 'bg-[#FFF5E6]',
      text: 'text-[#FE9800]',
      border: 'border-[#FE9800]/25',
    },
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'createdAt',
      header: 'Waktu Kejadian',
      render: (log) => {
        const d = log.createdAt ? new Date(log.createdAt) : null;
        if (!d || isNaN(d.getTime())) return '-';
        const dateStr = new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(d);
        const timeStr = new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(d);
        return (
          <div>
            <p className="font-bold text-[#191F28] text-xs">{dateStr}</p>
            <p className="text-[11px] font-mono text-[#6F7780] mt-0.5">{timeStr} WIB</p>
          </div>
        );
      },
    },
    {
      key: 'user',
      header: 'Staf / Kasir',
      render: (log) => (
        <div>
          <p className="font-bold text-[#191F28] text-xs">{log.userName}</p>
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#F2F4F6] text-[#4E5968] border border-[#E5E8EB] mt-0.5">
            {log.userRole}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Jenis Aksi Kritis',
      align: 'center',
      render: (log) => {
        const badge = ACTION_CONFIG[log.action] || {
          label: log.action.replace(/_/g, ' '),
          bg: 'bg-[#F2F4F6]',
          text: 'text-[#4E5968]',
          border: 'border-[#E5E8EB]',
        };
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] border whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'resourceType',
      header: 'Tipe Objek',
      render: (log) => (
        <span className="font-semibold text-[#333D4B]">{log.resourceType}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Alasan / Keterangan',
      render: (log) => (
        <span className="text-[#191F28] font-medium text-xs max-w-xs line-clamp-2">
          {log.reason || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (log) =>
        log.oldData || log.newData ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setSelectedLog(log)}
              className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors inline-flex items-center justify-center"
              title="Lihat Snapshot Data"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-[#8B95A1] text-xs">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama staf, alasan atau ID..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs font-semibold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            {actionTypes.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs font-semibold text-[#6F7780]">
          Total {filteredLogs.length} Jejak Forensik Tercatat
        </p>
      </div>

      {/* Reusable Data Table with Pagination */}
      <DataTable
        columns={columns}
        data={paginatedLogs}
        keyExtractor={(item) => item.id}
        emptyTitle="Belum Ada Aktivitas Mencurigakan"
        emptyMessage="Seluruh transaksi berjalan normal tanpa adanya void, manipulasi stok atau selisih kas."
        emptyIcon={Shield}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredLogs.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Snapshot Inspection Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Snapshot Data Forensik"
        description={`Audit Log ID: #${selectedLog?.id || ''}`}
        icon={FileCode}
      >
        {selectedLog && (
          <div className="space-y-4 pt-1">
            <div className="p-3 bg-[#F2F4F6] rounded-xl text-xs space-y-1">
              <p>
                <strong className="text-[#191F28]">Aksi:</strong> {selectedLog.action}
              </p>
              <p>
                <strong className="text-[#191F28]">Oleh:</strong> {selectedLog.userName} ({selectedLog.userRole})
              </p>
              <p>
                <strong className="text-[#191F28]">Keterangan:</strong> {selectedLog.reason || '-'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {selectedLog.oldData && (
                <div className="p-3 bg-white rounded-xl border border-[#E5E8EB] space-y-1">
                  <span className="font-bold text-[#F04452]">
                    Kondisi Sebelum (Old Data):
                  </span>
                  <pre className="font-mono text-[10px] overflow-x-auto text-[#6F7780] bg-[#F2F4F6] p-2.5 rounded-lg max-h-60">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.oldData), null, 2);
                      } catch {
                        return selectedLog.oldData;
                      }
                    })()}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div className="p-3 bg-white rounded-xl border border-[#E5E8EB] space-y-1">
                  <span className="font-bold text-[#03B26C]">
                    Kondisi Sesudah (New Data):
                  </span>
                  <pre className="font-mono text-[10px] overflow-x-auto text-[#6F7780] bg-[#F2F4F6] p-2.5 rounded-lg max-h-60">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.newData), null, 2);
                      } catch {
                        return selectedLog.newData;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] font-bold text-xs rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
