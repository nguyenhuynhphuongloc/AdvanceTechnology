/**
 * Phase 5E — Get exact column names for inventory and payment tables
 */
const { Client } = require('pg');

const dbs = {
  'inventory-service': {
    host: 'ep-spring-scene-a1y50ccj-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_OEuev0z5tHJp',
    database: 'neondb',
  },
  'payment-service': {
    host: 'ep-fancy-glade-a1anw83n-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_lH7O9NKnRLvj',
    database: 'neondb',
  },
};

async function getColumns(config, table) {
  const client = new Client({ ...config, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
      [table]
    );
    return { table, cols: res.rows };
  } finally {
    await client.end();
  }
}

async function main() {
  const invCols = await getColumns(dbs['inventory-service'], 'inventory_items');
  console.log('\n=== inventory_items columns ===');
  invCols.cols.forEach(r => console.log(' ', r.column_name, '|', r.data_type, '| nullable:', r.is_nullable));

  const invTxCols = await getColumns(dbs['inventory-service'], 'inventory_transactions');
  console.log('\n=== inventory_transactions columns ===');
  invTxCols.cols.forEach(r => console.log(' ', r.column_name, '|', r.data_type, '| nullable:', r.is_nullable));

  const txnCols = await getColumns(dbs['payment-service'], 'transactions');
  console.log('\n=== transactions columns ===');
  txnCols.cols.forEach(r => console.log(' ', r.column_name, '|', r.data_type, '| nullable:', r.is_nullable));

  // Get sample transaction data
  const client = new Client({ ...dbs['payment-service'], ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await client.connect();
  const txns = await client.query('SELECT * FROM transactions LIMIT 3');
  console.log('\n=== transactions sample ===');
  txns.rows.forEach((r, i) => {
    console.log(`  [${i+1}]`, JSON.stringify(r));
  });
  await client.end();

  // Get sample inventory items
  const invClient = new Client({ ...dbs['inventory-service'], ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await invClient.connect();
  const items = await invClient.query('SELECT * FROM inventory_items LIMIT 3');
  console.log('\n=== inventory_items sample ===');
  items.rows.forEach((r, i) => {
    const masked = {};
    for (const [k, v] of Object.entries(r)) {
      if (v === null) masked[k] = null;
      else if (typeof v === 'string' && v.length > 20) masked[k] = v.substring(0,6) + '...' + v.substring(v.length-4);
      else masked[k] = v;
    }
    console.log(`  [${i+1}]`, JSON.stringify(masked));
  });
  await invClient.end();

  console.log('\n=== DONE ===');
}

main().catch(console.error);
