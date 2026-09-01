import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ==========================================
// 1. SUPERADMIN & PLATFORM LEVEL
// ==========================================
export const platformAdmins = sqliteTable('platform_admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('superadmin').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==========================================
// 2. TENANTS & USER MANAGEMENT (RBAC)
// ==========================================
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(), // cuid2 / nanoid
  name: text('name').notNull(),
  businessType: text('business_type').notNull(), // 'minimarket' | 'atk' | 'building' | 'gadget' | 'general'
  phone: text('phone'),
  address: text('address'),
  receiptHeader: text('receipt_header'),
  receiptFooter: text('receipt_footer').default('Terima kasih telah berbelanja'),
  subscriptionPlan: text('subscription_plan').default('starter').notNull(), // 'starter' | 'pro'
  subscriptionStatus: text('subscription_status').default('trial').notNull(), // 'trial' | 'active' | 'suspended' | 'expired'
  subscriptionExpiresAt: integer('subscription_expires_at', { mode: 'timestamp' }),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const outlets = sqliteTable('outlets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'Toko Utama', 'Cabang Pasar', 'Gudang'
  address: text('address'),
  phone: text('phone'),
  isMain: integer('is_main', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantIdx: index('outlet_tenant_idx').on(table.tenantId),
}));

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'cashier', 'superadmin'] }).default('cashier').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantUsernameIdx: uniqueIndex('user_tenant_username_idx').on(table.tenantId, table.username),
}));

// ==========================================
// ==========================================
// 3. MASTER PRODUK, MULTI-SATUAN & HARGA
// ==========================================
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
}, (table) => ({
  tenantIdx: index('category_tenant_idx').on(table.tenantId),
}));

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  barcode: text('barcode'),
  baseUnit: text('base_unit').default('pcs').notNull(), // 'pcs', 'kg', 'meter', 'lembar'
  costPrice: real('cost_price').default(0).notNull(), // HPP per base unit
  hasImei: integer('has_imei', { mode: 'boolean' }).default(false).notNull(),
  minStockAlert: real('min_stock_alert').default(5),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantBarcodeIdx: index('product_tenant_barcode_idx').on(table.tenantId, table.barcode),
  tenantActiveIdx: index('product_tenant_active_idx').on(table.tenantId, table.isActive),
  tenantCategoryIdx: index('product_tenant_category_idx').on(table.tenantId, table.categoryId),
}));

export const productUnits = sqliteTable('product_units', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  unitName: text('unit_name').notNull(), // 'dus', 'sak', 'pack', 'rol'
  conversionQty: real('conversion_qty').notNull(), // e.g., 1 dus = 24 base unit
  barcode: text('barcode'),
}, (table) => ({
  productIdx: index('product_units_product_idx').on(table.productId),
  tenantIdx: index('product_units_tenant_idx').on(table.tenantId),
}));

export const productPriceTiers = sqliteTable('product_price_tiers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productUnitId: text('product_unit_id').references(() => productUnits.id, { onDelete: 'cascade' }),
  tierName: text('tier_name').default('ecer').notNull(), // 'ecer' | 'grosir' | 'langganan'
  minQty: real('min_qty').default(1).notNull(),
  price: real('price').notNull(),
}, (table) => ({
  productIdx: index('price_tiers_product_idx').on(table.productId),
  tenantIdx: index('price_tiers_tenant_idx').on(table.tenantId),
}));

export const outletStock = sqliteTable('outlet_stock', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  currentStock: real('current_stock').default(0).notNull(), // stored in Base Unit
}, (table) => ({
  outletProductIdx: uniqueIndex('outlet_product_unique_idx').on(table.outletId, table.productId),
}));

// ==========================================
// 4. TRANSAKSI POS & PIUTANG PELANGGAN
// ==========================================
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  debtLimit: real('debt_limit').default(0).notNull(),
  currentDebt: real('current_debt').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantIdx: index('customer_tenant_idx').on(table.tenantId),
}));

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  userId: text('user_id').notNull().references(() => users.id),
  customerId: text('customer_id').references(() => customers.id),
  invoiceNo: text('invoice_no').notNull(),
  subtotal: real('subtotal').notNull(),
  discount: real('discount').default(0).notNull(),
  total: real('total').notNull(),
  paidAmount: real('paid_amount').notNull(),
  changeAmount: real('change_amount').default(0).notNull(),
  remainingDebt: real('remaining_debt').default(0).notNull(),
  paymentMethod: text('payment_method').default('CASH').notNull(), // 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBT' | 'DP'
  paymentStatus: text('payment_status').default('PAID').notNull(), // 'PAID' | 'PARTIAL' | 'UNPAID'
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantInvoiceIdx: uniqueIndex('transaction_tenant_invoice_idx').on(table.tenantId, table.invoiceNo),
  tenantCreatedIdx: index('transaction_tenant_created_idx').on(table.tenantId, table.createdAt),
  tenantOutletIdx: index('transaction_tenant_outlet_idx').on(table.tenantId, table.outletId),
}));

