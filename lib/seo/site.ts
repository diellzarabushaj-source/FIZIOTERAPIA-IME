export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "Fizioterapia Ime";
export const DEFAULT_TITLE = "Fizioterapia Ime – Platformë digjitale për fizioterapi";
export const DEFAULT_DESCRIPTION =
  "Platformë digjitale për plane fizioterapie, udhëzime të qarta për pacientë dhe mjete profesionale për fizioterapeutë.";

export const PUBLIC_INDEXABLE_ROUTES = [
  "/",
  "/blog",
  "/faq",
  "/support",
  "/clinic-use",
  "/patient-handout",
  "/per-pacientin",
  "/per-fizioterapeutin",
  "/si-perdoret-ne-klinike",
  "/cmimi",
  "/contact",
  "/privacy",
  "/terms",
  "/medical-disclaimer",
  "/camera-consent",
  "/data-deletion",
] as const;

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/owner-hidden",
  "/physiotherapist-dashboard",
  "/physiotherapist-portal",
  "/patient-dashboard",
  "/patient-portal",
  "/patient-progress",
  "/patient-session",
  "/patient-contact",
  "/patient-access",
  "/p/",
  "/sign-in",
  "/sign-up",
  "/api/",
  "/app-preview",
  "/launch-checklist",
  "/pilot-",
  "/final-handoff",
  "/mobile-submission",
  "/qa-checklist",
  "/product-flow",
  "/clinical-recommendations",
  "/ai-check",
] as const;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
