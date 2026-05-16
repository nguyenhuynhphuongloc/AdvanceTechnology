import { storefrontBranding, deriveLogoText, type StorefrontBranding } from "./config";

type StoreSettingsResponse = {
  storeName: string;
  logoImageUrl?: string | null;
  logoPublicId?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
};

function getStoreApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_GATEWAY_URL || "http://localhost:3000";
}

function normalizeBranding(settings?: StoreSettingsResponse | null): StorefrontBranding {
  if (!settings) {
    return storefrontBranding;
  }

  const brandName = settings.storeName?.trim() || storefrontBranding.brandName;
  return {
    ...storefrontBranding,
    brandName,
    logoText: deriveLogoText(brandName),
    logoImageUrl: settings.logoImageUrl ?? null,
    logoPublicId: settings.logoPublicId ?? null,
    description: settings.description ?? null,
    contactEmail: settings.contactEmail?.trim() || storefrontBranding.contactEmail,
    contactPhone: settings.contactPhone?.trim() || storefrontBranding.contactPhone,
    address: settings.address?.trim() || storefrontBranding.address,
  };
}

export async function fetchStorefrontBranding(): Promise<StorefrontBranding> {
  try {
    const response = await fetch(new URL("/api/v1/store-settings", getStoreApiBaseUrl()), {
      cache: "no-store",
    });

    if (!response.ok) {
      return storefrontBranding;
    }

    const payload = (await response.json()) as StoreSettingsResponse;
    return normalizeBranding(payload);
  } catch {
    return storefrontBranding;
  }
}

export function mergeStorefrontBranding(settings?: StoreSettingsResponse | null) {
  return normalizeBranding(settings);
}
