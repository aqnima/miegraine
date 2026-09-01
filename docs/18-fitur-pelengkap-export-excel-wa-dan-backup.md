# 💡 SDD 18: Fitur Pelengkap Esensial (Export PDF & Excel, Struk WA & Backup Data)

Dokumen ini melengkapi sistem dengan **5 Fitur "Killer" Bernilai Tinggi** yang sangat disukai dan dibutuhkan oleh pemilik toko ritel di Indonesia.

---

## 1. 5 Fitur Pelengkap Bernilai Tinggi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5 FITUR PELENGKAP PILIHAN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Export PDF & Excel (.xlsx)     │ Cetak Invoice/Laporan PDF & Spreadsheet  │
│ 2. Kirim Nota Digital via WhatsApp│ Hemat kertas struk, 1-klik kirim ke WA   │
│ 3. Cetak Label Barcode & Rak      │ Buat barcode stiker untuk barang non-kode│
│ 4. Pengaturan Header/Footer Struk │ Custom nama toko, alamat, logo & medsos  │
│ 5. Backup & Restore Data Toko     │ Keamanan ekstra untuk pemilik toko       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Fitur & Alur Kerja

### 1. 📄 Fitur Export PDF & Excel (.xlsx)

#### A. Export Format PDF (Siap Cetak & Resmi):
* **Faktur Penjualan & Surat Jalan (Delivery Order)**: Format rapi ukuran A4/A5 untuk Toko Bangunan, ATK, dan Grosir (lengkap dengan logo toko, tanda tangan penerima/pengirim, dan rincian satuan).
* **Laporan Finansial Bulanan**: Laporan Laba/Rugi, Rekap Penjualan, dan Kartu Stok siap kirim ke pemilik/investor.
* **Kuitansi Pembayaran Piutang**: Bukti pelunasan bon pelanggan dengan stempel lunas.

#### B. Fitur Bulk Import & Export Excel (.xlsx / .csv):
* **Alur Bulk Import Produk (Multi-Satuan & Stok Awal)**:
  1. Owner mengunduh template Excel resmi: `Template_Import_Produk.xlsx`.
  2. Mengisi kolom: `Barcode`, `Nama Barang`, `Kategori`, `Satuan Dasar (pcs/sak)`, `Satuan Bertingkat (dus/pack)`, `Rasio Konversi (24)`, `Harga Beli (HPP)`, `Harga Jual Ecer`, `Harga Jual Grosir`, dan `Stok Awal`.
  3. Upload file Excel ke aplikasi.
  4. **Smart Validation & Preview Screen**:
     - Sistem memvalidasi seluruh baris data (deteksi otomatis jika ada barcode ganda atau harga minus).
     - Menampilkan pratinjau data valid vs data error sebelum dimasukkan ke database.
  5. Klik **"Simpan & Terapkan"** ➔ Ratusan hingga ribuan produk masuk ke katalog dan stok fisik langsung aktif dalam 3 detik!
* **Bulk Import Pelanggan & Hutang Lama**:
  - Memudahkan toko yang baru migrasi untuk mengimpor daftar langganan beserta sisa saldo bon/piutang lama mereka.
* **Bulk Export Data**:
  - Export Master Produk, Riwayat Transaksi per Kasir, dan Buku Piutang ke `.xlsx`.

---

### 2. 📲 Kirim Nota Digital Langsung ke WhatsApp Pembeli
* **Alur**:
  - Setelah kasir menekan tombol bayar, selain opsi *"Cetak Struk Thermal"*, ada tombol **`[ 📲 Kirim Nota via WA ]`**.
  - Kasir memasukkan nomor WA pembeli (atau otomatis terisi jika pelanggan sudah terdaftar).
  - Sistem membuat format pesan rapi:
    ```text
    *NOTA TRANSAKSI - TB SUMBER JAYA*
    No: INV-20260829-0001
    Tanggal: 29/08/2026 13:25

    - Semen Gresik (2 Sak) : Rp 130.000
    - Paku 5cm (1 Kg)       : Rp 18.000
    -----------------------------------
    Total     : Rp 148.000
    Bayar     : Rp 150.000 (Tunai)
    Kembalian : Rp 2.000

    Terima kasih telah berbelanja!
    ```

---

### 3. 🏷️ Generator & Cetak Label Barcode
* Untuk barang-barang yang tidak memiliki barcode dari pabrik (seperti paku kiloan, baut, kabel eceran, makanan curah):
  - Sistem otomatis membuatkan kode barcode internal unik (format Code-128).
  - Owner dapat mencetak lembaran stiker barcode siap tempel menggunakan printer biasa atau printer thermal label.

---

### 4. ⚙️ Kustomisasi Format Struk Belanja
* Owner dapat mengatur:
  - Teks Header: Nama Toko, Alamat, No. Telp / WhatsApp, Akun Instagram.
  - Teks Footer: Pesan terima kasih, ketentuan retur (*"Barang yang sudah dibeli dapat ditukar maksimal 2 hari dengan membawa nota"*).
  - Pilihan ukuran kertas: **58mm** (mini portabel) atau **80mm** (standar kasir).

---

### 5. 💾 Backup & Export Riwayat Finansial Toko
* Owner dapat mengunduh seluruh arsip data transaksinya dalam bentuk file `.json` terenkripsi atau spreadsheet `.xlsx` bulanan, memberikan rasa tenang dan kontrol penuh atas data bisnis mereka.
