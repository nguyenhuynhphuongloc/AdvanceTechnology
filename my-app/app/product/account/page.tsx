import AccountPageClient from "@/components/shopping/AccountPageClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const initialMode = rawMode === "register" ? "register" : "login";

  return <AccountPageClient initialMode={initialMode} />;
}
