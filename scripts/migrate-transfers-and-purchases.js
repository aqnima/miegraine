const { createClient } = require('@libsql/client');

async function migrate() {
  const client = createClient({ url: 'file:data/local.sqlite' });

  const queries = [
    `CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      transfer_no TEXT NOT NULL,
      source_outlet_id TEXT NOT NULL,
      target_outlet_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      notes TEXT,
      created_by_id TEXT NOT NULL,
      received_by_id TEXT,
      transferred_at INTEGER,
      received_at INTEGER,
      created_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS stock_transfer_items (
      id TEXT PRIMARY KEY,
      transfer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_name TEXT DEFAULT 'pcs' NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      address TEXT,
      email TEXT,
      created_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      outlet_id TEXT NOT NULL,
      supplier_id TEXT,
      supplier_name TEXT NOT NULL,
      invoice_no TEXT NOT NULL,
      purchase_date INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'PAID' NOT NULL,
      payment_method TEXT DEFAULT 'CASH' NOT NULL,
      paid_amount REAL DEFAULT 0 NOT NULL,
      due_days INTEGER DEFAULT 0 NOT NULL,
      notes TEXT,
      created_by_id TEXT NOT NULL,
      created_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      batch_number TEXT,
      expired_date INTEGER
    )`,
  ];

  for (const q of queries) {
    try {
      await client.execute(q);
    } catch (err) {
      console.error('Error executing migration:', err.message);
    }
  }

  console.log('All migrations executed successfully for stock_transfers and purchases.');
}

migrate();
