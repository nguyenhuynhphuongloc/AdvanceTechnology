import { AdminUnavailableState } from "@/components/ui/AdminUnavailableState";

export default function AdminCategoriesPage() {
  return (
    <AdminUnavailableState
      moduleName="Categories"
      reason="Products currently expose category as a field, but there is no dedicated category management API connected to the admin frontend yet."
    />
  );
}
