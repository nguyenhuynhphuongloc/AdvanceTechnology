const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = "mongodb://admin:password@mongodb:27017/neondb?authSource=admin";
const client = new MongoClient(uri);

const categories = [
  { name: 'T-SHIRTS', slug: 't-shirts', img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { name: 'SHIRTS', slug: 'shirts', img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" },
  { name: 'TROUSERS', slug: 'trousers', img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=800" },
  { name: 'JACKETS', slug: 'jackets', img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: 'HOODIES', slug: 'hoodies', img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { name: 'FOOTWEAR', slug: 'footwear', img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { name: 'ACCESSORIES', slug: 'accessories', img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" }
].map(c => ({ id: crypto.randomUUID(), ...c }));

const shopNames = [
  "Urban Style Hub", "Elite Garments", "Trendify Store", "Cotton Cloud", 
  "Modern Threads", "Vogue Essentials", "Street Legacy", "Minimalist Collective"
];

const generateProducts = (category) => {
  const products = [];
  const categoryImages = [];
  const variants = [];
  
  for (let i = 1; i <= 5; i++) {
    const productId = crypto.randomUUID();
    const productSlug = `${category.slug}-model-${i}`;
    const mainImagePublicId = `sample_${category.slug}_${i}`;
    const basePrice = Math.floor(Math.random() * 50) + 20;
    const sellerName = shopNames[Math.floor(Math.random() * shopNames.length)];

    products.push({
      _id: productId,
      id: productId,
      name: `${category.name.charAt(0) + category.name.slice(1).toLowerCase()} Style ${i}`,
      slug: productSlug,
      sku: `${category.slug.toUpperCase()}-${i}00${i}`,
      description: `Premium quality ${category.name.toLowerCase()} designed for maximum comfort and style. Featuring durable fabrics and modern tailoring suitable for all seasons.`,
      basePrice: basePrice.toFixed(2),
      isActive: true,
      categorySlug: category.slug,
      sellerName: sellerName,
      productionDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      mainImagePublicId: mainImagePublicId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    categoryImages.push({
      id: crypto.randomUUID(),
      productId: productId,
      imageUrl: category.img,
      publicId: mainImagePublicId,
      altText: `${category.name} product image ${i}`,
      sortOrder: 0,
      isMain: true
    });

    variants.push({
      id: crypto.randomUUID(),
      productId: productId,
      sku: `${category.slug.toUpperCase()}-${i}00${i}-S`,
      size: 'S',
      color: 'Default',
      priceOverride: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: crypto.randomUUID(),
      productId: productId,
      sku: `${category.slug.toUpperCase()}-${i}00${i}-M`,
      size: 'M',
      color: 'Default',
      priceOverride: (basePrice + 5).toFixed(2),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return { products, categoryImages, variants };
};

async function seed() {
  try {
    await client.connect();
    const db = client.db("neondb");

    await db.collection("categories").deleteMany({});
    await db.collection("products").deleteMany({});
    await db.collection("product_images").deleteMany({});
    await db.collection("product_variants").deleteMany({});

    await db.collection("categories").insertMany(categories);
    console.log(`Inserted ${categories.length} categories`);

    for (const cat of categories) {
      const { products, categoryImages, variants } = generateProducts(cat);
      await db.collection("products").insertMany(products);
      await db.collection("product_images").insertMany(categoryImages);
      await db.collection("product_variants").insertMany(variants);
      console.log(`Successfully seeded ${cat.name}`);
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    await client.close();
  }
}

seed();
