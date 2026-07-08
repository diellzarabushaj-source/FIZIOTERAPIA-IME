import { NextResponse, type NextProxy } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtectedRoute = createRouteMatcher([
  "/physio(.*)",
  "/owner-hidden(.*)",
  "/physiotherapist-portal(.*)",
  "/physiotherapist-dashboard(.*)",
  "/admin-hidden(.*)",
  "/admin-dashboard(.*)",
]);

const protectedProxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
