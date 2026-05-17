/**
 * Phase 5E MongoDB audit
 */
const { MongoClient } = require('mongodb');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

dns.setServers((process.env.NODE_DNS_SERVERS || '8.8.8.8,1.1.1.1').split(','));

function parseEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index >= 0) env[line.slice(0, index)] = line.slice(index + 1);
  }
  return env;
}

async function main() {
  const rootEnv = parseEnv(path.join(__dirname, '..', '.env'));
  const serviceEnv = parseEnv(path.join(__dirname, '..', 'microservices', 'product-service', '.env'));
  const url =
    process.env.PRODUCT_DB_URL ||
    rootEnv.PRODUCT_DB_URL ||
    process.env.DB_URL ||
    serviceEnv.DB_URL ||
    'mongodb://admin:password@localhost:27017/neondb?authSource=admin';
  if (url.includes('<db_password>')) {
    throw new Error('Set PRODUCT_DB_URL or DB_URL to a valid MongoDB URI before auditing.');
  }
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(process.env.DB_DATABASE || rootEnv.DB_DATABASE || serviceEnv.DB_DATABASE || 'neondb');

    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    collections.forEach(c => console.log(' ', c.name));

    for (const c of collections) {
      const name = c.name;
      const count = await db.collection(name).countDocuments();
      console.log(`\n=== ${name} (${count} docs) ===`);
      if (count === 0) continue;
      const docs = await db.collection(name).find({}).limit(5).toArray();
      docs.forEach((doc, i) => {
        const summary = {};
        for (const [k, v] of Object.entries(doc)) {
          if (k === '_id') { summary._id = '[ObjectId]'; continue; }
          if (typeof v === 'object' && v !== null) {
            summary[k] = '[Object/' + (Array.isArray(v) ? 'array' : 'object') + ']';
          } else {
            const s = String(v);
            summary[k] = s.length > 60 ? s.substring(0, 57) + '...' : s;
          }
        }
        console.log(`  [${i+1}]`, JSON.stringify(summary));
      });
    }

  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await client.close();
  }
}

main();
