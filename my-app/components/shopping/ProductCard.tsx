type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="h-52 w-full object-cover"
      />

      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
        <p className="mt-2 text-sm text-gray-500">{product.description}</p>
        <p className="mt-3 text-xl font-bold text-red-500">
          {product.price.toLocaleString("vi-VN")}đ
        </p>

        <button className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Mua ngay
        </button>
      </div>
    </div>
  );
}
