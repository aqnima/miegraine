# 🎯 SDD 09: Onboarding Preset & Smart-Toggle Fitur

Dokumen ini menjelaskan bagaimana sistem menyesuaikan diri dengan jenis toko yang dipilih oleh Owner saat pendaftaran, serta bagaimana fleksibilitas fitur diatur agar kasir tidak terbebani alur yang tidak perlu.

---

## 1. Alur Pemilihan Jenis Toko (Smart Onboarding)

Saat Pemilik Bisnis (Owner) pertama kali mendaftar akun SaaS:

```
[ Pendaftaran SaaS Toko Baru ]
─────────────────────────────────────────────────────────────────────────────
1. Nama Toko      : [ TB Makmur Jaya                     ]
2. Jenis Usaha    : [ 🧱 Toko Bangunan & Material     ▾ ]
                    ├── 🛒 Minimarket / Sembako
                    ├── 📚 Toko ATK & Fotokopi
                    ├── 🧱 Toko Bangunan & Material   <-- Dipilih
                    ├── 📱 Toko HP & Gadget
                    ├── ⚡ Toko Listrik & Teknik
                    └── 🏪 Ritel Umum / Lainnya
─────────────────────────────────────────────────────────────────────────────
```

### Apa yang Terjadi di Balik Layar Saat Jenis Usaha Dipilih?
Sistem secara otomatis mengaktifkan **Preset & Konfigurasi Bawaan**:

| Jenis Usaha yang Dipilih | Preset Satuan Awal | Fitur yang Otomatis Aktif di POS | Template Struk Default |
| :--- | :--- | :--- | :--- |
| **Minimarket / Sembako** | Pcs, Pack, Renceng, Dus | Fast Barcode Scan, Tombol Uang Pas | Thermal 58mm |
| **Toko ATK** | Pcs, Lusin, Rim, Box, Dus | Multi-Satuan Bertingkat, Grosir Qty | Thermal 80mm |
| **Toko Bangunan** | Pcs, Sak, Batang, Meter, Kg | Mode DP & Piutang Bon, Input Kuantitas Desimal | Invoice A4 & Thermal 80mm |
| **Toko HP & Gadget** | Unit, Pcs, Box | Kolom Input IMEI/SN, Masa Garansi | Thermal 80mm + Info Garansi |
| **Toko Listrik** | Pcs, Meter, Rol, Set | Konversi Meter ke Rol, Harga Rekanan Teknisi | Thermal 80mm |

---

## 2. Pengalaman Kasir saat Melayani Pembeli (Tanpa Ribet)

Kasir **TIDAK PERLU memilih jenis toko lagi saat melayani pembeli**:
* Kasir sudah otomatis masuk ke toko cabangnya.
* Kasir hanya melakukan 3 langkah cepat:
  1. **Scan / Pilih Barang** (Produk langsung masuk keranjang).
  2. **Pilih Satuan jika bukan Pcs** (Dropdown Pcs/Dus/Sak jika ada).
  3. **Pilih Metode Bayar** (Lunas / DP / Piutang Bon) ➔ Cetak Struk!

---

## 3. Fleksibilitas "Smart Toggle" per Produk (Toko Campuran)

Bagaimana jika satu toko menjual barang campuran (misal: Toko Kelontong yang juga jual pulsa dan semen)?

Owner/Admin dapat mengaktifkan fitur secara spesifik pada saat input Master Produk:
* `[x] Aktifkan Multi-Satuan` (untuk barang yang punya dus/sak/meter).
* `[x] Wajib Input IMEI / Serial Number` (khusus barang elektronik/HP).
* `[x] Aktifkan Tier Harga Grosir` (khusus barang yang ada diskon kuantitas).

Dengan cara ini, produk sederhana seperti permen/snack tetap diproses secara instan (1 klik), sedangkan produk semen/HP memiliki opsi tambahan tanpa memperlambat transaksi kasir secara umum!
