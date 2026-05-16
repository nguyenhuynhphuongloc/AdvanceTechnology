"use client";

import Link from "next/link";
import {
  ADMIN_INVENTORY_PATH,
  ADMIN_MEDIA_LIBRARY_PATH,
  ADMIN_PRODUCTS_PATH,
} from "@/lib/admin/constants";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: ADMIN_PRODUCTS_PATH, label: "Products" },
  { href: ADMIN_INVENTORY_PATH, label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: ADMIN_MEDIA_LIBRARY_PATH, label: "Media Library" },
];

export default function AdminDashboard() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Admin navigation
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">Management modules</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
