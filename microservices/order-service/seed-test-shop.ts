import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

function loadEnv(envPath: string) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const SELLER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const SHOP_ID   = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

async function main() {
  const env = loadEnv(path.resolve(__dirname, '../store-service/.env'));
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to store DB');

  await client.query(`
    INSERT INTO shops (id, seller_id, name, slug, status, commission_rate, created_at, updated_at)
    VALUES ($1, $2, 'Test Shop VN', 'test-shop-vn', 'approved', 0.10, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET name='Test Shop VN', status='approved'
  `, [SHOP_ID, SELLER_ID]);

  const shop = await client.query('SELECT id, seller_id, name, slug, status FROM shops WHERE id = $1', [SHOP_ID]);
  console.log('Shop:', JSON.stringify(shop.rows[0]));
  await client.end();
  console.log('Done');
}

main().catch(console.error);
