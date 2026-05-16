import { AdminUnavailableState } from "@/components/ui/AdminUnavailableState";

export default function AdminNotificationsPage() {
  return (
    <AdminUnavailableState
      moduleName="Notifications"
      reason="Notification logs exist in the notification service, but the admin UI has not connected a notification log table yet."
    />
  );
}
