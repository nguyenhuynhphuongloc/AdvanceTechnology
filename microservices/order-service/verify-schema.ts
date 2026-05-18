import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const { Client } = pg;

async function verify() {
  const client = new Client({
    host: process.env['DB_HOST'],
    port: Number(process.env['DB_PORT']),
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const tables = ['orders', 'shop_orders', 'shop_order_items'];
  for (const table of tables) {
    const r = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n=== ${table} ===`);
    console.log(JSON.stringify(r.rows, null, 2));
  }

  await client.end();
}

verify().catch(console.error);
