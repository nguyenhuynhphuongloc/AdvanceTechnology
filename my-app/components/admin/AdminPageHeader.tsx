"use client";

import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
};

export default function AdminPageHeader({
  title,
  subtitle,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {subtitle && (
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-admin-soft">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl font-bold text-admin-text">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-admin-muted">{description}</p>
        )}
      </div>
      {actions && <div className="mt-2 flex shrink-0 items-center gap-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
