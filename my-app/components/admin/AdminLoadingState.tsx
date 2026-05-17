"use client";

type AdminLoadingStateProps = {
  label?: string;
  className?: string;
};

export default function AdminLoadingState({
  label = "Loading...",
  className = "",
}: AdminLoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-3 border-admin-border border-t-admin-accent" />
      </div>
      {label && (
        <p className="mt-3 text-sm font-medium text-admin-muted">{label}</p>
      )}
    </div>
  );
}
