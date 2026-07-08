import { NextResponse, type NextProxy } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const protectedRoutePrefixes = [
  "/physio",
  "/owner-hidden",
  "/physiotherapist-portal",
  "/physiotherapist-dashboard",
  "/admin-hidden",
  "/admin-dashboard",
];

function isProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const protectedProxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedPath(req.nextUrl.pathname)) {
    await auth.protect();
  }
});

export const proxy: NextProxy = (request, event) => {
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  return protectedProxy(request, event);
};

export const config = {
  matcher: [
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
