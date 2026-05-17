"use client";

type StatusVariant =
  | "pending"
  | "approved"
  | "active"
  | "rejected"
  | "suspended"
  | "inactive"
  | "info"
  | "default";

const variantClasses: Record<StatusVariant, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-green-50 text-green-700 ring-green-200",
  active: "bg-green-50 text-green-700 ring-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  suspended: "bg-orange-50 text-orange-700 ring-orange-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

const variantDots: Record<StatusVariant, string> = {
  pending: "bg-amber-400",
  approved: "bg-green-500",
  active: "bg-green-500",
  rejected: "bg-red-500",
  suspended: "bg-orange-400",
  inactive: "bg-slate-400",
  info: "bg-blue-500",
  default: "bg-slate-400",
};

type AdminStatusBadgeProps = {
  status: string;
  variant?: StatusVariant;
  showDot?: boolean;
  className?: string;
};

export default function AdminStatusBadge({
  status,
  variant,
  showDot = true,
  className = "",
}: AdminStatusBadgeProps) {
  const normalized = status?.toLowerCase() ?? "";
  const resolvedVariant: StatusVariant =
    variant ?? (normalized as StatusVariant) ?? "default";

  const classes = variantClasses[resolvedVariant] ?? variantClasses.default;
  const dotClass = variantDots[resolvedVariant] ?? variantDots.default;

  const display = status?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${classes} ${className}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
      )}
      {display}
    </span>
  );
}
