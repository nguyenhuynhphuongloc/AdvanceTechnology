'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/shopping/auth-context';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        const sellerName = user.shopName || user.name || 'Independent Seller';
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products?sellerName=${encodeURIComponent(sellerName)}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Products</h1>
          <p className="text-zinc-500 font-medium text-lg">Manage your storefront catalog and inventory.</p>
        </div>
        <Link 
          href="/seller/products/new"
          className="bg-white !text-black px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-xl shadow-white/10"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[40px]">
          <div className="h-20 w-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No products yet</h3>
          <p className="text-zinc-500 mb-8 max-w-sm text-center">Start selling by uploading your first item to the marketplace.</p>
          <Link href="/seller/products/new" className="text-white font-bold border-b-2 border-white pb-1 hover:text-zinc-300 transition-colors">
            Upload your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-600 transition-all shadow-lg">
              <div className="aspect-[4/3] bg-black flex items-center justify-center text-zinc-800 relative">
                 {product.imageUrl ? (
                   <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                 ) : (
                   <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                 )}
                 <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                   <div className="bg-zinc-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700/50 shadow-xl">
                     Số lượng: {product.stock ?? 0}
                   </div>
                   <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                     Active
                   </div>
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg truncate pr-4">{product.name}</h3>
                  <span className="text-white font-black">${product.basePrice}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-4 line-clamp-1">{product.description}</p>
                <div className="flex items-center gap-2">
                  <Link href={`/seller/products/edit/${product.id}`} className="flex-1 bg-zinc-800 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors text-center">Edit</Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="px-3 bg-zinc-800 py-2.5 rounded-xl text-xs font-bold hover:bg-red-900/30 hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
