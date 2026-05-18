import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

function loadEnv(envPath: string) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

async function inspect(label: string, env: Record<string, string>, tables: string[]) {
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`\n=== ${label} ===`);

  for (const table of tables) {
    try {
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.log(`\n${table} (${cols.rowCount} cols):`);
      for (const c of cols.rows) {
        console.log(`  ${c.column_name} ${c.data_type} null=${c.is_nullable} default=${c.column_default ?? '-'}`);
      }
    } catch (err: any) {
      console.log(`\n${table}: ERROR - ${err.message}`);
    }
  }

  await client.end();
}

async function main() {
  await inspect('inventory-service DB', loadEnv(path.resolve(__dirname, '../inventory-service/.env')), ['inventory_items', 'inventory_transactions']);
  await inspect('cart-service DB', loadEnv(path.resolve(__dirname, '../cart-service/.env')), ['carts', 'cart_items']);
}

main().catch(console.error);
