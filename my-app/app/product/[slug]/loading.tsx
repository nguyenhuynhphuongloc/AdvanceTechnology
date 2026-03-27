import { StorefrontLoadingPage } from "@/components/storefront/StorefrontLoadingPage";

export default function ProductDetailLoading() {
  return (
    <StorefrontLoadingPage
      title="Loading product details"
      description="Fetching the selected product and its related catalog entries from the live backend."
    />
  );
}
