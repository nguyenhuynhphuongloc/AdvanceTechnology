import { redirect } from "next/navigation";
import { ADMIN_PRODUCTS_PATH } from "@/lib/admin/constants";

export default function AdminIndexPage() {
  redirect(ADMIN_PRODUCTS_PATH);
}
