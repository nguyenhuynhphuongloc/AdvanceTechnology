/**
 * Copy product-service MongoDB collections from a source MongoDB to Atlas.
 *
 * Usage:
 *   $env:SOURCE_MONGO_URL="mongodb://admin:password@localhost:27017/neondb?authSource=admin"
 *   $env:TARGET_MONGO_URL="mongodb+srv://tiennguyen:<password>@product-service.nkkntfg.mongodb.net/neondb?retryWrites=true&w=majority&appName=product-service"
 *   node scripts/migrate-product-mongo-to-atlas.js
 *
 * Optional:
 *   $env:MONGO_DATABASE="neondb"
 *   $env:MONGO_REPLACE_EXISTING="true"
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

const rootEnv = parseEnv(path.join(__dirname, '..', '.env'));
const serviceEnv = parseEnv(path.join(__dirname, '..', 'microservices', 'product-service', '.env'));

const collections = [
  'categories',
  'collections',
  'products',
  'product_images',
  'product_related',
  'product_variants',
];

const sourceUrl =
  process.env.SOURCE_MONGO_URL ||
  'mongodb://admin:password@localhost:27017/neondb?authSource=admin';
const targetUrl =
  process.env.TARGET_MONGO_URL ||
  process.env.PRODUCT_DB_URL ||
  rootEnv.PRODUCT_DB_URL ||
  process.env.DB_URL ||
  serviceEnv.DB_URL;
const databaseName =
  process.env.MONGO_DATABASE ||
  process.env.DB_DATABASE ||
  rootEnv.DB_DATABASE ||
  serviceEnv.DB_DATABASE ||
  'neondb';
const replaceExisting = String(process.env.MONGO_REPLACE_EXISTING || 'false').toLowerCase() === 'true';

function assertUsableUrl(name, url) {
  if (!url || url.includes('<db_password>')) {
    throw new Error(`${name} must be set to a valid MongoDB URI with the real password.`);
  }
}

async function copyCollection(sourceDb, targetDb, collectionName) {
  const docs = await sourceDb.collection(collectionName).find({}).toArray();
  if (replaceExisting) {
    await targetDb.collection(collectionName).deleteMany({});
  }

  if (docs.length > 0) {
    const operations = docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }));
    await targetDb.collection(collectionName).bulkWrite(operations, { ordered: false });
  }

  const targetCount = await targetDb.collection(collectionName).countDocuments();
  console.log(`${collectionName}: copied ${docs.length}, target count ${targetCount}`);
}

async function main() {
  assertUsableUrl('SOURCE_MONGO_URL', sourceUrl);
  assertUsableUrl('TARGET_MONGO_URL / PRODUCT_DB_URL / DB_URL', targetUrl);

  const sourceClient = new MongoClient(sourceUrl, { serverSelectionTimeoutMS: 10000 });
  const targetClient = new MongoClient(targetUrl, { serverSelectionTimeoutMS: 10000 });

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(databaseName);
    const targetDb = targetClient.db(databaseName);

    for (const collectionName of collections) {
      await copyCollection(sourceDb, targetDb, collectionName);
    }
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
