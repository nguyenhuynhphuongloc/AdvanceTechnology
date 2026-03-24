import Link from "next/link";
import { StorefrontHomePage } from "../components/storefront/StorefrontHomePage";

export default function Home() {
  return (
    <>
      <nav style={{ padding: 12, background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
        <Link href="/admin">Go to Admin Dashboard</Link>
      </nav>
      <StorefrontHomePage />
    </>
  );
}
