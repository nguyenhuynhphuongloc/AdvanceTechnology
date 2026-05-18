const {Client} = require('pg');
require('dotenv').config({path: './microservices/order-service/.env'});

async function main() {
  const pg = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });
  await pg.connect();
  const r = await pg.query("SELECT column_name FROM information_schema.columns WHERE table_name='shop_orders' ORDER BY ordinal_position");
  console.log('shop_orders columns:', r.rows.map(x => x.column_name).join(', '));
  await pg.end();
}
main().catch(e => console.error(e.message));
