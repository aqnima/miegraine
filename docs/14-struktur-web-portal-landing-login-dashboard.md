## 1. Peta Rute Web & Integrasi POS dalam Dashboard

Semua menu (termasuk POS Kasir) terintegrasi rapi dalam **1 Sistem Navigasi Dashboard Terpadu**, dengan dukungan **Mode Layar Penuh (Kiosk Mode)** untuk meja kasir:

```
app/
├── (public)                     # Area Publik (Marketing SaaS)
│   ├── page.tsx                 # 🚀 Modern Landing Page SaaS
│   ├── pricing/page.tsx         # Paket Langganan SaaS
│   ├── (auth)/
│   │   ├── login/page.tsx       # 🔑 Login Username & Password
│   │   └── register/page.tsx    # 📝 Registrasi SaaS & Pilih Tipe Toko
│
└── (dashboard)                  # Area Terpadu Dashboard & POS (/dashboard/*)
    ├── dashboard/
    │   ├── page.tsx             # 📊 Executive Live Dashboard (Omzet, Profit, Multi-Branch)
    │   ├── pos/page.tsx         # 🛒 Layar POS Kasir Terintegrasi (Dapat di-toggle Fullscreen)
    │   ├── products/page.tsx    # 📦 Master Produk, Satuan Bertingkat & Tier Harga
    │   ├── inventory/
    │   │   ├── restock/page.tsx # 🚚 Barang Masuk Supplier (Restock & HPP)
    │   │   └── opname/page.tsx  # 📋 Stok Opname & Kartu Mutasi Stok
    │   ├── debts/page.tsx       # 📑 Buku Piutang Pelanggan & Catatan Cicilan Bon
    │   ├── reports/
    │   │   ├── profit-loss/     # 📈 Laba/Rugi Bersih Otomatis & Cash Flow
    │   │   └── sales/page.tsx   # 🧾 Rekap Penjualan per Kasir / Cabang
    │   ├── outlets/page.tsx     # 🏢 Manajemen Toko Cabang & Transfer Stok
    │   ├── users/page.tsx       # 👥 Manajemen Karyawan (Owner, Admin, Kasir)
    │   └── settings/page.tsx    # ⚙️ Pengaturan Profil Toko & Format Struk
```

---

## 2. Bagaimana Pengalaman Pengguna (UX Rekomendasi)?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD TERPADU                                 │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  NAVBAR      │ [ 🛒 Layar Kasir POS ]  <- Menu Paling Atas di Sidebar       │
│  SIDEBAR     │ [ 📊 Ringkasan Omzet ]                                       │
│              │ [ 📦 Master Produk   ]                                       │
│  - Owner     │ [ 📑 Buku Piutang    ]                                       │
│  - Admin     │ [ 🚚 Stok & Supplier ]                                       │
│  - Kasir     │ [ 📈 Laporan Profit  ]                                       │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

1. **Untuk Owner & Admin**:
   - Menu **`🛒 Layar Kasir (POS)`** ditaruh di urutan paling atas sidebar.
   - Owner/Admin bisa sewaktu-waktu klik menu Kasir untuk melayani pembeli, lalu klik menu Laporan untuk cek omzet, semuanya dalam 1 klik tanpa login ulang!
2. **Tombol "Mode Kasir Penuh (Fullscreen / Kiosk)"**:
   - Saat berada di halaman Kasir POS, ada tombol `[ ⛶ Layar Penuh ]`.
   - Jika ditekan, sidebar dan navbar tersembunyi sementara agar layar monitor/tablet kasir 100% lega untuk scan barang.
3. **Untuk Kasir (Role: Cashier)**:
   - Kasir otomatis langsung terbuka di mode Kasir Penuh saat login, dan sidebar disesuaikan hanya menampilkan menu POS dan Tutup Shift.

---

## 2. Rincian Komponen Halaman

### A. Landing Page Publik (`/`)
* **Hero Section**: Headline memikat (*"Satu Aplikasi Kasir & Mini-ERP untuk Semua Jenis Toko — Minimarket, Bangunan, ATK, hingga Toko HP"*).
* **Interactive Business Tab**: Pengunjung web bisa mengklik tab (*Minimarket / Toko Bangunan / ATK / Toko HP*) untuk melihat simulasi fitur yang relevan secara visual.
* **Feature Grid**: Showcase Multi-Satuan (*Pcs -> Dus*), Mode Kasbon/DP, Pantau Banyak Cabang dari HP, dan Cetak Struk.
* **Pricing Calculator**: Pilihan paket langganan (Free Trial 14 Hari, Starter 1 Toko, Pro Multi-Cabang).
* **CTA Button**: *"Mulai Uji Coba Gratis Sekarang"*.

---

### B. Halaman Login & Registrasi (`/login` & `/register`)
* **`/login`**:
  - Input: **Username** & **Password**.
  - Logika: Setelah login sukses, jika akun adalah **Kasir** otomatis diarahkan ke `/pos`, jika **Owner/Admin** otomatis diarahkan ke `/dashboard`.
* **`/register`**:
  - Input: Nama Bisnis, Pilihan Tipe Toko, Username Owner, Password Owner.
  - Setelah daftar langsung masuk ke wizard inisialisasi outlet pertama.

---

### C. Layar POS Kasir (`/pos`)
* **Tampilan Fullscreen & Touch Friendly**:
  - Kiri: Katalog barang & tombol kategori cepat / barcode listener.
  - Kanan: Keranjang belanja interaktif dengan dropdown ganti satuan (*Pcs / Dus / Sak*) & pilihan metode bayar (*Lunas / DP / Bon*).

---

### D. Executive Dashboard (`/dashboard`)
* **Header**: Switcher Cabang (*"Semua Cabang"* vs *"Pilih Cabang A/B"*).
* **Kartu Metrik Live**: Total Omzet Hari Ini, Laba Kotor Realtime, Jumlah Transaksi, Kas Fisik di Laci, dan Total Piutang Belum Lunas.
* **Grafik Penjualan**: Tren omzet per jam dan daftar 5 produk terlaris hari ini.
