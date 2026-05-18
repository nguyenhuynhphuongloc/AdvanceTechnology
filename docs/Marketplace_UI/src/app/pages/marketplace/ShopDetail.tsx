import { useParams, Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, ArrowLeft, Package } from 'lucide-react';
import { mockShops, mockProducts } from '../../data/mockData';

export function ShopDetailPage() {
  const { slug } = useParams();
  const shop = mockShops.find((s) => s.slug === slug);

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Shop not found</h3>
            <p className="text-gray-600 mb-4">
              The shop you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/marketplace/shops">Browse Shops</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const shopProducts = mockProducts.filter((p) => p.shopId === shop.id);

  return (
    <div className="pb-12">
      <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4">
        <Button variant="ghost" asChild className="mt-4 mb-4">
          <Link to="/marketplace/shops">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Link>
        </Button>

        <Card className="-mt-16 relative z-10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{shop.name}</h1>
                  {shop.status === 'approved' && (
                    <Badge variant="secondary">Verified Shop</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{shop.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{shop.rating}</span>
                    <span className="text-gray-600">rating</span>
                  </div>
                  <div>
                    <span className="font-semibold">{shop.productCount}</span>
                    <span className="text-gray-600"> products</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-6">Products from this shop</h2>
          {shopProducts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-gray-600">
                  This shop hasn't added any products yet.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopProducts.map((product) => (
                <Link key={product.id} to={`/marketplace/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square overflow-hidden bg-gray-100 relative">
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
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
                      <div className="flex items-center justify-between mt-2">
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
          )}
        </div>
      </div>
    </div>
  );
}
