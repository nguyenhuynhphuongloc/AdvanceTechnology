"use client";

import type { ReactNode } from "react";

type TrendDirection = "up" | "down" | "neutral";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: TrendDirection;
  };
  loading?: boolean;
};

export default function AdminStatCard({
  label,
  value,
  icon,
  trend,
  loading = false,
}: AdminStatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  const trendColor =
    trend?.direction === "up"
      ? "text-green-600"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-admin-muted";

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-admin-soft">
          {label}
        </p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-accent-soft text-admin-accent">
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-admin-text">{value}</p>
      {trend && (
        <p className={`mt-1.5 text-xs font-medium ${trendColor}`}>
          {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
          {trend.value}
        </p>
      )}
    </div>
  );
}
