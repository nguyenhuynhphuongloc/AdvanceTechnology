import { storefrontBranding } from "@/lib/storefront/config";

export default function AdminStoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Store Settings</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Preview public identity settings. Persistence requires a store settings API contract.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="admin-surface space-y-5 p-5">
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Store name
            <input
              defaultValue={storefrontBranding.brandName}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Logo text
            <input
              defaultValue={storefrontBranding.logoText}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Contact email
            <input
              defaultValue={storefrontBranding.contactEmail}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-admin-text">
            Contact phone
            <input
              defaultValue={storefrontBranding.contactPhone}
              className="rounded-lg border border-admin-border px-3 py-2 text-sm outline-none focus:border-admin-accent"
            />
          </label>
          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-500"
          >
            Save unavailable until API is ready
          </button>
        </form>

        <aside className="admin-surface h-fit p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Public header preview</p>
          <div className="mt-4 rounded-xl border border-admin-border bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-black">
                {storefrontBranding.logoText}
              </span>
              <span className="text-lg font-black">{storefrontBranding.brandName}</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
