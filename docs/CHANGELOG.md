# 📜 CHANGELOG — Universal SaaS POS & Mini-ERP

Semua catatan perubahan, pembaruan fitur, optimasi performa, dan perbaikan bug dicatat secara terstruktur di sini.

Format mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan [Semantic Versioning](https://semver.org/).

---

## [v1.3.0] - 2026-08-31

### 🚀 Ditambahkan (Added)
- **Modul Laporan Laba Rugi (P&L) Interaktif & Realtime**:
  - Filter Rentang Waktu Terpadu: `Hari Ini`, `7 Hari Terakhir`, `Bulan Ini`, `Bulan Lalu`, `Semua`, dan `Kustom` (Pilih tanggal awal & akhir) tanpa reload halaman.
  - **Analisis Proporsi Beban Kas (Expense Breakdown)**: Visualisasi pembagian beban operasional toko per kategori pos biaya dengan indikator progress bar dan persentase kontribusi.
  - 4 Bento StatCard Reusable: Total Omzet Penjualan, Total HPP Modal Pokok, Beban Operasional Toko, dan Laba Bersih Realtime (dilengkapi Gross Margin % dan Net Margin %).
  - Modal Pencatatan Kas Keluar / Beban Operasional terintegrasi dengan opsi Kas Tunai (Laci) dan Transfer Bank.
- **Modul Rekap Penjualan Komprehensif (Sales Summary & Cash Audit)**:
  - 4 Reusable `<StatCard />` Kanal Pembayaran: Uang Tunai Kasir (`Banknote`), QRIS Digital (`QrCode`), Transfer Bank (`CreditCard`), dan Kasbon/Piutang (`Receipt`).
  - **Rincian Transaksi Penjualan (Log Per-Struk / Invoice)**:
    - Kolom Pencarian Realtime No. Invoice, Kasir, atau Pelanggan.
    - Filter Metode Pembayaran (Semua, Tunai, QRIS, Transfer, Kasbon).
    - **Modal Detail Transaksi**: Menampilkan daftar rincian item belanja (Nama produk, SKU, Qty, Satuan, Harga, Subtotal), rincian diskon/potongan, jumlah dibayar, uang kembalian, dan tombol cetak nota thermal.
  - **Performa Omzet Berdasarkan Kasir**:
    - Tabel ringkasan produktivitas staf kasir (Jumlah transaksi, total omzet dihasilkan, rata-rata omzet per struk/basket).
    - **Modal Detail Performa Kasir Komprehensif**: Profil kasir, 3 kartu metrik ringkasan, dan **Daftar Riwayat Struk Kasir Terpilih** dengan tombol aksi lihat detail barang belanjaan (`<Eye />`) dan cetak nota struk (`<Receipt />`).

### ⚡ Ditingkatkan & Dioptimalkan (Improved & Optimized)
- **Arsitektur Server Action Resilient & Anti-Crash (Safe-Return Pattern)**:
  - Mengubah penanganan error `getTransactionDetailAction` dan `getSalesReportBreakdownAction` menjadi pola objek response terstruktur (`{ success: true, transaction, items }`), menghilangkan potensi error *500 Internal Server Error* pada Turbopack & React Server DOM.
- **Standardisasi Kolom Aksi Menjadi Icon-Only Universal**:
  - Seluruh tombol aksi pada tabel aplikasi diseragamkan menjadi icon-only yang rapi, ringkas, dan modern:
    - Master Produk: `<Eye />` (Detail) & `<Trash2 />` (Hapus).
    - Rekap Penjualan: `<Eye />` (Rincian Item Belanja) & `<Receipt />` (Buka/Cetak Nota).
    - Performa Kasir: `<Eye />` (Detail Performa).
    - Dashboard Home Transaksi Terkini: `<Receipt />` (Buka/Cetak Nota).
    - Audit Log: `<Eye />` (Snapshot Data Kritis).
    - Transfer Antarcabang: `<Check />` (Konfirmasi Terima Barang).
    - *Buku Piutang*: Dikecualikan secara khusus dengan tombol icon + text (`[<Share2 /> Tagih WA]` & `[<Banknote /> Bayar]`).
- **Pembersihan Seluruh Emoticon / Emoji Menjadi 100% Lucide Icons**:
  - Menghapus penggunaan emoji karakter unicode di formulir, dropdown, badge status, dan modal, digantikan oleh komponen icon SVG `<lucide-react>` murni (`<User />`, `<Banknote />`, `<CreditCard />`, `<Receipt />`, `<Calendar />`, dll).
- **Perapian Layout Toolbar Atas (Uncarded Design)**:
  - Toolbar filter tanggal dan tombol aksi pada Laba Rugi dan Rekap Penjualan diubah menjadi layout uncarded dengan pill buttons `h-10` yang menyatu langsung dengan latar belakang halaman.

### 🐛 Diperbaiki (Fixed)
- **Import Skema Database `customers`**: Memperbaiki `ReferenceError: customers is not defined` pada action query rincian transaksi laporan penjualan (`getSalesReportBreakdownAction`).
- **Query Item Belanja Transaksi & Sanitasi Data**: Memperbaiki nama kolom `pricePerUnit`, sanitasi tipe data numerik dan tanggal, serta pencegahan crash *Cannot convert undefined or null to object*.
- **Pembersihan Teks Duplikat Double Icon**: Menghilangkan teks simbol `+` ganda pada tombol yang telah memiliki icon `<Plus />`.

---

## [v1.2.0] - 2026-08-31

### 🚀 Ditambahkan (Added)
- **Komponen Universal `<NumberInput />` & Format Ribuan Global (100% Seluruh Aplikasi)**:
  - Fungsi `formatRibuan()` dan `parseRibuan()` di [`src/lib/utils.ts`](../src/lib/utils.ts) untuk auto-format pemisah titik ribuan (contoh: `10.000`, `250.000`, `5.000.000`).
  - Pembersihan otomatis karakter non-angka saat pengguna mengetik.
  - **100% Diterapkan di seluruh modal & formulir**:
    - Modal Tambah/Edit Produk: Harga Beli (HPP), Harga Jual Eceran, Stok Awal, Min Alert Stok, Harga Grosir, Min Grosir Qty, dan Multi-Satuan (Konversi & Harga).
    - Modal Pembelian Supplier (PO): Jumlah Beli Qty, Harga Beli Satuan, dan Jatuh Tempo Hari.
    - Modal Kasir (POS): Input Diskon Potongan, Uang Diterima / Tunai Kasir, DP Pembayaran, dan Modal Awal/Blind Count Shift.
    - Modal Pelunasan Piutang & Tambah Pelanggan: Batas Plafon Hutang & Nominal Pembayaran Bon.
    - Modal Stok Opname & Transfer Cabang: Jumlah Fisik & Qty Transfer.
    - Pengaturan Superadmin: Tarif Paket Starter, Pro, dan Durasi Hari Trial.
- **Penghapusan Global Spinner Angka**:
  - Penonaktifan spinner panah atas/bawah browser (`appearance: textfield`, `::-webkit-outer/inner-spin-button`) pada semua input angka via [`src/app/globals.css`](../src/app/globals.css).
- **Dedicated POS Kiosk Mode (`fixed inset-0 z-50`)**:
  - Fitur mode layar penuh mesin kasir mandiri (*Standalone POS Kiosk*) yang menyembunyikan sidebar navigasi dan top navbar dashboard agar kasir dapat fokus 100% pada transaksi.
  - Akses cepat via tombol `Layar Kiosk POS` / `Keluar Kiosk` atau tombol shortcut `Esc`.
- **Komponen `<AlertModal />` Terpadu**:
  - Menambah dan mengekspor `<AlertModal />` di [`src/components/ui/confirm-modal.tsx`](../src/components/ui/confirm-modal.tsx) untuk menggantikan seluruh `window.alert()` bawaan browser.
- **Komponen `<CategoryModal />` & Full Category CRUD**:
  - Fitur lengkap kelola kategori produk di Master Produk: Tambah kategori baru, Edit/Ubah nama kategori secara langsung, dan Hapus kategori (dengan pengamanan produk tidak terhapus).
  - Server actions terintegrasi: `createCategoryAction`, `updateCategoryAction`, dan `deleteCategoryAction` di [`src/lib/actions/products.ts`](../src/lib/actions/products.ts).
- **Mobile Cart Drawer Modal**:
  - Modal bottom-sheet khusus perangkat mobile/tablet di POS Kasir untuk mengelola item keranjang dan proses checkout langsung dari layar sentuh.

### ⚡ Ditingkatkan & Dioptimalkan (Improved & Optimized)
- **Standardisasi Radius Sudut Komponen Maksimal `rounded-xl` (12px)**:
  - Menghilangkan seluruh `rounded-2xl` dan `rounded-3xl` yang berlebihan pada kartu metrik, modal, kotak input, tabel, dan kontainer layout.
  - Seluruh komponen kini konsisten dengan kombinasi sudut maksimal `rounded-xl` / `rounded-lg` untuk estetika clean UI profesional, dengan `rounded-full` khusus untuk circular avatar dan status pill badges.
- **Grid Katalog Produk Kasir (POS)**:
  - Format grid responsif 4 item per baris di layar desktop/tablet (`grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4`).
  - Badge in-cart kuantiti (`1x`, `2x`) ditempatkan rapi di dalam header kartu produk sebelah kanan badge satuan, menghilangkan overflow dan scrollbar horizontal.
  - Label multi-satuan diperjelas menjadi badge hijau `Multi-Satuan`.
- **Logika Validasi Diskon POS**:
  - Diskon tidak dapat melebihi subtotal belanja (`Math.min(val, subtotal)`).
  - Auto-cap diskon reaktif saat kuantiti produk di keranjang berkurang atau dihapus agar total tagihan tidak pernah minus (`< 0`).
- **Standardisasi Reusable `<DataTable>` & `<Pagination>` di Seluruh Modul**:
  - Migrasi modul Master Produk (`product-table.tsx`), Buku Bon/Piutang (`debt-client-view.tsx`), Restock Supplier (`restock-client-view.tsx`), Laporan Omzet Kasir (`sales-report-client-view.tsx`), Valuasi Aset Stok (`inventory-report-client-view.tsx`), Mutasi Stok Realtime (`inventory/page.tsx`), dan Log Audit Forensik (`audit-client-view.tsx`).
- **Standardisasi Padding Layout Utama**:
  - Konten utama di dashboard tenant (`dashboard/layout.tsx`) dan superadmin (`superadmin/layout.tsx`) distandarisasikan menjadi `p-4 sm:p-6` agar rapi dan tidak melar berlebihan di monitor desktop.
- **Pembaruan Desain Hero Banner**:
  - Hero banner diubah menjadi warna Biru Flat solid modern (`#3182F6`) tanpa gradien berlebihan atau glassmorphism.

### 🐛 Diperbaiki (Fixed)
- **0 Native Dialogs**: Seluruh `window.alert()` dan `window.confirm()` digantikan 100% oleh `<ConfirmModal>` dan `<AlertModal>`.
- **Fix Type Error Dashboard**: Memperbaiki pengecekan null/undefined pada rekap tren mingguan di dashboard home.

---

## [v1.1.0] - 2026-08-29

### 🚀 Ditambahkan (Added)
- **Komponen Reusable UI Suite Lengkap**:
  - [`<Modal />`](../src/components/ui/modal.tsx): Dialog generik berbasis `React.createPortal` langsung ke `document.body` (100% full-screen overlay), body scroll lock, listener keyboard `Escape`, dan transisi IN & OUT.
  - [`<ConfirmModal />`](../src/components/ui/confirm-modal.tsx): Pengganti `window.confirm()` dengan 4 varian gaya aksi (`danger`, `warning`, `primary`, `success`), icon badge, dan spinner loading state.
  - [`<ToastProvider />` & `useToast()`](../src/components/ui/toast.tsx): Sistem notifikasi melayang di `document.body` dengan layout adaptif cerdas (1 baris ringkas jika hanya judul, 2 baris proporsional jika ada deskripsi), animasi pegas masuk/keluar, progress bar timeout solid 3.5px membentang penuh (*flush bottom-edge*), dan perapian tanda baca otomatis (`ensurePunctuation`).
  - [`<Pagination />`](../src/components/ui/pagination.tsx): Paginasi bersih dengan tombol navigasi icon-only `[ ‹ ] [ 1 / 5 ] [ › ]` dan pemilih kuantitas `Tampilkan [ 10 ▾ ] dari X data`.
  - [`<DataTable />`](../src/components/ui/data-table.tsx): Komponen tabel generik dengan dukungan embedding paginasi footer dan transisi baris.
  - [`<StatCard />`](../src/components/ui/stat-card.tsx): Kartu metrik Bento dengan efek *hover elevation* (`-translate-y-0.5`, `shadow-md`, border highlight) dan *icon scale transition*.
  - [`<Skeleton />` Suite](../src/components/ui/skeleton.tsx): Komponen kerangka pemandu loading dengan efek gelombang kilau (*shimmer animation*), dilengkapi preset `<StatCardSkeleton />`, `<DataTableSkeleton />`, dan `<TableToolbarSkeleton />`.
- **Streaming SSR Loading Skeletons (`loading.tsx`)**:
  - `src/app/superadmin/loading.tsx` (Skeleton Ringkasan Bisnis)
  - `src/app/superadmin/tenants/loading.tsx` (Skeleton Kelola Toko)
  - `src/app/superadmin/billing/loading.tsx` (Skeleton Tagihan & Keuangan)
  - `src/app/superadmin/audit/loading.tsx` (Skeleton Log Aktivitas)
  - `src/app/superadmin/settings/loading.tsx` (Skeleton Pengaturan Platform)
- **Animasi Navigasi Halaman (`template.tsx`)**:
  - `src/app/superadmin/template.tsx` dan `src/app/dashboard/template.tsx` dengan transisi halus `animate-page-enter` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Metadata PWA Manifest**:
  - Dibuat `src/app/manifest.ts` rute dinamis Next.js untuk mencegah error 500 pada fetch manifest browser.

### ⚡ Ditingkatkan & Dioptimalkan (Improved & Optimized)
- **Performa Development Server Next.js**:
  - Mengaktifkan **Turbopack** (`next dev --turbo`) untuk proses kompilasi 5×-10× lebih cepat.
  - Menambahkan `optimizePackageImports` di `next.config.ts` untuk modul `lucide-react`, `drizzle-orm`, `clsx`, `tailwind-merge`, `dexie`, dan `zod`.
  - Mematikan `reactStrictMode: false` di mode dev untuk memangkas double-rendering CPU.
- **Halaman Pengaturan Superadmin (`/superadmin/settings`)**:
  - Layout diubah menjadi *full-width* responsif (`max-w-6xl w-full`).
  - Tombol simpan mandiri untuk setiap kartu (*Simpan Tarif & Trial*, *Simpan Kontak CS*, *Simpan Banner Pengumuman*) dengan *isolated loading states* dan feedback Toast.
  - Spesifikasi arsitektur platform diganti dengan data runtime riil (Next.js 15.1.7, React 19, Node.js, Drizzle ORM v0.38.4, LibSQL SQLite, Dexie IndexedDB v4, Jose JWT v5).

---

## [v1.0.0] - 2026-08-28

### 🚀 Initial Platform Release
- Arsitektur Multi-Tenant Universal SaaS POS & Mini-ERP.
- Database Drizzle ORM dengan LibSQL/SQLite & Dexie IndexedDB.
- Modul Otentikasi Stateless JWT `jose` dengan proteksi RBAC Middleware.
- Modul Superadmin Suite (Dashboard Overview, Tenant Management & Impersonation, Billing & Invoicing, Audit Logs, Platform Settings).
- 24 Dokumen Desain Sistem (Software Design Document / SDD) komprehensif.

---
> Dikelola dan didokumentasikan oleh **Jule (주리)** untuk **Bos Besar Banget**. ✨
