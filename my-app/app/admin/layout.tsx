import type { ReactNode } from "react";
import "../globals.css";
import AdminSessionGate from "@/components/admin/AdminSessionGate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", padding: "24px" }}>
      <AdminSessionGate>{children}</AdminSessionGate>
    </div>
  );
}
