import { redirect } from "next/navigation";
import { buildProductDetailHref } from "../../../lib/products/routes";

type PageParams = Promise<{ slug: string }>;

export default async function LegacyProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  redirect(buildProductDetailHref(slug));
}
