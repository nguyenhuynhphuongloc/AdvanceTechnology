import { EmptyState } from "./States";

export function AdminUnavailableState({
  moduleName,
  reason,
}: {
  moduleName: string;
  reason: string;
}) {
  return (
    <EmptyState
      title={`${moduleName} is not connected yet`}
      description={reason}
    />
  );
}
