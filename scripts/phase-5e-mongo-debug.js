/**
 * Phase 5E — Debug product creation via direct MongoDB check
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
    throw new Error('Set PRODUCT_DB_URL or DB_URL to a valid MongoDB URI before debugging.');
  }
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(process.env.DB_DATABASE || rootEnv.DB_DATABASE || serviceEnv.DB_DATABASE || 'neondb');

  const products = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(5).toArray();
  console.log('Recent products in MongoDB:');
  products.forEach(p => {
    console.log(`  id=${p.id} slug=${p.slug} name=${p.name} approvalStatus=${p.approvalStatus} isActive=${p.isActive} shopId=${p.shopId} sellerId=${p.sellerId}`);
  });

  const variants = await db.collection('product_variants').find({}).sort({ _id: -1 }).limit(5).toArray();
  console.log('\nRecent variants in MongoDB:');
  variants.forEach(v => {
    console.log(`  id=${v.id} productId=${v.productId} sku=${v.sku} size=${v.size} color=${v.color}`);
  });

  const images = await db.collection('product_images').find({}).sort({ _id: -1 }).limit(5).toArray();
  console.log('\nRecent images in MongoDB:');
  images.forEach(i => {
    console.log(`  id=${i.id} publicId=${i.publicId} productId=${i.productId}`);
  });

  await client.close();
}

main().catch(e => console.error(e.message));
