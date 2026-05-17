"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 z-50 m-0 overflow-visible rounded-xl border border-admin-border bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      style={{ margin: "auto", maxHeight: "90vh" }}
    >
      <div
        className={`flex w-full flex-col ${sizeClasses[size]}`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-admin-border px-6 py-4">
          <h2 className="text-lg font-bold text-admin-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-muted transition hover:bg-slate-100 hover:text-admin-text"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-admin-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
