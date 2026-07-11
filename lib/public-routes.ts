const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/si-perdoret-ne-klinike",
  "/clinic-use",
  "/per-fizioterapeutin",
  "/per-pacientin",
  "/cmimi",
  "/support",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/medical-disclaimer",
  "/data-deletion",
  "/camera-consent",
  "/patient-handout",
]);

export function isPublicSitePath(pathname: string) {
  return PUBLIC_EXACT_PATHS.has(pathname) || pathname.startsWith("/blog");
}
