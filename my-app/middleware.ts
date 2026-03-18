import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoginRoute = pathname === ADMIN_LOGIN_PATH;

  if (!sessionToken && !isLoginRoute) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  if (sessionToken && isLoginRoute) {
    return NextResponse.redirect(new URL(ADMIN_PRODUCTS_PATH, request.url));
  }

  if (sessionToken && pathname === "/admin") {
    return NextResponse.redirect(new URL(ADMIN_PRODUCTS_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
