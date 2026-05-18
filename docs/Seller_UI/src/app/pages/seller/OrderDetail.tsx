import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, Package, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { StatusBadge } from '../../components/seller/StatusBadge';
import { mockSellerOrders, type SellerOrder } from '../../data/seller-mock';
import { toast } from 'sonner';

export function OrderDetail() {
  const { id } = useParams();
  const order = mockSellerOrders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/seller/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = (newStatus: string) => {
    toast.success(`Order status updated to ${newStatus}`);
  };

  const timeline = [
    { label: 'Order Placed', date: order.createdAt, completed: true },
    { label: 'Payment Confirmed', date: order.paymentStatus === 'paid' ? order.createdAt : null, completed: order.paymentStatus === 'paid' },
    { label: 'Processing', date: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.updatedAt : null, completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' },
    { label: 'Shipped', date: order.status === 'shipped' || order.status === 'delivered' ? order.updatedAt : null, completed: order.status === 'shipped' || order.status === 'delivered' },
    { label: 'Delivered', date: order.status === 'delivered' ? order.updatedAt : null, completed: order.status === 'delivered' },
  ];

  return (
    <div className="p-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/seller/orders">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{order.orderNumber}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={order.status} type="order" />
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-600">
                          {new Date(step.date).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select defaultValue={order.status} onValueChange={handleStatusUpdate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Update the order status to keep your customer informed
              </p>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.buyerName}</p>
              <p className="text-sm text-gray-600">{order.buyerEmail}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.ward}, {order.shippingAddress.district}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress.city}</p>
              <p className="text-sm text-gray-600 mt-2">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={order.paymentStatus} type="payment" />
              <p className="text-sm text-gray-600 mt-2">
                Total: {order.total.toLocaleString('vi-VN')}đ
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
