import Link from "next/link";
import { cookies } from "next/headers";
import { fetchAdminUsers } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminPagination } from "@/components/ui/AdminPagination";
import type { AdminUserAccount } from "@/lib/admin/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const role = readParam(params, "role") ?? "all";
  const query = (readParam(params, "search") ?? "").toLowerCase();
  const page = Math.max(1, Number(readParam(params, "page") ?? "1") || 1);
  const limit = 20;
  const { items: users } = await fetchAdminUsers(token).catch(() => ({ items: [] as AdminUserAccount[], total: 0 }));
  const filteredUsers = users.filter((user) => {
    const matchesRole = role === "all" || user.role === role;
    const matchesSearch =
      !query ||
      user.email.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });
  const pagedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Customers</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Users</h1>
        <p className="mt-2 text-sm text-admin-muted">Review account status, roles, carts, and order links.</p>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" action="/admin/users">
        <input
          name="search"
          defaultValue={query}
          placeholder="Search name, email, or id..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="role"
          defaultValue={role}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="user">User</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <AdminDataTable
        rows={pagedUsers}
        getRowKey={(user) => user.id}
        emptyTitle="No users found"
        emptyDescription="User accounts will appear here after registration or after filters are cleared."
        columns={[
          {
            key: "account",
            header: "Account",
            render: (user) => (
              <div>
                <p className="font-bold text-admin-text">{user.name || user.email}</p>
                <p className="font-mono text-xs text-admin-muted">{user.id.slice(0, 12)}</p>
              </div>
            ),
          },
          { key: "email", header: "Email", render: (user) => user.email },
          {
            key: "role",
            header: "Role",
            render: (user) => (
              <StatusBadge tone={user.role === "admin" ? "accent" : user.role === "seller" ? "warning" : "neutral"}>
                {user.role}
              </StatusBadge>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (user) => <StatusBadge tone={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Inactive"}</StatusBadge>,
          },
          { key: "created", header: "Created", render: (user) => new Date(user.createdAt).toLocaleDateString() },
          {
            key: "links",
            header: "Related",
            className: "text-right",
            render: (user) => (
              <div className="flex justify-end gap-3">
                <Link href={`/admin/carts?user=${user.id}`} className="font-bold text-admin-accent">Cart</Link>
                <Link href={`/admin/orders?search=${encodeURIComponent(user.email)}`} className="font-bold text-admin-accent">Orders</Link>
              </div>
            ),
          },
        ]}
      />
      <AdminPagination
        basePath="/admin/users"
        page={page}
        limit={limit}
        total={filteredUsers.length}
        query={{ search: query, role }}
      />
    </div>
  );
}
