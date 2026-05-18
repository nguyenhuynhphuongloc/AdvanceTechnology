export const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active", createdAt: "2024-01-15", orders: 12 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", createdAt: "2024-02-20", orders: 8 },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", status: "inactive", createdAt: "2024-03-10", orders: 3 },
  { id: 4, name: "Alice Brown", email: "alice@example.com", status: "active", createdAt: "2024-04-05", orders: 15 },
];

export const mockSellers = [
  { id: 1, name: "Tech Store", email: "tech@store.com", status: "approved", revenue: 45000, products: 120 },
  { id: 2, name: "Fashion Hub", email: "fashion@hub.com", status: "approved", revenue: 32000, products: 85 },
  { id: 3, name: "Home Decor", email: "home@decor.com", status: "pending", revenue: 0, products: 5 },
];

export const mockSellerProfiles = [
  { id: 1, shopName: "Tech Store", ownerName: "Mike Johnson", status: "approved", submittedAt: "2024-01-10" },
  { id: 2, shopName: "Fashion Hub", ownerName: "Sarah Lee", status: "approved", submittedAt: "2024-01-20" },
  { id: 3, shopName: "Home Decor", ownerName: "Tom Anderson", status: "pending", submittedAt: "2024-05-15" },
  { id: 4, shopName: "Pet Paradise", ownerName: "Lisa White", status: "rejected", submittedAt: "2024-05-10" },
];

export const mockShopApprovals = [
  { id: 1, shopName: "Home Decor", owner: "Tom Anderson", description: "Premium home decoration items", submittedAt: "2024-05-15", status: "pending" },
  { id: 2, shopName: "Sports Gear", owner: "Chris Martin", description: "Quality sports equipment", submittedAt: "2024-05-16", status: "pending" },
  { id: 3, shopName: "Book Store", owner: "Emma Davis", description: "Books for all ages", submittedAt: "2024-05-14", status: "pending" },
];

export const mockProductApprovals = [
  { id: 1, name: "Wireless Earbuds Pro", shop: "Tech Store", price: 89.99, status: "pending", submittedAt: "2024-05-17" },
  { id: 2, name: "Leather Jacket", shop: "Fashion Hub", price: 199.99, status: "pending", submittedAt: "2024-05-16" },
  { id: 3, name: "Ceramic Vase", shop: "Home Decor", price: 45.00, status: "pending", submittedAt: "2024-05-15" },
];

export const mockProducts = [
  { id: 1, name: "iPhone 15 Pro", category: "Electronics", shop: "Tech Store", price: 999, stock: 45, status: "approved" },
  { id: 2, name: "Samsung Galaxy S24", category: "Electronics", shop: "Tech Store", price: 899, stock: 32, status: "approved" },
  { id: 3, name: "Designer Dress", category: "Fashion", shop: "Fashion Hub", price: 149, stock: 15, status: "approved" },
  { id: 4, name: "Running Shoes", category: "Fashion", shop: "Fashion Hub", price: 89, stock: 8, status: "approved" },
  { id: 5, name: "Table Lamp", category: "Home", shop: "Home Decor", price: 45, stock: 0, status: "pending" },
];

export const mockCategories = [
  { id: 1, name: "Electronics", slug: "electronics", productCount: 245, status: "active", createdAt: "2024-01-01" },
  { id: 2, name: "Fashion", slug: "fashion", productCount: 189, status: "active", createdAt: "2024-01-01" },
  { id: 3, name: "Home & Garden", slug: "home-garden", productCount: 156, status: "active", createdAt: "2024-01-01" },
  { id: 4, name: "Sports", slug: "sports", productCount: 98, status: "active", createdAt: "2024-02-01" },
  { id: 5, name: "Books", slug: "books", productCount: 0, status: "draft", createdAt: "2024-05-15" },
];

export const mockInventory = [
  { id: 1, sku: "IPH15-PRO-256-BLK", product: "iPhone 15 Pro", variant: "256GB Black", available: 45, reserved: 5, status: "in-stock" },
  { id: 2, sku: "SAM-S24-128-WHT", product: "Samsung Galaxy S24", variant: "128GB White", available: 32, reserved: 3, status: "in-stock" },
  { id: 3, sku: "DRS-FLR-M-RED", product: "Designer Dress", variant: "M Red", available: 15, reserved: 2, status: "in-stock" },
  { id: 4, sku: "SHO-RUN-42-BLU", product: "Running Shoes", variant: "Size 42 Blue", available: 8, reserved: 1, status: "low-stock" },
  { id: 5, sku: "LMP-TBL-WHT", product: "Table Lamp", variant: "White", available: 0, reserved: 0, status: "out-of-stock" },
];

