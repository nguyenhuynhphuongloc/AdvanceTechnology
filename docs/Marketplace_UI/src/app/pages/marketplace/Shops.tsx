import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Star, Search, Store as StoreIcon } from 'lucide-react';
import { mockShops } from '../../data/mockData';

export function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShops = mockShops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shops</h1>

      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search shops..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {filteredShops.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <StoreIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shops found</h3>
            <p className="text-gray-600">
              Try adjusting your search to find what you're looking for.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Link key={shop.id} to={`/marketplace/shops/${shop.slug}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="h-32 overflow-hidden bg-gray-100 relative">
                  <img
                    src={shop.banner}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {shop.status === 'approved' && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      Verified
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-16 h-16 rounded-full border-4 border-white -mt-8 shadow-md"
                    />
                    <div className="flex-1 min-w-0 mt-2">
                      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors truncate">
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
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {shop.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
