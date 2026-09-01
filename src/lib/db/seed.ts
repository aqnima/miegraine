import { db } from './index';
import { tenants, users, outlets, categories, products, productUnits, productPriceTiers, outletStock, stockMutations, customers } from './schema';
import { hashPassword } from '../auth/password';
import { createId } from '@paralleldrive/cuid2';

export async function seedDemoData() {
  console.log('Seeding demo data for Miegraine...');

  const tenantId = 'demo-tenant-01';
  const outletId = 'demo-outlet-01';
  const ownerId = 'demo-user-owner';
  const adminId = 'demo-user-admin';
  const cashierId = 'demo-user-cashier';
  const superadminId = 'demo-user-superadmin';

  const defaultPassword = await hashPassword('admin123');
  const staffPassword = await hashPassword('123456');
  const superadminPassword = await hashPassword('superadmin123');

  // 1. Check or Insert Demo Tenant
  try {
    await db.insert(tenants).values({
      id: tenantId,
      name: 'Toko Sumber Rejeki (Demo)',
      businessType: 'minimarket',
      phone: '081234567890',
      address: 'Jl. Merdeka Raya No. 88, Jakarta',
      receiptHeader: 'TOKO SUMBER REJEKI',
      receiptFooter: 'Terima kasih atas kunjungan Anda. Simpan struk ini sebagai bukti pembelian sah.',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
    }).onConflictDoNothing();

    // 2. Outlet
    await db.insert(outlets).values({
      id: outletId,
      tenantId,
      name: 'Toko Utama',
      address: 'Jl. Merdeka Raya No. 88, Jakarta',
      phone: '081234567890',
      isMain: true,
    }).onConflictDoNothing();

    // 3. Users (Owner, Admin, Cashier, Superadmin)
    await db.insert(users).values([
      {
        id: ownerId,
        tenantId,
        outletId,
        name: 'Bos Besar (Owner)',
        username: 'owner',
        passwordHash: defaultPassword,
        role: 'owner',
        isActive: true,
      },
      {
        id: adminId,
        tenantId,
        outletId,
        name: 'Budi (Admin Cabang)',
        username: 'admin',
        passwordHash: staffPassword,
        role: 'admin',
        isActive: true,
      },
      {
        id: cashierId,
        tenantId,
        outletId,
        name: 'Siti (Kasir POS)',
        username: 'kasir',
        passwordHash: staffPassword,
        role: 'cashier',
        isActive: true,
      },
      {
        id: superadminId,
        tenantId,
        outletId,
        name: 'Superadmin',
        username: 'superadmin',
        passwordHash: superadminPassword,
        role: 'superadmin',
        isActive: true,
      },
    ]).onConflictDoNothing();

    // 4. Categories
    const catMakananId = 'cat-makanan-01';
    const catMinumanId = 'cat-minuman-01';
    const catSembakoId = 'cat-sembako-01';

    await db.insert(categories).values([
      { id: catMakananId, tenantId, name: 'Makanan & Snack' },
      { id: catMinumanId, tenantId, name: 'Minuman' },
      { id: catSembakoId, tenantId, name: 'Sembako & Bahan Pokok' },
    ]).onConflictDoNothing();

    // 5. Sample Products with Multi-Satuan & Stock
    const p1 = createId();
    const p1Unit = createId();
    await db.insert(products).values({
      id: p1,
      tenantId,
      name: 'Indomie Goreng Original 85g',
      barcode: '899886620011',
      categoryId: catMakananId,
      baseUnit: 'pcs',
      costPrice: 2800,
      minStockAlert: 20,
      isActive: true,
    }).onConflictDoNothing();

    await db.insert(productUnits).values({
      id: p1Unit,
      tenantId,
      productId: p1,
      unitName: 'dus',
      conversionQty: 40,
    }).onConflictDoNothing();

    await db.insert(productPriceTiers).values([
      { id: createId(), tenantId, productId: p1, productUnitId: null, tierName: 'ecer', minQty: 1, price: 3500 },
      { id: createId(), tenantId, productId: p1, productUnitId: null, tierName: 'grosir', minQty: 10, price: 3200 },
      { id: createId(), tenantId, productId: p1, productUnitId: p1Unit, tierName: 'ecer', minQty: 1, price: 125000 },
    ]).onConflictDoNothing();

    await db.insert(outletStock).values({
      id: createId(),
      tenantId,
      outletId,
      productId: p1,
      currentStock: 200,
    }).onConflictDoNothing();

    // Product 2: Minyak Goreng
    const p2 = createId();
    await db.insert(products).values({
      id: p2,
      tenantId,
      name: 'Minyak Goreng Bimoli 2 Liter',
      barcode: '899886620022',
      categoryId: catSembakoId,
      baseUnit: 'pouch',
      costPrice: 32000,
      minStockAlert: 10,
      isActive: true,
    }).onConflictDoNothing();

    await db.insert(productPriceTiers).values([
      { id: createId(), tenantId, productId: p2, productUnitId: null, tierName: 'ecer', minQty: 1, price: 38000 },
    ]).onConflictDoNothing();

    await db.insert(outletStock).values({
      id: createId(),
      tenantId,
      outletId,
      productId: p2,
      currentStock: 50,
    }).onConflictDoNothing();

    // 6. Customers
    await db.insert(customers).values({
      id: createId(),
      tenantId,
      name: 'Pak Haji Rohmat',
      phone: '081299887766',
      debtLimit: 2000000,
      currentDebt: 450000,
    }).onConflictDoNothing();

    await db.insert(customers).values({
      id: createId(),
      tenantId,
      name: 'Ibu Warung Dewi',
      phone: '085711223344',
      debtLimit: 5000000,
      currentDebt: 1200000,
    }).onConflictDoNothing();

    console.log('Demo seed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}
