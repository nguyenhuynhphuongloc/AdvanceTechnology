'use client';

const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_GATEWAY_URL ||
      'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_GATEWAY_URL ||
      'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────────

export interface SellerUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  fullName?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SellerUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('seller_token');
}

export function getUser(): SellerUser | null {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('seller_user');
  return u ? (JSON.parse(u) as SellerUser) : null;
}

// ─── API Functions ────────────────────────────────────────────────────────────────

export async function loginSeller(
  email: string,
  password: string,
): Promise<{ token: string; user: SellerUser }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = 'Login failed';
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  return { token: data.accessToken, user: data.user };
}

export async function registerSeller(
  payload: RegisterPayload,
): Promise<{ token: string; user: SellerUser }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName || '',
      role: payload.role || 'seller',
    }),
  });

  if (!response.ok) {
    let message = 'Registration failed';
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  return { token: data.accessToken, user: data.user };
}

export async function getSellerSession(
  token: string,
): Promise<SellerUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Session expired or invalid');
  }

  return (await response.json()) as SellerUser;
}

export function saveSellerSession(token: string, user: SellerUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('seller_token', token);
  localStorage.setItem('seller_user', JSON.stringify(user));
}

export function clearSellerSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('seller_token');
  localStorage.removeItem('seller_user');
}

export function isSellerLoggedIn(): boolean {
  return getToken() !== null && getUser() !== null;
}

export function isSellerRole(user: SellerUser | null): boolean {
  return user?.role === 'seller' || user?.role === 'admin';
}
