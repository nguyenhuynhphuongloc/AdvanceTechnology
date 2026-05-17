import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { mockCarts } from "../../data/adminMockData";

export default function Carts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Carts</h1>
        <p className="text-muted-foreground">Active shopping carts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Carts ({mockCarts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCarts.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell className="font-medium">{cart.userName}</TableCell>
                  <TableCell>{cart.items}</TableCell>
                  <TableCell className="font-semibold">${cart.total}</TableCell>
                  <TableCell>{cart.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {mockCarts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active carts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
