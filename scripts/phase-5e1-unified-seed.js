/**
 * Phase 5E.1 - Unified Marketplace Seed Data Script
 *
 * Upserts seed data into ALL service databases with FIXED IDs.
 * Safe to re-run: uses upsert (ON CONFLICT) to avoid duplicates.
 *
 * Execution:
 *   node phase-5e1-unified-seed.js
 *
 * Prerequisites:
 *   - All services should be accessible via their DB/connection strings
 *   - Product service (MongoDB Atlas) may fail — this is documented as a BLOCKER
 *   - All other PostgreSQL services will be seeded regardless
 *
 * Fixed Seed IDs (do not change):
 *   adminId  : 99999999-9999-9999-9999-999999999999
 *   sellerId : aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *   buyerId  : cccccccc-cccc-cccc-cccc-cccccccccccc
 *   shopId   : bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
 *   categoryId : 11111111-2222-3333-4444-555555555555
 *   productId  : eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
 *   variantId  : dddddddd-dddd-dddd-dddd-dddddddd0001
 *   imageId    : ffffffff-ffff-ffff-ffff-ffffffffffff
 */

'use strict';

const { MongoClient } = require('mongodb');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// ─── Fixed Seed IDs ─────────────────────────────────────────────────────────

const SEED_IDS = {
  adminId:    '99999999-9999-9999-9999-999999999999',
  sellerId:   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  buyerId:    'cccccccc-cccc-cccc-cccc-cccccccccccc',
  shopId:     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  categoryId: '11111111-2222-3333-4444-555555555555',
  productId:  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  variantId:  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  imageId:    'ffffffff-ffff-ffff-ffff-ffffffffffff',
};

// ─── Utility: Load .env ────────────────────────────────────────────────────

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`ENV file not found: ${envPath}`);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

// ─── Utility: PostgreSQL Client ───────────────────────────────────────────

function makePgClient(env) {
  return new pg.Client({
    host:     env['DB_HOST'],
    port:     Number(env['DB_PORT'] || 5432),
    user:     env['DB_USERNAME'],
    password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'],
    ssl:      { rejectUnauthorized: false },
  });
}

// ─── Utility: Sleep ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]).catch(fallback ?? (() => ({ status: 'timeout' })));
}

// ─── STEP 0: Verify connectivity ──────────────────────────────────────────

async function verifyConnectivity(services) {
  console.log('\n[STEP 0] Verifying database connectivity (quick check, 5s timeout each)...\n');
  const results = [];

  for (const svc of services) {
    const { name, type, clientPromise } = svc;
    try {
      const result = await withTimeout((async () => {
        const client = await clientPromise();
        if (type === 'pg') {
          await client.query('SELECT 1');
          await client.end();
        } else if (type === 'mongo') {
          await client.db().admin().ping();
          await client.close();
        }
      })(), 5000);

      if (result.status === 'timeout') {
        console.log(`  [WARN] ${name}: timeout (skipped)`);
        results.push({ name, status: 'timeout' });
      } else {
        console.log(`  [OK]  ${name}`);
        results.push({ name, status: 'ok' });
      }
    } catch (err) {
      console.log(`  [FAIL] ${name}: ${err.message}`);
      results.push({ name, status: 'fail', error: err.message });
    }
  }

  console.log('\n  Connectivity check done. Proceeding with seed...\n');
}

// ─── STEP 1: Auth Service (PostgreSQL) ─────────────────────────────────────

