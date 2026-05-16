import type { ReactNode } from "react";

type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const toneClassName: Record<StatusBadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  accent: "border-blue-200 bg-blue-50 text-blue-700",
};

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: StatusBadgeTone;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
        toneClassName[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
