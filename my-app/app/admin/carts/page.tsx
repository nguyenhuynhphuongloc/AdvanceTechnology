import { AdminUnavailableState } from "@/components/ui/AdminUnavailableState";

export default function AdminCartsPage() {
  return (
    <AdminUnavailableState
      moduleName="Carts"
      reason="The cart service exposes current-user cart operations, but no admin cart list/detail-by-user endpoint is available yet."
    />
  );
}
