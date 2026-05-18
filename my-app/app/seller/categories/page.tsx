'use client';

import { useState, useEffect } from 'react';
import {
  fetchShopCategories,
  createShopCategory,
  updateShopCategory,
  deleteShopCategory,
  type ShopCategory,
} from '@/lib/seller/category-api';
import { autoSlugify } from '@/lib/utils/slugify';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerEmptyState from '@/components/seller/SellerEmptyState';
import SellerLoadingState from '@/components/seller/SellerLoadingState';
import SellerModal from '@/components/seller/SellerModal';

export default function SellerCategoriesPage() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<ShopCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShopCategory | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShopCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditCategory(null);
    setName('');
    setSlug('');
    setSlugManual(false);
    setDescription('');
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (cat: ShopCategory) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManual(true);
    setDescription(cat.description ?? '');
    setFormError(null);
    setShowModal(true);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugManual) {
      setSlug(autoSlugify(v));
    }
  };

  const handleSlugChange = (v: string) => {
    setSlugManual(true);
    setSlug(autoSlugify(v));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFormError('Name and slug are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editCategory) {
        const updated = await updateShopCategory(editCategory.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createShopCategory({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
        });
        setCategories((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteShopCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SellerLoadingState />;

  return (
    <div>
      <SellerPageHeader
        title="Categories"
        subtitle="Manage product categories for your shop"
        action={
          <button
            onClick={openCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
          >
            + Add Category
          </button>
        }
      />

      {error ? (
        <div className="py-20 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={load} className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700">
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl">
          <SellerEmptyState
            title="No categories yet"
            description="Add categories to organize your products."
            action={
              <button
                onClick={openCreate}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                + Add Category
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Name', 'Slug', 'Description', 'Products', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-gray-400">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-400 max-w-[200px] truncate block">{cat.description ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-400">—</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(cat)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <SellerModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editCategory ? `Edit Category — ${editCategory.name}` : 'Add Category'}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-semibold">{formError}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Bánh Mì, Đồ Ăn Vặt"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="banh-mi"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">URL: /shop/{slug || 'category-slug'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </form>
      </SellerModal>

      {/* Delete Confirm Modal */}
      <SellerModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{deleteTarget?.name}</strong>?
          This action cannot be undone.
        </p>
      </SellerModal>
    </div>
  );
}
