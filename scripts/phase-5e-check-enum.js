/**
 * Check auth_user_role enum values in DB
 */
const { Client } = require('pg');

const client = new Client({
  host: 'ep-noisy-glitter-a1b5d2jy-pooler.ap-southeast-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_I0HC2xkwsYpJ',
  database: 'neondb',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // Check enum labels
  const enums = await client.query(`
    SELECT n.nspname, t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'auth_user_role'
  `);
  console.log('auth_user_role enum values:', enums.rows);

  // Check column type
  const cols = await client.query(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'auth_users' AND column_name = 'role'
  `);
  console.log('role column:', cols.rows);

  await client.end();
}

main().catch(console.error);
