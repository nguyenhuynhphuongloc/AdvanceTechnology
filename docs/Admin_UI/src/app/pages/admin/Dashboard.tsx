import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { mockDashboardStats, mockRecentOrders, mockLowStockProducts } from "../../data/adminMockData";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: `$${mockDashboardStats.revenue.total.toLocaleString()}`,
      change: mockDashboardStats.revenue.change,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: mockDashboardStats.orders.total.toLocaleString(),
      change: mockDashboardStats.orders.change,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: mockDashboardStats.products.total.toLocaleString(),
      change: mockDashboardStats.products.change,
      icon: Package,
    },
    {
      title: "Total Users",
      value: mockDashboardStats.users.total.toLocaleString(),
      change: mockDashboardStats.users.change,
      icon: Users,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      processing: "outline",
      shipped: "default",
      delivered: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {stat.change > 0 ? (
                  <TrendingUp className="size-3 text-green-600" />
                ) : (
                  <TrendingDown className="size-3 text-red-600" />
                )}
                <span className={stat.change > 0 ? "text-green-600" : "text-red-600"}>
                  {stat.change > 0 ? "+" : ""}{stat.change}%
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to="/admin/orders">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-medium">${order.total}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to="/admin/inventory">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockLowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-orange-500" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {product.threshold}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${product.stock === 0 ? "text-red-600" : "text-orange-600"}`}>
                      {product.stock} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
