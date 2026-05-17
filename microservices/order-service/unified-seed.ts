/**
 * Phase 5E.1 - Unified Seed Script
 * Seeds all PostgreSQL DBs with consistent IDs for end-to-end marketplace flow testing.
 *
 * Unified IDs:
 *   buyerId  : cccccccc-cccc-cccc-cccc-cccccccccccc
 *   sellerId : aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *   shopId   : bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
 *   variantId: dddddddd-dddd-dddd-dddd-dddddddd0001
 *   variant2 : dddddddd-dddd-dddd-dddd-dddddddd0002
 *   productId: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
 *   categoryId: 11111111-2222-3333-4444-555555555555
 */
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const BUYER_ID   = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const SELLER_ID  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const SHOP_ID    = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const VARIANT_ID = 'dddddddd-dddd-dddd-dddd-dddddddd0001';
const VARIANT2_ID = 'dddddddd-dddd-dddd-dddd-dddddddd0002';
const PRODUCT_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const CATEGORY_ID = '11111111-2222-3333-4444-555555555555';

function loadEnv(envPath: string): Record<string, string> {
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

async function getClient(envPath: string): Promise<pg.Client> {
  const env = loadEnv(envPath);
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function seedStore(client: pg.Client) {
  console.log('\n[store-service] Seeding shops...');
  try {
    // Check existing
    const existing = await client.query('SELECT id, status FROM shops WHERE id = $1', [SHOP_ID]);
    if (existing.rows.length > 0) {
      console.log(`  Shop ${SHOP_ID.slice(-4)} already exists, status=${existing.rows[0].status}`);
      if (existing.rows[0].status !== 'approved') {
        await client.query('UPDATE shops SET status = $1, updated_at = NOW() WHERE id = $2', ['approved', SHOP_ID]);
        console.log('  → Updated to approved');
      }
    } else {
      await client.query(`
        INSERT INTO shops (id, seller_id, name, slug, status, description, logo_url, banner_url,
          is_active, commission_rate, created_at, updated_at)
        VALUES ($1, $2, 'Test Shop VN', 'test-shop-vn', 'approved', 'Test shop for Phase 5E',
          NULL, NULL, true, 10, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [SHOP_ID, SELLER_ID]);
      console.log(`  Shop ${SHOP_ID.slice(-4)} created`);
    }
  } catch (err: any) {
    console.error(`  ERROR: ${err.message}`);
    // Try alternative - maybe slug is unique constraint
    try {
      await client.query(`
        INSERT INTO shops (id, seller_id, name, slug, status, is_active, commission_rate, created_at, updated_at)
        VALUES ($1, $2, 'Test Shop VN', 'test-shop-vn', 'approved', true, 10, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET status = 'approved'
      `, [SHOP_ID, SELLER_ID]);
      console.log(`  Shop ${SHOP_ID.slice(-4)} upserted (slug conflict bypassed)`);
    } catch (err2: any) {
      console.error(`  Also failed: ${err2.message}`);
    }
  }
}

async function seedInventory(client: pg.Client) {
  console.log('\n[inventory-service] Seeding inventory_items...');
  const variants = [
    { id: VARIANT_ID, name: 'Variant 1 (Ao Thun M/Xanh)', price: 75000 },
    { id: VARIANT2_ID, name: 'Variant 2 (Quan Jean L/Đen)', price: 140000 },
  ];
  for (const v of variants) {
    try {
      await client.query(`
        INSERT INTO inventory_items (id, shop_id, variant_id, stock, reserved_stock, low_stock_threshold, updated_at)
        VALUES ($1, $2, $3, 100, 0, 10, NOW())
        ON CONFLICT (id) DO UPDATE SET stock = 100, reserved_stock = 0, shop_id = $2, variant_id = $3, updated_at = NOW()
      `, [v.id, SHOP_ID, v.id]);
      console.log(`  ${v.id.slice(-4)} stock=100 reserved=0`);
    } catch (err: any) {
      console.error(`  ERROR ${v.id.slice(-4)}: ${err.message}`);
    }
  }
}

async function seedCart(client: pg.Client) {
  console.log('\n[cart-service] Seeding cart_state...');

  // Check columns
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'cart_state' ORDER BY ordinal_position
  `);
  console.log('  cart_state cols:', cols.rows.map((r: any) => r.column_name).join(', '));

  const items = [
    {
      itemId: 'ffff0000-0000-0000-0000-000000000001',
      variantId: VARIANT_ID, productId: PRODUCT_ID, shopId: SHOP_ID,
      productNameSnapshot: 'Ao Thun Nam', variantNameSnapshot: 'M / Xanh',
      skuSnapshot: 'SKU-001', imageUrlSnapshot: 'https://picsum.photos/100',
      shopNameSnapshot: 'Test Shop VN', unitPriceSnapshot: 75000, quantity: 2,
      addedAt: new Date().toISOString(),
    },
    {
      itemId: 'ffff0000-0000-0000-0000-000000000002',
      variantId: VARIANT2_ID, productId: PRODUCT_ID, shopId: SHOP_ID,
      productNameSnapshot: 'Quan Jean', variantNameSnapshot: 'L / Đen',
      skuSnapshot: 'SKU-002', imageUrlSnapshot: 'https://picsum.photos/101',
      shopNameSnapshot: 'Test Shop VN', unitPriceSnapshot: 140000, quantity: 1,
      addedAt: new Date().toISOString(),
    },
  ];

  try {
    // Try with PascalCase column names (as TypeORM entities define)
    const colNames = cols.rows.map((r: any) => r.column_name);
    const hasOwnerKey = colNames.includes('ownerKey');
    const ownerKey = hasOwnerKey ? `user:${BUYER_ID}` : null;

    const insertParts: string[] = ['id', 'userId'];
    const insertVals: any[] = ['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', BUYER_ID];
    if (ownerKey) { insertParts.push('"ownerKey"'); insertVals.push(ownerKey); }
    insertParts.push('items');
    insertVals.push(JSON.stringify(items));

    const sql = `INSERT INTO cart_state (${insertParts.join(', ')}, created_at, updated_at)
      VALUES (${insertVals.map((_, i) => `$${i + 1}`).join(', ')}, NOW(), NOW())
      ON CONFLICT ("userId") DO UPDATE SET items = $${insertVals.length}::jsonb, updated_at = NOW()`;

    await client.query(sql, insertVals);
    console.log(`  Cart seeded: ${items.length} items`);
  } catch (err: any) {
    console.error(`  ERROR: ${err.message}`);
    // Try simpler insert
    try {
      await client.query(`
        INSERT INTO cart_state (id, "userId", items, created_at, updated_at)
        VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', $1, $2::jsonb, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET items = $2::jsonb, updated_at = NOW()
      `, [BUYER_ID, JSON.stringify(items)]);
      console.log(`  Cart seeded (simple): ${items.length} items`);
    } catch (err2: any) {
      console.error(`  Also failed: ${err2.message}`);
      // Dump columns for debugging
      const cols2 = await client.query('SELECT * FROM cart_state LIMIT 0');
      console.log('  Available columns:', cols2.fields.map((f: any) => f.name).join(', '));
    }
  }
}

async function seedOrder(client: pg.Client) {
  console.log('\n[order-service] Verifying test orders...');
  try {
    const r = await client.query(`
      SELECT id, order_number, auth_user_id, status, payment_status
      FROM orders WHERE auth_user_id = $1
    `, [BUYER_ID]);
    console.log(`  ${r.rows.length} orders for buyer ${BUYER_ID.slice(-4)}`);
    for (const row of r.rows) {
      console.log(`  - ${row.id.slice(-4)} ${row.order_number} status=${row.status} payment=${row.payment_status}`);
    }

    // Check shop_orders
    const so = await client.query('SELECT id, order_id, shop_id, status FROM shop_orders WHERE shop_id = $1', [SHOP_ID]);
    console.log(`  ${so.rows.length} shop_orders for shop ${SHOP_ID.slice(-4)}`);

    // Check shop_order_items
    const si = await client.query(`
      SELECT soi.id, soi.shop_order_id, soi.product_name_snapshot, soi.quantity
      FROM shop_order_items soi
      JOIN shop_orders so ON soi.shop_order_id = so.id
      WHERE so.shop_id = $1
    `, [SHOP_ID]);
    console.log(`  ${si.rows.length} shop_order_items for shop ${SHOP_ID.slice(-4)}`);
  } catch (err: any) {
    console.error(`  ERROR: ${err.message}`);
  }
}

async function main() {
  console.log('============================================');
  console.log('Phase 5E.1 - Unified Marketplace Seed');
  console.log('============================================');

  try {
    // 1. Store-service DB
    const storeClient = await getClient(path.resolve(__dirname, '../store-service/.env'));
    await seedStore(storeClient);
    await storeClient.end();

    // 2. Inventory-service DB
    const invClient = await getClient(path.resolve(__dirname, '../inventory-service/.env'));
    await seedInventory(invClient);
    await invClient.end();

    // 3. Cart-service DB
    const cartClient = await getClient(path.resolve(__dirname, '../cart-service/.env'));
    await seedCart(cartClient);
    await cartClient.end();

    // 4. Order-service DB
    const orderClient = await getClient(path.resolve(__dirname, '.env'));
    await seedOrder(orderClient);
    await orderClient.end();

    console.log('\n============================================');
    console.log('Seed complete.');
    console.log('NOTE: product-service (MongoDB) requires Docker/MongoDB Atlas.');
    console.log('============================================');
  } catch (err: any) {
    console.error('FATAL:', err.message);
  }
}

main().catch(console.error);
