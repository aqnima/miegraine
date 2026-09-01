const { createClient } = require('@libsql/client');

async function migrate() {
  const client = createClient({ url: 'file:data/local.sqlite' });
  
  try {
    await client.execute('ALTER TABLE platform_settings ADD COLUMN ultra_price REAL DEFAULT 249000');
    console.log('Successfully added ultra_price column to platform_settings');
  } catch (err) {
    console.log('ultra_price column status:', err.message);
  }

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS store_requests (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        owner_username TEXT NOT NULL,
        owner_phone TEXT,
        store_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        requested_plan TEXT DEFAULT 'pro' NOT NULL,
        status TEXT DEFAULT 'PENDING' NOT NULL,
        admin_notes TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `);
    console.log('Successfully created store_requests table');
  } catch (err) {
    console.log('store_requests table status:', err.message);
  }
}

migrate();
