"use client";

import { useEffect, useState } from "react";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProductDetail,
  fetchAdminProducts,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import { clearAdminSessionToken, getAdminSessionToken } from "@/lib/admin/session";
import type {
  AdminProductCard,
  AdminProductDetail,
  AdminProductPayload,
} from "@/lib/admin/types";

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  description: string;
  basePrice: string;
  mainImageUrl: string;
  mainImagePublicId: string;
  mainImageAltText: string;
  galleryImagesText: string;
  variantsText: string;
  relatedProductSlugs: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  sku: "",
  categorySlug: "",
  description: "",
  basePrice: "",
  mainImageUrl: "",
  mainImagePublicId: "",
  mainImageAltText: "",
  galleryImagesText: "",
  variantsText: "",
  relatedProductSlugs: "",
};

export default function AdminProductsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<AdminProductCard[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sessionToken = getAdminSessionToken();
    if (!sessionToken) {
      clearAdminSessionToken();
      window.location.href = ADMIN_LOGIN_PATH;
      return;
    }

    setToken(sessionToken);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadProducts(token);
  }, [token, search, category, status]);

  async function loadProducts(sessionToken: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminProducts(sessionToken, {
        search: search || undefined,
        category: category || undefined,
        status,
      });
      setItems(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectProduct(productId: string) {
    if (!token) {
      return;
    }

    setError(null);
    setNotice(null);

    try {
      const detail = await fetchAdminProductDetail(token, productId);
      setSelectedProductId(productId);
      setForm(toFormState(detail));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Unable to load product detail.");
    }
  }

  async function handleSave() {
    if (!token) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload = toPayload(form);
      const saved = selectedProductId
        ? await updateAdminProduct(token, selectedProductId, payload)
        : await createAdminProduct(token, payload);

      await loadProducts(token);
      setSelectedProductId(saved.id);
      setForm(toFormState(saved));
      setNotice(selectedProductId ? "Product updated." : "Product created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMainImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !token) {
      return;
    }

    setUploadingMainImage(true);
    setError(null);
    setNotice(null);

    try {
      const uploaded = await uploadAdminProductImage(file, token);
      setForm((current) => ({
        ...current,
        mainImageUrl: uploaded.imageUrl,
        mainImagePublicId: uploaded.publicId,
        mainImageAltText: current.mainImageAltText || file.name,
      }));
      setNotice("Main image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the main image.");
    } finally {
      setUploadingMainImage(false);
    }
  }

  async function handleGalleryImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length || !token) {
      return;
    }

    setUploadingGalleryImages(true);
    setError(null);
    setNotice(null);

    try {
      const uploadedImages = await Promise.all(
        files.map((file) => uploadAdminProductImage(file, token)),
      );

      setForm((current) => {
        const existingImages = parseGalleryImages(current.galleryImagesText);
        const nextSortOrderBase = existingImages.length + 1;
        const appendedImages = uploadedImages.map((image, index) => ({
          publicId: image.publicId,
          imageUrl: image.imageUrl,
          altText: files[index]?.name ?? "",
          sortOrder: nextSortOrderBase + index,
        }));

        return {
          ...current,
          galleryImagesText: serializeGalleryImages([...existingImages, ...appendedImages]),
        };
      });

      setNotice(
        files.length === 1 ? "Gallery image uploaded." : `${files.length} gallery images uploaded.`,
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Unable to upload gallery images.",
      );
    } finally {
      setUploadingGalleryImages(false);
    }
  }

  async function handleDelete() {
    if (!token || !selectedProductId) {
      return;
    }

    if (!window.confirm("Delete this product?")) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await deleteAdminProduct(token, selectedProductId);
      await loadProducts(token);
      setSelectedProductId(null);
      setForm(EMPTY_FORM);
      setNotice("Product deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <div style={heroCardStyle}>
        <p style={eyebrowStyle}>Admin products</p>
        <h2 style={{ margin: "8px 0 10px", fontSize: 32 }}>
          Search, inspect, create, edit, and delete catalog records
        </h2>
        <p style={{ margin: 0, color: "#5d4a3a", lineHeight: 1.7 }}>
          This page uses the gateway-backed admin product APIs. The editor keeps the
          payload close to the service contract so catalog changes stay predictable.
        </p>
      </div>

      <section style={panelStyle}>
        <div style={filterGridStyle}>
          <label style={fieldStyle}>
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, description, or SKU"
              style={inputStyle}
            />
          </label>
          <label style={fieldStyle}>
            <span>Category</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="outerwear"
              style={inputStyle}
            />
          </label>
          <label style={fieldStyle}>
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")}
              style={inputStyle}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setSelectedProductId(null);
              setForm(EMPTY_FORM);
              setNotice("Creating a new product.");
            }}
            style={secondaryButtonStyle}
          >
            New product
          </button>
        </div>
      </section>

      {error ? <p style={errorStyle}>{error}</p> : null}
      {notice ? <p style={noticeStyle}>{notice}</p> : null}

      <div style={twoColumnStyle}>
        <section style={panelStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Product list</h3>
            <span style={{ color: "#7a6756" }}>{loading ? "Loading..." : `${items.length} items`}</span>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {items.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => void handleSelectProduct(product.id)}
                style={{
                  ...listButtonStyle,
                  borderColor:
                    selectedProductId === product.id ? "rgba(138,90,50,0.45)" : "rgba(31,26,23,0.08)",
                  background:
                    selectedProductId === product.id ? "rgba(138,90,50,0.10)" : "rgba(255,255,255,0.8)",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{product.name}</p>
                  <p style={{ margin: "6px 0 0", color: "#6e5845" }}>
                    {product.category} · {product.sku}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>${product.basePrice.toFixed(2)}</p>
                  <p style={{ margin: "6px 0 0", color: product.isActive === false ? "#9a3324" : "#3d7a54" }}>
                    {product.isActive === false ? "inactive" : "active"}
                  </p>
                </div>
              </button>
            ))}
            {!loading && items.length === 0 ? (
              <p style={{ margin: 0, color: "#7a6756" }}>No products matched the current filters.</p>
            ) : null}
          </div>
        </section>

        <section style={panelStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ margin: 0, fontSize: 22 }}>
              {selectedProductId ? "Edit product" : "Create product"}
            </h3>
            {selectedProductId ? (
              <button type="button" onClick={() => void handleDelete()} style={dangerButtonStyle}>
                Delete
              </button>
            ) : null}
          </div>

          <div style={editorGridStyle}>
            <label style={fieldStyle}>
              <span>Name</span>
              <input value={form.name} onChange={(event) => updateForm(setForm, "name", event.target.value)} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span>Slug</span>
              <input value={form.slug} onChange={(event) => updateForm(setForm, "slug", event.target.value)} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span>SKU</span>
              <input value={form.sku} onChange={(event) => updateForm(setForm, "sku", event.target.value)} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span>Category slug</span>
              <input value={form.categorySlug} onChange={(event) => updateForm(setForm, "categorySlug", event.target.value)} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span>Base price</span>
              <input
                value={form.basePrice}
                onChange={(event) => updateForm(setForm, "basePrice", event.target.value)}
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
              />
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateForm(setForm, "description", event.target.value)}
                style={textareaStyle}
                rows={5}
              />
            </label>
            <label style={fieldStyle}>
              <span>Main image URL</span>
              <input value={form.mainImageUrl} onChange={(event) => updateForm(setForm, "mainImageUrl", event.target.value)} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span>Main image public ID</span>
              <input value={form.mainImagePublicId} onChange={(event) => updateForm(setForm, "mainImagePublicId", event.target.value)} style={inputStyle} />
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Main image alt text</span>
              <input value={form.mainImageAltText} onChange={(event) => updateForm(setForm, "mainImageAltText", event.target.value)} style={inputStyle} />
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Main image upload</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleMainImageUpload(event)}
                disabled={uploadingMainImage || saving}
                style={inputStyle}
              />
              <small style={helperStyle}>
                Upload a JPG, PNG, or WEBP file to populate the URL and public ID fields.
              </small>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Gallery images</span>
              <textarea
                value={form.galleryImagesText}
                onChange={(event) => updateForm(setForm, "galleryImagesText", event.target.value)}
                style={textareaStyle}
                rows={5}
              />
              <small style={helperStyle}>One image per line: publicId|imageUrl|altText|sortOrder</small>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Gallery image uploads</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => void handleGalleryImageUpload(event)}
                disabled={uploadingGalleryImages || saving}
                style={inputStyle}
              />
              <small style={helperStyle}>
                Uploaded images are appended to the gallery list using the returned Cloudinary URL and public ID.
              </small>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Variants</span>
              <textarea
                value={form.variantsText}
                onChange={(event) => updateForm(setForm, "variantsText", event.target.value)}
                style={textareaStyle}
                rows={6}
              />
              <small style={helperStyle}>
                One variant per line: sku|size|color|priceOverride(optional)|imagePublicId(optional)
              </small>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Related product slugs</span>
              <input
                value={form.relatedProductSlugs}
                onChange={(event) => updateForm(setForm, "relatedProductSlugs", event.target.value)}
                style={inputStyle}
                placeholder="winter-parka, alpaca-scarf"
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setForm(EMPTY_FORM)} style={secondaryButtonStyle}>
              Reset form
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              style={primaryButtonStyle}
              disabled={saving || uploadingMainImage || uploadingGalleryImages}
            >
              {saving
                ? "Saving..."
                : uploadingMainImage || uploadingGalleryImages
                  ? "Uploading images..."
                  : selectedProductId
                    ? "Update product"
                    : "Create product"}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function updateForm(
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>,
  field: keyof ProductFormState,
  value: string,
) {
  setForm((current) => ({ ...current, [field]: value }));
}

