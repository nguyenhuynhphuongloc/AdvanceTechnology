// Script để tạo migration thêm các column thiếu vào bảng orders, shop_orders, shop_order_items
// Chạy: node scripts/create-missing-columns.js

require('dotenv').config({ path: './microservices/order-service/.env' });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // Lấy columns hiện tại của orders
  const ordersCols = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'orders'
    ORDER BY ordinal_position
  `);
  console.log('=== orders columns ===');
  ordersCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

  // Lấy columns hiện tại của shop_orders
  const shopOrdersCols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'shop_orders'
    ORDER BY ordinal_position
  `);
  console.log('\n=== shop_orders columns ===');
  shopOrdersCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

  // Lấy columns hiện tại của shop_order_items
  const shopOrderItemsCols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'shop_order_items'
    ORDER BY ordinal_position
  `);
  console.log('\n=== shop_order_items columns ===');
  shopOrderItemsCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
