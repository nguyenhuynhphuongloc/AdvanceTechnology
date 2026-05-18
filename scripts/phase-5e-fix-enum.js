/**
 * Phase 5E — Fix auth_user_role enum to include 'seller'
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

  // Add seller to enum
  try {
    await client.query(`ALTER TYPE auth_user_role ADD VALUE IF NOT EXISTS 'seller'`);
    console.log('Added seller to enum (or already exists)');
  } catch (e) {
    if (e.message.includes('seller')) {
      console.log('seller already exists');
    } else {
      throw e;
    }
  }

  // Verify
  const enums = await client.query(`
    SELECT e.enumlabel FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'auth_user_role'
    ORDER BY e.enumsortorder
  `);
  console.log('auth_user_role now has:', enums.rows.map(r => r.enumlabel));

  await client.end();
}

main().catch(console.error);
