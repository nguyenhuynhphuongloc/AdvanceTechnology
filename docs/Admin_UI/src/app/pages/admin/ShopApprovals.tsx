import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { mockShopApprovals } from "../../data/adminMockData";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ShopApprovals() {
  const [shops, setShops] = useState(mockShopApprovals);
  const [selectedShop, setSelectedShop] = useState<typeof mockShopApprovals[0] | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const handleAction = () => {
    if (!selectedShop || !action) return;

    if (action === "reject" && !reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setShops(shops.filter(s => s.id !== selectedShop.id));
    toast.success(`Shop ${action === "approve" ? "approved" : "rejected"} successfully`);
    setSelectedShop(null);
    setAction(null);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop Approvals</h1>
        <p className="text-muted-foreground">Review and approve shop registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({shops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.shopName}</TableCell>
                  <TableCell>{shop.owner}</TableCell>
                  <TableCell className="max-w-xs truncate">{shop.description}</TableCell>
                  <TableCell>{shop.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedShop(shop);
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
                          setSelectedShop(shop);
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

          {shops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedShop} onOpenChange={() => {
        setSelectedShop(null);
        setAction(null);
        setReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Shop" : "Reject Shop"}
            </DialogTitle>
            <DialogDescription>
              {selectedShop?.shopName} by {selectedShop?.owner}
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
              setSelectedShop(null);
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