export const transactionItems = sqliteTable('transaction_items', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  unitName: text('unit_name').notNull(),
  conversionQty: real('conversion_qty').default(1).notNull(),
  qty: real('qty').notNull(),
  pricePerUnit: real('price_per_unit').notNull(),
  costPrice: real('cost_price').notNull(), // snapshot HPP saat transaksi
  subtotal: real('subtotal').notNull(),
  imeiList: text('imei_list'), // Serial/IMEI opsional
}, (table) => ({
  txIdx: index('tx_items_transaction_idx').on(table.transactionId),
  productIdx: index('tx_items_product_idx').on(table.productId),
}));

export const debtPayments = sqliteTable('debt_payments', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  userId: text('user_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').default('CASH').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantCustomerIdx: index('debt_payments_tenant_customer_idx').on(table.tenantId, table.customerId),
}));

// ==========================================
// 5. SUPPLIERS, RESTOCK & MUTASI STOK
// ==========================================
export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantIdx: index('supplier_tenant_idx').on(table.tenantId),
}));

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  poNumber: text('po_number').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').default('COMPLETED').notNull(), // 'DRAFT' | 'COMPLETED'
  receivedAt: integer('received_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantIdx: index('purchase_orders_tenant_idx').on(table.tenantId),
}));

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: text('id').primaryKey(),
  purchaseOrderId: text('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  unitName: text('unit_name').notNull(),
  conversionQty: real('conversion_qty').default(1).notNull(),
  qty: real('qty').notNull(),
  purchasePrice: real('purchase_price').notNull(),
  subtotal: real('subtotal').notNull(),
}, (table) => ({
  poIdx: index('po_items_po_idx').on(table.purchaseOrderId),
  productIdx: index('po_items_product_idx').on(table.productId),
}));

export const stockMutations = sqliteTable('stock_mutations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  productId: text('product_id').notNull().references(() => products.id),
  type: text('type').notNull(), // 'SALE' | 'PURCHASE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT'
  qtyChange: real('qty_change').notNull(), // base unit (+/-)
  stockBefore: real('stock_before').notNull(),
  stockAfter: real('stock_after').notNull(),
  referenceId: text('reference_id'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantProdCreatedIdx: index('stock_mut_tenant_prod_created_idx').on(table.tenantId, table.productId, table.createdAt),
  tenantOutletIdx: index('stock_mut_tenant_outlet_idx').on(table.tenantId, table.outletId),
}));

export const stockOpnames = sqliteTable('stock_opnames', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  userId: text('user_id').notNull().references(() => users.id),
  opnameNo: text('opname_no').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantIdx: index('stock_opnames_tenant_idx').on(table.tenantId),
}));

export const stockOpnameItems = sqliteTable('stock_opname_items', {
  id: text('id').primaryKey(),
  opnameId: text('opname_id').notNull().references(() => stockOpnames.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  systemStock: real('system_stock').notNull(),
  physicalStock: real('physical_stock').notNull(),
  differenceQty: real('difference_qty').notNull(),
  reason: text('reason').notNull(),
  notes: text('notes'),
}, (table) => ({
  opnameIdx: index('opname_items_opname_idx').on(table.opnameId),
  productIdx: index('opname_items_product_idx').on(table.productId),
}));


// ==========================================
// 6. SHIFT KASIR & ARUS KAS KEUANGAN
// ==========================================
export const cashShifts = sqliteTable('cash_shifts', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  userId: text('user_id').notNull().references(() => users.id),
  startingCash: real('starting_cash').notNull(), // Modal uang receh di laci
  expectedCash: real('expected_cash').default(0).notNull(), // Dihitung sistem
  actualCash: real('actual_cash'), // Diinput kasir saat tutup shift (Blind Count)
  discrepancy: real('discrepancy').default(0), // Selisih (actual - expected)
  status: text('status').default('OPEN').notNull(), // 'OPEN' | 'CLOSED'
  openedAt: integer('opened_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
}, (table) => ({
  tenantOutletStatusIdx: index('cash_shifts_tenant_outlet_status_idx').on(table.tenantId, table.outletId, table.status),
  tenantOpenedAtIdx: index('cash_shifts_tenant_opened_idx').on(table.tenantId, table.openedAt),
}));

export const cashFlows = sqliteTable('cash_flows', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  type: text('type').notNull(), // 'IN' (Pemasukan lain) | 'OUT' (Biaya Operasional)
  category: text('category').notNull(), // 'LISTRIK', 'GAJI', 'SEWA', 'MAKAN', 'LAIN'
  amount: real('amount').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantCreatedAtIdx: index('cash_flows_tenant_created_idx').on(table.tenantId, table.createdAt),
}));

