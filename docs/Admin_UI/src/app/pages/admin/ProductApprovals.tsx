import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { mockProductApprovals } from "../../data/adminMockData";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProductApprovals() {
  const [products, setProducts] = useState(mockProductApprovals);
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProductApprovals[0] | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const handleAction = () => {
    if (!selectedProduct || !action) return;

    if (action === "reject" && !reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProducts(products.filter(p => p.id !== selectedProduct.id));
    toast.success(`Product ${action === "approve" ? "approved" : "rejected"} successfully`);
    setSelectedProduct(null);
    setAction(null);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Approvals</h1>
        <p className="text-muted-foreground">Review and approve product submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.shop}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedProduct(product);
                          setAction("approve");
                        }}
                      >
                        <CheckCircle className="size-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedProduct(product);
                          setAction("reject");
                        }}
                      >
                        <XCircle className="size-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedProduct} onOpenChange={() => {
        setSelectedProduct(null);
        setAction(null);
        setReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Product" : "Reject Product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} from {selectedProduct?.shop}
            </DialogDescription>
          </DialogHeader>

          {action === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for rejection</label>
              <Textarea
                placeholder="Please provide a reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setSelectedProduct(null);
              setAction(null);
              setReason("");
            }}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
            >
              {action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