export const mockOrders = [
  { id: "ORD-001", customer: "John Doe", total: 1089, status: "delivered", paymentStatus: "paid", items: 2, createdAt: "2024-05-10" },
  { id: "ORD-002", customer: "Jane Smith", total: 149, status: "shipped", paymentStatus: "paid", items: 1, createdAt: "2024-05-15" },
  { id: "ORD-003", customer: "Bob Wilson", total: 899, status: "processing", paymentStatus: "paid", items: 1, createdAt: "2024-05-16" },
  { id: "ORD-004", customer: "Alice Brown", total: 234, status: "pending", paymentStatus: "awaiting_payment", items: 3, createdAt: "2024-05-17" },
];

export const mockShopOrders = [
  { id: "SHP-001", orderId: "ORD-001", shop: "Tech Store", seller: "Mike Johnson", total: 999, status: "delivered", items: 1 },
  { id: "SHP-002", orderId: "ORD-001", shop: "Fashion Hub", seller: "Sarah Lee", total: 90, status: "delivered", items: 1 },
  { id: "SHP-003", orderId: "ORD-002", shop: "Fashion Hub", seller: "Sarah Lee", total: 149, status: "shipped", items: 1 },
  { id: "SHP-004", orderId: "ORD-003", shop: "Tech Store", seller: "Mike Johnson", total: 899, status: "processing", items: 1 },
];

export const mockPayments = [
  { id: "PAY-001", orderId: "ORD-001", amount: 1089, method: "Credit Card", status: "paid", provider: "Stripe", createdAt: "2024-05-10" },
  { id: "PAY-002", orderId: "ORD-002", amount: 149, method: "PayPal", status: "paid", provider: "PayPal", createdAt: "2024-05-15" },
  { id: "PAY-003", orderId: "ORD-003", amount: 899, method: "Credit Card", status: "paid", provider: "Stripe", createdAt: "2024-05-16" },
  { id: "PAY-004", orderId: "ORD-004", amount: 234, method: "Bank Transfer", status: "pending", provider: "Manual", createdAt: "2024-05-17" },
];

export const mockCarts = [
  { id: 1, userId: 1, userName: "John Doe", items: 3, total: 1337, updatedAt: "2024-05-17 10:30" },
  { id: 2, userId: 2, userName: "Jane Smith", items: 1, total: 89, updatedAt: "2024-05-17 09:15" },
  { id: 3, userId: 4, userName: "Alice Brown", items: 5, total: 445, updatedAt: "2024-05-16 18:20" },
];

export const mockNotifications = [
  { id: 1, type: "order", message: "New order #ORD-004 received", status: "sent", channel: "email", createdAt: "2024-05-17 11:30" },
  { id: 2, type: "product", message: "Product approval pending", status: "sent", channel: "push", createdAt: "2024-05-17 10:15" },
  { id: 3, type: "shop", message: "New shop registration", status: "failed", channel: "email", createdAt: "2024-05-17 09:00" },
  { id: 4, type: "payment", message: "Payment received for ORD-003", status: "sent", channel: "sms", createdAt: "2024-05-16 16:45" },
];

export const mockDashboardStats = {
  revenue: { total: 125840, change: 12.5 },
  orders: { total: 342, change: 8.2 },
  products: { total: 1248, change: 5.3 },
  users: { total: 5623, change: 15.7 },
};

export const mockRecentOrders = [
  { id: "ORD-004", customer: "Alice Brown", total: 234, status: "pending" },
  { id: "ORD-003", customer: "Bob Wilson", total: 899, status: "processing" },
  { id: "ORD-002", customer: "Jane Smith", total: 149, status: "shipped" },
];

export const mockLowStockProducts = [
  { name: "Running Shoes", stock: 8, threshold: 10 },
  { name: "Table Lamp", stock: 0, threshold: 5 },
  { name: "Wireless Mouse", stock: 5, threshold: 15 },
];
