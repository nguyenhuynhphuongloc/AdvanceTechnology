import { AdminUnavailableState } from "@/components/ui/AdminUnavailableState";

export default function AdminLogsPage() {
  return (
    <AdminUnavailableState
      moduleName="Logs"
      reason="A logging service exists, but no admin gateway route or frontend helper is connected for browsing logs yet."
    />
  );
}