function toFormState(product: AdminProductDetail): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categorySlug: product.category,
    description: product.description,
    basePrice: product.basePrice.toString(),
    mainImageUrl: product.mainImage.imageUrl,
    mainImagePublicId: product.mainImage.publicId,
    mainImageAltText: product.mainImage.altText ?? "",
    galleryImagesText: product.galleryImages
      .map((image) => [image.publicId, image.imageUrl, image.altText ?? "", image.sortOrder ?? 0].join("|"))
      .join("\n"),
    variantsText: product.variants
      .map((variant) => {
        const priceOverride = variant.price === product.basePrice ? "" : String(variant.price);
        return [variant.sku, variant.size, variant.color, priceOverride, ""].join("|");
      })
      .join("\n"),
    relatedProductSlugs: product.relatedProducts.map((relatedProduct) => relatedProduct.slug).join(", "),
  };
}

function toPayload(form: ProductFormState): AdminProductPayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    sku: form.sku.trim(),
    description: form.description.trim(),
    categorySlug: form.categorySlug.trim(),
    basePrice: Number(form.basePrice),
    mainImage: {
      imageUrl: form.mainImageUrl.trim(),
      publicId: form.mainImagePublicId.trim(),
      altText: form.mainImageAltText.trim() || undefined,
      sortOrder: 0,
      isMain: true,
    },
    galleryImages: parseGalleryImages(form.galleryImagesText),
    variants: parseVariants(form.variantsText),
    relatedProductSlugs: form.relatedProductSlugs
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

