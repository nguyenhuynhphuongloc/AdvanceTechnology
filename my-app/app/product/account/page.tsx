import AccountPageClient from "@/components/shopping/AccountPageClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const rawRedirectTo = Array.isArray(params.redirectTo) ? params.redirectTo[0] : params.redirectTo;
  const initialMode = rawMode === "register" ? "register" : "login";
  const redirectTo =
    typeof rawRedirectTo === "string" && rawRedirectTo.startsWith("/")
      ? rawRedirectTo
      : undefined;

  return <AccountPageClient initialMode={initialMode} redirectTo={redirectTo} />;
}
