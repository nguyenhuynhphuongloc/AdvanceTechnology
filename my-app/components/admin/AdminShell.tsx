"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import AdminSessionGate, { useAdminSession } from "./AdminSessionGate";
import { logoutAdmin } from "@/lib/admin/api";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_SELLERS_PATH,
  ADMIN_SELLER_PROFILES_PATH,
  ADMIN_SHOP_APPROVALS_PATH,
  ADMIN_PRODUCT_APPROVALS_PATH,
  ADMIN_ANALYTICS_PATH,
  ADMIN_REFUNDS_PATH,
  ADMIN_COMMISSIONS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_STORES_PATH,
  ADMIN_ADMINS_PATH,
  ADMIN_PROFILE_PATH,
} from "@/lib/admin/constants";
import { clearAdminSessionToken } from "@/lib/admin/session";

/* ─── Inline SVG Icons ─────────────────────────────────────────── */
const icons: Record<string, ReactNode> = {
  dashboard: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  analytics: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-6" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  userCog: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8a3 3 0 11.001 6.001A3 3 0 0119 8z" />
    </svg>
  ),
  store: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9zM9 21V12h6v9" />
    </svg>
  ),
  checkCircle: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
    </svg>
  ),
  packageCheck: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7v10l8 4M12 11l8-4M12 11v10" />
    </svg>
  ),
  package: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 11l8-4M12 11v10M12 11L4 7" />
    </svg>
  ),
  tag: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 5l8 8-5 5-8-8V3h3l2 2zM13.5 3H21v7.5L13 18l-7-7 7.5-8z" />
    </svg>
  ),
  warehouse: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />
    </svg>
  ),
  image: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </svg>
  ),
  shoppingCart: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  creditCard: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
    </svg>
  ),
  shoppingBag: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0" />
    </svg>
  ),
  rotateCcw: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 109-9 9 9 0 00-9 9zM3 3v5h5" />
    </svg>
  ),
  trendingUp: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />
    </svg>
  ),
  dollarSign: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  fileText: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  bell: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  home: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

/* ─── Nav Definition ────────────────────────────────────────────── */
type AdminNavItem = {
  href: string;
  label: string;
  group: string;
  icon: string;
  unavailable?: boolean;
  noApi?: boolean;
};

const adminNavItems: AdminNavItem[] = [
  // Overview
  { href: "/admin", label: "Dashboard", group: "Overview", icon: "dashboard" },
  { href: ADMIN_ANALYTICS_PATH, label: "Analytics", group: "Overview", icon: "analytics" },
  // Users & Sellers
  { href: ADMIN_USERS_PATH, label: "Users", group: "Users & Sellers", icon: "users" },
  { href: ADMIN_SELLERS_PATH, label: "Sellers", group: "Users & Sellers", icon: "userCog", unavailable: true },
  { href: ADMIN_SELLER_PROFILES_PATH, label: "Seller Profiles", group: "Users & Sellers", icon: "store" },
  { href: ADMIN_ADMINS_PATH, label: "Admins", group: "Users & Sellers", icon: "userCog", noApi: true },
  // Stores
  { href: ADMIN_STORES_PATH, label: "All Stores", group: "Stores", icon: "store" },
  { href: ADMIN_SHOP_APPROVALS_PATH, label: "Shop Approvals", group: "Stores", icon: "checkCircle" },
  // Moderation
  { href: ADMIN_PRODUCT_APPROVALS_PATH, label: "Product Approvals", group: "Moderation", icon: "packageCheck" },
  { href: "/admin/reports", label: "Reports", group: "Moderation", icon: "fileText", noApi: true },
  { href: "/admin/categories", label: "Categories", group: "Moderation", icon: "tag" },
  // Commerce
  { href: "/admin/orders", label: "Orders", group: "Commerce", icon: "shoppingCart" },
  { href: "/admin/shop-orders", label: "Shop Orders", group: "Commerce", icon: "package" },
  { href: "/admin/payments", label: "Payments", group: "Commerce", icon: "creditCard" },
  { href: "/admin/carts", label: "Carts", group: "Commerce", icon: "shoppingBag" },
  // Finance
  { href: "/admin/revenue", label: "Platform Revenue", group: "Finance", icon: "dollarSign", noApi: true },
  { href: ADMIN_COMMISSIONS_PATH, label: "Commissions", group: "Finance", icon: "trendingUp", unavailable: true },
  { href: ADMIN_REFUNDS_PATH, label: "Refunds", group: "Finance", icon: "rotateCcw", unavailable: true },
  // System
  { href: "/admin/notifications", label: "Notifications", group: "System", icon: "bell" },
  { href: "/admin/store-settings", label: "Platform Settings", group: "System", icon: "settings" },
  // Profile
  { href: ADMIN_PROFILE_PATH, label: "My Profile", group: "Profile", icon: "userCog" },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
function buildBreadcrumb(pathname: string): string[] {
  if (pathname === "/admin") return ["Dashboard"];
  return pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((seg) =>
      seg.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" "),
    );
}