function parseGalleryImages(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [publicId = "", imageUrl = "", altText = "", sortOrder = "0"] = line.split("|");
      return {
        publicId: publicId.trim(),
        imageUrl: imageUrl.trim(),
        altText: altText.trim() || undefined,
        sortOrder: Number(sortOrder.trim() || "0"),
      };
    });
}

function serializeGalleryImages(
  images: Array<{ publicId: string; imageUrl: string; altText?: string; sortOrder?: number }>,
) {
  return images
    .map((image) => [
      image.publicId,
      image.imageUrl,
      image.altText ?? "",
      image.sortOrder ?? 0,
    ].join("|"))
    .join("\n");
}

function parseVariants(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sku = "", size = "", color = "", priceOverride = "", imagePublicId = ""] = line.split("|");
      return {
        sku: sku.trim(),
        size: size.trim(),
        color: color.trim(),
        priceOverride: priceOverride.trim() ? Number(priceOverride.trim()) : undefined,
        imagePublicId: imagePublicId.trim() || undefined,
      };
    });
}

const heroCardStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: 28,
  background: "rgba(255, 249, 242, 0.9)",
  border: "1px solid rgba(31,26,23,0.08)",
  boxShadow: "0 16px 40px rgba(60,44,31,0.08)",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 24,
  background: "rgba(255, 252, 247, 0.94)",
  border: "1px solid rgba(31,26,23,0.08)",
  boxShadow: "0 12px 30px rgba(60,44,31,0.06)",
};

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
  gap: 24,
};

const filterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  alignItems: "end",
};

const editorGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#382b22",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,26,23,0.12)",
  background: "white",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 120,
};

const listButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(31,26,23,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 16,
  padding: "12px 18px",
  background: "#201811",
  color: "#fff5ec",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(31,26,23,0.12)",
  borderRadius: 16,
  padding: "12px 18px",
  background: "rgba(255,255,255,0.84)",
  color: "#201811",
  cursor: "pointer",
  fontWeight: 700,
};

const dangerButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 16,
  padding: "12px 18px",
  background: "#8f2f20",
  color: "#fff7f2",
  cursor: "pointer",
  fontWeight: 700,
};

const helperStyle: React.CSSProperties = {
  color: "#7a6756",
  fontSize: 12,
  fontWeight: 400,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8a5a32",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(168, 42, 42, 0.12)",
  color: "#8c1d18",
};

const noticeStyle: React.CSSProperties = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(61, 122, 84, 0.12)",
  color: "#21552f",
};
