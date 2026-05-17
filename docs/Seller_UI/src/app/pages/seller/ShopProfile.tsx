import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { StatusBadge } from '../../components/seller/StatusBadge';
import { mockShop } from '../../data/seller-mock';
import { toast } from 'sonner';

export function ShopProfile() {
  const [shop, setShop] = useState(mockShop);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.success('Shop profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Shop</h1>
          <p className="text-gray-600">Manage your shop information and settings</p>
        </div>
        <StatusBadge status={shop.status} type="shop" />
      </div>

      {/* Shop Banner */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            {shop.banner ? (
              <img src={shop.banner} alt="Shop banner" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No banner image</p>
              </div>
            )}
            {isEditing && (
              <button className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 flex items-center gap-6">
            <div className="relative">
              {shop.logo ? (
                <img src={shop.logo} alt="Shop logo" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{shop.name}</h2>
              <p className="text-gray-600">@{shop.slug}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date(shop.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shop Information</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name</Label>
              <Input
                id="name"
                value={shop.name}
                onChange={(e) => setShop({ ...shop, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Shop URL</Label>
              <Input
                id="slug"
                value={shop.slug}
                onChange={(e) => setShop({ ...shop, slug: e.target.value })}
                disabled={!isEditing}
                placeholder="your-shop-url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={shop.description}
              onChange={(e) => setShop({ ...shop, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Tell customers about your shop..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={shop.email}
                onChange={(e) => setShop({ ...shop, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={shop.phone}
                onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={shop.address}
              onChange={(e) => setShop({ ...shop, address: e.target.value })}
              disabled={!isEditing}
              rows={2}
            />
          </div>

          {shop.status === 'pending' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your shop is pending approval. You'll be notified once it's reviewed.
              </p>
            </div>
          )}

          {shop.status === 'rejected' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-1">
                Your shop has been rejected
              </p>
              <p className="text-sm text-red-700">
                Please contact support for more information or update your shop details and resubmit.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
