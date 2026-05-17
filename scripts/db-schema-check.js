require('dotenv').config({ path: '/app/.env' });
const {Client} = require('pg');
(async()=>{
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const orders = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='orders' ORDER BY ordinal_position"
  );
  console.log('orders:', orders.rows.map(r => r.column_name).join(', '));

  const so = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='shop_orders' ORDER BY ordinal_position"
  );
  console.log('shop_orders:', so.rows.map(r => r.column_name).join(', '));

  const soi = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='shop_order_items' ORDER BY ordinal_position"
  );
  console.log('shop_order_items:', soi.rows.map(r => r.column_name).join(', '));

  await client.end();
})().catch(e => { console.error(e.message); process.exit(1); });
