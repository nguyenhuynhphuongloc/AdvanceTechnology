import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
}

async function createCategoryAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await createAdminCategory(token, {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    parentId: String(formData.get("parentId") ?? "") || null,
  });
  revalidatePath("/admin/categories");
}

async function updateCategoryAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  const id = String(formData.get("id") ?? "");
  await updateAdminCategory(token, id, {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    parentId: String(formData.get("parentId") ?? "") || null,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/product");
  revalidatePath("/search");
}

async function deleteCategoryAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await deleteAdminCategory(token, String(formData.get("id") ?? ""));
  revalidatePath("/admin/categories");
  revalidatePath("/product");
  revalidatePath("/search");
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const token = await getAdminToken();
  const params = await searchParams;
  const search = readParam(params, "search");
  const response = await fetchAdminCategories(token, { search }).catch(() => ({
    items: [],
    total: 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Categories</h1>
          <p className="mt-2 text-sm text-admin-muted">
            {response.total} category records for product classification.
          </p>
        </div>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" action="/admin/categories">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search category name or slug..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <div />
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Search</button>
      </form>

      <form action={createCategoryAction} className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <input
          name="name"
          required
          placeholder="Category name"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <input
          name="slug"
          required
          placeholder="category-slug"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="parentId"
          defaultValue=""
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">No parent</option>
          {response.items.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white">
          Add category
        </button>
      </form>

      <AdminDataTable
        rows={response.items}
        getRowKey={(category) => category.id}
        emptyTitle="No categories found"
        emptyDescription="Create product categories before assigning products to the catalog."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (category) => (
              <form id={`category-${category.id}`} action={updateCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-bold text-admin-text outline-none focus:border-admin-accent"
                />
              </form>
            ),
          },
          {
            key: "slug",
            header: "Slug",
            render: (category) => (
              <input
                form={`category-${category.id}`}
                name="slug"
                defaultValue={category.slug}
                className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 font-mono text-xs text-admin-text outline-none focus:border-admin-accent"
              />
            ),
          },
          {
            key: "parent",
            header: "Parent",
            render: (category) => (
              <select
                form={`category-${category.id}`}
                name="parentId"
                defaultValue={category.parentId ?? ""}
                className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
              >
                <option value="">No parent</option>
                {response.items
                  .filter((candidate) => candidate.id !== category.id)
                  .map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
              </select>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (category) => (
              <div className="flex justify-end gap-2">
                <button
                  form={`category-${category.id}`}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                >
                  Save
                </button>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    Delete
                  </button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
