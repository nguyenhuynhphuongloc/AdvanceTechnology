import { AdminUnavailableState } from "@/components/ui/AdminUnavailableState";

export default function AdminPaymentsPage() {
  return (
    <AdminUnavailableState
      moduleName="Payments"
      reason="Payment service endpoints exist, but an admin payment table and protected frontend helper have not been wired yet."
    />
  );
}
