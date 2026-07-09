import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = [
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
];

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function clerkIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname) && !clerkIsConfigured()) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-hidden";
    url.searchParams.set("reason", "auth-not-configured");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/admin-billing/:path*",
    "/admin-feedback/:path*",
    "/pilot-decision/:path*",
  ],
};
