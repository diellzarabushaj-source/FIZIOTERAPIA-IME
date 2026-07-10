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
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
];

const adminRoutePrefixes = [
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
];

function matchesPath(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const protectedProxy = clerkMiddleware(async (auth, req) => {
  if (!matchesPath(req.nextUrl.pathname, protectedRoutePrefixes)) {
    return NextResponse.next();
  }

  const { userId } = await auth();
  if (userId) return NextResponse.next();

  const signInUrl = req.nextUrl.clone();
  signInUrl.pathname = "/sign-in";
  signInUrl.search = "";
  signInUrl.searchParams.set("redirect_url", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
});

export const proxy: NextProxy = (request, event) => {
  const { pathname } = request.nextUrl;

  if (!isClerkConfigured) {
    if (matchesPath(pathname, adminRoutePrefixes)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-hidden";
      url.searchParams.set("reason", "auth-not-configured");
      return NextResponse.redirect(url);
    }

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
