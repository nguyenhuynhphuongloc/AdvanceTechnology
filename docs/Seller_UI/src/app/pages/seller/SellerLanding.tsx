import { Navigate } from 'react-router';

export function SellerLanding() {
  // Check if user is logged in (mock check)
  const isLoggedIn = false; // In real app, check session/token

  if (isLoggedIn) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <Navigate to="/seller/login" replace />;
}
