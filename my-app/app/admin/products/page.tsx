import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <main style={{ padding: "24px" }}>
      <h1>Admin Products</h1>
      <p>Đây là trang quản lý sản phẩm Admin (tạm).</p>
      <p>
        Quay về <Link href="/admin">Dashboard</Link>
      </p>
    </main>
  );
}
