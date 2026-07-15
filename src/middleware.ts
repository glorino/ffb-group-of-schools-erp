import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/error", "/portal/apply"];
  const isPublic = publicRoutes.some((route) => pathname === route);
  const isApiOrStatic = pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/favicon");

  if (isPublic || isApiOrStatic) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                       request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
