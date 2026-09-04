import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/about",
  "/events",
  "/news",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/forgot-password",
  "/portal/apply",
  "/portal/track",
  "/portal/entrance-exam",
  "/api/auth",
  "/api/seed-auto",
  "/api/seed-news",
  "/api/admissions",
  "/api/admissions/track",
  "/api/seed/demo-reports",
  "/api/payments/callback",
  "/api/auth/error",
  "/api/verify-transcript",
  "/api/public",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect NextAuth's /api/auth/error to our /auth/error page
  if (pathname === "/api/auth/error") {
    return NextResponse.redirect(new URL("/auth/error" + request.nextUrl.search, request.url));
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session token cookie (NextAuth v5 uses authjs.session-token)
  // Also check for old bloated JWT cookies and clear them
  const sessionToken = request.cookies.get("authjs.session-token")?.value
    || request.cookies.get("__Secure-authjs.session-token")?.value
    || request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value;

  // If cookie is oversized (>4KB), it's an old bloated JWT - clear it and redirect to login
  if (sessionToken && sessionToken.length > 4000) {
    console.warn("[MIDDLEWARE] Clearing oversized session cookie, length:", sessionToken.length);
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Session expired, please login again" }, { status: 401 });
    }
    return response;
  }

  if (!sessionToken) {
    // API routes get 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
