import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import ProductList from "@/components/shopping/ProductList";
import { products } from "@/lib/shopping/data";

export default function ShoppingPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <ShoppingHeader />
        <ProductList products={products} />
      </div>
    </main>
  );
}
