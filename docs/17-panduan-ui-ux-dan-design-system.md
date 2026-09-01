# 🎨 SDD 17: Panduan Desain UI/UX, Design System & Anti-Slop Guidelines (Master Design)

> **Design Read**: B2B SaaS POS & Mini-ERP Universal for Indonesian retail/wholesale merchants, in a Korean FinTech (Toss-Inspired) + Modern Retail UX style.  
> **Dials**: `ENERGY 2 (Balanced) / RHYTHM 2 (Consistent with Structural Breaks) / MOTION 1 (Fast & Purposeful)`

---

## 1. Filosofi Visual Utama (Non-Generic & Anti-Slop)

1. **Crafted for Speed & Clarity (Zero-Anxiety Finance)**:
   - Antarmuka kasir dan laporan keuangan didesain tanpa elemen dekoratif berlebihan (bebas dari glassmorphism berlebihan, glow neon, atau ilustrasi 3D blob generik).
   - Fokus 100% pada **kemudahan membaca angka keuangan (Tabular Numerals)**, kontras tinggi yang nyaman di mata kasir (*WCAG AA Compliant*), dan responsivitas instan.
2. **Karakter Visual: Modern Korean FinTech (Toss Aesthetics)**:
   - Memadukan ketegasan warna *Toss Cerulean Blue* (`#3182F6`) yang mencerminkan rasa aman & profesional dengan permukaan netral bersih (*Crisp Canvas `#FFFFFF` & Subdued Slate `#F2F4F6`*).
   - Aksen status fungsional: Hijau Kas Lunas (`#03B26C`), Oranye Piutang/Jatuh Tempo (`#FE9800`), dan Merah Peringatan (`#F04452`).

---

## 2. Palet Warna & Token Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PALET WARNA UTAMA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Primary (Toss Blue)  : #3182F6  (Hover: #2272EB, Subtle: #E8F3FF)           │
│ Secondary / Surface  : #F2F4F6  (Darker: #E5E8EB, Canvas: #FFFFFF)          │
│ Text Primary (Ink)   : #191F28  (High-Contrast Body & Header)              │
│ Text Muted (Slate)   : #6F7780  (Subtitle, Barcode, Keterangan Satuan)      │
│ Border Hairline      : #E5E8EB  (Hover: #D1D6DB)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                            WARNA STATUS FUNGSIONAL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Success (Lunas/Kas)  : #03B26C  (Light BG: #E6FAF2)                         │
│ Warning (Piutang/DP) : #FE9800  (Light BG: #FFF5E6)                         │
│ Danger (Void/Minus)  : #F04452  (Light BG: #FEECED)                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Komponen Reusable UI Suite & Pola Interaksi

Platform wajib menggunakan suite komponen seragam yang terpusat di `src/components/ui/*`:

### A. Modal & Dialog (`Modal.tsx` & `ConfirmModal.tsx`)
- **Portal Dom**: Menggunakan `createPortal(..., document.body)` untuk menjamin backdrop overlay menutupi 100% seluruh layar monitor browser (`z-[9999]`).
- **Animasi Transisi IN/OUT**:
  - Backdrop: `opacity 0 ➔ 1 (IN, 200ms)` dan `opacity 1 ➔ 0 (OUT, 150ms)`.
  - Konten Dialog: `scale 0.96 translateY(8px) ➔ scale 1 translateY(0) (IN)` dan sebaliknya `(OUT)`.
- **Dismissal Controls**: Tombol silang `X`, klik backdrop, atau menekan tombol keyboard `Escape`.

### B. Toast Notification (`toast.tsx`)
- **Portal Dom**: Di-portal ke `document.body` di pojok kanan bawah (`bottom-5 right-5 z-[99999]`).
- **Animasi Masuk & Keluar**: Meluncur halus `translateX(100%) ➔ 0` (Apple spring style) dan `translateX(0) ➔ 100%` saat ditutup.
- **Timeout Progress Bar**: Garis waktu tipis 2.5px di tepi bawah kartu (`absolute -bottom-[1px] -left-[1px] -right-[1px] rounded-b-xl`) yang menyusut dari 100% ke 0% tanpa menyisakan celah sudut putih.
- **Auto Punctuation**: Setiap pesan deskripsi otomatis diformat dengan tanda titik (`.`) resmi.

### C. Paginasi & Tabel Data (`pagination.tsx` & `data-table.tsx`)
- **Icon-Only Navigation**: `[ ‹ ] [ 1 / 5 ] [ › ]` tanpa teks berlebih yang memakan ruang.
- **Page Size Selector**: Dropdown minimalis `Tampilkan [ 10 ▾ ] dari 45 data`.

### D. Skeleton Shimmer Suite (`skeleton.tsx` & `loading.tsx`)
- Menggunakan efek gelombang kilau alami (`before:animate-[shimmer_1.5s_infinite]`).
- Menampilkan kerangka instan saat data server sedang di-streaming melalui Next.js 15 App Router `loading.tsx`.

---

## 4. Standar Layout & Penyelarasan Navigasi (Sidebar 28px Alignment)

- **Left Coordinate Consistency**:
  - Kontainer sidebar memiliki padding `p-3.5` (14px).
  - Tautan menu navigasi memiliki `px-3.5` (14px).
  - **Koordinat Icon Menu = 28px dari tepi kiri layar**.
  - Header logo brand (Mahkota `w-8 h-8`) dan avatar profil di footer wajib diselaraskan persis pada koordinat **28px** dari tepi kiri layar untuk menjaga garis visual (*vertical grid alignment*) yang sempurna.

---
> Dikelola dan didokumentasikan oleh **Jule (주리)** untuk **Bos Besar Banget**. ✨
