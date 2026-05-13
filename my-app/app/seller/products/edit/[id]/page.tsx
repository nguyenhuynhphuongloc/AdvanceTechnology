'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/shopping/auth-context';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('t-shirts');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products`);
        if (response.ok) {
          const data = await response.json();
          const product = data.items.find((p: any) => p.id === id);
          if (product) {
            setName(product.name);
            setPrice(product.basePrice.toString());
            setDescription(product.description || '');
            setCategory(product.category || 't-shirts');
            setImageUrl(product.imageUrl || '');
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .trim() || `product-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const productData = {
      name,
      slug: slugify(name),
      sku: `SKU-${id.substring(0, 8)}`, // Keep same SKU or regenerate
      description,
      categorySlug: category,
      basePrice: parseFloat(price),
      isActive: true,
      mainImage: {
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        publicId: `seller_${Date.now()}`,
        altText: name,
        isMain: true
      },
      variants: [
        {
          sku: `SKU-${id.substring(0, 8)}-DEFAULT`,
          size: 'M',
          color: 'Default',
          priceOverride: parseFloat(price)
        }
      ]
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update product');
      }

      router.push('/seller/products');
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-zinc-500 font-bold">Loading product...</div>;

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link href="/seller/products" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 font-bold text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Products
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-2">Edit Product</h1>
        <p className="text-zinc-500 font-medium text-lg">Update your product listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="t-shirts">T-Shirts</option>
                  <option value="shirts">Shirts</option>
                  <option value="trousers">Trousers</option>
                  <option value="jackets">Jackets</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="footwear">Footwear</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
             <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Product Image</label>
             <div className="aspect-square bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
               {imageUrl && <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />}
             </div>
             <input
               type="url"
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-[11px] focus:border-white outline-none"
             />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
