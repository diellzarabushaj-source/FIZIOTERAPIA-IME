import { NextResponse, type NextProxy } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

// Patient code routes are intentionally public at the Clerk layer. Their own
// server-side patient session validation controls access to clinical data.
const protectedRoutePrefixes = [
  "/physio",
  "/physiotherapist-portal",
  "/physiotherapist-dashboard",
  "/owner-hidden",
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
  "/pilot-launch",
  "/pilot-readiness",
  "/pilot-runbook",
  "/pilot-communications",
  "/pilot-onboarding",
  "/launch-checklist",
  "/qa-checklist",
  "/mobile-submission",
  "/final-handoff",
];

const adminRoutePrefixes = [
  "/owner-hidden",
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
  "/pilot-launch",
  "/pilot-readiness",
  "/pilot-runbook",
  "/pilot-communications",
  "/pilot-onboarding",
  "/launch-checklist",
  "/qa-checklist",
  "/mobile-submission",
  "/final-handoff",
];

function matchesPath(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectNewPlanCreation(request: Parameters<NextProxy>[0]) {
  if (
    request.nextUrl.pathname !== "/physiotherapist-portal/plan-builder" ||
    request.nextUrl.searchParams.has("planId")
  ) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/physiotherapist-portal/plan-builder/new";
  return NextResponse.redirect(url);
}

const protectedProxy = clerkMiddleware(async (auth, req) => {
  if (!matchesPath(req.nextUrl.pathname, protectedRoutePrefixes)) return NextResponse.next();

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

  if (!isClerkConfigured && matchesPath(pathname, protectedRoutePrefixes)) {
    const url = request.nextUrl.clone();
    url.pathname = matchesPath(pathname, adminRoutePrefixes) ? "/admin-hidden" : "/sign-in";
    url.search = "";
    url.searchParams.set("reason", "auth-not-configured");
    return NextResponse.redirect(url);
  }

  const newPlanRedirect = redirectNewPlanCreation(request);
  if (newPlanRedirect) return newPlanRedirect;

  return protectedProxy(request, event);
};

export const config = {
  matcher: [
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
