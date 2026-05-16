import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  fetchAdminStoreSettings,
  updateAdminStoreSettings,
  uploadAdminProductImage,
} from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
}

async function updateStoreSettingsAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  const logoFile = formData.get("logoFile");
  let logoImageUrl = String(formData.get("logoImageUrl") ?? "") || null;
  let logoPublicId = String(formData.get("logoPublicId") ?? "") || null;

  if (logoFile instanceof File && logoFile.size > 0) {
    const uploaded = await uploadAdminProductImage(logoFile, token);
    logoImageUrl = uploaded.imageUrl;
    logoPublicId = uploaded.publicId;
  }

  await updateAdminStoreSettings(token, {
    storeName: String(formData.get("storeName") ?? ""),
    logoImageUrl,
    logoPublicId,
    description: String(formData.get("description") ?? "") || null,
    contactEmail: String(formData.get("contactEmail") ?? "") || null,
    contactPhone: String(formData.get("contactPhone") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
  });

  revalidatePath("/");
  revalidatePath("/product");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/admin/store-settings");
}

export default async function AdminStoreSettingsPage() {
  const token = await getAdminToken();
  const settings = await fetchAdminStoreSettings(token).catch(() => null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Store Settings</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Persist storefront identity so the public store reflects admin changes without code edits.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={updateStoreSettingsAction} className="admin-surface space-y-5 p-5">
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Store name
            <input
              name="storeName"
              required
              defaultValue={settings?.storeName ?? "Advance Technology"}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Logo image URL
            <input
              name="logoImageUrl"
              defaultValue={settings?.logoImageUrl ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Logo public ID
            <input
              name="logoPublicId"
              defaultValue={settings?.logoPublicId ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Upload logo
            <input
              type="file"
              name="logoFile"
              accept="image/*"
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={settings?.description ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Contact email
            <input
              type="email"
              name="contactEmail"
              defaultValue={settings?.contactEmail ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Contact phone
            <input
              name="contactPhone"
              defaultValue={settings?.contactPhone ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Address
            <input
              name="address"
              defaultValue={settings?.address ?? ""}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <button className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white">
            Save settings
          </button>
        </form>

        <aside className="admin-surface h-fit p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Public preview</p>
          <div className="mt-4 rounded-xl border border-admin-border bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-3">
              {settings?.logoImageUrl ? (
                <img
                  src={settings.logoImageUrl}
                  alt={settings.storeName}
                  className="h-10 w-10 rounded-xl border border-white/20 bg-white/10 object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-black">
                  {(settings?.storeName ?? "Advance Technology").slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <span className="block text-lg font-black">{settings?.storeName ?? "Advance Technology"}</span>
                <span className="block text-sm text-white/65">{settings?.contactEmail ?? "No email configured"}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
