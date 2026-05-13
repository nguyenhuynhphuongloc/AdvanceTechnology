'use client';

import AccountPageClient from "@/components/shopping/AccountPageClient";

export default function SellerLoginPage() {
  return (
    <AccountPageClient 
      initialMode="login" 
      redirectTo="/seller/dashboard" 
    />
  );
}