/* ─── Logout Button ─────────────────────────────────────────────── */
function AdminLogoutButton() {
  const router = useRouter();
  const { token } = useAdminSession();

  async function handleLogout() {
    try { await logoutAdmin(token); } catch { /* ignore */ }
    finally {
      clearAdminSessionToken();
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Logout"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-admin-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      {icons.logout}
    </button>
  );
}

/* ─── Sidebar Nav Link ──────────────────────────────────────────── */
function NavLink({ item, isActive }: { item: AdminNavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-admin-accent-soft text-admin-accent"
          : "text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text",
      ].join(" ")}
    >
      <span className={isActive ? "text-admin-accent" : "text-admin-soft"}>
        {icons[item.icon]}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.unavailable && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          Soon
        </span>
      )}
      {item.noApi && !item.unavailable && (
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
          No API
        </span>
      )}
    </Link>
  );
}

/* ─── Chrome ────────────────────────────────────────────────────── */
function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAdminSession();
  const breadcrumb = buildBreadcrumb(pathname);
  const groups = Array.from(new Set(adminNavItems.map((item) => item.group)));

  const userInitial = (user.email ?? "A").charAt(0).toUpperCase();

  return (
    <div className="admin-shell flex min-h-screen text-admin-text">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 border-r border-admin-border bg-admin-surface lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-admin-border px-5 py-4">
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-accent text-xs font-bold text-white">
              AT
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-admin-text">Admin Console</span>
              <span className="block text-xs text-admin-muted">Advance Technology</span>
            </span>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-admin-soft">
                {group}
              </p>
              <div className="space-y-0.5">
                {adminNavItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                    return <NavLink key={item.href} item={item} isActive={isActive} />;
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-admin-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
          >
            {icons.home}
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b border-admin-border bg-admin-surface/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
            {/* Breadcrumb */}
            <div className="hidden min-w-0 flex-1 items-center gap-1 text-xs font-medium text-admin-muted sm:flex">
              <Link href="/admin" className="shrink-0 hover:text-admin-text">Admin</Link>
              {breadcrumb.map((seg) => (
                <span key={seg} className="flex items-center gap-1 truncate">
                  <span className="text-admin-soft">/</span>
                  <span className="truncate">{seg}</span>
                </span>
              ))}
            </div>
            <span className="flex-1 sm:hidden" />

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <form action="/admin/users" className="hidden md:block">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-soft" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    name="search"
                    placeholder="Search users…"
                    className="h-8 w-52 rounded-lg border border-admin-border bg-admin-surface-muted pl-8 pr-3 text-xs text-admin-text outline-none transition focus:border-admin-accent focus:bg-white"
                  />
                </div>
              </form>

              {/* Notification bell */}
              <Link
                href="/admin/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
                title="Notifications"
              >
                {icons.bell}
              </Link>

              {/* User pill */}
              <div className="hidden items-center gap-2 rounded-lg border border-admin-border bg-admin-surface-muted px-3 py-1.5 sm:flex">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-admin-accent text-[10px] font-bold text-white">
                  {userInitial}
                </span>
                <span className="max-w-[140px] truncate text-xs font-medium text-admin-text">{user.email}</span>
              </div>

              {/* Logout */}
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        {/* Mobile scrollable nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-admin-border bg-admin-surface px-3 py-2 lg:hidden">
          {adminNavItems.filter(i => !i.unavailable).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                pathname === item.href
                  ? "bg-admin-accent-soft text-admin-accent"
                  : "text-admin-muted hover:bg-admin-surface-muted",
              ].join(" ")}
            >
              <span className="opacity-70">{icons[item.icon]}</span>
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

/* ─── Shell export ──────────────────────────────────────────────── */
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminSessionGate>
      {pathname === ADMIN_LOGIN_PATH ? children : <AdminChrome>{children}</AdminChrome>}
    </AdminSessionGate>
  );
}
