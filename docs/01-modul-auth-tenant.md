# 🔐 SDD 01: Modul Multi-Tenant & Otentikasi

Dokumen ini menjelaskan alur pendaftaran toko (onboarding), manajemen multi-cabang/outlet, pembagian peran pengguna (RBAC), dan arsitektur otentikasi di Cloudflare Edge.

---

## 1. Scope & Kebutuhan Fitur

1. **Registrasi Toko (Onboarding Sederhana)**:
   - Form pendaftaran: Nama Toko, Kategori Bisnis (*Minimarket / Toko ATK / Toko Bangunan / Ritel Umum*), Alamat, No. Telp, Email & Password Owner.
   - Pilihan Kategori Bisnis otomatis mengatur preset satuan awal (misal jika pilih Toko Bangunan -> langsung aktif satuan Sak, Batang, Meter, Pcs).
2. **Role & Permission Matrix (RBAC: Owner, Admin, Kasir)**:

| Menu / Fitur | Owner (Pemilik) | Admin (Manajer Cabang) | Kasir (Cashier) |
| :--- | :---: | :---: | :---: |
| **Layar POS Kasir (/pos)** | ✅ | ✅ | ✅ |
| **Buka/Tutup Shift & Kas Laci** | ✅ | ✅ | ✅ |
| **Master Data Produk & Satuan** | ✅ | ✅ (Bisa Tambah/Edit) | ❌ (Hanya Baca di POS) |
| **Barang Masuk / Pembelian Supplier** | ✅ | ✅ | ❌ |
| **Stok Opname & Penyesuaian** | ✅ | ✅ | ❌ |
| **Buku Piutang & Catat Cicilan** | ✅ | ✅ | ⚠️ (Bisa catat DP saat kasir) |
| **Laporan Penjualan Cabang** | ✅ (Semua Cabang) | ✅ (Cabang Sendiri) | ⚠️ (Hanya Shift Sendiri) |
| **Laporan Laba/Rugi & HPP** | ✅ | ❌ (Tersembunyi) | ❌ (Tersembunyi) |
| **Manajemen Karyawan & Cabang** | ✅ | ❌ | ❌ |

3. **Session & Security di Cloudflare Edge**:
   - Stateless JWT cookie dengan enkripsi yang ringan untuk Cloudflare Workers/Edge runtime.

---

## 2. Skema Database Drizzle (D1 SQLite)

```typescript
// schema/auth.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(), // nanoid or uuid
  name: text('name').notNull(),
  businessType: text('business_type').notNull(), // 'minimarket' | 'atk' | 'building' | 'general'
  phone: text('phone'),
  address: text('address'),
  receiptFooter: text('receipt_footer').default('Terima kasih atas kunjungan Anda'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  username: text('username').notNull(), // username untuk login (e.g. 'kasir1', 'budi', 'admin_toko')
  email: text('email'), // opsional untuk kasir/admin, wajib untuk owner
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'cashier'] }).default('cashier').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

---

## 3. Alur Kerja (Workflows)

### A. Flow Registrasi & Onboarding Toko Baru
```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pemilik Toko
    participant UI as Onboarding Page
    participant Server as Next.js Server Action
    participant DB as Cloudflare D1

    Owner->>UI: Input Nama Toko, Tipe Bisnis, Username & Password Owner
    UI->>Server: Submit Data Registrasi
    Server->>Server: Hash Password (Argon2 / WebCrypto)
    Server->>DB: INSERT into tenants & users (role: 'owner')
    Server->>DB: INSERT preset default units (Pcs, Dus, dll)
    Server->>UI: Set HTTP-Only Session Cookie
    UI-->>Owner: Redirect ke Dashboard Utama Toko
```

### B. Flow Login (Owner, Admin, Kasir)
```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Owner / Admin / Kasir)
    participant UI as Halaman Login (/login)
    participant Server as Next.js API / Action
    User->>UI: Input Username & Password
    UI->>Server: Verifikasi Kredensial (Username + Password)
    Server-->>UI: Return Session Token dengan TenantID & Role
    alt Role is Kasir
        UI->>UI: Redirect langsung ke Layar POS Kasir (/pos)
    else Role is Owner / Admin
        UI->>UI: Redirect ke Dashboard Utama (/dashboard)
    end
```
