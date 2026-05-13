'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/shopping/auth-context';
import Link from 'next/link';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('t-shirts');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('10');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .trim() || `product-${Date.now()}`;
  };
  const generateSKU = (cat: string) => `${cat.toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const slug = slugify(name);
    const sku = generateSKU(category);
    const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

    const productData = {
      name,
      slug,
      sku,
      description,
      categorySlug: category,
      basePrice: parseFloat(price),
      stock: parseInt(stock),
      sellerName: user?.shopName || user?.name || 'Independent Seller',
      isActive: true,
      mainImage: {
        imageUrl: finalImageUrl,
        publicId: `seller_${Date.now()}`,
        altText: name,
        isMain: true
      },
      variants: [
        {
          sku: `${sku}-DEFAULT`,
          size: 'M',
          color: 'Default',
          priceOverride: parseFloat(price)
        }
      ]
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create product');
      }

      // Also save to localStorage for local tracking if needed, 
      // but primarily we rely on the API now.
      const localProducts = JSON.parse(localStorage.getItem('seller_products') || '[]');
      localProducts.push({ ...productData, sellerEmail: user?.email, id: Date.now().toString() });
      localStorage.setItem('seller_products', JSON.stringify(localProducts));

      router.push('/seller/products');
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link href="/seller/products" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 font-bold text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Products
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-2">Add New Product</h1>
        <p className="text-zinc-500 font-medium text-lg">Create a new listing for your shop.</p>
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
                placeholder="Ex: Wireless Noise Cancelling Headphones"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers about your product..."
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-10 pr-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all appearance-none cursor-pointer"
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

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Initial Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex: 50"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
             <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Product Image</label>
             <div className="aspect-square bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:border-zinc-500 transition-all overflow-hidden relative">
               {imageUrl ? (
                 <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                 <>
                   <svg className="w-10 h-10 text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4">Enter Image URL Below</p>
                 </>
               )}
             </div>
             <input
               type="url"
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               placeholder="https://example.com/image.jpg"
               className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-[11px] focus:border-white outline-none transition-all font-mono"
             />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-2xl shadow-white/10 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? 'Creating Product...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
