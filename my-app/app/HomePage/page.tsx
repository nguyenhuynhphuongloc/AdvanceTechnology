import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Acme Hoodie",
    price: "$79.00",
    image: "/products/hoodie.jpg",
  },
  {
    id: 2,
    name: "Acme T-Shirt",
    price: "$39.00",
    image: "/products/tshirt.jpg",
  },
  {
    id: 3,
    name: "Acme Cap",
    price: "$29.00",
    image: "/products/cap.jpg",
  },
  {
    id: 4,
    name: "Acme Jacket",
    price: "$129.00",
    image: "/products/jacket.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      
      {/* HERO */}
      <section className="relative h-[500px] flex items-center justify-center text-center">
        <Image
          src="/hero.jpg"
          alt="Hero"
          fill
          className="object-cover"
        />

        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to Acme Store
          </h1>

          <p className="text-lg mb-6">
            Premium clothing for modern developers
          </p>

          <Link
            href="/search"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-10">
          Featured Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>

              <div className="mt-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-gray-500">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Explore Collections
          </h2>

          <p className="text-gray-600 mb-8">
            Discover the latest trends and new arrivals
          </p>

          <Link
            href="/search"
            className="border px-6 py-3 rounded-lg hover:bg-black hover:text-white transition"
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join our newsletter
        </h2>

        <p className="text-gray-600 mb-6">
          Get updates about new products and offers
        </p>

        <div className="flex gap-2 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="border px-4 py-3 rounded-lg w-64"
          />

          <button className="bg-black text-white px-6 py-3 rounded-lg">
            Subscribe
          </button>
        </div>
      </section>

    </main>
  );
}