async function seedAuthService(env) {
  console.log('[STEP 1] Seeding auth-service (auth_users)...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to auth DB');

    // Upsert admin
    await client.query(`
      INSERT INTO auth_users (id, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, 'admin@marketplace.test', 'HASH_PLACEHOLDER_ADMIN', 'admin', true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [SEED_IDS.adminId]);
    console.log(`  ✓ admin upserted: ${SEED_IDS.adminId}`);

    // Upsert seller
    await client.query(`
      INSERT INTO auth_users (id, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, 'seller@marketplace.test', 'HASH_PLACEHOLDER_SELLER', 'seller', true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [SEED_IDS.sellerId]);
    console.log(`  ✓ seller upserted: ${SEED_IDS.sellerId}`);

    // Upsert buyer
    await client.query(`
      INSERT INTO auth_users (id, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, 'buyer@marketplace.test', 'HASH_PLACEHOLDER_BUYER', 'customer', true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [SEED_IDS.buyerId]);
    console.log(`  ✓ buyer upserted: ${SEED_IDS.buyerId}`);

    // Verify
    const res = await client.query(
      'SELECT id, email, role, is_active FROM auth_users WHERE id = ANY($1)',
      [[SEED_IDS.adminId, SEED_IDS.sellerId, SEED_IDS.buyerId]]
    );
    console.log(`  → Verified: ${res.rows.length}/3 users exist in DB`);

  } catch (err) {
    console.error(`  ✗ Auth seed FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── STEP 2: Store Service (PostgreSQL) ───────────────────────────────────

async function seedStoreService(env) {
  console.log('[STEP 2] Seeding store-service (shops)...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to store DB');

    // Upsert shop (status = approved so seller can create products)
    await client.query(`
      INSERT INTO shops (
        id, seller_id, name, slug, status,
        commission_rate, created_at, updated_at
      )
      VALUES ($1, $2, 'Test Shop VN', 'test-shop-vn', 'approved', 0.05, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        status = EXCLUDED.status,
        updated_at = NOW()
    `, [SEED_IDS.shopId, SEED_IDS.sellerId]);
    console.log(`  ✓ shop upserted: ${SEED_IDS.shopId} (sellerId=${SEED_IDS.sellerId}, status=approved)`);

    // Verify
    const res = await client.query(
      'SELECT id, seller_id, name, slug, status FROM shops WHERE id = $1',
      [SEED_IDS.shopId]
    );
    if (res.rows.length === 1) {
      console.log(`  → Verified: shop name="${res.rows[0].name}", status="${res.rows[0].status}"`);
    }

  } catch (err) {
    console.error(`  ✗ Store seed FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── STEP 3: Product Service (MongoDB Atlas) ────────────────────────────────

async function seedProductService(env) {
  console.log('[STEP 3] Seeding product-service (MongoDB Atlas)...');

  const uri = env['DB_URL'] || env['PRODUCT_DB_URL'];
  if (!uri || uri.includes('<db_password>')) {
    console.log('  ⚠ SKIPPED: DB_URL not configured or contains placeholder.');
    console.log('  ⚠ BLOCKER: product-service seed cannot run without valid MongoDB Atlas URI.');
    console.log('  ⚠ FIX: Set DB_URL in microservices/product-service/.env');
    return { success: false, blocker: 'mongodb_atlas_uri_missing' };
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    console.log('  Connected to MongoDB Atlas');
    const db = client.db(env['DB_DATABASE'] || 'neondb');

    // 3a. Category
    try {
      await db.collection('categories').updateOne(
        { id: SEED_IDS.categoryId },
        {
          $set: {
            id: SEED_IDS.categoryId,
            name: 'T-Shirts',
            slug: 't-shirts',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`  ✓ category upserted: ${SEED_IDS.categoryId} (name=T-Shirts, slug=t-shirts)`);
    } catch (err) {
      console.error(`  ✗ Category upsert FAILED: ${err.message}`);
    }

    // 3b. Product
    try {
      await db.collection('products').updateOne(
        { id: SEED_IDS.productId },
        {
          $set: {
            id: SEED_IDS.productId,
            name: 'Ao Thun Nam Premium',
            slug: 'ao-thun-nam-premium',
            sku: 'TSHIRT-001',
            description: 'Ao thun nam cao cap, chat lieu 100% cotton, phong cach hien dai.',
            basePrice: 75000,
            isActive: true,
            categoryId: SEED_IDS.categoryId,
            sellerName: 'Test Shop VN',
            mainImagePublicId: SEED_IDS.imageId,
            shopId: SEED_IDS.shopId,
            sellerId: SEED_IDS.sellerId,
            approvalStatus: 'approved',
            rejectionReason: null,
            approvedAt: new Date(),
            approvedBy: SEED_IDS.adminId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`  ✓ product upserted: ${SEED_IDS.productId} (name=Ao Thun Nam Premium, approvalStatus=approved)`);
    } catch (err) {
      console.error(`  ✗ Product upsert FAILED: ${err.message}`);
    }

    // 3c. Image
    try {
      await db.collection('product_images').updateOne(
        { id: SEED_IDS.imageId },
        {
          $set: {
            id: SEED_IDS.imageId,
            productId: SEED_IDS.productId,
            imageUrl: 'https://picsum.photos/seed/tshirt1/800/800',
            publicId: SEED_IDS.imageId,
            altText: 'Ao thun nam premium',
            sortOrder: 0,
            isMain: true,
          },
        },
        { upsert: true }
      );
      console.log(`  ✓ image upserted: ${SEED_IDS.imageId}`);
    } catch (err) {
      console.error(`  ✗ Image upsert FAILED: ${err.message}`);
    }

    // 3d. Variant
    try {
      await db.collection('product_variants').updateOne(
        { id: SEED_IDS.variantId },
        {
          $set: {
            id: SEED_IDS.variantId,
            productId: SEED_IDS.productId,
            sku: 'TSHIRT-001-M',
            size: 'M',
            color: 'Xanh',
            priceOverride: null,
            imageId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`  ✓ variant upserted: ${SEED_IDS.variantId} (size=M, color=Xanh, isActive=true)`);
    } catch (err) {
      console.error(`  ✗ Variant upsert FAILED: ${err.message}`);
    }

    // Verify
    const productCount = await db.collection('products').countDocuments({ id: SEED_IDS.productId });
    const variantCount = await db.collection('product_variants').countDocuments({ id: SEED_IDS.variantId });
    const categoryCount = await db.collection('categories').countDocuments({ id: SEED_IDS.categoryId });
    console.log(`  → Verified: ${productCount} product, ${variantCount} variant, ${categoryCount} category`);

    await client.close();
    return { success: true, productCount, variantCount, categoryCount };

  } catch (err) {
    console.error(`  ✗ MongoDB Atlas connection FAILED: ${err.message}`);
    console.error(`  ⚠ This is the BLOCKER for Phase 5E.1 — checkout cannot proceed without product data.`);
    await client.close().catch(() => {});
    return { success: false, blocker: 'mongodb_atlas_connection_failed', error: err.message };
  }
}

// ─── STEP 4: Inventory Service (PostgreSQL) ────────────────────────────────

async function seedInventoryService(env) {
  console.log('[STEP 4] Seeding inventory-service (inventory_items)...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to inventory DB');

    // Verify the unique index exists: (shop_id, variant_id)
    await client.query(`
      INSERT INTO inventory_items (id, shop_id, product_id, variant_id, stock, reserved_stock, low_stock_threshold, updated_at)
      VALUES (
        $1, $2, $3, $4,
        100,   -- stock = 100
        0,     -- reserved_stock = 0
        10,    -- low_stock_threshold = 10
        NOW()
      )
      ON CONFLICT (shop_id, variant_id) DO UPDATE SET
        stock = 100,
        reserved_stock = 0,
        product_id = EXCLUDED.product_id,
        updated_at = NOW()
    `, [
      SEED_IDS.variantId,  // use variantId as inventory item id
      SEED_IDS.shopId,
      SEED_IDS.productId,
      SEED_IDS.variantId,
    ]);
    console.log(`  ✓ inventory_item upserted: variantId=${SEED_IDS.variantId}, shopId=${SEED_IDS.shopId}, stock=100, reserved=0`);

    // Verify
    const res = await client.query(
      'SELECT id, shop_id, variant_id, product_id, stock, reserved_stock FROM inventory_items WHERE variant_id = $1',
      [SEED_IDS.variantId]
    );
    if (res.rows.length === 1) {
      console.log(`  → Verified: stock=${res.rows[0].stock}, reserved=${res.rows[0].reserved_stock}`);
    }

  } catch (err) {
    console.error(`  ✗ Inventory seed FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── STEP 5: Cart Service (PostgreSQL) ─────────────────────────────────────

async function seedCartService(env) {
  console.log('[STEP 5] Seeding cart-service (cart_state)...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to cart DB');

    // Check existing columns
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'cart_state'
      ORDER BY ordinal_position
    `);
    console.log(`  cart_state columns: ${cols.rows.map(r => r.column_name).join(', ')}`);

    const items = [
      {
        itemId:              'ffff0000-0000-0000-0000-000000000001',
        variantId:           SEED_IDS.variantId,
        productId:           SEED_IDS.productId,
        shopId:              SEED_IDS.shopId,
        productNameSnapshot: 'Ao Thun Nam Premium',
        variantNameSnapshot: 'M / Xanh',
        skuSnapshot:         'TSHIRT-001-M',
        imageUrlSnapshot:    'https://picsum.photos/seed/tshirt1/800/800',
        shopNameSnapshot:    'Test Shop VN',
        unitPriceSnapshot:   75000,
        quantity:             2,
        addedAt:              new Date().toISOString(),
      },
    ];

    await client.query(`
      INSERT INTO cart_state (id, "userId", "ownerKey", items, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
      ON CONFLICT ("userId") DO UPDATE SET
        items = EXCLUDED.items,
        "updatedAt" = NOW()
    `, [
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
      SEED_IDS.buyerId,
      `user:${SEED_IDS.buyerId}`,
      JSON.stringify(items),
    ]);
    console.log(`  ✓ cart_state upserted: buyerId=${SEED_IDS.buyerId}, ${items.length} item(s)`);

    // Verify
    const res = await client.query(
      'SELECT id, "userId", "ownerKey", items FROM cart_state WHERE "userId" = $1',
      [SEED_IDS.buyerId]
    );
    if (res.rows.length === 1) {
      const parsed = typeof res.rows[0].items === 'string'
        ? JSON.parse(res.rows[0].items)
        : res.rows[0].items;
      console.log(`  → Verified: cartId=${res.rows[0].id}, items=${parsed.length}`);

      // Log linkage verification
      for (const item of parsed) {
        console.log(`     item: variantId=${item.variantId}, productId=${item.productId}, shopId=${item.shopId}, qty=${item.quantity}`);
      }
    }

  } catch (err) {
    console.error(`  ✗ Cart seed FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── STEP 6: Order Service (PostgreSQL) ────────────────────────────────────

async function seedOrderService(env) {
  console.log('[STEP 6] Checking order-service schema (no pre-seed needed for checkout)...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to order DB');

    // Verify required tables exist
    const tables = ['orders', 'shop_orders', 'shop_order_items'];
    for (const table of tables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists
      `, [table]);
      console.log(`  → table "${table}": ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
    }

    // Count existing orders for buyer
    const res = await client.query(
      'SELECT COUNT(*) as cnt FROM orders WHERE auth_user_id = $1',
      [SEED_IDS.buyerId]
    );
    console.log(`  → Existing orders for buyerId=${SEED_IDS.buyerId}: ${res.rows[0].cnt}`);

  } catch (err) {
    console.error(`  ✗ Order schema check FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── STEP 7: Payment Service (PostgreSQL) ─────────────────────────────────

async function seedPaymentService(env) {
  console.log('[STEP 7] Checking payment-service schema...');
  const client = makePgClient(env);

  try {
    await client.connect();
    console.log('  Connected to payment DB');

    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%payment%'
    `);
    console.log(`  → payment tables: ${res.rows.map(r => r.table_name).join(', ') || 'none found'}`);

  } catch (err) {
    console.error(`  ✗ Payment schema check FAILED: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const SEP = '═'.repeat(70);
  console.log(`\n${SEP}`);
  console.log(' Phase 5E.1 — Unified Marketplace Seed Data');
  console.log(` ${SEP}`);
  console.log(` Fixed IDs:`);
  console.log(`   adminId    : ${SEED_IDS.adminId}`);
  console.log(`   sellerId   : ${SEED_IDS.sellerId}`);
  console.log(`   buyerId    : ${SEED_IDS.buyerId}`);
  console.log(`   shopId     : ${SEED_IDS.shopId}`);
  console.log(`   categoryId : ${SEED_IDS.categoryId}`);
  console.log(`   productId  : ${SEED_IDS.productId}`);
  console.log(`   variantId  : ${SEED_IDS.variantId}`);
  console.log(`   imageId    : ${SEED_IDS.imageId}`);
  console.log(SEP);

  const rootDir = path.resolve(__dirname, '..');

  // Load env files
  const authEnv      = loadEnv(path.join(rootDir, 'microservices/authentication-service/.env'));
  const storeEnv     = loadEnv(path.join(rootDir, 'microservices/store-service/.env'));
  const productEnv   = loadEnv(path.join(rootDir, 'microservices/product-service/.env'));
  const inventoryEnv = loadEnv(path.join(rootDir, 'microservices/inventory-service/.env'));
  const cartEnv      = loadEnv(path.join(rootDir, 'microservices/cart-service/.env'));
  const orderEnv     = loadEnv(path.join(rootDir, 'microservices/order-service/.env'));
  const paymentEnv   = loadEnv(path.join(rootDir, 'microservices/payment-service/.env'));

  // Verify connectivity first
  await verifyConnectivity([
    { name: 'auth-service DB',      type: 'pg', clientPromise: () => makePgClient(authEnv) },
    { name: 'store-service DB',     type: 'pg', clientPromise: () => makePgClient(storeEnv) },
    { name: 'product-service (MongoDB)', type: 'mongo', clientPromise: () => {
      const uri = productEnv['DB_URL'] || productEnv['PRODUCT_DB_URL'];
      return new MongoClient(uri || '', {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      });
    }},
    { name: 'inventory-service DB', type: 'pg', clientPromise: () => makePgClient(inventoryEnv) },
    { name: 'cart-service DB',      type: 'pg', clientPromise: () => makePgClient(cartEnv) },
    { name: 'order-service DB',     type: 'pg', clientPromise: () => makePgClient(orderEnv) },
    { name: 'payment-service DB',   type: 'pg', clientPromise: () => makePgClient(paymentEnv) },
  ]);

  const results = {};

  // Run seed steps
  try {
    await seedAuthService(authEnv);
    results.auth = { success: true };
  } catch (err) {
    results.auth = { success: false, error: err.message };
  }

  try {
    await seedStoreService(storeEnv);
    results.store = { success: true };
  } catch (err) {
    results.store = { success: false, error: err.message };
  }

  try {
    results.product = await seedProductService(productEnv);
  } catch (err) {
    results.product = { success: false, error: err.message };
  }

  try {
    await seedInventoryService(inventoryEnv);
    results.inventory = { success: true };
  } catch (err) {
    results.inventory = { success: false, error: err.message };
  }

  try {
    await seedCartService(cartEnv);
    results.cart = { success: true };
  } catch (err) {
    results.cart = { success: false, error: err.message };
  }

  try {
    await seedOrderService(orderEnv);
    results.order = { success: true };
  } catch (err) {
    results.order = { success: false, error: err.message };
  }

  try {
    await seedPaymentService(paymentEnv);
    results.payment = { success: true };
  } catch (err) {
    results.payment = { success: false, error: err.message };
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${SEP}`);
  console.log(' Seed Summary');
  console.log(SEP);
  for (const [svc, result] of Object.entries(results)) {
    const icon = result.success ? '✓' : (result.blocker ? '⚠' : '✗');
    const note = result.blocker
      ? `[BLOCKER: ${result.blocker}]`
      : result.error
        ? `[ERROR: ${result.error}]`
        : '[OK]';
    console.log(`  ${icon} ${svc.padEnd(12)} ${note}`);
  }

  const hasBlocker = Object.values(results).some(r => r.blocker);
  const allSuccess = Object.values(results).every(r => r.success);

  console.log(SEP);
  if (allSuccess) {
    console.log(' ✓ All services seeded successfully.');
  } else if (hasBlocker) {
    console.log(' ⚠ Seed completed with BLOCKER(S). Check MongoDB Atlas connectivity.');
  } else {
    console.log(' ⚠ Seed completed with error(s). Review output above.');
  }

  // Write summary to seed report
  const reportPath = path.join(rootDir, 'docs/phase-5e1-seed-data-report.md');
  const reportContent = generateSeedReport(results);
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`\n  Report written to: docs/phase-5e1-seed-data-report.md`);

  console.log(`\n${SEP}\n`);
  process.exit(hasBlocker ? 1 : 0);
}

function generateSeedReport(results) {
  const lines = [
    '# Phase 5E.1 Seed Data Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Fixed Seed IDs',
    '',
    '| Name | ID |',
    '|------|----|',
    `| adminId | \`${SEED_IDS.adminId}\` |`,
    `| sellerId | \`${SEED_IDS.sellerId}\` |`,
    `| buyerId | \`${SEED_IDS.buyerId}\` |`,
    `| shopId | \`${SEED_IDS.shopId}\` |`,
    `| categoryId | \`${SEED_IDS.categoryId}\` |`,
    `| productId | \`${SEED_IDS.productId}\` |`,
    `| variantId | \`${SEED_IDS.variantId}\` |`,
    `| imageId | \`${SEED_IDS.imageId}\` |`,
    '',
    '## Seed Results',
    '',
    '| Service | Status | Detail |',
    '|---------|--------|--------|',
  ];

  const svcLabels = {
    auth:      'Auth Service (auth_users)',
    store:     'Store Service (shops)',
    product:   'Product Service (MongoDB)',
    inventory: 'Inventory Service (inventory_items)',
    cart:      'Cart Service (cart_state)',
    order:     'Order Service (schema check)',
    payment:   'Payment Service (schema check)',
  };

  for (const [svc, result] of Object.entries(results)) {
    const label = svcLabels[svc] || svc;
    const status = result.success ? '✅ SUCCESS' : (result.blocker ? `⚠️ BLOCKER: ${result.blocker}` : `❌ ERROR: ${result.error}`);
    lines.push(`| ${label} | ${status} | - |`);
  }

  lines.push('');
  lines.push('## Known Blockers');
  lines.push('');
  const blockers = Object.entries(results)
    .filter(([, r]) => r.blocker)
    .map(([svc, r]) => `- **${svc}**: ${r.blocker}${r.error ? ` — ${r.error}` : ''}`);
  if (blockers.length > 0) {
    lines.push(...blockers);
  } else {
    lines.push('_No blockers._');
  }

  lines.push('');
  lines.push('## ID Linkage Contract');
  lines.push('');
  lines.push('```');
  lines.push('auth_users.id  (buyer)  = orders.auth_user_id');
  lines.push('               = cart_state.userId');
  lines.push('               = shop_orders.seller_id  ← NO: shop_orders.seller_id = auth_users.id (SELLER)');
  lines.push('');
  lines.push('auth_users.id  (seller) = shops.seller_id');
  lines.push('                           = shop_orders.seller_id');
  lines.push('');
  lines.push('shops.id                 = products.shopId');
  lines.push('               = inventory_items.shop_id');
  lines.push('               = shop_orders.shop_id');
  lines.push('               = cart_items[].shopId');
  lines.push('');
  lines.push('products.id              = product_variants.productId');
  lines.push('               = inventory_items.product_id');
  lines.push('               = cart_items[].productId');
  lines.push('               = shop_order_items.product_id');
  lines.push('');
  lines.push('product_variants.id       = inventory_items.variant_id');
  lines.push('               = cart_items[].variantId');
  lines.push('               = shop_order_items.variant_id');
  lines.push('```');
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Password hashes are placeholders. Auth service uses JWT from API Gateway for test requests.');
  lines.push('- MongoDB Atlas connection may fail with TLS alert — this is a known infrastructure issue.');
  lines.push('- All PostgreSQL services use Neon Tech SSL connections.');
  lines.push('- Cart is pre-seeded with 1 item for buyer to test checkout flow.');

  return lines.join('\n');
}

main().catch(err => {
  console.error('\nFatal seed error:', err.message);
  process.exit(1);
});
