"use client";

import AdminModal from "./AdminModal";

type ConfirmVariant = "danger" | "warning" | "info" | "default";

const variantConfig: Record<
  ConfirmVariant,
  { confirmLabel: string; confirmClass: string }
> = {
  danger: {
    confirmLabel: "Confirm",
    confirmClass:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    confirmLabel: "Proceed",
    confirmClass:
      "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500",
  },
  info: {
    confirmLabel: "Confirm",
    confirmClass:
      "bg-admin-accent text-white hover:bg-blue-700 focus:ring-admin-accent",
  },
  default: {
    confirmLabel: "Confirm",
    confirmClass:
      "bg-admin-accent text-white hover:bg-blue-700 focus:ring-admin-accent",
  },
};

type AdminConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  children?: React.ReactNode;
};

export default function AdminConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
}: AdminConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-admin-border bg-white px-4 py-2 text-sm font-semibold text-admin-text transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${config.confirmClass}`}
          >
            {loading ? "Processing..." : (confirmLabel ?? config.confirmLabel)}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {description && (
          <p className="text-sm text-admin-muted">{description}</p>
        )}
        {children}
      </div>
    </AdminModal>
  );
}
