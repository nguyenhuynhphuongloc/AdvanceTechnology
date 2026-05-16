"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  deleteAdminMediaAsset,
  fetchAdminMediaAssets,
  isAdminApiError,
  isAdminUnauthorizedError,
  uploadAdminMediaAsset,
} from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH, ADMIN_PRODUCTS_PATH } from "@/lib/admin/constants";
import { clearAdminSessionToken } from "@/lib/admin/session";
import type { AdminMediaAsset } from "@/lib/admin/types";
import { useAdminSession } from "./AdminSessionGate";
import { useRouter } from "next/navigation";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function formatBytes(value?: number | null) {
  if (!value) {
    return "Unknown size";
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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

export default function AdminMediaLibrary() {
  const router = useRouter();
  const { token } = useAdminSession();
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearAdminSessionToken();
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  }, [router]);

  const loadAssets = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetchAdminMediaAssets(token);
      setAssets(response.items);
      setStatus("success");
    } catch (loadError) {
      if (isAdminUnauthorizedError(loadError)) {
        handleUnauthorized();
        return;
      }

      setStatus("error");
      setError(readErrorMessage(loadError, "Could not load media assets."));
    }
  }, [handleUnauthorized, token]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    setUploadError(null);
    setUploadMessage(null);

    if (!file) {
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setUploadError("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError("Image file size must be 5MB or smaller.");
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadAdminMediaAsset(file, token);
      setUploadMessage(`Uploaded ${uploaded.publicId}.`);
      await loadAssets();
    } catch (uploadErrorValue) {
      if (isAdminUnauthorizedError(uploadErrorValue)) {
        handleUnauthorized();
        return;
      }

      setUploadError(readErrorMessage(uploadErrorValue, "Could not upload media asset."));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(asset: AdminMediaAsset) {
    setUploadError(null);
    setUploadMessage(null);

    if (asset.linked) {
      setUploadError("This asset is still linked to a product and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(`Delete media asset "${asset.publicId}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingPublicId(asset.publicId);

    try {
      await deleteAdminMediaAsset(token, asset.publicId);
      setUploadMessage(`Deleted ${asset.publicId}.`);
      await loadAssets();
    } catch (deleteErrorValue) {
      if (isAdminUnauthorizedError(deleteErrorValue)) {
        handleUnauthorized();
        return;
      }

      setUploadError(readErrorMessage(deleteErrorValue, "Could not delete media asset."));
    } finally {
      setDeletingPublicId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-black">
      <div className="mx-auto max-w-[1280px] px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Media Library</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-black/35"
            >
              Dashboard
            </Link>
            <Link
              href={ADMIN_PRODUCTS_PATH}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Product Manager
            </Link>
          </div>
        </header>

        <section className="mb-6 rounded-[24px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Upload asset</h2>
              <p className="mt-1 text-sm text-black/55">
                JPG, PNG, or WEBP. Maximum file size is 5MB.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85">
              {isUploading ? "Uploading..." : "Choose image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isUploading}
                onChange={handleUpload}
              />
            </label>
          </div>
          {uploadError ? (
            <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#b91c1c]">
              {uploadError}
            </div>
          ) : null}
          {uploadMessage ? (
            <div className="mt-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#166534]">
              {uploadMessage}
            </div>
          ) : null}
        </section>

        {status === "loading" ? (
          <div className="rounded-[24px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-sm text-black/50">
            Loading media assets...
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-[24px] border border-[#fecaca] bg-[#fff1f2] px-6 py-5 text-sm text-[#b91c1c]">
            {error}
          </div>
        ) : null}

        {status === "success" && assets.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-sm text-black/50">
            No media assets found in the managed Cloudinary folder.
          </div>
        ) : null}

        {status === "success" && assets.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <article
                key={asset.publicId}
                className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-black/5">
                  <img
                    src={asset.imageUrl}
                    alt={asset.publicId}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-black">{asset.publicId}</p>
                    <p className="mt-1 text-xs text-black/50">
                      {asset.width ?? "?"}x{asset.height ?? "?"} · {formatBytes(asset.bytes)}
                    </p>
                    {asset.createdAt ? (
                      <p className="mt-1 text-xs text-black/50">
                        Created {new Date(asset.createdAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        asset.linked
                          ? "bg-[#eff6ff] text-[#1d4ed8]"
                          : "bg-[#f3f4f6] text-[#4b5563]"
                      }`}
                    >
                      {asset.linked ? "Linked" : "Unlinked"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDelete(asset)}
                      disabled={asset.linked || deletingPublicId === asset.publicId}
                      className="rounded-full border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-xs font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/5 disabled:text-black/30"
                    >
                      {deletingPublicId === asset.publicId ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  {asset.linked ? (
                    <p className="text-xs leading-5 text-black/50">
                      In use by {asset.linkedProductName ?? "a product"}.
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
