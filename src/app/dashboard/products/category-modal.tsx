'use client';

import React, { useState } from 'react';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/lib/actions/products';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';
import {
  Tags,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Loader2,
  FolderPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
  onCategoriesChange?: (updatedCategories: Array<{ id: string; name: string }>) => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categories: initialCategories,
  onCategoriesChange,
}: CategoryModalProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCatName, setNewCatName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.warning('Nama kategori tidak boleh kosong');
      return;
    }

    setIsCreating(true);
    try {
      const res = await createCategoryAction(trimmed);
      const updated = [...categories, { id: res.id, name: trimmed }];
      setCategories(updated);
      onCategoriesChange?.(updated);
      setNewCatName('');
      toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan kategori');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (cat: { id: string; name: string }) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.warning('Nama kategori tidak boleh kosong');
      return;
    }

    setIsUpdating(true);
    try {
      await updateCategoryAction(id, trimmed);
      const updated = categories.map((c) => (c.id === id ? { ...c, name: trimmed } : c));
      setCategories(updated);
      onCategoriesChange?.(updated);
      setEditingId(null);
      toast.success('Nama kategori berhasil diperbarui!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui kategori');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategoryAction(categoryToDelete.id);
      const updated = categories.filter((c) => c.id !== categoryToDelete.id);
      setCategories(updated);
      onCategoriesChange?.(updated);
      toast.success(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      setCategoryToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus kategori');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Kelola Master Kategori Produk"
        size="md"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] rounded-xl text-xs font-bold transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tutup</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tags className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nama kategori baru (misal: Minuman Dingin)..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-xl text-xs font-semibold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newCatName.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#3182F6] hover:bg-[#2272EB] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </>
              )}
            </button>
          </form>

          <div className="border border-[#E5E8EB] rounded-xl overflow-hidden divide-y divide-[#E5E8EB] bg-white">
            <div className="px-3.5 py-2 bg-[#F8F9FA] text-[11px] font-bold text-[#6F7780] flex justify-between items-center">
              <span>Daftar Kategori ({categories.length})</span>
              <span>Aksi</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#E5E8EB]">
              {categories.length === 0 ? (
                <div className="p-8 text-center text-[#6F7780]">
                  <FolderPlus className="w-8 h-8 mx-auto text-[#B0B8C1] mb-1.5" />
                  <p className="text-xs font-semibold">Belum ada kategori yang dibuat.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-[#F9FBFF] transition-colors"
                  >
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="flex-1 px-2.5 py-1 bg-white border border-[#3182F6] rounded-lg text-xs font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={isUpdating}
                          className="p-1.5 bg-[#03B26C] text-white rounded-lg hover:bg-[#029B5E] transition-colors"
                          title="Simpan Perubahan"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-[#F2F4F6] text-[#6F7780] rounded-lg hover:bg-[#E5E8EB] transition-colors"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-[#3182F6] flex-shrink-0" />
                          <span className="text-xs font-bold text-[#191F28] truncate">{cat.name}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] rounded-lg transition-colors"
                            title="Ubah Nama Kategori"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 text-[#6F7780] hover:text-[#F04452] hover:bg-[#FEECED] rounded-lg transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori Produk"
        description={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"? Produk yang terkait dengan kategori ini tidak akan dihapus, tetapi kategorinya akan diubah menjadi kosong (Tanpa Kategori).`}
        confirmText="Ya, Hapus Kategori"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
