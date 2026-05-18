import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { mockOrders } from "../../data/adminMockData";
import { ArrowLeft, Package, CreditCard, Truck } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/orders">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order {order.id}</h1>
          <p className="text-muted-foreground">Order details and status</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="size-4" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg">{order.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-4" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg">{order.paymentStatus}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="size-4" />
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${order.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Customer Name</span>
            <span className="font-medium">{order.customer}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Order Date</span>
            <span className="font-medium">{order.createdAt}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Number of Items</span>
            <span className="font-medium">{order.items}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Order Placed</p>
                <p className="text-sm text-muted-foreground">{order.createdAt}</p>
              </div>
            </div>
            {order.status !== "pending" && (
              <div className="flex items-start gap-4">
                <div className="size-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Order {order.status}</p>
                  <p className="text-sm text-muted-foreground">Processing by seller</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
