import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { ShoppingCart, Star, Store, Minus, Plus, ArrowLeft, Package } from 'lucide-react';
import { mockProducts, addToCart } from '../../data/mockData';

export function ProductDetailPage() {
  const { slug } = useParams();
  const product = mockProducts.find((p) => p.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product not found</h3>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/marketplace/products">Browse Products</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    const variantInfo = Object.entries(selectedVariants)
      .map(([key, value]) => value)
      .join(', ');

    const requiredVariants = product.variants?.length || 0;
    const selectedCount = Object.keys(selectedVariants).length;

    if (requiredVariants > 0 && selectedCount < requiredVariants) {
      toast.error('Please select all product options');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity,
      shopId: product.shopId,
      shopName: product.shopName,
      variantInfo: variantInfo || undefined,
    });

    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/marketplace/products">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating}</span>
                </div>
              )}
              {product.sold && (
                <span className="text-gray-600">{product.sold} sold</span>
              )}
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              ₫{product.price.toLocaleString()}
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <Link
                to={`/marketplace/shops/${mockProducts.find((p) => p.shopId === product.shopId)?.shopId}`}
                className="flex items-center gap-3 hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
              >
                <Store className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <p className="font-semibold text-blue-600">{product.shopName}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.name}>
                  <label className="block text-sm font-semibold mb-2">
                    {variant.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <Button
                        key={option}
                        variant={selectedVariants[variant.name] === option ? 'default' : 'outline'}
                        onClick={() =>
                          setSelectedVariants((prev) => ({ ...prev, [variant.name]: option }))
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          {product.stock === 0 && (
            <Badge variant="destructive" className="w-full justify-center py-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-12">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
        </CardContent>
      </Card>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} to={`/marketplace/products/${p.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{p.shopName}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-blue-600">
                        ₫{p.price.toLocaleString()}
                      </p>
                      {p.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{p.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
