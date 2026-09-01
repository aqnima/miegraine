export interface BusinessPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultUnits: Array<{ name: string; isBase: boolean; conversion?: number }>;
  defaultCategories: string[];
  receiptHeader: string;
  receiptFooter: string;
  features: {
    hasImei: boolean;
    multiUnitDefault: boolean;
    hasGrosir: boolean;
    hasDownPayment: boolean;
    hasTableNo?: boolean;
    hasExpiredDate?: boolean;
    hasServiceItem?: boolean;
  };
}

export const BUSINESS_PRESETS: Record<string, BusinessPreset> = {
  minimarket: {
    id: 'minimarket',
    name: 'Minimarket & Sembako',
    icon: 'ShoppingCart',
    description: 'Fokus scan barcode cepat, uang pas tunai, dan varian renceng/dus.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'pack', isBase: false, conversion: 10 },
      { name: 'renceng', isBase: false, conversion: 12 },
      { name: 'dus', isBase: false, conversion: 24 },
    ],
    defaultCategories: ['Makanan & Minuman', 'Sembako', 'Kebutuhan Rumah', 'Rokok & Tembakau', 'Snack'],
    receiptHeader: 'MINIMARKET SEGAR JAYA',
    receiptFooter: 'Terima kasih atas kunjungan Anda. Barang yang dibeli tidak dapat ditukar.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: false,
    },
  },
  fnb: {
    id: 'fnb',
    name: 'F&B, Kafe & Resto',
    icon: 'Coffee',
    description: 'Order pesanan cepat, nomor meja (Dine-in / Takeaway), dan cetak tiket dapur.',
    defaultUnits: [
      { name: 'porsi', isBase: true },
      { name: 'cup', isBase: true },
      { name: 'gelas', isBase: true },
      { name: 'paket', isBase: true },
    ],
    defaultCategories: ['Kopi & Minuman', 'Makanan Utama', 'Camilan & Snack', 'Topping & Ekstra', 'Paket Hemat'],
    receiptHeader: 'KAFE RASA NUSANTARA',
    receiptFooter: 'Terima kasih telah bersantap bersama kami. Selamat menikmati!',
    features: {
      hasImei: false,
      multiUnitDefault: false,
      hasGrosir: false,
      hasDownPayment: false,
      hasTableNo: true,
    },
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Apotek & Toko Obat',
    icon: 'Pill',
    description: 'Tracking tanggal kedaluwarsa (ED), nomor batch, dan resep dokter.',
    defaultUnits: [
      { name: 'tablet', isBase: true },
      { name: 'strip', isBase: false, conversion: 10 },
      { name: 'botol', isBase: true },
      { name: 'box', isBase: false, conversion: 100 },
      { name: 'tube', isBase: true },
    ],
    defaultCategories: ['Obat Bebas', 'Obat Keras / Resep', 'Vitamin & Suplemen', 'Alat Kesehatan', 'Perawatan Tubuh'],
    receiptHeader: 'APOTEK SEHAT SEJAHTERA',
    receiptFooter: 'Semoga lekas sembuh. Obat yang sudah dibeli tidak dapat ditukar.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: false,
      hasDownPayment: false,
      hasExpiredDate: true,
    },
  },
  workshop: {
    id: 'workshop',
    name: 'Bengkel & Servis Kendaraan',
    icon: 'Wrench',
    description: 'Kombinasi sparepart fisik, jasa/ongkos montir, dan nomor plat kendaraan.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'jasa', isBase: true },
      { name: 'botol', isBase: true },
      { name: 'set', isBase: true },
      { name: 'liter', isBase: true },
    ],
    defaultCategories: ['Oli & Pelumas', 'Sparepart Motor', 'Ban & Velg', 'Jasa Servis & Tuneup', 'Aksesoris'],
    receiptHeader: 'BENGKEL MOTOR PRESISI',
    receiptFooter: 'Garansi servis berlaku 7 hari. Simpan nota ini untuk klaim garansi.',
    features: {
      hasImei: false,
      multiUnitDefault: false,
      hasGrosir: false,
      hasDownPayment: true,
      hasServiceItem: true,
    },
  },
  fashion: {
    id: 'fashion',
    name: 'Fashion & Butik Pakaian',
    icon: 'Shirt',
    description: 'Varian ukuran (S/M/L/XL) & warna, diskon musiman, dan cetak label barcode.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'lusin', isBase: false, conversion: 12 },
      { name: 'set', isBase: true },
      { name: 'pasang', isBase: true },
    ],
    defaultCategories: ['Atasan & Kaos', 'Kemeja & Blouse', 'Celana & Rok', 'Dress & Gamis', 'Hijab & Aksesoris', 'Sepatu & Sandal'],
    receiptHeader: 'BUTIK MODIS ELEGAN',
    receiptFooter: 'Penukaran ukuran maksimal 3 hari dengan nota dan label masih utuh.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: false,
    },
  },
  building: {
    id: 'building',
    name: 'Toko Bangunan & Material',
    icon: 'Hammer',
    description: 'Satuan sak/kg/batang, cetak invoice faktur/surat jalan, dan bayar DP bon.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'kg', isBase: true },
      { name: 'meter', isBase: true },
      { name: 'sak', isBase: false, conversion: 50 },
      { name: 'batang', isBase: false, conversion: 6 },
      { name: 'dus', isBase: false, conversion: 1 },
    ],
    defaultCategories: ['Semen & Mortar', 'Cat & Thinner', 'Besi & Baja', 'Pipa & Sanitasi', 'Alat Tukang', 'Paku & Baut'],
    receiptHeader: 'TB MAKMUR JAYA SENTOSA',
    receiptFooter: 'Barang yang sudah dikirim harap diperiksa langsung. Faktur ini sah.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: true,
    },
  },
  atk: {
    id: 'atk',
    name: 'Toko ATK & Fotokopi',
    icon: 'BookOpen',
    description: 'Multi-satuan bertingkat (pcs -> lusin -> rim -> dus) dan harga grosir.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'pack', isBase: false, conversion: 10 },
      { name: 'lusin', isBase: false, conversion: 12 },
      { name: 'rim', isBase: false, conversion: 500 },
      { name: 'dus', isBase: false, conversion: 5 },
    ],
    defaultCategories: ['Kertas & Buku', 'Alat Tulis', 'Binder & Map', 'Peralatan Kantor', 'Peralatan Seni'],
    receiptHeader: 'TOKO ATK MITRA UTAMA',
    receiptFooter: 'Melayani grosir & eceran perlengkapan kantor & sekolah.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: false,
    },
  },
  gadget: {
    id: 'gadget',
    name: 'Toko HP & Gadget',
    icon: 'Smartphone',
    description: 'Pencatatan nomor IMEI/Serial, kartu garansi, dan aksesoris HP.',
    defaultUnits: [
      { name: 'unit', isBase: true },
      { name: 'pcs', isBase: true },
      { name: 'box', isBase: false, conversion: 1 },
    ],
    defaultCategories: ['Smartphone', 'Tablet', 'Aksesoris HP', 'Powerbank & Charger', 'Audio & TWS', 'Sparepart'],
    receiptHeader: 'GADGET CORNER CELL',
    receiptFooter: 'Garansi resmi berlaku sesuai ketentuan distributor. Simpan nota ini untuk klaim.',
    features: {
      hasImei: true,
      multiUnitDefault: false,
      hasGrosir: false,
      hasDownPayment: true,
    },
  },
  electrical: {
    id: 'electrical',
    name: 'Toko Listrik & Teknik',
    icon: 'Zap',
    description: 'Konversi meter ke rol kabel, fitting lampu, dan harga teknisi.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'meter', isBase: true },
      { name: 'rol', isBase: false, conversion: 100 },
      { name: 'set', isBase: true },
    ],
    defaultCategories: ['Kabel Listrik', 'Lampu & Bohlam', 'Saklar & Stopkontak', 'MCB & Panel', 'Pipa Listrik'],
    receiptHeader: 'LISTRIK JAYA ABADI',
    receiptFooter: 'Lampu bergaransi wajib menyertakan dus asli dan nota ini.',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: false,
    },
  },
  general: {
    id: 'general',
    name: 'Ritel Umum & Serba Ada',
    icon: 'Store',
    description: 'Fleksibel untuk segala jenis toko kelontong, pakaian, pakan, atau hobi.',
    defaultUnits: [
      { name: 'pcs', isBase: true },
      { name: 'pack', isBase: false, conversion: 10 },
      { name: 'dus', isBase: false, conversion: 24 },
    ],
    defaultCategories: ['Umum', 'Produk Unggulan', 'Promo'],
    receiptHeader: 'TOKO SERBA ADA',
    receiptFooter: 'Terima kasih telah berbelanja di toko kami!',
    features: {
      hasImei: false,
      multiUnitDefault: true,
      hasGrosir: true,
      hasDownPayment: true,
    },
  },
};

export function getAllPresets(): BusinessPreset[] {
  return Object.values(BUSINESS_PRESETS);
}
