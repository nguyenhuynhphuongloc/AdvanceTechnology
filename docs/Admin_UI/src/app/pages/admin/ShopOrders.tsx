import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { mockShopOrders } from "../../data/adminMockData";

export default function ShopOrders() {
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
        <h1 className="text-3xl font-bold">Shop Orders</h1>
        <p className="text-muted-foreground">Orders by individual shops</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shop Orders ({mockShopOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Order ID</TableHead>
                <TableHead>Parent Order</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShopOrders.map((shopOrder) => (
                <TableRow key={shopOrder.id}>
                  <TableCell className="font-mono font-medium">{shopOrder.id}</TableCell>
                  <TableCell className="font-mono">{shopOrder.orderId}</TableCell>
                  <TableCell>{shopOrder.shop}</TableCell>
                  <TableCell>{shopOrder.seller}</TableCell>
                  <TableCell>{shopOrder.items}</TableCell>
                  <TableCell>${shopOrder.total}</TableCell>
                  <TableCell>{getStatusBadge(shopOrder.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
