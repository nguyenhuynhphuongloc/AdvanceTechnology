export { fetchProducts, fetchProductDetail, fetchRelatedProducts, fetchCategories } from './product-api';
export type {
  ProductCard,
  ProductDetail,
  ProductVariant,
  ProductImage,
  PaginatedProducts,
  Category,
} from './product-api';

export { fetchShops, fetchShopDetail, fetchShopProducts } from './shop-api';
export type { Shop, ShopProductsResult, ShopProductItem } from './shop-api';

export { fetchMyCart, addCartItem, updateCartItem, removeCartItem } from './cart-api';
export type { Cart, CartItem } from './cart-api';

export {
  fetchMyOrders,
  fetchOrderDetail,
  checkout,
  cancelOrder,
} from './order-api';
export type {
  Order,
  OrderSummary,
  OrderItem,
  ShopOrder,
  ShippingAddress,
  CheckoutPayload,
  PaginatedOrders,
} from './order-api';

export { fetchVariantStock, fetchStockForVariants } from './inventory-api';
export type { InventoryItem, VariantStockMap } from './inventory-api';
