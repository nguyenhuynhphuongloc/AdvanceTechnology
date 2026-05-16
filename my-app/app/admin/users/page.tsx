import { fetchAdminUsers } from "@/lib/admin/api";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const { items: users } = await fetchAdminUsers(token).catch(() => ({ items: [] as any[] }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Users</h1>
          <p className="text-text-muted">Manage customers, admins, and roles. <span className="font-mono text-text-soft text-xs">({users.length} users)</span></p>
        </div>
      </div>
      
      <div className="bg-surface border border-border-dim rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-dim bg-surface-muted/50 text-[11px] font-black uppercase tracking-wider text-text-soft">
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No users found or unauthorized. Please log in as admin.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-4 pl-6 text-xs font-mono text-text-muted">{user.id.slice(0, 8)}…</td>
                  <td className="p-4 text-sm font-bold text-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'admin'
                        ? 'bg-accent/15 text-accent'
                        : user.role === 'seller'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-surface-strong text-text-soft'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-success" : "bg-text-soft"}`} />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-soft">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-text-muted">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
