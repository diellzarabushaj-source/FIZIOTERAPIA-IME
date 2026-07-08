import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const appDir = join(process.cwd(), "app");

const requiredPublicRoutes = [
  "/",
  "/faq",
  "/support",
  "/clinic-use",
  "/launch-checklist",
  "/qa-checklist",
  "/pilot-onboarding",
  "/pilot-launch",
  "/pilot-readiness",
  "/pilot-runbook",
  "/pilot-communications",
  "/mobile-submission",
  "/final-handoff",
  "/patient-handout",
  "/pilot-feedback",
  "/patient-portal",
  "/privacy",
  "/terms",
  "/medical-disclaimer",
  "/camera-consent",
  "/data-deletion",
];

const requiredProtectedRoutes = [
  "/physiotherapist-portal",
  "/patient-dashboard",
  "/ai-check",
  "/admin-hidden",
  "/admin-dashboard",
  "/admin-billing",
  "/admin-feedback",
  "/pilot-decision",
];

const requiredApiRoutes = [
  ["/api/mobile/patient-session", join(appDir, "api", "mobile", "patient-session", "route.ts")],
  ["/api/mobile/save-progress", join(appDir, "api", "mobile", "save-progress", "route.ts")],
];

const dynamicRoutes = new Set([
  "/reports/demo",
]);

function routeToPageFile(route) {
  if (route === "/") return join(appDir, "page.tsx");
  const segments = route.split("/").filter(Boolean);
  return join(appDir, ...segments, "page.tsx");
}

function routeExists(route) {
  if (dynamicRoutes.has(route)) return true;
  return existsSync(routeToPageFile(route));
}

function extractFooterHrefs() {
  const footerPath = join(process.cwd(), "components", "SiteFooter.tsx");
  if (!existsSync(footerPath)) return [];
  const source = readFileSync(footerPath, "utf8");
  const matches = [...source.matchAll(/\["[^"]+",\s*"(\/[^"]*)"\]/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

const checks = [
  ...requiredPublicRoutes.map((route) => ({ route, group: "public", exists: routeExists(route), file: dynamicRoutes.has(route) ? "dynamic route accepted" : routeToPageFile(route) })),
  ...requiredProtectedRoutes.map((route) => ({ route, group: "protected", exists: routeExists(route), file: routeToPageFile(route) })),
  ...extractFooterHrefs().map((route) => ({ route, group: "footer", exists: routeExists(route), file: dynamicRoutes.has(route) ? "dynamic route accepted" : routeToPageFile(route) })),
  ...requiredApiRoutes.map(([route, file]) => ({ route, group: "api", exists: existsSync(file), file })),
];

const seen = new Set();
const results = checks.filter((check) => {
  const key = `${check.group}:${check.route}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.table(results.map(({ group, route, exists }) => ({ group, route, exists })));

const missing = results.filter((result) => !result.exists);
if (missing.length) {
  console.error("\nMissing route file(s):");
  for (const item of missing) {
    console.error(`- ${item.group}: ${item.route} -> ${item.file}`);
  }
  process.exit(1);
}

console.log(`\nRoute preflight passed for ${results.length} route checks.`);
