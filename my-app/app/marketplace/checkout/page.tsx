'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkout, fetchMyCart, type Cart, type CartItem } from '@/lib/marketplace';
import {
  ArrowLeftIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CreditCardIcon,
  Input,
  Label,
  Separator,
  WalletIcon,
  buttonClassName,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

type ShippingInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMyCart()
      .then((data) => {
        if (data.items.length === 0) router.replace('/marketplace/cart');
        setCart(data);
      })
      .catch((e: unknown) => setSubmitError(e instanceof Error ? e.message : 'Failed to load cart'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading checkout...</div>;
  }

  if (!getToken()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">Please log in to checkout</h3>
          <Link href="/marketplace/login?next=/marketplace/checkout" className={buttonClassName()}>Log In</Link>
        </Card>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const groupedByShop = cart.items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopName: item.shopNameSnapshot || 'Shop',
        items: [] as CartItem[],
      };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopName: string; items: CartItem[] }>);

  const subtotal = cart.subtotal;
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  function setField(field: keyof ShippingInfo, value: string) {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setSubmitError(null);
    try {
      const result = await checkout({
        shippingAddress: {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          street: shippingInfo.address,
          city: shippingInfo.city,
          district: shippingInfo.district,
          country: 'VN',
        },
        paymentMethod,
      });
      router.push(`/marketplace/orders/${result.orderId}`);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Checkout failed');
      setIsProcessing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace/cart" className={buttonClassName({ variant: 'ghost', className: 'mb-4' })}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Cart
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                    <Input id="fullName" placeholder="Enter your full name" value={shippingInfo.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone number" value={shippingInfo.phone} onChange={(e) => setField('phone', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input id="address" placeholder="Street address, apartment, suite, etc." value={shippingInfo.address} onChange={(e) => setField('address', e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input id="city" placeholder="Enter city" value={shippingInfo.city} onChange={(e) => setField('city', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" placeholder="Enter district" value={shippingInfo.district} onChange={(e) => setField('district', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="flex-1 cursor-pointer">
                      <span className="flex items-center gap-3">
                        <WalletIcon className="h-5 w-5 text-gray-600" />
                        <span>
                          <span className="block font-semibold">Cash on Delivery</span>
                          <span className="block text-sm text-gray-600">Pay when you receive</span>
                        </span>
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50">
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="flex-1 cursor-pointer">
                      <span className="flex items-center gap-3">
                        <CreditCardIcon className="h-5 w-5 text-gray-600" />
                        <span>
                          <span className="block font-semibold">Credit/Debit Card</span>
                          <span className="block text-sm text-gray-600">Pay securely with your card</span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedByShop).map(([shopId, group]) => (
                  <div key={shopId}>
                    <h4 className="mb-3 font-semibold">{group.shopName}</h4>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.itemId} className="flex gap-3">
                          <Image
                            src={item.imageUrlSnapshot || imageFallback(item.variantId, 80, 80)}
                            alt={item.productNameSnapshot}
                            width={64}
                            height={64}
                            unoptimized
                            className="h-16 w-16 rounded bg-gray-100 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 font-medium">{item.productNameSnapshot}</p>
                            {item.variantNameSnapshot && <p className="text-sm text-gray-600">{item.variantNameSnapshot}</p>}
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-blue-600">{formatVnd(item.unitPriceSnapshot * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    {Object.keys(groupedByShop).length > 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatVnd(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-semibold">{formatVnd(shippingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatVnd(total)}</span>
                  </div>
                </div>

                {submitError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{submitError}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-center text-xs text-gray-600">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
