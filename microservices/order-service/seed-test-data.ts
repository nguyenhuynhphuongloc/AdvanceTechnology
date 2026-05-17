/**
 * Seed test data cho Phase 5E checkout flow test.
 * Chạy: npx ts-node -r tsconfig-paths/register seed-test-data.ts
 */

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
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}

async function runQuery(label: string, env: Record<string, string>, sql: string, params: any[] = []) {
  const client = new pg.Client({
    host: env['DB_HOST'],
    port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'],
    password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`[${label}] Connected to ${env['DB_HOST']}`);

  try {
    await client.query(sql, params);
    console.log(`[${label}] OK`);
  } catch (err: any) {
    console.error(`[${label}] Error: ${err.message}`);
  }

  await client.end();
}

// ─── TEST IDs ────────────────────────────────────────────────────────────────
const SELLER_ID   = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const SHOP_ID     = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const BUYER_ID    = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const VARIANT_IDS = [
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
];
const CART_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1';

async function main() {
  console.log('=== Phase 5E Seed Test Data ===\n');

  // ── STORE SERVICE ──────────────────────────────────────────────────────────
  const storeEnv = loadEnv(path.resolve(__dirname, '../store-service/.env'));

  await runQuery('store:sellers', storeEnv, `
    INSERT INTO sellers (id, user_id, status, created_at, updated_at)
    VALUES ($1, $1, 'active', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET status = 'active'
  `, [SELLER_ID]);

  await runQuery('store:shops', storeEnv, `
    INSERT INTO shops (id, seller_id, name, slug, status, is_active, commission_rate, created_at, updated_at)
    VALUES ($1, $2, 'Test Shop VN', 'test-shop-vn', 'approved', true, 0.10, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET status = 'approved', is_active = true
  `, [SHOP_ID, SELLER_ID]);

  const shopCheck = await new pg.Client({
    host: storeEnv['DB_HOST'], port: Number(storeEnv['DB_PORT']),
    user: storeEnv['DB_USERNAME'], password: storeEnv['DB_PASSWORD'],
    database: storeEnv['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  }).connect().then(async c => {
    const r = await c.query('SELECT id, name, slug, status, is_active FROM shops WHERE id = $1', [SHOP_ID]);
    console.log('[store] Shop:', JSON.stringify(r.rows[0]));
    await c.end();
    return r.rows[0];
  });

  // ── INVENTORY SERVICE ─────────────────────────────────────────────────────
  const invEnv = loadEnv(path.resolve(__dirname, '../inventory-service/.env'));

  for (const vid of VARIANT_IDS) {
    await runQuery(`inventory:${vid.slice(-4)}`, invEnv, `
      INSERT INTO inventory_items (id, shop_id, variant_id, stock, reserved_stock, low_stock_threshold, created_at, updated_at)
      VALUES ($1, $2, $3, 100, 0, 10, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET stock = 100, reserved_stock = 0
    `, [vid, SHOP_ID, vid]);
  }

  // ── CART SERVICE ───────────────────────────────────────────────────────────
  const cartEnv = loadEnv(path.resolve(__dirname, '../cart-service/.env'));

  await runQuery('cart:carts', cartEnv, `
    INSERT INTO carts (id, user_id, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET user_id = $2, updated_at = NOW()
  `, [CART_ID, BUYER_ID]);

  for (let i = 0; i < VARIANT_IDS.length; i++) {
    const vid = VARIANT_IDS[i];
    const itemId = `ffffffff-ffff-ffff-ffff-fffffffff00${i+1}`;
    await runQuery(`cart:item${i+1}`, cartEnv, `
      INSERT INTO cart_items (id, cart_id, shop_id, product_id, variant_id,
        product_name_snapshot, variant_name_snapshot, sku_snapshot, image_url_snapshot,
        shop_name_snapshot, unit_price_snapshot, quantity, added_at, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,'Test Product ${i+1}','Variant ${i+1}','SKU-${i+1}','https://picsum.photos/200','Test Shop VN',${50000*(i+1)},${i+1},NOW(),NOW(),NOW())
      ON CONFLICT (id) DO UPDATE SET quantity = ${i+1}
    `, [itemId, CART_ID, SHOP_ID, vid, vid]);
  }

  // ── ORDER SERVICE ──────────────────────────────────────────────────────────
  const orderEnv = loadEnv(path.resolve(__dirname, './.env'));

  const orders = await new pg.Client({
    host: orderEnv['DB_HOST'], port: Number(orderEnv['DB_PORT']),
    user: orderEnv['DB_USERNAME'], password: orderEnv['DB_PASSWORD'],
    database: orderEnv['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  }).connect().then(async c => {
    const r = await c.query('SELECT COUNT(*) as cnt FROM orders');
    await c.end();
    return Number(r.rows[0].cnt);
  });

  console.log('\n=== Seed Complete ===');
  console.log(`sellerId : ${SELLER_ID}`);
  console.log(`shopId   : ${SHOP_ID}`);
  console.log(`buyerId  : ${BUYER_ID}`);
  console.log(`variants : ${VARIANT_IDS.join(', ')}`);
  console.log(`cartId   : ${CART_ID}`);
  console.log(`existing orders in DB: ${orders}`);
  console.log('\nNOTE: MongoDB products still need approvalStatus=approved + isActive=true + shopId set.');
  console.log('      Requires Docker for MongoDB, or seed directly into MongoDB.');
}

main().catch(console.error);
