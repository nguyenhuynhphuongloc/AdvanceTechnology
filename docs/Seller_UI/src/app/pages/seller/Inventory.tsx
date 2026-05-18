import { useState } from 'react';
import { Search, AlertTriangle, Edit } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { mockProducts, type ProductVariant } from '../../data/seller-mock';
import { toast } from 'sonner';

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant & { productName: string } | null>(null);
  const [updateStock, setUpdateStock] = useState(0);

  const allVariants = mockProducts.flatMap(product =>
    product.variants.map(variant => ({
      ...variant,
      productName: product.name,
      productImage: product.images[0]
    }))
  );

  const filteredVariants = allVariants.filter(variant =>
    variant.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    variant.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    variant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleUpdateStock = () => {
    if (selectedVariant) {
      toast.success(`Stock updated for ${selectedVariant.productName} - ${selectedVariant.name}`);
      setSelectedVariant(null);
      setUpdateStock(0);
    }
  };

  const lowStockCount = allVariants.filter(v => v.stock <= v.lowStockThreshold).length;
  const outOfStockCount = allVariants.filter(v => v.stock === 0).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Track and manage stock levels for all your products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SKUs</p>
                <p className="text-2xl font-bold">{allVariants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by product name, SKU, or variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVariants.map((variant) => {
                  const status = getStockStatus(variant.stock, variant.lowStockThreshold);
                  return (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={variant.productImage}
                            alt={variant.productName}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="font-medium">{variant.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                      <TableCell className="text-right font-medium">{variant.stock}</TableCell>
                      <TableCell className="text-right text-gray-600">{variant.reserved}</TableCell>
                      <TableCell className="text-right font-medium">{variant.stock + variant.reserved}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedVariant({ ...variant, productName: variant.productName });
                            setUpdateStock(variant.stock);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={!!selectedVariant} onOpenChange={() => setSelectedVariant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {selectedVariant && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedVariant.productName}</p>
                <p className="text-sm text-gray-600">Variant: {selectedVariant.name}</p>
                <p className="text-sm text-gray-600">SKU: {selectedVariant.sku}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Available Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={updateStock}
                  onChange={(e) => setUpdateStock(Number(e.target.value))}
                  min="0"
                />
                <p className="text-sm text-gray-500">
                  Current: {selectedVariant.stock} | Reserved: {selectedVariant.reserved}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVariant(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
