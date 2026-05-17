/**
 * Ensure product-service MongoDB Atlas collections and indexes exist.
 *
 * Uses PRODUCT_DB_URL from root .env by default.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

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
const uri = process.env.PRODUCT_DB_URL || rootEnv.PRODUCT_DB_URL || serviceEnv.DB_URL;
const databaseName = process.env.MONGO_DATABASE || process.env.DB_DATABASE || 'neondb';

if (!uri || uri.includes('<db_password>')) {
  throw new Error('Set PRODUCT_DB_URL or product-service DB_URL to a valid MongoDB Atlas URI.');
}

const collectionIndexes = {
  categories: [
    [{ id: 1 }, { unique: true, name: 'uq_categories_id' }],
    [{ name: 1 }, { unique: true, name: 'uq_categories_name' }],
    [{ slug: 1 }, { unique: true, name: 'uq_categories_slug' }],
    [{ parentId: 1 }, { name: 'idx_categories_parentId', sparse: true }],
  ],
  collections: [
    [{ id: 1 }, { unique: true, name: 'uq_collections_id' }],
    [{ name: 1 }, { unique: true, name: 'uq_collections_name' }],
    [{ slug: 1 }, { unique: true, name: 'uq_collections_slug' }],
  ],
  products: [
    [{ id: 1 }, { unique: true, name: 'uq_products_id' }],
    [{ slug: 1 }, { unique: true, name: 'idx_products_slug' }],
    [{ sku: 1 }, { unique: true, name: 'uq_products_sku' }],
    [{ shopId: 1 }, { name: 'idx_products_shopId', sparse: true }],
    [{ sellerId: 1 }, { name: 'idx_products_sellerId', sparse: true }],
    [{ categoryId: 1 }, { name: 'idx_products_categoryId', sparse: true }],
    [{ approvalStatus: 1, isActive: 1 }, { name: 'idx_products_visibility' }],
  ],
  product_images: [
    [{ id: 1 }, { unique: true, name: 'uq_product_images_id' }],
    [{ productId: 1, sortOrder: 1 }, { name: 'idx_product_images_product_sort' }],
    [{ publicId: 1 }, { name: 'idx_product_images_publicId' }],
  ],
  product_related: [
    [{ id: 1 }, { unique: true, name: 'uq_product_related_id' }],
    [{ productId: 1, relatedProductId: 1 }, { unique: true, name: 'uq_product_related_pair' }],
  ],
  product_variants: [
    [{ id: 1 }, { unique: true, name: 'uq_product_variants_id' }],
    [{ sku: 1 }, { unique: true, name: 'uq_product_variants_sku' }],
    [{ productId: 1 }, { name: 'idx_product_variants_productId' }],
  ],
};

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    const db = client.db(databaseName);

    const existingCollections = new Set((await db.listCollections().toArray()).map((item) => item.name));
    for (const [collectionName, indexes] of Object.entries(collectionIndexes)) {
      if (!existingCollections.has(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`created collection ${collectionName}`);
      } else {
        console.log(`collection ${collectionName} already exists`);
      }

      for (const [keys, options] of indexes) {
        await db.collection(collectionName).createIndex(keys, options);
      }

      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName}: ${count} documents`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
