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

async function main() {
  const storeEnv = loadEnv(path.resolve(__dirname, '../store-service/.env'));
  const client = new pg.Client({
    host: storeEnv['DB_HOST'],
    port: Number(storeEnv['DB_PORT']),
    user: storeEnv['DB_USERNAME'],
    password: storeEnv['DB_PASSWORD'],
    database: storeEnv['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log('Tables in store DB:');
  for (const row of tables.rows) {
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [row.table_name]
    );
    console.log(`\n${row.table_name}:`);
    for (const c of cols.rows) {
      console.log(`  ${c.column_name} (${c.data_type})`);
    }
  }

  await client.end();
}

main().catch(console.error);
