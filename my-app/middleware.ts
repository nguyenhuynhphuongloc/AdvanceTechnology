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

  // Tạm cho phép truy cập admin trực tiếp (dev mode).
  // Nếu muốn bảo mật, thêm logic session cookie sau.
  return NextResponse.next();
}


export const config = {
  matcher: ["/admin/:path*"],
};
