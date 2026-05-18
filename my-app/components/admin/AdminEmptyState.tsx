"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
};

export default function AdminEmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 text-admin-soft">{icon}</div>
      ) : (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-admin-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-admin-muted">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link
              href={action.href}
              className="rounded-lg border border-admin-border bg-admin-surface px-4 py-2 text-sm font-semibold text-admin-text transition hover:border-admin-accent hover:text-admin-accent"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="rounded-lg border border-admin-border bg-admin-surface px-4 py-2 text-sm font-semibold text-admin-text transition hover:border-admin-accent hover:text-admin-accent"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
