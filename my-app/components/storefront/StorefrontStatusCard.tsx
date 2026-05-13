import Link from "next/link";

type StorefrontStatusCardProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  tone?: "default" | "error";
};

export function StorefrontStatusCard({
  title,
  description,
  actionHref,
  actionLabel,
  tone = "default",
}: StorefrontStatusCardProps) {
  const containerClasses =
    tone === "error"
      ? "p-10 border border-danger/30 rounded-xl bg-danger/10 text-center"
      : "p-14 border border-border-dim rounded-[22px] bg-surface/20 text-center";

  return (
    <div className={containerClasses}>
      <h2 className="m-0 text-[28px] font-bold tracking-tight">{title}</h2>
      <p className="mt-3 mx-auto mb-0 max-w-[560px] text-text-muted leading-relaxed">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-all hover:-translate-y-0.5 bg-accent text-accent-contrast hover:bg-accent-strong shadow-lg"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
