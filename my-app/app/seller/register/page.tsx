'use client';

import AccountPageClient from "@/components/shopping/AccountPageClient";

export default function SellerRegisterPage() {
  return (
    <AccountPageClient 
      initialMode="register" 
      defaultRole="seller" 
      redirectTo="/seller/profile" 
    />
  );
}
