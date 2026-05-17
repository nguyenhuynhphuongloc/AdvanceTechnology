const { Client } = require('pg');
const args = process.argv.slice(2);
const host = args[0];
const port = parseInt(args[1]);
const user = args[2];
const password = args[3];
const database = args[4];

const client = new Client({
  host, port, user, password, database,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

async function run() {
  try {
    await client.connect();
    
    // Get tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('=== TABLES ===');
    tables.rows.forEach(r => console.log(r.table_name));
    
    // Get columns for each table
    for (const row of tables.rows) {
      const cols = await client.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
        [row.table_name]
      );
      console.log('\n=== ' + row.table_name + ' ===');
      cols.rows.forEach(c => {
        console.log(c.column_name + ' | ' + c.data_type + ' | nullable:' + c.is_nullable + (c.column_default ? ' | default:' + c.column_default : ''));
      });
    }
    
    // Get row counts
    console.log('\n=== ROW COUNTS ===');
    for (const row of tables.rows) {
      try {
        const count = await client.query('SELECT COUNT(*) FROM "' + row.table_name + '"');
        console.log(row.table_name + ': ' + count.rows[0].count);
      } catch(e) {
        console.log(row.table_name + ': ERROR - ' + e.message);
      }
    }
    
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await client.end();
  }
}

run();
