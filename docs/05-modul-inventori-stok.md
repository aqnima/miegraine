# 🏭 SDD 05: Modul Inventori, Pembelian & Kalkulasi HPP

Dokumen ini menjelaskan alur pencatatan barang masuk (pembelian dari supplier), kartu stok, penyesuaian stok opname, dan kalkulasi HPP Average (Harga Pokok Penjualan).

---

## 1. Fitur Kunci Manajemen Inventori

1. **Pembelian Barang Masuk (Restock Supplier)**:
   - Input faktur pembelian supplier: pilih supplier, pilih produk, pilih satuan beli (misal beli dalam `Dus` atau `Sak`), harga beli, dan kuantitas.
   - Stok fisik otomatis bertambah dikonversikan ke Satuan Dasar (`Base Unit`).
   - Kalkulasi otomatis **HPP Average Baru** (Moving Average Cost).
2. **Penyesuaian Stok (Stok Opname)**:
   - Pencocokan stok fisik nyata di toko/gudang dengan stok di aplikasi.
   - Pencatatan alasan selisih (*Barang Rusak, Hilang, Kadaluarsa, Salah Hitung*).
3. **Kartu Stok (Mutasi Stok Realtime)**:
   - Log jejak setiap penambahan/pengurangan: dari Penjualan POS, Pembelian Supplier, Retur, atau Stok Opname.
4. **Alert Stok Menipis (Low Stock Warning)**:
   - Notifikasi visual pada dashboard jika `currentStock <= minStockAlert`.

---

## 2. Skema Database Drizzle (D1 SQLite)

```typescript
// schema/inventory.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants, users } from './auth';
import { products } from './products';

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  supplierId: text('supplier_id').references(() => suppliers.id),
  userId: text('user_id').notNull().references(() => users.id),
  poNumber: text('po_number').notNull(), // Contoh: PO-20260829-001
  totalAmount: real('total_amount').notNull(),
  paymentStatus: text('payment_status').default('PAID').notNull(), // 'PAID' | 'UNPAID' (Hutang ke Supplier)
  notes: text('notes'),
  purchaseDate: integer('purchase_date', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: text('id').primaryKey(),
  purchaseOrderId: text('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  unitName: text('unit_name').notNull(),
  conversionQty: real('conversion_qty').default(1).notNull(),
  qty: real('qty').notNull(),
  costPerUnit: real('cost_per_unit').notNull(),
  subtotal: real('subtotal').notNull(),
});

export const stockMutations = sqliteTable('stock_mutations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'SALE' | 'PURCHASE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'
  referenceId: text('reference_id'), // ID transaksi penjualan atau ID PO
  qtyChange: real('qty_change').notNull(), // +10 atau -5 (dalam base unit)
  stockAfter: real('stock_after').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

---

## 3. Rumus Kalkulasi Moving Average HPP (Cost Price)

Saat terjadi pembelian barang baru:

$$\text{HPP Baru} = \frac{(\text{Stok Lama} \times \text{HPP Lama}) + (\text{Qty Masuk (Base Unit)} \times \text{Harga Beli per Base Unit})}{\text{Stok Lama} + \text{Qty Masuk (Base Unit)}}$$

Contoh:
* Stok Lama Cat: 10 Kaleng @ Rp 100.000 (Total = Rp 1.000.000).
* Beli Baru: 10 Kaleng @ Rp 120.000 (Total = Rp 1.200.000).
* HPP Rata-Rata Baru = (1.000.000 + 1.200.000) / 20 = **Rp 110.000 / Kaleng**.
* Nilai HPP ini langsung dipakai di kasir untuk menghitung keuntungan bersih tiap transaksi secara otomatis!
