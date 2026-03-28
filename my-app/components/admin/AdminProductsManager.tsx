"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProductDetail,
  fetchAdminProducts,
  isAdminApiError,
  isAdminUnauthorizedError,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import { clearAdminSessionToken } from "@/lib/admin/session";
import type {
  AdminProductCard,
  AdminProductDetail,
  AdminProductPayload,
} from "@/lib/admin/types";
import { useAdminSession } from "./AdminSessionGate";

type DraftImage = {
  id: string;
  file?: File;
  previewUrl: string;
  altText: string;
  imageUrl?: string;
  publicId?: string;
  isUploaded: boolean;
};

type DraftVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  priceOverride: string;
  imageId: string;
};

type ProductLoadState = {
  status: "loading" | "success" | "error";
  items: AdminProductCard[];
  total: number;
  error: string | null;
};

function createClientId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function createDraftVariant(): DraftVariant {
  return {
    id: createClientId("variant"),
    sku: "",
    size: "",
    color: "",
    priceOverride: "",
    imageId: "",
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function revokeDraftImage(image: DraftImage | null) {
  if (image?.file) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

function revokeDraftImages(images: DraftImage[]) {
  images.forEach((image) => {
    if (image.file) {
      URL.revokeObjectURL(image.previewUrl);
    }
  });
}

function buildDraftImage(file: File, fallbackAltText: string) {
  return {
    id: createClientId("image"),
    file,
    previewUrl: URL.createObjectURL(file),
    altText: fallbackAltText,
    isUploaded: false,
  } satisfies DraftImage;
}

function buildExistingImage(
  image: {
    imageUrl: string;
    publicId: string;
    altText?: string | null;
  },
  fallbackAltText: string,
): DraftImage {
  return {
    id: createClientId("image"),
    previewUrl: image.imageUrl,
    altText: image.altText?.trim() || fallbackAltText,
    imageUrl: image.imageUrl,
    publicId: image.publicId,
    isUploaded: true,
  };
}

function readErrorMessage(error: unknown, fallbackMessage: string) {
  if (isAdminApiError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default function AdminProductsManager() {
  const router = useRouter();
  const { token } = useAdminSession();
  const mainImageRef = useRef<DraftImage | null>(null);
  const galleryImagesRef = useRef<DraftImage[]>([]);
  const [productsState, setProductsState] = useState<ProductLoadState>({
    status: "loading",
    items: [],
    total: 0,
    error: null,
  });
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [mainImage, setMainImage] = useState<DraftImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<DraftImage[]>([]);
  const [variants, setVariants] = useState<DraftVariant[]>([createDraftVariant()]);
  const [relatedProductSlugs, setRelatedProductSlugs] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<AdminProductDetail | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductName, setEditingProductName] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [existingProductsSearch, setExistingProductsSearch] = useState("");
  const [isLoadingEditor, setIsLoadingEditor] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [statusUpdatingProductId, setStatusUpdatingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  useEffect(() => {
    mainImageRef.current = mainImage;
  }, [mainImage]);

  useEffect(() => {
    galleryImagesRef.current = galleryImages;
  }, [galleryImages]);

  useEffect(() => {
    return () => {
      revokeDraftImage(mainImageRef.current);
      revokeDraftImages(galleryImagesRef.current);
    };
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearAdminSessionToken();
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  }, [router]);

  const refreshProducts = useCallback(async () => {
    setProductsState((current) => ({
      status: "loading",
      items: current.items,
      total: current.total,
      error: null,
    }));

    try {
      const response = await fetchAdminProducts(token, { limit: 50, status: "all" });
      setProductsState({
        status: "success",
        items: response.items,
        total: response.total,
        error: null,
      });
    } catch (error) {
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      setProductsState({
        status: "error",
        items: [],
        total: 0,
        error: readErrorMessage(error, "Could not load products from the database."),
      });
    }
  }, [handleUnauthorized, token]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const categoryOptions = useMemo(
    () =>
      [...new Set(productsState.items.map((product) => product.category))]
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [productsState.items],
  );

  const existingSlugConflict = useMemo(() => {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
      return false;
    }

    return productsState.items.some(
      (product) => product.slug === normalizedSlug && product.id !== editingProductId,
    );
  }, [editingProductId, productsState.items, slug]);

  const existingSkuConflict = useMemo(() => {
    const normalizedSku = sku.trim().toLowerCase();
    if (!normalizedSku) {
      return false;
    }

    return productsState.items.some(
      (product) => product.sku.toLowerCase() === normalizedSku && product.id !== editingProductId,
    );
  }, [editingProductId, productsState.items, sku]);

  const selectableRelatedProducts = useMemo(() => {
    return productsState.items.filter((product) => product.id !== editingProductId);
  }, [editingProductId, productsState.items]);

  const selectedProduct = useMemo(
    () => productsState.items.find((product) => product.id === selectedProductId) ?? null,
    [productsState.items, selectedProductId],
  );

  const filteredExistingProducts = useMemo(() => {
    const query = existingProductsSearch.trim().toLowerCase();
    if (!query) {
      return productsState.items;
    }

    return productsState.items.filter((product) =>
      [
        product.name,
        product.slug,
        product.sku,
        product.category,
        product.isActive ? "active" : "inactive",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [existingProductsSearch, productsState.items]);

  const selectableImages = useMemo(
    () => [
      ...(mainImage
        ? [
            {
              id: mainImage.id,
              label: `Main image (${mainImage.file?.name ?? mainImage.publicId ?? "uploaded"})`,
            },
          ]
        : []),
      ...galleryImages.map((image, index) => ({
        id: image.id,
        label: `Gallery ${index + 1} (${image.file?.name ?? image.publicId ?? "uploaded"})`,
      })),
    ],
    [galleryImages, mainImage],
  );

  const totalDraftImages = (mainImage ? 1 : 0) + galleryImages.length;

  useEffect(() => {
    if (filteredExistingProducts.length === 0) {
      if (selectedProductId !== null) {
        setSelectedProductId(null);
      }
      return;
    }

    if (!selectedProductId) {
      setSelectedProductId(filteredExistingProducts[0].id);
      return;
    }

    const stillExists = filteredExistingProducts.some((product) => product.id === selectedProductId);
    if (!stillExists) {
      setSelectedProductId(filteredExistingProducts[0].id);
    }
  }, [filteredExistingProducts, selectedProductId]);

  function resetForm() {
    revokeDraftImage(mainImage);
    revokeDraftImages(galleryImages);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setSku("");
    setDescription("");
    setCategorySlug("");
    setBasePrice("");
    setMainImage(null);
    setGalleryImages([]);
    setVariants([createDraftVariant()]);
    setRelatedProductSlugs([]);
    setEditingProductId(null);
    setEditingProductName(null);
    setFormError(null);
    setSubmitSuccess(null);
    setCreatedProduct(null);
    setUploadStage(null);
  }

  async function handleEditProduct(productId: string) {
    setFormError(null);
    setSubmitSuccess(null);
    setCreatedProduct(null);
    setIsLoadingEditor(true);

    try {
      const detail = await fetchAdminProductDetail(token, productId);
      const nextMainImage = buildExistingImage(detail.mainImage, detail.name);
      const nextGalleryImages = detail.galleryImages.map((image, index) =>
        buildExistingImage(image, `${detail.name} ${index + 1}`),
      );
      const imageIdsByUrl = new Map<string, string>([[detail.mainImage.imageUrl, nextMainImage.id]]);

      detail.galleryImages.forEach((image, index) => {
        imageIdsByUrl.set(image.imageUrl, nextGalleryImages[index].id);
      });

      revokeDraftImage(mainImageRef.current);
      revokeDraftImages(galleryImagesRef.current);

      setEditingProductId(detail.id);
      setEditingProductName(detail.name);
      setName(detail.name);
      setSlug(detail.slug);
      setSlugTouched(true);
      setSku(detail.sku);
      setDescription(detail.description);
      setCategorySlug(detail.category);
      setBasePrice(String(detail.basePrice));
      setMainImage(nextMainImage);
      setGalleryImages(nextGalleryImages);
      setVariants(
        detail.variants.length > 0
          ? detail.variants.map((variant) => ({
              id: createClientId("variant"),
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              priceOverride:
                Number(variant.price) === Number(detail.basePrice) ? "" : String(variant.price),
              imageId: variant.imageUrl ? imageIdsByUrl.get(variant.imageUrl) ?? "" : "",
            }))
          : [createDraftVariant()],
      );
      setRelatedProductSlugs(detail.relatedProducts.map((product) => product.slug));
    } catch (error) {
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      setFormError(readErrorMessage(error, "Could not load the product for editing."));
    } finally {
      setIsLoadingEditor(false);
    }
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    const confirmed = window.confirm(`Delete "${productName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setFormError(null);
    setSubmitSuccess(null);
    setDeletingProductId(productId);

    try {
      await deleteAdminProduct(token, productId);
      if (editingProductId === productId) {
        resetForm();
      }
      if (selectedProductId === productId) {
        setSelectedProductId(null);
      }
      setCreatedProduct(null);
      setSubmitSuccess(`Product "${productName}" was deleted successfully.`);
      await refreshProducts();
    } catch (error) {
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      setFormError(readErrorMessage(error, "Could not delete the product."));
    } finally {
      setDeletingProductId(null);
    }
  }

  function handleMainImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const nextImage = buildDraftImage(file, name.trim() || "Main product image");
    setMainImage((current) => {
      revokeDraftImage(current);
      return nextImage;
    });
    setSubmitSuccess(null);
  }

  function handleGalleryImagesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const nextImages = files.map((file, index) =>
      buildDraftImage(file, `${name.trim() || "Gallery image"} ${galleryImages.length + index + 1}`),
    );

    setGalleryImages((current) => [...current, ...nextImages]);
    setSubmitSuccess(null);
  }

  function removeGalleryImage(imageId: string) {
    setGalleryImages((current) => {
      const imageToRemove = current.find((image) => image.id === imageId) ?? null;
      revokeDraftImage(imageToRemove);
      return current.filter((image) => image.id !== imageId);
    });

    setVariants((current) =>
      current.map((variant) =>
        variant.imageId === imageId
          ? {
              ...variant,
              imageId: "",
            }
          : variant,
      ),
    );
  }

  function updateGalleryImageAlt(imageId: string, value: string) {
    setGalleryImages((current) =>
      current.map((image) =>
        image.id === imageId
          ? {
              ...image,
              altText: value,
            }
          : image,
      ),
    );
  }

  function updateMainImageAlt(value: string) {
    setMainImage((current) =>
      current
        ? {
            ...current,
            altText: value,
          }
        : current,
    );
  }

  function addVariantRow() {
    setVariants((current) => [...current, createDraftVariant()]);
  }

  function removeVariantRow(variantId: string) {
    setVariants((current) => (current.length === 1 ? current : current.filter((variant) => variant.id !== variantId)));
  }

  function updateVariant(variantId: string, field: keyof DraftVariant, value: string) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  function toggleRelatedProduct(productSlug: string) {
    setRelatedProductSlugs((current) =>
      current.includes(productSlug)
        ? current.filter((slugValue) => slugValue !== productSlug)
        : [...current, productSlug],
    );
  }

  function buildPayloadFromDetail(
    detail: AdminProductDetail,
    overrides?: { isActive?: boolean },
  ): AdminProductPayload {
    const imageEntries: Array<[string, string]> = [
      [detail.mainImage.imageUrl, detail.mainImage.publicId],
      ...detail.galleryImages.map((image) => [image.imageUrl, image.publicId] as [string, string]),
    ];
    const imagePublicIdsByUrl = new Map<string, string>(imageEntries);

    return {
      name: detail.name,
      slug: detail.slug,
      sku: detail.sku,
      description: detail.description,
      categorySlug: detail.category,
      basePrice: detail.basePrice,
      isActive: overrides?.isActive ?? detail.isActive,
      mainImage: {
        imageUrl: detail.mainImage.imageUrl,
        publicId: detail.mainImage.publicId,
        altText: detail.mainImage.altText,
        sortOrder: detail.mainImage.sortOrder,
        isMain: true,
      },
      galleryImages: detail.galleryImages.map((image) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isMain: false,
      })),
      variants: detail.variants.map((variant) => ({
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        priceOverride: Number(variant.price) === Number(detail.basePrice) ? undefined : variant.price,
        imagePublicId: variant.imageUrl ? imagePublicIdsByUrl.get(variant.imageUrl) : undefined,
      })),
      relatedProductSlugs:
        detail.relatedProducts.length > 0
          ? detail.relatedProducts.map((product) => product.slug)
          : undefined,
    };
  }

  async function handleToggleProductStatus(product: AdminProductCard) {
    setFormError(null);
    setSubmitSuccess(null);
    setStatusUpdatingProductId(product.id);

    try {
      const detail = await fetchAdminProductDetail(token, product.id);
      const nextStatus = !detail.isActive;
      await updateAdminProduct(
        token,
        product.id,
        buildPayloadFromDetail(detail, {
          isActive: nextStatus,
        }),
      );

      if (createdProduct?.id === product.id) {
        setCreatedProduct({
          ...createdProduct,
          isActive: nextStatus,
        });
      }

      setSubmitSuccess(
        `Product "${product.name}" was ${nextStatus ? "activated" : "deactivated"} successfully.`,
      );
      await refreshProducts();
    } catch (error) {
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      setFormError(readErrorMessage(error, "Could not update the product status."));
    } finally {
      setStatusUpdatingProductId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitSuccess(null);
    setCreatedProduct(null);

    const normalizedName = name.trim();
    const normalizedSlug = slugify(slug);
    const normalizedSku = sku.trim();
    const normalizedDescription = description.trim();
    const normalizedCategorySlug = slugify(categorySlug);
    const parsedBasePrice = Number(basePrice);

    if (!normalizedName || !normalizedSlug || !normalizedSku || !normalizedDescription) {
      setFormError("Please fill in the product name, slug, SKU, and description.");
      return;
    }

    if (productsState.status !== "success") {
      setFormError("Load the existing product list before creating a new product.");
      return;
    }

    if (!normalizedCategorySlug) {
      setFormError("Please enter a valid category slug.");
      return;
    }

    if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
      setFormError("Base price must be a valid number greater than or equal to 0.");
      return;
    }

    if (!mainImage) {
      setFormError("Please select a main image for the product.");
      return;
    }

    if (existingSlugConflict) {
      setFormError("This slug already exists in the database. Please use a different slug.");
      return;
    }

    if (existingSkuConflict) {
      setFormError("This SKU already exists in the database. Please use a different SKU.");
      return;
    }

    const optionKeys = new Set<string>();
    for (const variant of variants) {
      const sizeValue = variant.size.trim();
      const colorValue = variant.color.trim();
      const skuValue = variant.sku.trim();

      if (!sizeValue || !colorValue || !skuValue) {
        setFormError("Each variant must include a SKU, size, and color.");
        return;
      }

      if (variant.priceOverride.trim() !== "") {
        const overrideValue = Number(variant.priceOverride);
        if (!Number.isFinite(overrideValue) || overrideValue < 0) {
          setFormError("Variant price override must be a valid number.");
          return;
        }
      }

      const optionKey = `${sizeValue.toLowerCase()}::${colorValue.toLowerCase()}`;
      if (optionKeys.has(optionKey)) {
        setFormError("You cannot create two variants with the same size and color.");
        return;
      }

      optionKeys.add(optionKey);
    }

    setIsSubmitting(true);

    try {
      const imagesToUpload = [mainImage, ...galleryImages].filter((image) => image.file).length;
      setUploadStage(
        imagesToUpload > 0
          ? `Uploading ${imagesToUpload} image(s)...`
          : "Preparing product payload...",
      );

      const uploadedMainImage = mainImage.file
        ? await uploadAdminProductImage(mainImage.file, token)
        : {
            imageUrl: mainImage.imageUrl ?? mainImage.previewUrl,
            publicId: mainImage.publicId ?? "",
          };

      const uploadedGalleryImages = await Promise.all(
        galleryImages.map(async (image) => {
          if (image.file) {
            return uploadAdminProductImage(image.file, token);
          }

          return {
            imageUrl: image.imageUrl ?? image.previewUrl,
            publicId: image.publicId ?? "",
          };
        }),
      );

      const imagePublicIds = new Map<string, string>([[mainImage.id, uploadedMainImage.publicId]]);
      galleryImages.forEach((image, index) => {
        imagePublicIds.set(image.id, uploadedGalleryImages[index].publicId);
      });

      const payload: AdminProductPayload = {
        name: normalizedName,
        slug: normalizedSlug,
        sku: normalizedSku,
        description: normalizedDescription,
        categorySlug: normalizedCategorySlug,
        basePrice: parsedBasePrice,
        mainImage: {
          imageUrl: uploadedMainImage.imageUrl,
          publicId: uploadedMainImage.publicId,
          altText: mainImage.altText.trim() || normalizedName,
          sortOrder: 0,
          isMain: true,
        },
        galleryImages: galleryImages.map((image, index) => ({
          imageUrl: uploadedGalleryImages[index].imageUrl,
          publicId: uploadedGalleryImages[index].publicId,
          altText: image.altText.trim() || `${normalizedName} ${index + 1}`,
          sortOrder: index + 1,
          isMain: false,
        })),
        variants: variants.map((variant) => ({
          sku: variant.sku.trim(),
          size: variant.size.trim(),
          color: variant.color.trim(),
          priceOverride:
            variant.priceOverride.trim() === "" ? undefined : Number(variant.priceOverride),
          imagePublicId: variant.imageId ? imagePublicIds.get(variant.imageId) : undefined,
        })),
        relatedProductSlugs: relatedProductSlugs.length > 0 ? relatedProductSlugs : undefined,
      };

      setUploadStage(
        editingProductId ? "Updating product in the database..." : "Creating product in the database...",
      );
      const created = editingProductId
        ? await updateAdminProduct(token, editingProductId, payload)
        : await createAdminProduct(token, payload);
      setCreatedProduct(created);
      setSubmitSuccess(
        editingProductId
          ? `Product "${created.name}" was updated successfully.`
          : `Product "${created.name}" was created successfully.`,
      );
      resetForm();
      await refreshProducts();
    } catch (error) {
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      setFormError(readErrorMessage(error, "Could not create the product."));
    } finally {
      setUploadStage(null);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6">
      <section className="rounded-[28px] border border-black/10 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/45">
              Product Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black">
              Product management
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refreshProducts()}
              className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold text-black transition hover:border-black/35"
            >
              Refresh products
            </button>
            <Link
              href="/admin"
              className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
        <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black">
              {editingProductId ? `Editing ${editingProductName ?? "product"}` : "Product form"}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Product name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="Oversized denim jacket"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Slug
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="oversized-denim-jacket"
                />
                {existingSlugConflict ? (
                  <span className="text-xs font-normal text-black/45">
                    This slug already exists in the database.
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Product SKU
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="JACKET-001"
                />
                {existingSkuConflict ? (
                  <span className="text-xs font-normal text-black/45">
                    This SKU already exists in the database.
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Base price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(event) => setBasePrice(event.target.value)}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="1590000"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="Write a short product description covering materials, fit, and highlights."
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                Category slug
                <input
                  list="admin-product-categories"
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(event.target.value)}
                  className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                  placeholder="outerwear"
                />
                <datalist id="admin-product-categories">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-black/10 bg-[#fbfbfb] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">Main image</h3>
                    <p className="mt-1 text-sm leading-6 text-black/55">
                      Required. This image will be used as the product main image.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                    Choose image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleMainImageSelected}
                    />
                  </label>
                </div>

                {mainImage ? (
                    <div className="mt-5 space-y-4">
                      <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
                        <Image
                          src={mainImage.previewUrl}
                          alt={mainImage.altText || name || "Main product image"}
                          width={1200}
                          height={900}
                          unoptimized
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </div>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        Alt text
                      <input
                        value={mainImage.altText}
                        onChange={(event) => updateMainImageAlt(event.target.value)}
                        className="rounded-2xl border border-black/12 bg-white px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                        placeholder="Main product image"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-black/15 bg-white px-5 py-10 text-center text-sm leading-6 text-black/45">
                    No main image selected yet. Choose a JPG, PNG, or WEBP file to preview it before creating the product.
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-black/10 bg-[#fbfbfb] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">Gallery</h3>
                    <p className="mt-1 text-sm leading-6 text-black/55">
                      You can add multiple images. Variants can be linked to any uploaded gallery image.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-black">
                    Add images
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleGalleryImagesSelected}
                    />
                  </label>
                </div>

                {galleryImages.length > 0 ? (
                  <div className="mt-5 grid gap-4">
                    {galleryImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="grid gap-4 rounded-[22px] border border-black/10 bg-white p-4 md:grid-cols-[120px_minmax(0,1fr)]"
                      >
                        <Image
                          src={image.previewUrl}
                          alt={image.altText || `Gallery image ${index + 1}`}
                          width={480}
                          height={480}
                          unoptimized
                          className="h-[120px] w-full rounded-2xl object-cover"
                        />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-black">Image {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(image.id)}
                              className="text-sm font-semibold text-[#c0392b]"
                            >
                              Remove
                            </button>
                          </div>
                          <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                            Alt text
                            <input
                              value={image.altText}
                              onChange={(event) => updateGalleryImageAlt(image.id, event.target.value)}
                              className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                              placeholder={`Gallery image ${index + 1}`}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-black/15 bg-white px-5 py-10 text-center text-sm leading-6 text-black/45">
                    No gallery images yet. You can skip this section if you only need a main image.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#fbfbfb] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-black">Variants</h3>
                </div>

                <button
                  type="button"
                  onClick={addVariantRow}
                  className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-black"
                >
                  Add variant
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="rounded-[22px] border border-black/10 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/55">
                        Variant {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeVariantRow(variant.id)}
                        disabled={variants.length === 1}
                        className="text-sm font-semibold text-[#c0392b] disabled:cursor-not-allowed disabled:text-black/25"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        SKU variant
                        <input
                          value={variant.sku}
                          onChange={(event) => updateVariant(variant.id, "sku", event.target.value)}
                          className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                          placeholder="JACKET-001-BLK-M"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        Size
                        <input
                          value={variant.size}
                          onChange={(event) => updateVariant(variant.id, "size", event.target.value)}
                          className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                          placeholder="M"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        Color
                        <input
                          value={variant.color}
                          onChange={(event) => updateVariant(variant.id, "color", event.target.value)}
                          className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                          placeholder="Black"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        Price override
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.priceOverride}
                          onChange={(event) =>
                            updateVariant(variant.id, "priceOverride", event.target.value)
                          }
                          className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                          placeholder="Leave empty to use the base price"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-black">
                        Linked image
                        <select
                          value={variant.imageId}
                          onChange={(event) => updateVariant(variant.id, "imageId", event.target.value)}
                          className="rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 font-normal text-black outline-none transition focus:border-black/35"
                        >
                          <option value="">No image linked</option>
                          {selectableImages.map((image) => (
                            <option key={image.id} value={image.id}>
                              {image.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#fbfbfb] p-5">
              <h3 className="text-lg font-bold text-black">Related products</h3>
              <p className="mt-1 text-sm leading-6 text-black/55">
                Select from products already in the database. You can skip this section if it is not needed.
              </p>

              <div className="mt-5 grid max-h-[320px] gap-3 overflow-y-auto pr-1">
                {selectableRelatedProducts.length > 0 ? (
                  selectableRelatedProducts.map((product) => (
                    <label
                      key={product.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={relatedProductSlugs.includes(product.slug)}
                        onChange={() => toggleRelatedProduct(product.slug)}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-black">{product.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-black/50">
                          {product.slug} · {product.category} · {product.sku}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-8 text-center text-sm text-black/45">
                    No products are available in the database for linking yet.
                  </div>
                )}
              </div>
            </div>

            {(formError || submitSuccess || uploadStage) && (
              <div className="space-y-3">
                {uploadStage ? (
                  <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm font-medium text-[#1d4ed8]">
                    {uploadStage}
                  </div>
                ) : null}
                {formError ? (
                  <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#b91c1c]">
                    {formError}
                  </div>
                ) : null}
                {submitSuccess ? (
                  <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#166534]">
                    {submitSuccess}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingEditor}
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-wait disabled:bg-black/50"
              >
                {isSubmitting
                  ? "Processing..."
                  : editingProductId
                    ? "Update product"
                    : "Create product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-black transition hover:border-black/35 disabled:cursor-not-allowed disabled:text-black/30"
              >
                {editingProductId ? "Cancel editing" : "Reset form"}
              </button>
              {isLoadingEditor ? (
                <span className="text-sm text-black/45">Loading product details...</span>
              ) : null}
              <span className="text-sm text-black/45">
                {totalDraftImages} image(s) ready to upload · {variants.length} variant(s)
              </span>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-black">Payload summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-black/65">
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                  Slug preview
                </span>
                <span className="mt-2 block font-semibold text-black">
                  {slugify(slug) || "No slug yet"}
                </span>
              </div>
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                  Base price
                </span>
                <span className="mt-2 block font-semibold text-black">
                  {basePrice && Number.isFinite(Number(basePrice))
                    ? formatCurrency(Number(basePrice))
                    : "No price entered"}
                </span>
              </div>
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                  Category
                </span>
                <span className="mt-2 block font-semibold text-black">
                  {slugify(categorySlug) || "No category selected"}
                </span>
              </div>
            </div>
          </section>

          {createdProduct ? (
            <section className="rounded-[28px] border border-[#bbf7d0] bg-[#f0fdf4] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#166534]/70">
                Last created
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#14532d]">
                {createdProduct.name}
              </h2>
              <div className="mt-4 grid gap-2 text-sm text-[#166534]">
                <p>Slug: {createdProduct.slug}</p>
                <p>SKU: {createdProduct.sku}</p>
                <p>Category: {createdProduct.category}</p>
                <p>Status: {createdProduct.isActive ? "Active" : "Inactive"}</p>
                <p>Variants: {createdProduct.variants.length}</p>
                <p>Gallery images: {createdProduct.galleryImages.length + 1}</p>
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-black">Existing products</h2>
                {selectedProduct ? (
                  <p className="mt-1 text-sm leading-6 text-black/55">
                    Selected: {selectedProduct.name}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/55">
                  {productsState.total} items
                </span>
                <button
                  type="button"
                  onClick={() => selectedProduct && void handleToggleProductStatus(selectedProduct)}
                  disabled={
                    !selectedProduct ||
                    statusUpdatingProductId === selectedProduct?.id ||
                    deletingProductId === selectedProduct?.id ||
                    isSubmitting
                  }
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/5 disabled:text-black/30 ${
                    selectedProduct?.isActive
                      ? "border border-[#fde68a] bg-[#fffbeb] text-[#92400e] hover:bg-[#fef3c7]"
                      : "border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7]"
                  }`}
                >
                  {selectedProduct && statusUpdatingProductId === selectedProduct.id
                    ? "Updating..."
                    : selectedProduct?.isActive
                      ? "Set inactive"
                      : "Set active"}
                </button>
                <button
                  type="button"
                  onClick={() => selectedProduct && void handleEditProduct(selectedProduct.id)}
                  disabled={
                    !selectedProduct ||
                    isSubmitting ||
                    deletingProductId === selectedProduct?.id ||
                    isLoadingEditor ||
                    statusUpdatingProductId === selectedProduct?.id
                  }
                  className="rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-black transition hover:border-black/35 disabled:cursor-not-allowed disabled:text-black/30"
                >
                  {selectedProduct && isLoadingEditor && editingProductId === selectedProduct.id
                    ? "Loading..."
                    : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    selectedProduct &&
                    void handleDeleteProduct(selectedProduct.id, selectedProduct.name)
                  }
                  disabled={
                    !selectedProduct ||
                    deletingProductId === selectedProduct?.id ||
                    isSubmitting ||
                    statusUpdatingProductId === selectedProduct?.id
                  }
                  className="rounded-full border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-xs font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/5 disabled:text-black/30"
                >
                  {selectedProduct && deletingProductId === selectedProduct.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>

            {productsState.status === "loading" ? (
              <div className="mt-5 rounded-2xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-8 text-center text-sm text-black/45">
                Syncing products from the database...
              </div>
            ) : null}

            {productsState.status === "error" ? (
              <div className="mt-5 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-4 text-sm text-[#b91c1c]">
                {productsState.error}
              </div>
            ) : null}

            {productsState.status !== "error" ? (
              <div className="mt-5 grid max-h-[560px] gap-3 overflow-y-auto pr-1">
                <div className="sticky top-0 z-10 rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                  <input
                    type="text"
                    value={existingProductsSearch}
                    onChange={(event) => setExistingProductsSearch(event.target.value)}
                    placeholder="Search existing products..."
                    className="w-full rounded-2xl border border-black/12 bg-[#fafafa] px-4 py-3 text-sm text-black outline-none transition focus:border-black/35"
                  />
                </div>

                {filteredExistingProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedProductId === product.id
                        ? "border-black bg-white shadow-sm"
                        : "border-black/10 bg-[#fafafa] hover:border-black/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">{product.name}</p>
                        <p className="mt-1 text-xs leading-5 text-black/50">
                          {product.slug} · {product.sku}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          product.isActive
                            ? "bg-[#ecfdf3] text-[#166534]"
                            : "bg-[#f3f4f6] text-[#4b5563]"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-black/50">
                      <span>{product.category}</span>
                      <span>{formatCurrency(product.basePrice)}</span>
                    </div>
                    {editingProductId === product.id ? (
                      <div className="mt-4">
                        <span className="inline-flex items-center rounded-full bg-black px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                          Editing
                        </span>
                      </div>
                    ) : null}
                  </button>
                ))}

                {productsState.status === "success" && filteredExistingProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-8 text-center text-sm text-black/45">
                    {productsState.items.length === 0
                      ? "No products exist in the database yet."
                      : "No products match your search."}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}
