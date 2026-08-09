import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/services/token-storage";

const PUBLIC_PATHS = ["/", "/about", "/contact", "/services", "/news", "/emergency"];
const AUTH_PATHS = ["/login", "/register", "/auth/forgot-password", "/auth/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProtected = [
    "/citizen",
    "/department",
    "/admin",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Skip for anything not protected or auth-related, and static assets/API.
  if (!isProtected && !isAuthPage && !isPublic) {
    return NextResponse.next();
  }

  // Protected routes with no token → login.
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};