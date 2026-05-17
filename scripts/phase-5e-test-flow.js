/**
 * Phase 5E — Marketplace Flow Test Script (Corrected DTOs)
 * Tests: register → shop → category → product → inventory → cart → checkout
 */
const axios = require('axios');
const { Client } = require('pg');

const SERVICES = {
  auth: 'http://localhost:3008',
  gateway: 'http://localhost:3000',
  store: 'http://localhost:3012',
  product: 'http://localhost:3001',
  cart: 'http://localhost:3007',
  order: 'http://localhost:3004',
  inventory: 'http://localhost:3006',
  payment: 'http://localhost:3003',
};

const DB_ORDER = {
  host: 'ep-cold-dream-a1rxuc3e-pooler.ap-southeast-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_OSo2hygB0Dwv',
  database: 'neondb',
};

const delay = ms => new Promise(r => setTimeout(r, ms));

async function api(method, url, body, headers = {}) {
  try {
    const res = await axios({ method, url, data: body, headers, timeout: 15000 });
    return { ok: true, data: res.data, status: res.status };
  } catch (e) {
    return {
      ok: false,
      status: e.response?.status,
      data: e.response?.data,
      message: e.message,
    };
  }
}

function log(label, result, maxLen = 300) {
  const s = typeof result === 'string' ? result : JSON.stringify(result);
  console.log(`  [${label}] ${s.length > maxLen ? s.substring(0, maxLen) + '...' : s}`);
}

