# 👑 SDD 16: Modul Superadmin & SaaS Platform Management Portal

Dokumen ini menjelaskan portal khusus untuk **Pemilik Platform SaaS (Bos Besar)** guna memantau, mengelola, mengaktifkan masa langganan, dan memberikan dukungan teknis kepada seluruh Toko/Owner yang menjadi klien SaaS.

---

## 1. Arsitektur Portal Superadmin (`/superadmin/*`)

```
src/app/superadmin/
├── layout.tsx                # 🏛️ Shell Superadmin (Sidebar 28px left-aligned & Top Navbar)
├── template.tsx              # 🎬 Page-to-Page Smooth Enter Transition
├── loading.tsx               # 뼈 Shimmer Skeleton Overview
├── page.tsx                  # 📊 Ringkasan Bisnis & Global MRR Analytics
├── tenants/
│   ├── page.tsx              # 🏬 Server Data Provider Kelola Toko Klien
│   ├── loading.tsx           # 뼈 Shimmer Skeleton Kelola Toko
│   └── tenants-client-view.tsx # ⚡ Client View (Search, Filter, Modal Tambah & Impersonasi)
├── billing/
│   ├── page.tsx              # 💳 Server Data Provider Tagihan & Keuangan
│   ├── loading.tsx           # 뼈 Shimmer Skeleton Tagihan
│   └── billing-client-view.tsx # ⚡ Client View (4 StatCard, Konfirmasi Pembayaran & Filter)
├── audit/
│   ├── page.tsx              # 🛡️ Server Data Provider Audit Logs Platform
│   ├── loading.tsx           # 뼈 Shimmer Skeleton Audit Logs
│   └── audit-client-view.tsx # ⚡ Client View (4 StatCard Metrik Keamanan & Tabel Log)
└── settings/
    ├── page.tsx              # ⚙️ Server Data Provider Pengaturan Platform
    ├── loading.tsx           # 뼈 Shimmer Skeleton Pengaturan
    └── settings-client-view.tsx # ⚡ Client View (Tarif/Trial, Kontak CS, Banner Broadcast)
```

---

## 2. Fitur-Fitur Kunci Superadmin (Khusus Bos Besar)

### 1. **Daftar Tenant & Kontrol Masa Berlangganan (Subscription Management)**
* Melihat seluruh toko terdaftar: Nama Toko, Tipe Usaha, Nama Owner, No. WhatsApp, Paket (*Trial / Starter / Pro*), Status (*Aktif / Suspended / Expired*), dan Tanggal Jatuh Tempo.
* **Aksi Cepat**:
  - Tombol **`+ Tambah Toko`** dengan modal form interaktif dan feedback toast.
  - Tombol **`Perpanjang (+30 Hari)`** masa aktif langganan.
  - Tombol **`Bekukan (Suspend)`** dan **`Buka Blokir (Activate)`** via dialog konfirmasi aman.
  - Tombol **`Hapus Toko`** dengan dialog konfirmasi berbahaya berstandar `ConfirmModal`.

### 2. **Fitur Impersonasi / "Login as Owner" (Customer Support 1-Klik)**
* Jika ada klien toko yang komplain atau minta bantuan teknis, Bos Besar tidak perlu meminta password mereka.
* Cukup klik tombol **`[ 🕵️ Masuk ]`** di portal Superadmin.
* Sistem langsung menyuntikkan session support (`impersonatedTenantId`), menampilkan banner atas **Mode Bantuan Aktif**, dan memungkinkan Bos Besar kembali ke Superadmin dengan 1-klik tombol **`[ Keluar Mode Bantuan ]`**.

### 3. **Global SaaS Analytics (Metrik Bisnis Bos Besar)**
* **Total Tenant Aktif**: Jumlah toko yang sedang berlangganan aktif.
* **Total Pendapatan Langganan (MRR)**: Estimasi pendapatan bulanan Bos Besar dari biaya langganan SaaS.
* **Total Transaksi Seluruh Toko (GMV)**: Total perputaran uang yang diproses sistem hari ini.
* **Tingkat Retensi / Pembayaran**: Persentase kelancaran pembayaran sewa SaaS.

### 4. **Broadcast Notifikasi Global & Pengaturan Tarif**
* Bos Besar dapat mengatur biaya langganan per bulan dan durasi uji coba (*trial*) toko baru.
* Menyimpan kontak WhatsApp & Email CS resmi platform.
* Menyiarkan pesan pengumuman (*Broadcast Banner*) yang otomatis tayang di dashboard seluruh klien toko.

---

## 3. Komponen Reusable UI Suite yang Digunakan

Seluruh halaman superadmin telah diselaraskan menggunakan komponen UI standar FinTech:
- **`Modal` & `ConfirmModal`**: Menggunakan `React.createPortal` langsung ke `document.body` untuk menutupi seluruh layar monitor secara merata (`z-[9999]`).
- **`ToastProvider` (`useToast`)**: Notifikasi melayang dengan transisi halus dan progress bar timeout full-width (`-bottom-[1px] -left-[1px] -right-[1px]`).
- **`Pagination`**: Paginasi ringkas icon-only `[ ‹ ] [ 1 / 5 ] [ › ]` dan pemilih baris `Tampilkan [ 10 ▾ ] dari X data`.
- **`StatCard` & `DataTable`**: Kartu metrik Bento interaktif dan tabel data seragam.
- **`Skeleton`**: Animasi shimmer otomatis saat proses perpindahan halaman via `loading.tsx`.

---
> Dikelola dan didokumentasikan oleh **Jule (주리)** untuk **Bos Besar Banget**. ✨
