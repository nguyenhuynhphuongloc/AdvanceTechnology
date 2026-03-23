import { StorefrontLoadingPage } from "../../../components/storefront/StorefrontLoadingPage";

export default function LoadingProductDetailPage() {
  return (
    <StorefrontLoadingPage
      title="Loading product details"
      description="Fetching the selected product and its related catalog entries from the live backend."
    />
  );
}
