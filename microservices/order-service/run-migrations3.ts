import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const { Client } = pg;

async function run() {
  const client = new Client({
    host: process.env['DB_HOST'],
    port: Number(process.env['DB_PORT']),
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database');

  // Migration 3: Add shop_name_snapshot to shop_order_items
  try {
    await client.query(`
      ALTER TABLE shop_order_items
      ADD COLUMN IF NOT EXISTS shop_name_snapshot VARCHAR(255)
    `);
    console.log('✓ Migration 3: Added shop_name_snapshot to shop_order_items');
  } catch (err: any) {
    if (err.code === '42701') console.log('○ Migration 3: shop_name_snapshot already exists');
    else console.error('✗ Migration 3 error:', err.message);
  }

  await client.end();
  console.log('Done');
}

run().catch(console.error);
