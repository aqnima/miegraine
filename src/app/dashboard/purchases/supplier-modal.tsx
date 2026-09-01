'use client';

import React, { useState } from 'react';
import {
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  getSuppliersAction,
} from '@/lib/actions/purchases';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Loader2,
  Phone,
  User,
  MapPin,
  Mail,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: any[];
  onSuppliersChange?: (updatedSuppliers: any[]) => void;
}

export function SupplierModal({
  isOpen,
  onClose,
  suppliers: initialSuppliers,
  onSuppliersChange,
}: SupplierModalProps) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State for Add
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setSuppliers(initialSuppliers);
  }, [initialSuppliers]);

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Peringatan', 'Nama supplier wajib diisi.');
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('contactPerson', contactPerson.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('email', email.trim());

      const res = await createSupplierAction(formData);
      const newSupplier = {
        id: res.id,
        name: name.trim(),
        contactPerson: contactPerson.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        email: email.trim() || null,
        createdAt: new Date(),
      };

      const updated = [newSupplier, ...suppliers];
      setSuppliers(updated);
      onSuppliersChange?.(updated);

      // Reset form
      setName('');
      setContactPerson('');
      setPhone('');
      setAddress('');
      setEmail('');
      setIsAdding(false);

      toast.success('Supplier Tersimpan', `Supplier "${newSupplier.name}" berhasil ditambahkan.`);
      router.refresh();
    } catch (err: any) {
      toast.error('Gagal Tambah Supplier', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditContact(s.contactPerson || '');
    setEditPhone(s.phone || '');
    setEditAddress(s.address || '');
    setEditEmail(s.email || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.warning('Peringatan', 'Nama supplier wajib diisi.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateSupplierAction(id, {
        name: editName.trim(),
        contactPerson: editContact.trim() || null,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
        email: editEmail.trim() || null,
      });

      const updated = suppliers.map((s) =>
        s.id === id
          ? {
              ...s,
              name: editName.trim(),
              contactPerson: editContact.trim() || null,
              phone: editPhone.trim() || null,
              address: editAddress.trim() || null,
              email: editEmail.trim() || null,
            }
          : s
      );

      setSuppliers(updated);
      onSuppliersChange?.(updated);
      setEditingId(null);
      toast.success('Supplier Diperbarui', 'Data supplier berhasil disimpan.');
      router.refresh();
    } catch (err: any) {
      toast.error('Gagal Update', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSupplierAction(supplierToDelete.id);
      const updated = suppliers.filter((s) => s.id !== supplierToDelete.id);
      setSuppliers(updated);
      onSuppliersChange?.(updated);
      toast.success('Supplier Dihapus', `Supplier "${supplierToDelete.name}" telah dihapus.`);
      setSupplierToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast.error('Gagal Hapus', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Kelola Master Supplier"
        description="Daftar distributor & rekanan pengadaan barang dagangan"
        icon={Building2}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end w-full">
            <button
              type="button"
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
          {/* Top Bar: Search & Toggle Add Form */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#6F7780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama supplier, kontak, HP..."
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#E5E8EB] rounded-xl text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] placeholder:text-[#8B95A1]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className={`h-9 inline-flex items-center space-x-1.5 px-3.5 rounded-xl font-bold text-xs transition-all ${
                isAdding
                  ? 'bg-[#F2F4F6] text-[#4E5968]'
                  : 'bg-[#3182F6] hover:bg-[#2272EB] text-white shadow-2xs'
              }`}
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Batal' : 'Supplier Baru'}</span>
            </button>
          </div>

          {/* Inline Add Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] space-y-3 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#191F28] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#3182F6]" />
                  Tambah Rekanan Supplier Baru
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Nama Usaha / Distributor *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: PT. Sumber Pangan Makmur"
                    required
                    className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Nama Sales / PIC</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Contoh: Pak Budi"
                    className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7780] mb-1">Alamat Gudang / Kantor</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Industri Raya No. 12"
                    className="w-full h-9 px-3 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-8 px-4 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Simpan Supplier</span>
                </button>
              </div>
            </form>
          )}

          {/* Supplier List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center bg-[#F8F9FA] rounded-xl border border-dashed border-[#E5E8EB]">
                <Building2 className="w-8 h-8 text-[#8B95A1] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#4E5968]">Belum Ada Supplier</p>
                <p className="text-[11px] text-[#8B95A1] mt-0.5">Klik "Supplier Baru" untuk mendaftarkan distributor.</p>
              </div>
            ) : (
              filteredSuppliers.map((s) => {
                const isEditing = editingId === s.id;

                if (isEditing) {
                  return (
                    <div key={s.id} className="p-3.5 rounded-xl border border-[#3182F6] bg-[#F8FAFF] space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nama Supplier"
                          className="h-8 px-2.5 bg-white border border-[#E5E8EB] rounded-lg text-xs font-bold text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                        />
                        <input
                          type="text"
                          value={editContact}
                          onChange={(e) => setEditContact(e.target.value)}
                          placeholder="Nama PIC Sales"
                          className="h-8 px-2.5 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                        />
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="No. Telepon"
                          className="h-8 px-2.5 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                        />
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Alamat"
                          className="h-8 px-2.5 bg-white border border-[#E5E8EB] rounded-lg text-xs text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="h-7 px-3 rounded-lg border border-[#E5E8EB] bg-white text-xs font-semibold text-[#6F7780] hover:bg-[#F2F4F6]"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleSaveEdit(s.id)}
                          className="h-7 px-3 rounded-lg bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-bold flex items-center space-x-1"
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-[#E5E8EB] bg-white hover:border-[#3182F6]/30 hover:bg-[#F8F9FA] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#191F28] truncate">{s.name}</p>
                        <div className="flex items-center space-x-3 text-[11px] text-[#6F7780] mt-0.5 flex-wrap">
                          {s.contactPerson && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#8B95A1]" />
                              {s.contactPerson}
                            </span>
                          )}
                          {s.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-[#03B26C]" />
                              {s.phone}
                            </span>
                          )}
                          {s.address && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 text-[#8B95A1]" />
                              {s.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSupplierToDelete({ id: s.id, name: s.name })}
                        className="p-1.5 rounded-lg text-[#6F7780] hover:text-[#F04452] hover:bg-[#FEECED] transition-colors"
                        title="Hapus Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Rekanan Supplier?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus <strong>"{supplierToDelete?.name}"</strong>? Data faktur pembelian historis yang telah dicatat akan tetap tersimpan aman.
          </span>
        }
        confirmText="Ya, Hapus Supplier"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
}