async function main() {
  console.log('=== Phase 5E Marketplace Flow Test ===\n');

  // ── 1. Admin Login ──────────────────────────────────────────────────────────
  console.log('[1] Admin login...');
  const adminLogin = await api('POST', `${SERVICES.auth}/api/v1/auth/login`, {
    email: 'admin@example.com',
    password: 'Password123!',
  });
  if (!adminLogin.ok) {
    console.log('    FAIL: cannot login admin'); process.exit(1);
  }
  const adminToken = adminLogin.data.accessToken;
  const adminId = adminLogin.data.user?.id;
  log('adminId', adminId);
  console.log('    OK');

  // ── 2. Register Seller ──────────────────────────────────────────────────────
  console.log('\n[2] Register seller account...');
  const sellerEmail = `seller_p5e_${Date.now()}@test.local`;
  const sellerPassword = 'TestSeller123!';
  const sellerRegister = await api('POST', `${SERVICES.auth}/api/v1/auth/register`, {
    email: sellerEmail,
    password: sellerPassword,
    name: 'Phase 5E Test Seller',   // ← required by RegisterDto
    role: 'seller',
  });
  if (!sellerRegister.ok) {
    console.log('    FAIL:', JSON.stringify(sellerRegister.data));
    process.exit(1);
  }
  console.log('    OK:', sellerRegister.data.user?.id);

  await delay(500);

  // ── 3. Seller Login ────────────────────────────────────────────────────────
  console.log('\n[3] Seller login...');
  const sellerLogin = await api('POST', `${SERVICES.auth}/api/v1/auth/login`, {
    email: sellerEmail,
    password: sellerPassword,
  });
  if (!sellerLogin.ok) {
    console.log('    FAIL:', JSON.stringify(sellerLogin.data)); process.exit(1);
  }
  const sellerToken = sellerLogin.data.accessToken;
  const sellerId = sellerLogin.data.user?.id;
  log('sellerId', sellerId);
  console.log('    OK');

  // ── 4. Seller Create Shop ──────────────────────────────────────────────────
  console.log('\n[4] Seller create shop...');
  const shopSlug = `s-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
  const shopRes = await api('POST', `${SERVICES.store}/api/v1/seller/shop`, {
    name: `Phase 5E Test Shop ${Date.now()}`,
    slug: shopSlug,
    description: 'Test shop for Phase 5E flow verification',
    contactEmail: sellerEmail,
  }, { Authorization: `Bearer ${sellerToken}`, 'x-user-id': sellerId });
  if (!shopRes.ok) {
    console.log('    FAIL:', JSON.stringify(shopRes.data)); process.exit(1);
  }
  const shopId = shopRes.data.id;
  log('shopId', shopId);
  console.log('    OK');

  await delay(500);

  // ── 5. Admin Approve Shop ─────────────────────────────────────────────────
  console.log('\n[5] Admin approve shop...');
  const approveRes = await api('PATCH', `${SERVICES.store}/api/v1/admin/shops/${shopId}/approve`, {}, {
    Authorization: `Bearer ${adminToken}`,
  });
  if (!approveRes.ok) {
    console.log('    FAIL:', JSON.stringify(approveRes.data)); process.exit(1);
  }
  log('shop status', approveRes.data.status);
  console.log('    OK');

  await delay(500);

  // ── 6. Admin Create Category ───────────────────────────────────────────────
  console.log('\n[6] Admin create category...');
  const catRes = await api('POST', `${SERVICES.product}/api/v1/admin/categories`, {
    name: `Phase 5E Test Category ${Date.now()}`,
    slug: `test-cat-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
  }, { Authorization: `Bearer ${adminToken}` });
  if (!catRes.ok) {
    console.log('    FAIL:', JSON.stringify(catRes.data)); process.exit(1);
  }
  const categoryId = catRes.data.id;
  log('categoryId', categoryId);
  console.log('    OK');

  await delay(500);

  // ── 7. Admin Upload Image (for mainImage) ──────────────────────────────────
  console.log('\n[7] Upload product image...');
  // Create a minimal 1x1 transparent PNG in memory (base64)
  // This will be uploaded to Cloudinary
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const buf = Buffer.from(pngBase64, 'base64');
  let imageRes;
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buf, { filename: 'test.png', contentType: 'image/png' });
    imageRes = await axios.post(`${SERVICES.product}/api/v1/products/upload-image`, form.getBuffer(), {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${adminToken}` },
      timeout: 20000,
    });
  } catch (e) {
    // Fallback: try with admin token for product-service upload
    console.log('    (upload via admin route)');
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', buf, { filename: 'test.png', contentType: 'image/png' });
      imageRes = await axios.post(`${SERVICES.product}/api/v1/admin/products/upload-image`, form.getBuffer(), {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${adminToken}` },
        timeout: 20000,
      });
    } catch (e2) {
      imageRes = null;
    }
  }
  if (!imageRes?.data?.publicId) {
    console.log('    WARN: Could not upload image. Using placeholder.');
  } else {
    log('publicId', imageRes.data.publicId);
    console.log('    OK');
  }
  const publicId = imageRes?.data?.publicId || 'placeholder_public_id_' + Date.now();
  const imageUrl = imageRes?.data?.url || 'https://via.placeholder.com/300';

  await delay(500);

  // ── 8. Seller Create Product ───────────────────────────────────────────────
  console.log('\n[8] Seller create product...');
  const testSku = `TEST-SKU-${Date.now()}-${process.hrtime.bigint() % 100000n}`;
  const productRes = await api('POST', `${SERVICES.product}/api/v1/seller/products`, {
    name: `Phase 5E Test Product ${Date.now()}`,
    slug: `test-product-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    description: 'Test product for Phase 5E flow verification',
    categoryId: categoryId,
    sku: testSku,
    basePrice: 199000,        // ← basePrice, not "price"
    mainImage: {               // ← required by CreateProductDto
      imageUrl: imageUrl,
      publicId: publicId,
      altText: 'Test product image',
    },
    variants: [
      {
        sku: `${testSku}-M-BLK`,
        size: 'M',
        color: 'Black',
        priceOverride: 199000,
      },
      {
        sku: `${testSku}-L-BLK`,
        size: 'L',
        color: 'Black',
        priceOverride: 229000,
      },
    ],
  }, { Authorization: `Bearer ${sellerToken}`, 'x-user-id': sellerId });
  if (!productRes.ok) {
    console.log('    FAIL:', JSON.stringify(productRes.data)); process.exit(1);
  }
  const productId = productRes.data.id;
  const variantId = productRes.data.variants?.[0]?.id;
  const variantId2 = productRes.data.variants?.[1]?.id;
  log('productId', productId);
  log('variantId', variantId);
  log('variantId2', variantId2);
  console.log('    OK');

  await delay(500);

  // ── 9. Admin Approve Product ────────────────────────────────────────────────
  console.log('\n[9] Admin approve product...');
  const approveProductRes = await api('PATCH',
    `${SERVICES.product}/api/v1/admin/products/moderation/${productId}/approve`, {},
    { Authorization: `Bearer ${adminToken}` }
  );
  if (!approveProductRes.ok) {
    console.log('    FAIL:', JSON.stringify(approveProductRes.data)); process.exit(1);
  }
  log('approvalStatus', approveProductRes.data.approvalStatus);
  console.log('    OK');

  await delay(500);

  // ── 10. Seller Create Inventory (for both variants) ────────────────────────
  console.log('\n[10] Seller create inventory (variant 1)...');
  const invRes = await api('POST', `${SERVICES.inventory}/api/v1/seller/inventory`, {
    productId: productId,
    variantId: variantId,
    stock: 100,
    lowStockThreshold: 10,
  }, { Authorization: `Bearer ${sellerToken}`, 'x-user-id': sellerId });
  if (!invRes.ok) {
    console.log('    FAIL:', JSON.stringify(invRes.data)); process.exit(1);
  }
  log('inventory', invRes.data);
  console.log('    OK');

  await delay(300);

  console.log('\n[10b] Seller create inventory (variant 2)...');
  const invRes2 = await api('POST', `${SERVICES.inventory}/api/v1/seller/inventory`, {
    productId: productId,
    variantId: variantId2,
    stock: 50,
    lowStockThreshold: 5,
  }, { Authorization: `Bearer ${sellerToken}`, 'x-user-id': sellerId });
  if (!invRes2.ok) {
    console.log('    FAIL:', JSON.stringify(invRes2.data)); process.exit(1);
  }
  console.log('    OK');

  await delay(500);

  // ── 11. Buyer: Register + Login ─────────────────────────────────────────────
  console.log('\n[11] Register buyer account...');
  const buyerEmail = `buyer_p5e_${Date.now()}@test.local`;
  const buyerPassword = 'TestBuyer123!';
  const buyerReg = await api('POST', `${SERVICES.auth}/api/v1/auth/register`, {
    email: buyerEmail,
    password: buyerPassword,
    name: 'Phase 5E Test Buyer',
    role: 'customer',
  });
  if (!buyerReg.ok) {
    console.log('    FAIL:', JSON.stringify(buyerReg.data)); process.exit(1);
  }
  console.log('    Buyer registered:', buyerReg.data.user?.id);

  await delay(500);

  const buyerLogin = await api('POST', `${SERVICES.auth}/api/v1/auth/login`, {
    email: buyerEmail,
    password: buyerPassword,
  });
  if (!buyerLogin.ok) {
    console.log('    FAIL:', JSON.stringify(buyerLogin.data)); process.exit(1);
  }
  const buyerToken = buyerLogin.data.accessToken;
  const buyerId = buyerLogin.data.user?.id;
  log('buyerId', buyerId);
  console.log('    OK');

  // ── 12. Add both variants to Cart ───────────────────────────────────────────
  console.log('\n[12] Add variant 1 (M, 199K) to cart...');
  const cartRes = await api('POST', `${SERVICES.cart}/api/v1/carts/me/items`, {
    productId: productId,
    variantId: variantId,
    quantity: 2,
  }, { 'x-user-id': buyerId });
  if (!cartRes.ok) {
    console.log('    FAIL:', JSON.stringify(cartRes.data)); process.exit(1);
  }
  log('cart add result', cartRes.data);
  console.log('    OK');

  await delay(300);

  console.log('\n[12b] Add variant 2 (L, 229K) to cart...');
  const cartRes2 = await api('POST', `${SERVICES.cart}/api/v1/carts/me/items`, {
    productId: productId,
    variantId: variantId2,
    quantity: 1,
  }, { 'x-user-id': buyerId });
  if (!cartRes2.ok) {
    console.log('    FAIL:', JSON.stringify(cartRes2.data)); process.exit(1);
  }
  console.log('    OK');

  await delay(500);

  // ── 13. Get Cart ────────────────────────────────────────────────────────────
  console.log('\n[13] Get cart...');
  const getCartRes = await api('GET', `${SERVICES.cart}/api/v1/carts/me`, null, {
    'x-user-id': buyerId,
  });
  if (!getCartRes.ok) {
    console.log('    FAIL:', JSON.stringify(getCartRes.data));
  } else {
    log('cart', getCartRes.data);
    console.log('    OK');
  }

  await delay(500);

  // ── 14. Checkout ────────────────────────────────────────────────────────────
  console.log('\n[14] Checkout...');
  const checkoutRes = await api('POST', `${SERVICES.order}/api/v1/orders/checkout`, {
    shippingAddress: {
      fullName: 'Phase 5E Test Buyer',
      phone: '0909000000',
      province: 'Ho Chi Minh City',
      district: 'District 1',
      ward: 'Ward 1',
      street: '123 Test Street',
    },
    paymentMethod: 'cod',
    note: 'Phase 5E test checkout',
  }, {
    Authorization: `Bearer ${buyerToken}`,
    'x-user-id': buyerId,
  });
  if (!checkoutRes.ok) {
    console.log('    FAIL:', JSON.stringify(checkoutRes.data));
  } else {
    log('checkout', checkoutRes.data);
    console.log('    OK');
  }

  await delay(1000);

  // ── 15. DB Verification ────────────────────────────────────────────────────
  console.log('\n[15] DB Verification...');
  const pg = new Client({ ...DB_ORDER, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  const orders = await pg.query('SELECT id, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
  console.log('  orders:', orders.rows.map(r =>
    `${r.id?.substring(0,8)}... status=${r.status} total=${r.total_amount}`
  ).join(', '));

  const shopOrders = await pg.query('SELECT id, "order_id", "shop_id", status, subtotal FROM shop_orders ORDER BY id DESC LIMIT 5');
  console.log('  shop_orders:', shopOrders.rows.length, 'rows');
  if (shopOrders.rows.length > 0) {
    shopOrders.rows.forEach(r => {
      console.log(`    ${r.id?.substring(0,8)}... order=${r.order_id?.substring(0,8)}... shop=${r.shop_id?.substring(0,8)}... status=${r.status} subtotal=${r.subtotal}`);
    });
  }

  const shopOrderItems = await pg.query('SELECT id, "shop_order_id", "product_id", quantity, "unit_price_snapshot" FROM shop_order_items ORDER BY id DESC LIMIT 10');
  console.log('  shop_order_items:', shopOrderItems.rows.length, 'rows');
  if (shopOrderItems.rows.length > 0) {
    shopOrderItems.rows.forEach(r => {
      console.log(`    ${r.id?.substring(0,8)}... shop_order=${r.shop_order_id?.substring(0,8)}... product=${r.product_id?.substring(0,8)}... qty=${r.quantity}`);
    });
  }

  await pg.end();

  // ── 16. Seller: List Shop Orders ───────────────────────────────────────────
  console.log('\n[16] Seller list shop orders...');
  const sellerOrders = await api('GET', `${SERVICES.order}/api/v1/seller/orders`, null, {
    Authorization: `Bearer ${sellerToken}`,
    'x-user-id': sellerId,
  });
  if (!sellerOrders.ok) {
    console.log('    FAIL:', JSON.stringify(sellerOrders.data));
  } else {
    log('seller orders', sellerOrders.data);
    console.log('    OK');
  }

  // ── 17. Admin: List Shop Orders ────────────────────────────────────────────
  console.log('\n[17] Admin list shop orders...');
  const adminShopOrders = await api('GET', `${SERVICES.order}/api/v1/admin/shop-orders`, null, {
    Authorization: `Bearer ${adminToken}`,
  });
  if (!adminShopOrders.ok) {
    console.log('    FAIL:', JSON.stringify(adminShopOrders.data));
  } else {
    log('admin shop orders', adminShopOrders.data);
    console.log('    OK');
  }

  console.log('\n=== Flow Test Complete ===');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
