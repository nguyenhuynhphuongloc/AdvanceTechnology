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
  const className =
    tone === "error"
      ? "storefront-message storefront-message-error"
      : "storefront-message storefront-message-empty";

  return (
    <div className={className}>
      <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
      <p style={{ margin: "12px auto 0", maxWidth: 560, color: "var(--text-muted)", lineHeight: 1.7 }}>
        {description}
      </p>
      {actionHref && actionLabel ? (
        <div style={{ marginTop: 24 }}>
          <Link href={actionHref} className="storefront-button storefront-button-primary">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
