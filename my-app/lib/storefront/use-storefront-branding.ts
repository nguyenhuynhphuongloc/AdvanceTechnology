"use client";

import { useEffect, useState } from "react";
import { storefrontBranding, type StorefrontBranding } from "./config";
import { fetchStorefrontBranding } from "./api";

export function useStorefrontBranding() {
  const [branding, setBranding] = useState<StorefrontBranding>(storefrontBranding);

  useEffect(() => {
    let cancelled = false;

    fetchStorefrontBranding().then((nextBranding) => {
      if (!cancelled) {
        setBranding(nextBranding);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return branding;
}
