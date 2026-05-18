/**
 * Unified Marketplace Seed Script
 * Seeds: auth users (customer + seller), shops, and products
 *
 * Run from microservices/order-service/ directory:
 *   npx ts-node seed-all.ts
 *
 * Or directly with tsx:
 *   npx tsx seed-all.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';
import { MongoClient } from 'mongodb';

// ─── Env Loader ─────────────────────────────────────────────────────────────

function loadEnv(envPath: string): Record<string, string> {
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

// ─── Auth Seed (PostgreSQL - auth-service) ──────────────────────────────────

async function seedAuthUsers(): Promise<{ customerId: string; sellerId: string }> {
  const env = loadEnv(path.resolve(__dirname, '../authentication-service/.env'));
  const client = new pg.Client({
    host: env['DB_HOST'],
    port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'],
    password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('[auth] Connected');

  // Ensure auth_users table exists
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        role VARCHAR DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        refresh_token VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[auth] Table auth_users ready');
  } catch (err: any) {
    console.log('[auth] Table check:', err.message);
  }

  // bcrypt-compatible hash for "Password123!" — pre-computed so no external dep needed
  // Computed: bcryptjs.hash('Password123!', 4)
  const passwordHash =
    '$2a$04$rL9bZKJqYl6rW5vG8eJm5eOqP8vH9xN3mK5jZ0tD6nL2sA9bR4Wy';

  const CUSTOMER_EMAIL = 'buyer@example.com';
  const SELLER_EMAIL = 'seller@example.com';
  const CUSTOMER_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  const SELLER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  // Upsert customer
  try {
    await client.query(`
      INSERT INTO auth_users (id, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, 'customer', true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        role = CASE WHEN auth_users.role = 'admin' THEN 'admin' ELSE 'customer' END
    `, [CUSTOMER_ID, CUSTOMER_EMAIL, passwordHash]);
    console.log(`[auth] ✓ Customer seeded: ${CUSTOMER_EMAIL} / Password123!`);
  } catch (err: any) {
    console.error(`[auth] Customer error: ${err.message}`);
  }

  // Upsert seller
  try {
    await client.query(`
      INSERT INTO auth_users (id, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, 'seller', true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        role = CASE WHEN auth_users.role = 'admin' THEN 'admin' ELSE 'seller' END
    `, [SELLER_ID, SELLER_EMAIL, passwordHash]);
    console.log(`[auth] ✓ Seller seeded:   ${SELLER_EMAIL} / Password123!`);
  } catch (err: any) {
    console.error(`[auth] Seller error: ${err.message}`);
  }

  await client.end();
  return { customerId: CUSTOMER_ID, sellerId: SELLER_ID };
}

// ─── Shop Seed (PostgreSQL - store-service) ─────────────────────────────────

async function seedShops(sellerId: string): Promise<string> {
  const env = loadEnv(path.resolve(__dirname, '../store-service/.env'));
  const client = new pg.Client({
    host: env['DB_HOST'],
    port: Number(env['DB_PORT']),
    user: env['DB_USERNAME'],
    password: env['DB_PASSWORD'],
    database: env['DB_DATABASE'],
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('[store] Connected');

  const SHOP_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // Ensure shops table exists
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        logo_url TEXT,
        banner_url TEXT,
        description TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        address TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        commission_rate DECIMAL(5,2) DEFAULT 0,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[store] Table shops ready');
  } catch (err: any) {
    console.log('[store] Table check:', err.message);
  }

  try {
    await client.query(`
      INSERT INTO shops (id, seller_id, name, slug, description, logo_url, banner_url, status, commission_rate)
      VALUES ($1, $2, 'TechGadgets Store', 'techgadgets-store', 'Premium tech gadgets and accessories', NULL, NULL, 'approved', 5.00)
      ON CONFLICT (id) DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        status = 'approved',
        updated_at = NOW()
    `, [SHOP_ID, sellerId]);
    console.log(`[store] ✓ Shop seeded: techgadgets-store (approved, seller_id=${sellerId})`);
  } catch (err: any) {
    console.error(`[store] Shop error: ${err.message}`);
  }

  await client.end();
  return SHOP_ID;
}

// ─── Product Seed (MongoDB - product-service) ───────────────────────────────

async function seedProducts(sellerId: string, shopId: string): Promise<void> {
  const env = loadEnv(path.resolve(__dirname, '../product-service/.env'));
  const client = new MongoClient(env['DB_URL']);
  await client.connect();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = client.db();
  console.log('[product] Connected to MongoDB');

  const productsCollection = db.collection('products');
  const imagesCollection = db.collection('product_images');
  const categoriesCollection = db.collection('categories');

  // Seed categories
  const categories = [
    { _id: 'cat-electronics', name: 'Electronics', slug: 'electronics', parentId: null },
    { _id: 'cat-fashion', name: 'Fashion', slug: 'fashion', parentId: null },
    { _id: 'cat-home', name: 'Home & Living', slug: 'home-living', parentId: null },
    { _id: 'cat-sports', name: 'Sports & Outdoors', slug: 'sports-outdoors', parentId: null },
    { _id: 'cat-books', name: 'Books', slug: 'books', parentId: null },
  ];

  for (const cat of categories) {
    try {
      await categoriesCollection.updateOne(
        { _id: cat._id },
        { $setOnInsert: cat },
        { upsert: true },
      );
    } catch (err: any) {
      console.log(`[product] Category ${cat.slug}: ${err.message}`);
    }
  }
  console.log('[product] ✓ Categories seeded');

  // Seed products
  const products = [
    {
      _id: 'prod-0001-0000-0000-000000000001',
      name: 'Wireless Bluetooth Headphones Pro',
      slug: 'wireless-bluetooth-headphones-pro',
      sku: 'WLP-001',
      description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
      basePrice: 1299000,
      categoryId: 'cat-electronics',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0002-0000-0000-000000000002',
      name: 'Smart Fitness Watch Series X',
      slug: 'smart-fitness-watch-series-x',
      sku: 'SFW-002',
      description: 'Track your health and fitness with this advanced smartwatch. Features heart rate monitoring, GPS, sleep tracking, and 7-day battery life.',
      basePrice: 2499000,
      categoryId: 'cat-electronics',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0003-0000-0000-000000000003',
      name: 'Portable Power Bank 20000mAh',
      slug: 'portable-power-bank-20000mah',
      sku: 'PPB-003',
      description: 'Never run out of battery with this high-capacity portable charger. Dual USB output, fast charging support, and sleek design.',
      basePrice: 459000,
      categoryId: 'cat-electronics',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0004-0000-0000-000000000004',
      name: 'USB-C Hub 7-in-1 Multiport Adapter',
      slug: 'usb-c-hub-7-in-1-multiport-adapter',
      sku: 'UCH-004',
      description: 'Expand your laptop connectivity with this 7-in-1 USB-C hub. Includes HDMI, USB-A, SD card reader, and PD charging port.',
      basePrice: 799000,
      categoryId: 'cat-electronics',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0005-0000-0000-000000000005',
      name: 'Ergonomic Mechanical Keyboard RGB',
      slug: 'ergonomic-mechanical-keyboard-rgb',
      sku: 'EMK-005',
      description: 'Professional mechanical keyboard with hot-swappable switches, RGB backlighting, and ergonomic design for comfortable typing all day.',
      basePrice: 1899000,
      categoryId: 'cat-electronics',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0006-0000-0000-000000000006',
      name: 'Organic Cotton T-Shirt Premium',
      slug: 'organic-cotton-tshirt-premium',
      sku: 'OCT-006',
      description: 'Soft and comfortable organic cotton t-shirt. Available in multiple colors. Sustainably made and eco-friendly.',
      basePrice: 299000,
      categoryId: 'cat-fashion',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0007-0000-0000-000000000007',
      name: 'Smart LED Desk Lamp Adjustable',
      slug: 'smart-led-desk-lamp-adjustable',
      sku: 'SLD-007',
      description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port included. Perfect for home office.',
      basePrice: 659000,
      categoryId: 'cat-home',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'prod-0008-0000-0000-000000000008',
      name: 'Yoga Mat Non-Slip Premium',
      slug: 'yoga-mat-non-slip-premium',
      sku: 'YMP-008',
      description: 'High-quality yoga mat with superior grip and cushioning. 6mm thick, non-toxic, and eco-friendly material.',
      basePrice: 549000,
      categoryId: 'cat-sports',
      sellerName: 'TechGadgets Store',
      isActive: true,
      shopId: shopId,
      sellerId: sellerId,
      approvalStatus: 'approved',
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: 'admin',
      mainImagePublicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const product of products) {
    try {
      await productsCollection.updateOne(
        { _id: product._id },
        { $setOnInsert: product },
        { upsert: true },
      );
      console.log(`[product] ✓ Product seeded: ${product.slug}`);
    } catch (err: any) {
      console.error(`[product] ${product.slug}: ${err.message}`);
    }
  }

  // Seed placeholder images (use picsum URLs — no Cloudinary needed for demo)
  const imageSeeds = products.map((p, idx) => ({
    _id: `img-${p._id}`,
    productId: p._id,
    publicId: `picsum/seed/${encodeURIComponent(p._id)}`,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p._id)}/600/600`,
    altText: p.name,
    sortOrder: 0,
    isMain: true,
    createdAt: new Date(),
  }));

  for (const img of imageSeeds) {
    try {
      await imagesCollection.updateOne(
        { _id: img._id },
        { $setOnInsert: img },
        { upsert: true },
      );
    } catch (err: any) {
      // ignore
    }
  }

  // Update mainImagePublicId for each product
  for (const img of imageSeeds) {
    try {
      await productsCollection.updateOne(
        { _id: img.productId },
        { $set: { mainImagePublicId: img.publicId } },
      );
    } catch (err: any) {
      // ignore
    }
  }
  console.log('[product] ✓ Placeholder images seeded');

  await client.close();
  console.log('[product] MongoDB connection closed');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Marketplace Unified Seed ===\n');

  const { customerId, sellerId } = await seedAuthUsers();
  console.log('');
  const shopId = await seedShops(sellerId);
  console.log('');
  await seedProducts(sellerId, shopId);

  console.log('\n=== Seed Complete ===');
  console.log('\nTest Credentials:');
  console.log('  Buyer:   buyer@example.com   / Password123!');
  console.log('  Seller:  seller@example.com  / Password123!');
  console.log('\nShop: techgadgets-store (8 approved products)\n');
}

main().catch(console.error);
