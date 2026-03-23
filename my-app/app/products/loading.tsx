import { StorefrontLoadingPage } from "../../components/storefront/StorefrontLoadingPage";

export default function LoadingProductsPage() {
  return (
    <StorefrontLoadingPage
      title="Loading products"
      description="Fetching the live product catalog from the API gateway and preparing storefront filters."
    />
  );
}
