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

  // Migration 1: Add columns to orders
  try {
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS order_number VARCHAR(32) UNIQUE,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(24) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS currency VARCHAR(8) DEFAULT 'VND',
      ADD COLUMN IF NOT EXISTS note VARCHAR(500),
      ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(500)
    `);
    console.log('✓ Migration 1: Added columns to orders');
  } catch (err: any) {
    if (err.code === '42701') console.log('○ Migration 1: Columns already exist (skipping)');
    else console.error('✗ Migration 1 error:', err.message);
  }

  // Migration 2: Add snapshot columns to shop_order_items
  try {
    await client.query(`
      ALTER TABLE shop_order_items
      ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255),
      ADD COLUMN IF NOT EXISTS variant_name_snapshot VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sku_snapshot VARCHAR(100),
      ADD COLUMN IF NOT EXISTS image_url_snapshot VARCHAR(500),
      ADD COLUMN IF NOT EXISTS shop_name_snapshot VARCHAR(255)
    `);
    console.log('✓ Migration 2: Added snapshot columns to shop_order_items');
  } catch (err: any) {
    if (err.code === '42701') console.log('○ Migration 2: Columns already exist (skipping)');
    else console.error('✗ Migration 2 error:', err.message);
  }

  await client.end();
  console.log('Done');
}

run().catch(console.error);
