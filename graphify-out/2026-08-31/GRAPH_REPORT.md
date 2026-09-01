# Graph Report - miegraine  (2026-08-31)

## Corpus Check
- 120 files · ~60,992 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 625 nodes · 1205 edges · 51 communities (42 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- tenants-client-view.tsx
- superadmin.ts
- formatRupiah
- getSessionUser
- devDependencies
- dependencies
- compilerOptions
- superadmin/layout.tsx
- reports/page.tsx
- skeleton.tsx
- generate-crown-png.js
- 📦 SDD 02: Modul Master Produk, Multi-Satuan & Multi-Harga
- generate-icons.js
- app/page.tsx
- 3. Fitur Kunci untuk Owner & Multi-Outlet
- postcss.config.mjs
- next.config.ts
- next-env.d.ts
- tailwind.config.ts
- 2. Rincian Fitur & Alur Kerja
- 2. Rincian Rekomendasi Logic per Tahapan
- 3. Komponen Reusable UI Suite & Pola Interaksi
- 14-struktur-web-portal-landing-login-dashboard.md
- 2. Fitur-Fitur Kunci Superadmin (Khusus Bos Besar)
- 🚀 SDD 20: Panduan Deployment Cloudflare, Konfigurasi D1 & CI/CD Pipeline
- [v1.1.0] - 2026-08-29
- opname-modal.tsx
- 2. Rincian Lapisan Keamanan
- 2. Rincian Konfigurasi & Implementasi Teknis
- ⚡ SDD 13: Arsitektur Caching & Offline-Resilience (Next.js + Edge + D1)
- 🔐 SDD 15: Arsitektur Auth, Middleware & Session Token di Edge (Cloudflare + Next.js)
- 2. Rincian Teknis Implementasi
- 🏛️ SDD 00: Overview & Arsitektur Global Sistem
- 🔐 SDD 01: Modul Multi-Tenant & Otentikasi
- 09-onboarding-preset-dan-smart-toggle.md
- 🕵️ SDD 21: Modul Audit Log & Activity Tracking (Anti-Fraud & Forensik Toko)
- 03-modul-kasir-pos.md
- 04-modul-piutang-kasbon.md
- 05-modul-inventori-stok.md
- 06-modul-laporan-keuangan.md
- 24-master-peta-rute-dan-url-aplikasi.md
- 📊 PROGRESS TRACKER — Universal SaaS POS & Mini-ERP
- 08-cakupan-jenis-toko.md
- 23-master-skema-database-d1-drizzle.md
- 🗺️ SDD 22: Master Development Roadmap (Phased Execution Plan)
- 📚 Master Documentation Hub: Universal SaaS POS & Mini-ERP

## God Nodes (most connected - your core abstractions)
1. `getSessionUser()` - 80 edges
2. `formatRupiah()` - 39 edges
3. `formatTanggal()` - 21 edges
4. `compilerOptions` - 16 edges
5. `DB` - 13 edges
6. `getProductsAction()` - 12 edges
7. `requireSuperadmin()` - 11 edges
8. `TenantsClientView()` - 9 edges
9. `PosPaymentModal()` - 8 edges
10. `products` - 8 edges

## Surprising Connections (you probably didn't know these)
- `SuperadminLayout()` --calls--> `getSessionUser()`  [EXTRACTED]
  src/app/superadmin/layout.tsx → src/lib/auth/session.ts
- `LoginPage()` --calls--> `loginAction()`  [EXTRACTED]
  src/app/(auth)/login/page.tsx → src/lib/actions/auth.ts
- `DebtsPage()` --calls--> `getSessionUser()`  [EXTRACTED]
  src/app/dashboard/debts/page.tsx → src/lib/auth/session.ts
- `InventoryPage()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/dashboard/inventory/page.tsx → src/lib/utils.ts
- `InventoryPage()` --calls--> `formatTanggal()`  [EXTRACTED]
  src/app/dashboard/inventory/page.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (51 total, 4 thin omitted)

### Community 0 - "tenants-client-view.tsx"
Cohesion: 0.06
Nodes (49): jetbrainsMono, metadata, plusJakartaSans, viewport, AuditClientView(), AuditClientViewProps, SuperadminAuditPage(), BillingClientView() (+41 more)

### Community 1 - "superadmin.ts"
Cohesion: 0.09
Nodes (48): LoginPage(), DashboardLayout(), DashboardHomePage(), LogAuditInput, ActionResult, loginAction(), logoutAction(), registerTenantAction() (+40 more)

### Community 2 - "formatRupiah"
Cohesion: 0.08
Nodes (42): AuditClientView(), AuditClientViewProps, CustomerModal(), CustomerModalProps, DebtClientView(), DebtClientViewProps, DebtPaymentModal(), DebtPaymentModalProps (+34 more)

### Community 3 - "getSessionUser"
Cohesion: 0.08
Nodes (43): AuditPage(), OpnamePage(), InventoryPage(), RestockPage(), PosPage(), ImportModal(), ImportModalProps, ProductsPage() (+35 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (31): autoprefixer, @cloudflare/workers-types, drizzle-kit, devDependencies, autoprefixer, @cloudflare/workers-types, drizzle-kit, postcss (+23 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (31): clsx, dexie, dexie-react-hooks, drizzle-orm, jose, @libsql/client, lucide-react, next (+23 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 7 - "superadmin/layout.tsx"
Cohesion: 0.38
Nodes (4): SuperadminLayout(), SuperadminNav(), DashboardTopNavbar(), DashboardTopNavbarProps

### Community 9 - "reports/page.tsx"
Cohesion: 0.27
Nodes (8): ExpenseModal(), ExpenseModalProps, ReportsPage(), ReportsClientView(), ReportsClientViewProps, createExpenseAction(), getProfitLossSummaryAction(), getTopSellingProductsAction()

### Community 10 - "skeleton.tsx"
Cohesion: 0.23
Nodes (5): DataTableSkeleton(), Skeleton(), SkeletonProps, StatCardSkeleton(), TableToolbarSkeleton()

### Community 11 - "generate-crown-png.js"
Cohesion: 0.19
Nodes (12): crc32(), createPng(), fs, iconsDir, makeChunk(), path, publicDir, renderCrown() (+4 more)

### Community 12 - "📦 SDD 02: Modul Master Produk, Multi-Satuan & Multi-Harga"
Cohesion: 0.20
Nodes (10): 1. Scope & Tantangan Kunci, 1. Toko ATK (Pulpen), 2. Skema Database Drizzle (D1 SQLite), 2. Toko Bangunan (Semen & Pasir), 3. Logika Perhitungan Multi-Satuan (Real-World Examples), 3. Toko Listrik (Kabel Listrik), 4. Tampilan Dropdown Kasir POS (UX Simpel), Aturan Emas (The Golden Rule): (+2 more)

### Community 13 - "generate-icons.js"
Cohesion: 0.22
Nodes (10): crc32(), crcTable, createSimplePng(), fs, iconsDir, makeChunk(), path, png192 (+2 more)

### Community 14 - "app/page.tsx"
Cohesion: 0.32
Nodes (4): FloatingWhatsapp(), FloatingWhatsappProps, ScrollReveal(), ScrollRevealProps

### Community 15 - "3. Fitur Kunci untuk Owner & Multi-Outlet"
Cohesion: 0.20
Nodes (10): 1. Konsep Hirarki Organisasi (Multi-Outlet Hierarchy), 1. **Live Executive Dashboard (Pantauan Owner dari HP/Laptop)**, 2. Alur Kerja (End-to-End Flow), 2. **Master Produk Terpusat vs Stok per Cabang**, 3. Fitur Kunci untuk Owner & Multi-Outlet, 3. **Mutasi & Transfer Stok Antar Cabang**, 4. **Laporan Tutup Shift & Notifikasi Ringkas**, 4. Skema Database Drizzle untuk Multi-Outlet (+2 more)

### Community 24 - "2. Rincian Fitur & Alur Kerja"
Cohesion: 0.20
Nodes (10): 1. 5 Fitur Pelengkap Bernilai Tinggi, 1. 📄 Fitur Export PDF & Excel (.xlsx), 2. 📲 Kirim Nota Digital Langsung ke WhatsApp Pembeli, 2. Rincian Fitur & Alur Kerja, 3. 🏷️ Generator & Cetak Label Barcode, 4. ⚙️ Kustomisasi Format Struk Belanja, 5. 💾 Backup & Export Riwayat Finansial Toko, A. Export Format PDF (Siap Cetak & Resmi): (+2 more)

### Community 25 - "2. Rincian Rekomendasi Logic per Tahapan"
Cohesion: 0.22
Nodes (9): 1. Peta Alur Logika Keseluruhan (Master Flowchart), 2. Rincian Rekomendasi Logic per Tahapan, 🌟 SDD 10: Rekomendasi Blueprint Logic & End-to-End Flow (Best Practice), 🔹 Tahap 1: Registrasi & Setup Toko (Owner), 🔹 Tahap 2: Master Barang & Stok Masuk (Restock), 🔹 Tahap 3: Kasir POS (Fast, Accurate & Flexible), 🔹 Tahap 4: Tutup Shift Kasir (Pencegahan Kebocoran Kas / Fraud), 🔹 Tahap 5: Manajemen Piutang & Cicilan (Buku Bon) (+1 more)

### Community 26 - "3. Komponen Reusable UI Suite & Pola Interaksi"
Cohesion: 0.22
Nodes (9): 1. Filosofi Visual Utama (Non-Generic & Anti-Slop), 2. Palet Warna & Token Sistem, 3. Komponen Reusable UI Suite & Pola Interaksi, 4. Standar Layout & Penyelarasan Navigasi (Sidebar 28px Alignment), A. Modal & Dialog (`Modal.tsx` & `ConfirmModal.tsx`), B. Toast Notification (`toast.tsx`), C. Paginasi & Tabel Data (`pagination.tsx` & `data-table.tsx`), D. Skeleton Shimmer Suite (`skeleton.tsx` & `loading.tsx`) (+1 more)

### Community 27 - "14-struktur-web-portal-landing-login-dashboard.md"
Cohesion: 0.25
Nodes (7): 1. Peta Rute Web & Integrasi POS dalam Dashboard, 2. Bagaimana Pengalaman Pengguna (UX Rekomendasi)?, 2. Rincian Komponen Halaman, A. Landing Page Publik (`/`), B. Halaman Login & Registrasi (`/login` & `/register`), C. Layar POS Kasir (`/pos`), D. Executive Dashboard (`/dashboard`)

### Community 28 - "2. Fitur-Fitur Kunci Superadmin (Khusus Bos Besar)"
Cohesion: 0.25
Nodes (8): 1. Arsitektur Portal Superadmin (`/superadmin/*`), 1. **Daftar Tenant & Kontrol Masa Berlangganan (Subscription Management)**, 2. Fitur-Fitur Kunci Superadmin (Khusus Bos Besar), 2. **Fitur Impersonasi / "Login as Owner" (Customer Support 1-Klik)**, 3. **Global SaaS Analytics (Metrik Bisnis Bos Besar)**, 3. Komponen Reusable UI Suite yang Digunakan, 4. **Broadcast Notifikasi Global & Pengaturan Tarif**, 👑 SDD 16: Modul Superadmin & SaaS Platform Management Portal

### Community 29 - "🚀 SDD 20: Panduan Deployment Cloudflare, Konfigurasi D1 & CI/CD Pipeline"
Cohesion: 0.25
Nodes (8): 1. Topologi Deployment di Cloudflare, 2. File Konfigurasi Wrangler (`wrangler.toml`), 3. Langkah Inisialisasi Database D1 & Migrasi Drizzle, 4. Perintah Build & Deploy ke Cloudflare Pages, 🚀 SDD 20: Panduan Deployment Cloudflare, Konfigurasi D1 & CI/CD Pipeline, Step 1: Login & Buat Database D1 di Cloudflare, Step 2: Konfigurasi Drizzle ORM (`drizzle.config.ts`), Step 3: Eksekusi Migrasi Skema ke D1

### Community 30 - "[v1.1.0] - 2026-08-29"
Cohesion: 0.25
Nodes (7): 📜 CHANGELOG — Universal SaaS POS & Mini-ERP, 🐛 Diperbaiki (Fixed), 🚀 Ditambahkan (Added), ⚡ Ditingkatkan & Dioptimalkan (Improved & Optimized), 🚀 Initial Platform Release, [v1.0.0] - 2026-08-28, [v1.1.0] - 2026-08-29

### Community 31 - "opname-modal.tsx"
Cohesion: 0.32
Nodes (6): OpnameClientView(), OpnameClientViewProps, OpnameModal(), OpnameModalProps, createStockOpnameAction(), OpnameItemInput

### Community 32 - "2. Rincian Lapisan Keamanan"
Cohesion: 0.29
Nodes (7): 1. 4 Lapisan Keamanan Utama (Defense-in-Depth), 2. Rincian Lapisan Keamanan, A. Isolasi Data Multi-Tenant (Anti Kebocoran Data Antar Toko), B. Keamanan Otentikasi & Password di Edge, C. Proteksi Anti-Fraud Meja Kasir (Pencegahan Kebocoran Kas), D. Keamanan Database & Injeksi (SQLi & XSS), 🛡️ SDD 11: Arsitektur Keamanan Sistem (Security) & Anti-Fraud

### Community 33 - "2. Rincian Konfigurasi & Implementasi Teknis"
Cohesion: 0.29
Nodes (7): 1. Arsitektur Pertahanan Berlapis (Zero-Trust Security Mesh), 2. Rincian Konfigurasi & Implementasi Teknis, A. Edge Rate Limiter Middleware (`middleware.ts`), B. Anti-Session Hijacking (Device Fingerprint Binding), C. Cloudflare WAF & Anti-DDoS Rules (Wrangler / Dashboard), D. Input Sanitization & Payload Protection, 🛡️ SDD 12: Enterprise Security Hardening, Rate Limiting & Anti-DDoS Architecture

### Community 34 - "⚡ SDD 13: Arsitektur Caching & Offline-Resilience (Next.js + Edge + D1)"
Cohesion: 0.29
Nodes (7): 1. 4 Lapis Arsitektur Caching, 2. Rincian & Strategi Invalidation per Lapis, 3. PWA (Progressive Web App) & Offline Shell Architecture, A. Lapis 1: Client-Side Offline Cache (IndexedDB Kasir), B. Lapis 2: Next.js Server Cache Tags (`revalidateTag`), C. Lapis 3: Database Write-Through (D1 SQLite), ⚡ SDD 13: Arsitektur Caching & Offline-Resilience (Next.js + Edge + D1)

### Community 35 - "🔐 SDD 15: Arsitektur Auth, Middleware & Session Token di Edge (Cloudflare + Next.js)"
Cohesion: 0.29
Nodes (6): 1. Arsitektur Otentikasi Stateless di Cloudflare Edge, 2. Struktur Payload JWT Session Token (`jose`), 3. Konfigurasi Cookie Sesi, 4. Logika Edge Middleware (`middleware.ts`), 5. Helper `getCurrentSession()` di Server Actions & Pages, 🔐 SDD 15: Arsitektur Auth, Middleware & Session Token di Edge (Cloudflare + Next.js)

### Community 36 - "2. Rincian Teknis Implementasi"
Cohesion: 0.29
Nodes (7): 1. 3 Jalur Koneksi Printer Thermal Universal, 2. Rincian Teknis Implementasi, 3. Komponen Pengaturan Printer di POS Kasir, A. Jalur 1: Bluetooth Thermal Printer (Untuk HP & Tablet), B. Jalur 2: Kabel USB Thermal Printer (Untuk Laptop & PC Kasir), C. Jalur 3: Universal Browser Print Fallback (`@media print`), 🖨️ SDD 19: Integrasi Hardware Printer Thermal (Bluetooth, USB & Browser Print)

### Community 37 - "🏛️ SDD 00: Overview & Arsitektur Global Sistem"
Cohesion: 0.33
Nodes (6): 1. Prinsip Desain Sistem (Design Principles), 2. Arsitektur Infrastruktur (Cloudflare Stack), 3. Strategi Multi-Tenancy (Data Isolation), 4. Global Entity Relationship Diagram (ERD), 5. Ringkasan Modul & Peta Dokumen SDD, 🏛️ SDD 00: Overview & Arsitektur Global Sistem

### Community 38 - "🔐 SDD 01: Modul Multi-Tenant & Otentikasi"
Cohesion: 0.33
Nodes (6): 1. Scope & Kebutuhan Fitur, 2. Skema Database Drizzle (D1 SQLite), 3. Alur Kerja (Workflows), A. Flow Registrasi & Onboarding Toko Baru, B. Flow Login (Owner, Admin, Kasir), 🔐 SDD 01: Modul Multi-Tenant & Otentikasi

### Community 39 - "09-onboarding-preset-dan-smart-toggle.md"
Cohesion: 0.33
Nodes (5): 1. Alur Pemilihan Jenis Toko (Smart Onboarding), 2. Pengalaman Kasir saat Melayani Pembeli (Tanpa Ribet), 3. Fleksibilitas "Smart Toggle" per Produk (Toko Campuran), Apa yang Terjadi di Balik Layar Saat Jenis Usaha Dipilih?, 🎯 SDD 09: Onboarding Preset & Smart-Toggle Fitur

### Community 40 - "🕵️ SDD 21: Modul Audit Log & Activity Tracking (Anti-Fraud & Forensik Toko)"
Cohesion: 0.33
Nodes (5): 1. Mengapa Audit Log Sangat Krusial di POS Ritel?, 2. 7 Event Kritis yang Wajib Dicatat (Event Triggers), 3. Skema Database Drizzle (D1 SQLite), 4. Tampilan Halaman Audit Log di Dashboard Owner (`/dashboard/audit`), 🕵️ SDD 21: Modul Audit Log & Activity Tracking (Anti-Fraud & Forensik Toko)

### Community 41 - "03-modul-kasir-pos.md"
Cohesion: 0.40
Nodes (4): 1. Fitur Utama Layar Kasir POS, 2. Skema Database Transaksi Drizzle (D1 SQLite), 3. Flow Checkout Kasir (Sequence Diagram), 🛒 SDD 03: Modul Kasir POS & Transaksi Penjualan

### Community 42 - "04-modul-piutang-kasbon.md"
Cohesion: 0.40
Nodes (4): 1. Fitur Kunci Buku Piutang, 2. Skema Database Pembayaran Piutang (D1 SQLite), 3. Flow Pelunasan Piutang (Sequence Diagram), 📑 SDD 04: Modul Piutang & Kasbon (Buku Bon Pelanggan)

### Community 43 - "05-modul-inventori-stok.md"
Cohesion: 0.40
Nodes (4): 1. Fitur Kunci Manajemen Inventori, 2. Skema Database Drizzle (D1 SQLite), 3. Rumus Kalkulasi Moving Average HPP (Cost Price), 🏭 SDD 05: Modul Inventori, Pembelian & Kalkulasi HPP

### Community 44 - "06-modul-laporan-keuangan.md"
Cohesion: 0.40
Nodes (4): 1. Fitur Utama Laporan Finansial Toko, 2. Skema Database Arus Kas Drizzle (D1 SQLite), 3. Alur Perhitungan Laba Rugi Realtime, 📊 SDD 06: Modul Laporan & Arus Kas Sederhana

### Community 45 - "24-master-peta-rute-dan-url-aplikasi.md"
Cohesion: 0.40
Nodes (4): 1. Peta Rute URL Lengkap (Complete URL Directory), 2. Tabel Matriks Hak Akses Rute (RBAC Routing Matrix), 3. Server Actions & API Handlers, 🗺️ SDD 24: Master Peta Rute URL, Halaman & Akses Kontrol (Routing Matrix)

### Community 46 - "📊 PROGRESS TRACKER — Universal SaaS POS & Mini-ERP"
Cohesion: 0.40
Nodes (4): 💎 Komponen Reusable UI Suite yang Telah Aktif, ⚡ Optimasi Engine & Developer Experience, 📊 PROGRESS TRACKER — Universal SaaS POS & Mini-ERP, 🎯 Ringkasan Status Keseluruhan

### Community 47 - "08-cakupan-jenis-toko.md"
Cohesion: 0.50
Nodes (3): 1. Matriks Cakupan Toko & Fitur Kunci, 2. Mengapa Bisa Universal untuk Semua Toko Ini?, 🏪 SDD 08: Cakupan Scope Jenis Toko & Solusi Fitur Spesifik

### Community 48 - "23-master-skema-database-d1-drizzle.md"
Cohesion: 0.50
Nodes (3): 1. Diagram Relasi Entitas Global (Complete ERD), 2. Definisi Skema Drizzle TypeScript Lengkap (`src/lib/db/schema.ts`), 🗄️ SDD 23: Master Skema Database Drizzle ORM (Cloudflare D1 SQLite)

### Community 49 - "🗺️ SDD 22: Master Development Roadmap (Phased Execution Plan)"
Cohesion: 0.67
Nodes (3): 📌 Peta Status Roadmap Pembangunan, 📋 Rincian Langkah, Dokumen Rujukan & Status Lengkap Seluruh Fase, 🗺️ SDD 22: Master Development Roadmap (Phased Execution Plan)

### Community 50 - "📚 Master Documentation Hub: Universal SaaS POS & Mini-ERP"
Cohesion: 0.67
Nodes (3): 📑 Daftar Lengkap Dokumen Desain Sistem (SDD), 🚀 Live Status & Log Pembaruan, 📚 Master Documentation Hub: Universal SaaS POS & Mini-ERP

## Knowledge Gaps
- **248 isolated node(s):** `fs`, `path`, `zlib`, `iconsDir`, `crcTable` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 268 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSessionUser()` connect `getSessionUser` to `tenants-client-view.tsx`, `superadmin.ts`, `formatRupiah`, `superadmin/layout.tsx`, `reports/page.tsx`, `opname-modal.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `formatRupiah()` connect `formatRupiah` to `tenants-client-view.tsx`, `superadmin.ts`, `getSessionUser`, `reports/page.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `🏢 SDD 07: Modul Multi-Outlet, Live Monitoring Owner & Transfer Stok` connect `3. Fitur Kunci untuk Owner & Multi-Outlet` to `README.md`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `zlib` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tenants-client-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05698778833107191 - nodes in this community are weakly interconnected._
- **Should `superadmin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08857808857808858 - nodes in this community are weakly interconnected._
- **Should `formatRupiah` be split into smaller, more focused modules?**
  _Cohesion score 0.07518796992481203 - nodes in this community are weakly interconnected._