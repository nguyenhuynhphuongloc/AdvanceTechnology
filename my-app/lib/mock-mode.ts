export function isMockFrontendEnabled() {
  return process.env.NEXT_PUBLIC_MOCK_FRONTEND === "true";
}
