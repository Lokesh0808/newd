import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Proxy (Next.js 16's replacement for middleware).
 *
 * Only protected *page* routes are guarded here — API routes perform their own
 * authorisation checks so they can return JSON 401s instead of redirects.
 */
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/resume", "/interview", "/settings"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (needsAuth && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Signed-in users should not see the login/signup screens again.
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/resume/:path*", "/interview/:path*", "/settings/:path*", "/login", "/signup"],
};
