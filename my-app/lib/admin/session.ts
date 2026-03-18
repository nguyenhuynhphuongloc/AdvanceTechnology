import { ADMIN_SESSION_COOKIE } from "./constants";

export function getAdminSessionToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${ADMIN_SESSION_COOKIE}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

export function setAdminSessionToken(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=28800; Path=/; SameSite=Lax`;
}

export function clearAdminSessionToken() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ADMIN_SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
