import { useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { mockOrders } from '../../data/mockData';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function OrderDetailPage() {
  const { id } = useParams();
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order not found</h3>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/marketplace/orders">View All Orders</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const groupedByShop = order.items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopName: item.shopName,
        items: [],
      };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopName: string; items: typeof order.items }>);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/marketplace/orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[order.status]} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedByShop).map(([shopId, { shopName, items }]) => (
                <div key={shopId}>
                  <h4 className="font-semibold mb-4">{shopName}</h4>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <Link to={`/marketplace/products/${item.productId}`}>
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded bg-gray-100"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/marketplace/products/${item.productId}`}
                            className="font-semibold hover:text-blue-600 line-clamp-2"
                          >
                            {item.productName}
                          </Link>
                          {item.variantInfo && (
                            <p className="text-sm text-gray-600 mt-1">{item.variantInfo}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            ₫{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₫{item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(groupedByShop).length > 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    <div className="h-full w-px bg-gray-300 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold">Order Placed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.status !== 'pending' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600"></div>
                      {order.status !== 'paid' && <div className="h-full w-px bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">Payment Confirmed</p>
                      <p className="text-sm text-gray-600">Payment received</p>
                    </div>
                  </div>
                )}
                {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600"></div>
                      {order.status !== 'processing' && <div className="h-full w-px bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">Processing</p>
                      <p className="text-sm text-gray-600">Your order is being prepared</p>
                    </div>
                  </div>
                )}
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600"></div>
                      {order.status !== 'shipped' && <div className="h-full w-px bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">Shipped</p>
                      <p className="text-sm text-gray-600">Your order is on the way</p>
                    </div>
                  </div>
                )}
                {order.status === 'delivered' && (
                  <div className="flex gap-4">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    <div>
                      <p className="font-semibold">Delivered</p>
                      <p className="text-sm text-gray-600">Order successfully delivered</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.shippingAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={paymentStatusColors[order.paymentStatus]}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₫{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">₫30,000</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">₫{(order.total + 30000).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
