'use client';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'host.docker.internal'
    ? 'http://host.docker.internal:3000'
    : process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_GATEWAY_URL ||
      'http://localhost:3000';

export type MarketplaceUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

type AuthResponse = {
  accessToken: string;
  user: MarketplaceUser;
};

const TOKEN_COOKIE = 'token';
const USER_STORAGE_KEY = 'marketplace_user';
const TOKEN_STORAGE_KEY = 'marketplace_token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

async function authFetch(path: string, payload: Record<string, unknown>): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Authentication failed';
    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
    } catch {
      // Keep default message if response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<AuthResponse>;
}

function ensureCustomer(user: MarketplaceUser) {
  if (user.role !== 'customer') {
    throw new Error('This account is not a buyer account. Please use the seller or admin login.');
  }
}

export async function loginCustomer(email: string, password: string): Promise<AuthResponse> {
  const result = await authFetch('/api/v1/auth/login', { email, password });
  ensureCustomer(result.user);
  return result;
}

export async function registerCustomer(payload: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const result = await authFetch('/api/v1/auth/register', {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: 'customer',
  });
  ensureCustomer(result.user);
  return result;
}

export function saveMarketplaceSession(token: string, user: MarketplaceUser) {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearMarketplaceSession() {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getMarketplaceToken(): string | null {
  if (typeof document === 'undefined') return null;
  const token = document.cookie.split('; ').find((row) => row.startsWith(`${TOKEN_COOKIE}=`))?.split('=')[1];
  return token ? decodeURIComponent(token) : null;
}

export function getMarketplaceUser(): MarketplaceUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MarketplaceUser;
  } catch {
    return null;
  }
}

export function isMarketplaceLoggedIn() {
  return Boolean(getMarketplaceToken());
}
