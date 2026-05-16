"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import AdminSessionGate, { useAdminSession } from "./AdminSessionGate";
import { logoutAdmin } from "@/lib/admin/api";
import {
  ADMIN_INVENTORY_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_MEDIA_LIBRARY_PATH,
  ADMIN_PRODUCTS_PATH,
} from "@/lib/admin/constants";
import { clearAdminSessionToken } from "@/lib/admin/session";

type AdminNavItem = {
  href: string;
  label: string;
  group: string;
  unavailable?: boolean;
};

const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", group: "Overview" },
  { href: ADMIN_PRODUCTS_PATH, label: "Products", group: "Catalog" },
  { href: "/admin/categories", label: "Categories", group: "Catalog", unavailable: true },
  { href: ADMIN_INVENTORY_PATH, label: "Inventory", group: "Catalog" },
  { href: ADMIN_MEDIA_LIBRARY_PATH, label: "Media Library", group: "Catalog" },
  { href: "/admin/orders", label: "Orders", group: "Commerce" },
  { href: "/admin/payments", label: "Payments", group: "Commerce", unavailable: true },
  { href: "/admin/carts", label: "Carts", group: "Commerce", unavailable: true },
  { href: "/admin/users", label: "Users", group: "Customers" },
  { href: "/admin/store-settings", label: "Store Settings", group: "System", unavailable: true },
  { href: "/admin/logs", label: "Logs", group: "System", unavailable: true },
  { href: "/admin/notifications", label: "Notifications", group: "System", unavailable: true },
];

function buildBreadcrumb(pathname: string) {
  if (pathname === "/admin") {
    return ["Dashboard"];
  }

  return pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    );
}

function AdminLogoutButton() {
  const router = useRouter();
  const { token } = useAdminSession();

  async function handleLogout() {
    try {
      await logoutAdmin(token);
    } catch {
      // Local logout still clears stale sessions if the gateway is unavailable.
    } finally {
      clearAdminSessionToken();
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
    >
      Logout
    </button>
  );
}

function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAdminSession();
  const breadcrumb = buildBreadcrumb(pathname);
  const groups = Array.from(new Set(adminNavItems.map((item) => item.group)));

  return (
    <div className="admin-shell flex min-h-screen text-admin-text">
      <aside className="hidden w-72 shrink-0 border-r border-admin-border bg-admin-surface lg:flex lg:flex-col">
        <div className="border-b border-admin-border px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-accent text-sm font-black text-white">
              AT
            </span>
            <span>
              <span className="block text-base font-black tracking-tight">Admin Console</span>
              <span className="block text-xs font-medium text-admin-muted">Advance Technology</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {groups.map((group) => (
            <div key={group} className="mb-5">
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-admin-soft">
                {group}
              </p>
              <div className="grid gap-1">
                {adminNavItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition",
                          isActive
                            ? "bg-admin-accent-soft text-admin-accent"
                            : "text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text",
                        ].join(" ")}
                      >
                        <span>{item.label}</span>
                        {item.unavailable ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            Soon
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-admin-border p-4">
          <Link
            href="/"
            className="flex rounded-lg px-3 py-2 text-sm font-semibold text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
          >
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-admin-border bg-admin-surface/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-admin-muted">
                <Link href="/admin" className="hover:text-admin-text">
                  Admin
                </Link>
                {breadcrumb.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span>/</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
              <p className="mt-1 truncate text-sm text-admin-muted">
                Manage catalog, orders, customers, and store operations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form action="/admin/products" className="hidden sm:block">
                <input
                  name="search"
                  placeholder="Search admin..."
                  className="h-10 w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-admin-accent focus:bg-white"
                />
              </form>
              <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                Notifications
              </span>
              <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 md:inline-flex">
                {user.email}
              </span>
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-admin-border bg-admin-surface px-4 py-3 lg:hidden">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold",
                pathname === item.href
                  ? "bg-admin-accent-soft text-admin-accent"
                  : "bg-slate-100 text-admin-muted",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminSessionGate>
      {pathname === ADMIN_LOGIN_PATH ? children : <AdminChrome>{children}</AdminChrome>}
    </AdminSessionGate>
  );
}
