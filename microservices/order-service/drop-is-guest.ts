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
  console.log('Connected');

  try {
    await client.query(`ALTER TABLE orders DROP COLUMN IF EXISTS is_guest`);
    console.log('✓ Dropped is_guest column');
  } catch (err: any) {
    console.error('✗ Error:', err.message);
  }

  await client.end();
}

run().catch(console.error);
