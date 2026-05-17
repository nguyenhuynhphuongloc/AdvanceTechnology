/**
 * Phase 5E Data Audit — Full runtime data inventory (fixed column names)
 */
const { Client } = require('pg');

const dbs = {
  'auth-service': {
    host: 'ep-noisy-glitter-a1b5d2jy-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_I0HC2xkwsYpJ',
    database: 'neondb',
  },
  'order-service': {
    host: 'ep-cold-dream-a1rxuc3e-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_OSo2hygB0Dwv',
    database: 'neondb',
  },
  'store-service': {
    host: 'ep-spring-union-ao6cq0xv-pooler.c-2.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_8VBuFqgeGTQ4',
    database: 'neondb',
  },
  'inventory-service': {
    host: 'ep-spring-scene-a1y50ccj-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_OEuev0z5tHJp',
    database: 'neondb',
  },
  'cart-service': {
    host: 'ep-old-base-a1lxzo5k-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_WXTuSl24wGME',
    database: 'neondb',
  },
  'payment-service': {
    host: 'ep-fancy-glade-a1anw83n-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_lH7O9NKnRLvj',
    database: 'neondb',
  },
};

function mask(s) {
  if (!s) return 'null';
  if (s.length <= 8) return '***';
  return s.substring(0, 6) + '...' + s.substring(s.length - 4);
}

async function queryDb(name, config, sql) {
  const client = new Client({ ...config, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    const res = await client.query(sql);
    return { name, rows: res.rows, fields: res.fields.map(f => f.name), count: res.rowCount };
  } catch (e) {
    return { name, error: e.message };
  } finally {
    await client.end();
  }
}

function print(result) {
  console.log('\n=== ' + result.name + ' ===');
  if (result.error) { console.log('ERROR:', result.error); return; }
  if (result.count === 0) { console.log('  (0 rows)'); return; }
  console.log(`Rows: ${result.count}`);
  console.log('Fields:', result.fields.join(', '));
  result.rows.slice(0, 8).forEach((row, i) => {
    const parts = Object.entries(row).map(([k, v]) => {
      if (v === null) return `${k}: null`;
      if (typeof v === 'object') return `${k}: [${Array.isArray(v) ? 'array' : 'jsonb'}]`;
      const s = String(v);
      return `${k}: ${s.length > 50 ? s.substring(0, 47) + '...' : s}`;
    });
    console.log(`  [${i+1}] ${parts.join(' | ')}`);
  });
  if (result.count > 8) console.log(`  ... +${result.count - 8} more`);
}

async function main() {
  // Auth service
  const authUsersCols = await queryDb('auth_users COLS', dbs['auth-service'],
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='auth_users'`);
  print(authUsersCols);
  const authUsers = await queryDb('auth_users', dbs['auth-service'],
    `SELECT * FROM "auth_users" LIMIT 10`);
  print(authUsers);

  // Order service
  const ordersCols = await queryDb('orders COLS', dbs['order-service'],
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='orders'`);
  print(ordersCols);
  const orders = await queryDb('orders', dbs['order-service'],
    `SELECT * FROM orders ORDER BY id DESC LIMIT 5`);
  print(orders);

  const shopOrders = await queryDb('shop_orders', dbs['order-service'],
    `SELECT * FROM shop_orders LIMIT 5`);
  print(shopOrders);

  const shopOrderItems = await queryDb('shop_order_items', dbs['order-service'],
    `SELECT * FROM shop_order_items LIMIT 5`);
  print(shopOrderItems);

  // Store service
  const shops = await queryDb('shops', dbs['store-service'],
    `SELECT * FROM shops LIMIT 5`);
  print(shops);

  // Inventory service
  const invItems = await queryDb('inventory_items', dbs['inventory-service'],
    `SELECT id, "shop_id", "product_id", "variant_id", stock, "reserved_stock", status, sku FROM inventory_items ORDER BY id LIMIT 20`);
  print(invItems);

  // Cart service
  const cartState = await queryDb('cart_state', dbs['cart-service'],
    `SELECT id, "userId", "guestToken", "updatedAt" FROM cart_state ORDER BY "updatedAt" DESC LIMIT 10`);
  print(cartState);

  // Payment service
  const txns = await queryDb('transactions', dbs['payment-service'],
    `SELECT id, "orderId", amount, status, "createdAt" FROM transactions ORDER BY "createdAt" DESC LIMIT 5`);
  print(txns);

  const refunds = await queryDb('refunds', dbs['payment-service'],
    `SELECT * FROM refunds LIMIT 5`);
  print(refunds);

  console.log('\n\n=== COMPLETE ===');
}

main().catch(console.error);