// ==========================================
// 7. AUDIT LOG & AKTIVITAS SENSITIF
// ==========================================
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id'),
  userId: text('user_id').notNull().references(() => users.id),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(), // 'TRANSACTION_VOID', 'PRICE_OVERRIDE', 'STOCK_ADJUSTMENT'
  resourceType: text('resource_type').notNull(), // 'TRANSACTION', 'PRODUCT', 'CUSTOMER_DEBT'
  resourceId: text('resource_id'),
  oldData: text('old_data'),
  newData: text('new_data'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantCreatedAtIdx: index('audit_logs_tenant_created_idx').on(table.tenantId, table.createdAt),
  tenantActionIdx: index('audit_logs_tenant_action_idx').on(table.tenantId, table.action),
}));

// ==========================================
// 8. GLOBAL PLATFORM CONFIGURATION
// ==========================================
export const platformSettings = sqliteTable('platform_settings', {
  id: text('id').primaryKey().default('global'),
  starterPrice: real('starter_price').default(0).notNull(), // Trial Free
  proPrice: real('pro_price').default(99000).notNull(), // Pro 1 Toko
  ultraPrice: real('ultra_price').default(249000).notNull(), // Ultra Multi-Toko
  supportPhone: text('support_phone').default('6281234567890'),
  supportEmail: text('support_email').default('support@miegraine.id'),
  trialDays: integer('trial_days').default(7).notNull(),
  broadcastBanner: text('broadcast_banner').default(''),
  isBroadcastActive: integer('is_broadcast_active', { mode: 'boolean' }).default(false).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==========================================
// 9. PENGAJUAN TOKO BARU DARI OWNER (STORE REQUESTS)
// ==========================================
export const storeRequests = sqliteTable('store_requests', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ownerName: text('owner_name').notNull(),
  ownerUsername: text('owner_username').notNull(),
  ownerPhone: text('owner_phone'),
  storeName: text('store_name').notNull(),
  businessType: text('business_type').notNull(),
  requestedPlan: text('requested_plan').default('pro').notNull(), // 'starter' | 'pro' | 'ultra'
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes: text('admin_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  ownerIdx: index('store_requests_owner_idx').on(table.ownerId),
  statusIdx: index('store_requests_status_idx').on(table.status),
}));

// ==========================================
// 10. TRANSFER STOK ANTAR-CABANG (INTER-OUTLET TRANSFER)
// ==========================================
export const stockTransfers = sqliteTable('stock_transfers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  transferNo: text('transfer_no').notNull(),
  sourceOutletId: text('source_outlet_id').notNull().references(() => outlets.id),
  targetOutletId: text('target_outlet_id').notNull().references(() => outlets.id),
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  notes: text('notes'),
  createdById: text('created_by_id').notNull().references(() => users.id),
  receivedById: text('received_by_id').references(() => users.id),
  transferredAt: integer('transferred_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  receivedAt: integer('received_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantStatusIdx: index('transfers_tenant_status_idx').on(table.tenantId, table.status),
  tenantCreatedIdx: index('transfers_tenant_created_idx').on(table.tenantId, table.createdAt),
}));

export const stockTransferItems = sqliteTable('stock_transfer_items', {
  id: text('id').primaryKey(),
  transferId: text('transfer_id').notNull().references(() => stockTransfers.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: real('quantity').notNull(),
  unitName: text('unit_name').default('pcs').notNull(),
}, (table) => ({
  transferIdx: index('transfer_items_transfer_idx').on(table.transferId),
  productIdx: index('transfer_items_product_idx').on(table.productId),
}));

// ==========================================
// 11. PEMBELIAN BARANG MASUK / KULAKAN (PURCHASES)
// ==========================================
export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  supplierName: text('supplier_name').notNull(),
  invoiceNo: text('invoice_no').notNull(),
  purchaseDate: integer('purchase_date', { mode: 'timestamp' }).notNull(),
  totalAmount: real('total_amount').notNull(),
  paymentStatus: text('payment_status').default('PAID').notNull(), // 'PAID' | 'DUE' | 'PARTIAL'
  paymentMethod: text('payment_method').default('CASH').notNull(), // 'CASH' | 'TRANSFER' | 'TEMPO'
  paidAmount: real('paid_amount').default(0).notNull(),
  dueDays: integer('due_days').default(0).notNull(),
  notes: text('notes'),
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tenantDateIdx: index('purchases_tenant_date_idx').on(table.tenantId, table.purchaseDate),
  tenantOutletIdx: index('purchases_tenant_outlet_idx').on(table.tenantId, table.outletId),
}));

export const purchaseItems = sqliteTable('purchase_items', {
  id: text('id').primaryKey(),
  purchaseId: text('purchase_id').notNull().references(() => purchases.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
  batchNumber: text('batch_number'),
  expiredDate: integer('expired_date', { mode: 'timestamp' }),
}, (table) => ({
  purchaseIdx: index('purchase_items_purchase_idx').on(table.purchaseId),
  productIdx: index('purchase_items_product_idx').on(table.productId),
}));



