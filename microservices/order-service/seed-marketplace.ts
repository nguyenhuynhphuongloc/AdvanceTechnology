/**
 * Phase 5E - Seed marketplace test data (corrected schema)
 */
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

const BUYER_ID    = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const SHOP_ID     = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const VARIANT_IDS = [
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
];

async function seedInventory() {
  const env = loadEnv(path.resolve(__dirname, '../inventory-service/.env'));
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('[inventory] Connected');

  for (const vid of VARIANT_IDS) {
    try {
      await client.query(`
        INSERT INTO inventory_items (id, shop_id, variant_id, stock, reserved_stock, low_stock_threshold, updated_at)
        VALUES ($1, $2, $3, 100, 0, 10, NOW())
        ON CONFLICT (id) DO UPDATE SET stock = 100, reserved_stock = 0, shop_id = $2, variant_id = $3, updated_at = NOW()
      `, [vid, SHOP_ID, vid]);
      console.log(`[inventory] OK: ${vid.slice(-4)} stock=100`);
    } catch (err: any) {
      console.error(`[inventory] Error ${vid.slice(-4)}: ${err.message}`);
    }
  }

  const r = await client.query('SELECT id, shop_id, variant_id, stock, reserved_stock FROM inventory_items WHERE shop_id = $1', [SHOP_ID]);
  console.log(`[inventory] ${r.rows.length} items for shop ${SHOP_ID}`);
  for (const row of r.rows) console.log(`  ${row.id.slice(-4)} stock=${row.stock} reserved=${row.reserved_stock}`);

  await client.end();
}

async function seedCart() {
  const env = loadEnv(path.resolve(__dirname, '../cart-service/.env'));
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('[cart] Connected');

  // Check cart_state table columns
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_state' ORDER BY ordinal_position
  `);
  console.log('[cart] cart_state columns:', cols.rows.map((r: any) => r.column_name).join(', '));

  // Upsert cart_state — JSON items with all CartItemSnapshot fields
  const items = [
    {
      itemId: 'ffff0000-0000-0000-0000-000000000001',
      variantId: VARIANT_IDS[0],
      productId: VARIANT_IDS[0],
      shopId: SHOP_ID,
      productNameSnapshot: 'Ao Thun Nam',
      variantNameSnapshot: 'M / Xanh',
      skuSnapshot: 'SKU-001',
      imageUrlSnapshot: 'https://picsum.photos/100',
      shopNameSnapshot: 'Test Shop VN',
      unitPriceSnapshot: 75000,
      quantity: 2,
      addedAt: new Date().toISOString(),
    },
    {
      itemId: 'ffff0000-0000-0000-0000-000000000002',
      variantId: VARIANT_IDS[1],
      productId: VARIANT_IDS[1],
      shopId: SHOP_ID,
      productNameSnapshot: 'Quan Jean',
      variantNameSnapshot: 'L / Den',
      skuSnapshot: 'SKU-002',
      imageUrlSnapshot: 'https://picsum.photos/101',
      shopNameSnapshot: 'Test Shop VN',
      unitPriceSnapshot: 140000,
      quantity: 1,
      addedAt: new Date().toISOString(),
    },
  ];

  try {
    await client.query(`
      INSERT INTO cart_state (id, "userId", "ownerKey", items, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
      ON CONFLICT ("userId") DO UPDATE SET items = $4::jsonb, updated_at = NOW()
    `, ['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', BUYER_ID, `user:${BUYER_ID}`, JSON.stringify(items)]);
    console.log('[cart] cart_state seeded OK');
  } catch (err: any) {
    console.error(`[cart] Error: ${err.message}`);
    console.error(`[cart] Check: does cart_state table exist?`);
  }

  await client.end();
}

async function main() {
  console.log('=== Phase 5E Seed: Inventory + Cart ===\n');
  await seedInventory();
  console.log('');
  await seedCart();
  console.log('\nDone. Note: product-service (MongoDB) must be running to validate cart items during checkout.');
}

main().catch(console.error);
