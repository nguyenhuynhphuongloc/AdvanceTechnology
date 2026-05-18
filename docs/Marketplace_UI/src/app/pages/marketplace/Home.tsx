import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import { mockProducts, mockShops, categories } from '../../data/mockData';

export function MarketplaceHome() {
  const featuredProducts = mockProducts.slice(0, 4);
  const featuredShops = mockShops.slice(0, 3);

  return (
    <div className="space-y-12 pb-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Shop from thousands of trusted sellers and find exactly what you're looking for.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/marketplace/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/marketplace/shops">Explore Shops</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/marketplace/products?category=${category.slug}`}
              className="group"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="ghost" asChild>
            <Link to="/marketplace/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} to={`/marketplace/products/${product.slug}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.shopName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-blue-600">
                      ₫{product.price.toLocaleString()}
                    </p>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                      </div>
                    )}
                  </div>
                  {product.sold && (
                    <p className="text-xs text-gray-500 mt-1">{product.sold} sold</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Shops</h2>
          <Button variant="ghost" asChild>
            <Link to="/marketplace/shops">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredShops.map((shop) => (
            <Link key={shop.id} to={`/marketplace/shops/${shop.slug}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 overflow-hidden bg-gray-100">
                  <img
                    src={shop.banner}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-16 h-16 rounded-full border-4 border-white -mt-8 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{shop.rating}</span>
                        </div>
                        <span>{shop.productCount} products</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {shop.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
