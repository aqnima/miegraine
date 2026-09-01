'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils';
import { deleteProductAction, getProductsAction } from '@/lib/actions/products';
import { ProductModal } from './product-modal';
import { ImportModal } from './import-modal';
import { BarcodeModal } from './barcode-modal';
import { CategoryModal } from './category-modal';
import { UnitModal } from './unit-modal';
import { ProductDetailModal } from './product-detail-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import {
  Search,
  Filter,
  Plus,
  Package,
  Layers,
  Smartphone,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Edit3,
  FileSpreadsheet,
  QrCode,
  Tags,
  Scale,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductTableProps {
  initialProducts: any[];
  categories: any[];
  businessType: string;
}

export function ProductTable({
  initialProducts,
  categories: initialCategories,
  businessType,
}: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toast = useToast();
  const router = useRouter();

  // Instant state updater on mutation
  const refreshProducts = async () => {
    try {
      const latest = await getProductsAction();
      setProducts(latest);
      router.refresh();
    } catch {
      router.refresh();
    }
  };

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search));
      const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
      return matchSearch && matchCategory;
    })
    .sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base', numeric: true })
    );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const deletedName = productToDelete.name;
    try {
      await deleteProductAction(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      toast.success('Produk Dihapus', `Produk "${deletedName}" berhasil dihapus dari inventaris.`);
    } catch (err: unknown) {
      toast.error('Gagal Menghapus Produk', err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Nama Produk',
      render: (p) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[#191F28] truncate block text-xs sm:text-sm">
              {p.name}
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              {p.barcode ? (
                <span className="text-[11px] font-mono text-[#6F7780] bg-[#F2F4F6] px-1.5 py-0.5 rounded">
                  {p.barcode}
                </span>
              ) : (
                <span className="text-[10px] text-[#8B95A1] italic">Tanpa barcode</span>
              )}
              {p.hasImei && (
                <span className="text-[10px] bg-[#F3E8FF] text-[#7E22CE] px-1.5 py-0.2 rounded font-bold">
                  IMEI
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (p) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F2F4F6] text-[#4E5968]">
          {p.categoryName}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: 'Modal (HPP)',
      render: (p) => (
        <span className="font-semibold text-[#6F7780] tabular-nums font-mono text-xs">
          {formatRupiah(p.costPrice || 0)}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Harga Jual',
      render: (p) => {
        const basePrice =
          p.priceTiers?.find(
            (t: any) => t.productUnitId === null && t.tierName === 'ecer'
          )?.price || 0;
        return (
          <div>
            <p className="font-bold text-[#3182F6] text-sm tabular-nums font-mono">
              {formatRupiah(basePrice)}
            </p>
            {p.units && p.units.length > 0 && (
              <p className="text-[11px] text-[#6F7780]">+{p.units.length} satuan lain</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'stock',
      header: 'Stok Fisik',
      render: (p) => {
        const isLowStock = p.stock <= (p.minStockAlert || 5);
        return (
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-bold text-sm tabular-nums ${
                isLowStock ? 'text-[#F04452]' : 'text-[#191F28]'
              }`}
            >
              {p.stock} {p.baseUnit}
            </span>
            {isLowStock && (
              <span title="Stok Menipis">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F04452]" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (p) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            type="button"
            onClick={() => setSelectedDetailProduct(p)}
            className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors"
            title="Lihat Detail Produk"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(p.id, p.name)}
            className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#F04452] hover:bg-[#FEECED] transition-colors"
            title="Hapus Produk"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama barang atau barcode..."
              className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs placeholder:text-[#8B95A1]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3182F6] shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-[#F2F4F6] text-[#4E5968] border border-[#E5E8EB] px-3.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
            title="Kelola Master Kategori (Tambah / Edit / Hapus)"
          >
            <Tags className="w-3.5 h-3.5 text-[#3182F6]" />
            <span className="hidden md:inline">Kelola Kategori</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUnitModalOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-[#F2F4F6] text-[#4E5968] border border-[#E5E8EB] px-3.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
            title="Kelola Master Satuan & Multi-Satuan (Pcs, Dus, Pack, Kg...)"
          >
            <Scale className="w-3.5 h-3.5 text-[#03B26C]" />
            <span className="hidden md:inline">Kelola Satuan</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsBarcodeOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-[#F2F4F6] text-[#191F28] border border-[#E5E8EB] px-3.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
            title="Cetak Label Barcode"
          >
            <QrCode className="w-4 h-4 text-[#3182F6]" />
            <span className="hidden sm:inline">Cetak Barcode</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-1.5 bg-[#E6FAF2] hover:bg-[#03B26C] text-[#03B26C] hover:text-white px-3.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
            title="Bulk Import Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 inline-flex items-center justify-center space-x-2 bg-[#3182F6] hover:bg-[#2272EB] text-white px-4 rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Reusable Data Table with Pagination */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        keyExtractor={(item) => item.id}
        emptyTitle="Belum Ada Produk"
        emptyMessage="Klik tombol 'Tambah Produk Baru' untuk mendaftarkan barang pertama Anda."
        emptyIcon={Package}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredProducts.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [10, 25, 50, 100],
        }}
      />

      {/* Modal Form Tambah Produk */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshProducts}
        categories={categories}
        businessType={businessType}
      />

      {/* Category CRUD Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoriesChange={(updated) => setCategories(updated)}
      />

      {/* Unit Master CRUD Modal */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
      />

      {/* Bulk Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={refreshProducts}
      />

      {/* Barcode Label Modal */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={products}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        product={selectedDetailProduct}
      />

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Produk Ini?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus produk <strong>"{productToDelete?.name}"</strong>? Data transaksi masa lalu tetap tersimpan, namun produk tidak akan muncul lagi di kasir POS.
          </span>
        }
        confirmText="Ya, Hapus Produk"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
