/**
 * Seed test orders directly into order DB.
 * This tests the READ APIs: listMyOrders, listAdminOrders, listSellerShopOrders.
 * Checkout requires cart+inventory+store services (needs Docker).
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
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const BUYER_ID   = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const SELLER_ID   = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const SHOP_ID    = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ORDER_1    = '11111111-1111-1111-1111-111111111111';
const ORDER_2    = '22222222-2222-2222-2222-222222222222';
const SO_1       = 'aaaa0000-0000-0000-0000-000000000001';
const SO_2       = 'aaaa0000-0000-0000-0000-000000000002';
const SI_1       = 'bbbb0000-0000-0000-0000-000000000001';
const SI_2       = 'bbbb0000-0000-0000-0000-000000000002';
const SI_3       = 'bbbb0000-0000-0000-0000-000000000003';

async function seedOrders() {
  const env = loadEnv(path.resolve(__dirname, './.env'));
  const client = new pg.Client({
    host: env['DB_HOST'], port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'], password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'], ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to order DB');

  // ── Order 1 (buyer cccc...) ──────────────────────────────────────────────
  await client.query(`
    INSERT INTO orders (id, auth_user_id, order_number, status, payment_status, payment_method,
      shipping_address_snapshot, subtotal, shipping_fee, total_amount, currency, created_at, updated_at)
    VALUES ($1,$2,'ORD-20260517-T001','pending','pending','cod',
      '{"fullName":"Test Buyer","phone":"0909000001","province":"HCM","district":"Q1","ward":"Ben Nghe","street":"1 Nguyen Hue"}'::jsonb,
      '150000.00','30000.00','180000.00','VND', NOW()-INTERVAL '2 hours', NOW()-INTERVAL '2 hours')
    ON CONFLICT (id) DO UPDATE SET auth_user_id=$2, status='pending'
  `, [ORDER_1, BUYER_ID]);

  await client.query(`
    INSERT INTO shop_orders (id, order_id, shop_id, seller_id, status, subtotal, shipping_fee, shop_total, created_at, updated_at)
    VALUES ($1,$2,$3,$4,'pending','150000.00','30000.00','180000.00',NOW()-INTERVAL '2 hours',NOW()-INTERVAL '2 hours')
    ON CONFLICT (id) DO UPDATE SET status='pending'
  `, [SO_1, ORDER_1, SHOP_ID, SELLER_ID]);

  await client.query(`
    INSERT INTO shop_order_items (id, shop_order_id, product_id, variant_id,
      product_name_snapshot, variant_name_snapshot, sku_snapshot, image_url_snapshot, shop_name_snapshot,
      unit_price, quantity, line_total, created_at)
    VALUES ($1,$2,'dddddddd-dddd-dddd-dddd-dddddddd0001','dddddddd-dddd-dddd-dddd-dddddddd0001',
      'Ao Thun Nam','M / Xanh','SKU-001','https://picsum.photos/100','Test Shop VN',
      '75000.00',2,'150000.00',NOW()-INTERVAL '2 hours')
    ON CONFLICT (id) DO NOTHING
  `, [SI_1, SO_1]);

  console.log('✓ Seeded Order 1 (buyer', BUYER_ID, ') with 1 shop_order, 1 item');

  // ── Order 2 (another buyer) ───────────────────────────────────────────────
  const BUYER2 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const ORDER_2B = '33333333-3333-3333-3333-333333333333';
  const SO_2B = 'aaaa0000-0000-0000-0000-000000000003';

  await client.query(`
    INSERT INTO orders (id, auth_user_id, order_number, status, payment_status, payment_method,
      shipping_address_snapshot, subtotal, shipping_fee, total_amount, currency, created_at, updated_at)
    VALUES ($1,$2,'ORD-20260517-T002','confirmed','pending','stripe',
      '{"fullName":"Another Buyer","phone":"0909000002","province":"HCM","district":"Q3","ward":"Ward 11","street":"99 Truong Chinh"}'::jsonb,
      '280000.00','0.00','280000.00','VND', NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day')
    ON CONFLICT (id) DO UPDATE SET auth_user_id=$2
  `, [ORDER_2B, BUYER2]);

  await client.query(`
    INSERT INTO shop_orders (id, order_id, shop_id, seller_id, status, subtotal, shipping_fee, shop_total, created_at, updated_at)
    VALUES ($1,$2,$3,$4,'confirmed','280000.00','0.00','280000.00',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING
  `, [SO_2B, ORDER_2B, SHOP_ID, SELLER_ID]);

  for (const [siId, pname] of [[SI_2, 'Product 2'], [SI_3, 'Product 3']] as [string, string][]) {
    await client.query(`
      INSERT INTO shop_order_items (id, shop_order_id, product_id, variant_id,
        product_name_snapshot, variant_name_snapshot, sku_snapshot, image_url_snapshot, shop_name_snapshot,
        unit_price, quantity, line_total, created_at)
      VALUES ($1,$2,$3,$4,$5,'Variant 2','SKU-002','https://picsum.photos/101','Test Shop VN',
        '140000.00',2,'280000.00',NOW()-INTERVAL '1 day')
      ON CONFLICT (id) DO NOTHING
    `, [siId, SO_2B, 'dddddddd-dddd-dddd-dddd-dddddddd0002', 'dddddddd-dddd-dddd-dddd-dddddddd0002', pname]);
  }

  console.log('✓ Seeded Order 2 (another buyer', BUYER2, ') with 1 shop_order, 2 items');

  // ── Verify ────────────────────────────────────────────────────────────────
  const cnt = await client.query('SELECT COUNT(*) FROM orders');
  const soCnt = await client.query('SELECT COUNT(*) FROM shop_orders');
  const siCnt = await client.query('SELECT COUNT(*) FROM shop_order_items');
  console.log(`\nDB: orders=${cnt.rows[0].count}, shop_orders=${soCnt.rows[0].count}, shop_order_items=${siCnt.rows[0].count}`);

  await client.end();
  console.log('\nDone. Test IDs:');
  console.log('  BUYER_ID  =', BUYER_ID);
  console.log('  BUYER2    =', BUYER2);
  console.log('  SELLER_ID =', SELLER_ID);
  console.log('  SHOP_ID   =', SHOP_ID);
  console.log('  ORDER_1   =', ORDER_1);
  console.log('  ORDER_2B  =', ORDER_2B);
}

seedOrders().catch(console.error);
