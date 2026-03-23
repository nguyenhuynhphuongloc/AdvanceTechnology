'use client';

import { useAuth } from '@/lib/shopping/auth-context';
import Link from 'next/link';

export default function AccountButton() {
  const { user } = useAuth();

  return (
    <Link
      href="/product/account"
      className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-white/35 lg:inline-flex"
      aria-label="Tài khoản"
      title={user ? user.name : 'Đăng nhập'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>

      {user && (
        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-[#0b0b0b] bg-green-500" />
      )}
    </Link>
  );
}
