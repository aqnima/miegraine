# 📚 Master Documentation Hub: Universal SaaS POS & Mini-ERP

Selamat datang di repositori dokumentasi teknis (Software Design Document / SDD) untuk platform **Universal SaaS POS & Mini-ERP**.

Aplikasi ini dibangun di atas arsitektur serverless **Next.js 15 + Drizzle ORM + Cloudflare Edge + D1 SQLite**, dirancang untuk performa tinggi, kebal gangguan koneksi internet (*Offline-Resilient*), dan mendukung berbagai vertikal ritel & grosir (Minimarket, Toko Bangunan, Toko ATK, Toko HP/Gadget, Ritel Umum).

---

## 🚀 Live Status & Log Pembaruan

- 📊 [**`PROGRESS.md` — Status & Realisasi Roadmap Pengerjaan**](./PROGRESS.md): Pantauan status per fase (Fase 0 s/d 10), modul yang telah rampung, dan komponen UI aktif.
- 📜 [**`CHANGELOG.md` — Catatan Rilis & Riwayat Perubahan**](./CHANGELOG.md): Daftar lengkap fitur baru, perbaikan bug (*fixes*), dan optimasi performa mesin.

---

## 📑 Daftar Lengkap Dokumen Desain Sistem (SDD)

| No | File Dokumen | Topik & Cakupan Utama |
| :---: | :--- | :--- |
| **00** | [**`00-overview-architecture.md`**](./00-overview-architecture.md) | Arsitektur Global, Cloudflare Stack, Multi-Tenancy & Global ERD |
| **01** | [**`01-modul-auth-tenant.md`**](./01-modul-auth-tenant.md) | Multi-Tenancy, 3 Role (Owner, Admin, Kasir) & Login Username-Password |
| **02** | [**`02-modul-master-produk.md`**](./02-modul-master-produk.md) | Master Produk, Multi-Satuan Bertingkat & Konversi Base Unit Realtime |
| **03** | [**`03-modul-kasir-pos.md`**](./03-modul-kasir-pos.md) | Layar Kasir POS Cepat, Scan Barcode, Pembayaran Tunai & Cetak Struk |
| **04** | [**`04-modul-piutang-kasbon.md`**](./04-modul-piutang-kasbon.md) | Buku Piutang (Bon), Batas Kredit, dan Pelunasan/Cicilan 1-Klik |
| **05** | [**`05-modul-inventori-stok.md`**](./05-modul-inventori-stok.md) | Restock Supplier, Stok Opname, Kartu Mutasi Stok & HPP Average |
| **06** | [**`06-modul-laporan-keuangan.md`**](./06-modul-laporan-keuangan.md) | Laba Bersih Otomatis Tanpa Jurnal Akuntansi, Arus Kas & Produk Terlaris |
| **07** | [**`07-modul-multi-outlet-monitoring.md`**](./07-modul-multi-outlet-monitoring.md) | Multi-Cabang, Live Monitoring Owner di HP & Transfer Stok Antar Toko |
| **08** | [**`08-cakupan-jenis-toko.md`**](./08-cakupan-jenis-toko.md) | Cakupan 7+ Jenis Toko (Minimarket, Bangunan, ATK, HP, Listrik, dll.) |
| **09** | [**`09-onboarding-preset-dan-smart-toggle.md`**](./09-onboarding-preset-dan-smart-toggle.md) | Smart Onboarding Preset Berdasarkan Tipe Usaha & Fitur Smart Toggle |
| **10** | [**`10-rekomendasi-logic-dan-flow-lengkap.md`**](./10-rekomendasi-logic-dan-flow-lengkap.md) | Blueprint Master Logic & End-to-End Flow dari Hulu ke Hilir |
| **11** | [**`11-arsitektur-security-dan-anti-fraud.md`**](./11-arsitektur-security-dan-anti-fraud.md) | Defense-in-Depth, Blind Cash Count & HPP Masking Anti-Fraud Kasir |
| **12** | [**`12-security-hardening-dan-rate-limiting.md`**](./12-security-hardening-dan-rate-limiting.md) | Cloudflare Anti-DDoS, Edge Sliding-Window Rate Limiting & CSP Strict |
| **13** | [**`13-arsitektur-caching-dan-offline-resilience.md`**](./13-arsitektur-caching-dan-offline-resilience.md) | 4-Layer Caching (IndexedDB 0ms Scan & D1 Atomic Transactions) |
| **14** | [**`14-struktur-web-portal-landing-login-dashboard.md`**](./14-struktur-web-portal-landing-login-dashboard.md) | Web Portal Suite (Landing Page, Login, Dashboard Terpadu & POS Kiosk) |
| **15** | [**`15-arsitektur-auth-middleware-session-token.md`**](./15-arsitektur-auth-middleware-session-token.md) | Stateless JWT `jose` Edge & RBAC Middleware Context Injection |
| **16** | [**`16-modul-superadmin-saas-platform.md`**](./16-modul-superadmin-saas-platform.md) | Portal Khusus Superadmin Bos Besar (Manajemen Tenant & Login As Owner) |
| **17** | [**`17-panduan-ui-ux-dan-design-system.md`**](./17-panduan-ui-ux-dan-design-system.md) | Master Design System Toss FinTech, Tabular Numerals & Anti-Slop Rules |
| **18** | [**`18-fitur-pelengkap-export-excel-wa-dan-backup.md`**](./18-fitur-pelengkap-export-excel-wa-dan-backup.md) | Export/Import PDF & Excel (.xlsx), Struk Digital WA & Backup Data |
| **19** | [**`19-integrasi-hardware-printer-thermal-bluetooth-usb.md`**](./19-integrasi-hardware-printer-thermal-bluetooth-usb.md) | Multi-Hardware Thermal Printer (Web Bluetooth, WebUSB & Browser Print) |
| **20** | [**`20-panduan-deployment-cloudflare-dan-cicd.md`**](./20-panduan-deployment-cloudflare-dan-cicd.md) | Panduan Deployment Cloudflare Pages, D1 Database Binding & CI/CD |
| **21** | [**`21-modul-audit-log-dan-activity-tracking.md`**](./21-modul-audit-log-dan-activity-tracking.md) | Audit Trail, Pelacak Void/Diskon Kasir & Forensik Pencegahan Fraud |
| **22** | [**`22-master-development-roadmap.md`**](./22-master-development-roadmap.md) | Master Development Roadmap Bertahap (Fase 0 - 10 & DoDs) |
| **23** | [**`23-master-skema-database-d1-drizzle.md`**](./23-master-skema-database-d1-drizzle.md) | Master Skema Database Drizzle ORM Lengkap (D1 SQLite Single Source) |
| **24** | [**`24-master-peta-rute-dan-url-aplikasi.md`**](./24-master-peta-rute-dan-url-aplikasi.md) | Master Peta Rute URL, Halaman, App Router & Matriks Akses RBAC |
| **INDEX**| [**`README.md`**](./README.md) | Katalog Master & Navigasi Terpusat Semua Modul SDD |

---

> Dikelola dan didokumentasikan oleh **Jule (주리)** untuk **Bos Besar Banget**. Seluruh implementasi tersinkronisasi penuh dengan standar enterprise! 🚀✨
