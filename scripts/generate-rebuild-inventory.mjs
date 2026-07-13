import { readdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = process.cwd();
const outputPath = resolve(root, "docs/rebuild/repository-inventory.generated.md");
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const textExtensions = new Set([
  ".css", ".js", ".jsx", ".json", ".md", ".mjs", ".sql", ".ts", ".tsx", ".yaml", ".yml",
]);

function repositoryPath(absolutePath) {
  return relative(root, absolutePath).split(sep).join("/");
}

function extension(path) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index).toLowerCase() : "";
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(absolutePath));
    if (entry.isFile()) paths.push(absolutePath);
  }

  return paths;
}

function routeFromPage(path) {
  const withoutPrefix = path.replace(/^app\//, "").replace(/\/(?:page|route)\.(?:[cm]?[jt]sx?)$/, "");
  const segments = withoutPrefix
    .split("/")
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

function markdownList(values) {
  if (values.length === 0) return "- None found.";
  return values.map((value) => `- \`${value}\``).join("\n");
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  if (rows.length === 0) return `${header}\n${separator}\n| ${headers.map((_, index) => index === 0 ? "None found" : "").join(" | ")} |`;
  return [header, separator, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

const absoluteFiles = await walk(root);
const files = absoluteFiles.map(repositoryPath).sort();
const sourceByPath = new Map();

for (const absolutePath of absoluteFiles) {
  const path = repositoryPath(absolutePath);
  if (!textExtensions.has(extension(path))) continue;
  try {
    sourceByPath.set(path, await readFile(absolutePath, "utf8"));
  } catch {
    // Binary or unreadable files are intentionally omitted from content inventory.
  }
}

const appFiles = files.filter((path) => path.startsWith("app/"));
const routeEntries = appFiles
  .filter((path) => /\/(page|route)\.(?:[cm]?[jt]sx?)$/.test(path))
  .map((path) => [routeFromPage(path), path.endsWith("/route.ts") || path.endsWith("/route.js") ? "route handler" : "page", path])
  .sort((left, right) => left[0].localeCompare(right[0]) || left[2].localeCompare(right[2]));

const appBoundaries = appFiles
  .filter((path) => /\/(layout|loading|error|global-error|not-found|template)\.(?:[cm]?[jt]sx?)$/.test(path))
  .sort();

const serverActionFiles = [...sourceByPath.entries()]
  .filter(([, source]) => /^\s*["']use server["'];/m.test(source))
  .map(([path]) => path)
  .sort();

const environmentVariables = new Map();
for (const [path, source] of sourceByPath) {
  const names = new Set();
  for (const match of source.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) names.add(match[1]);
  for (const match of source.matchAll(/process\.env\[["']([A-Z][A-Z0-9_]*)["']\]/g)) names.add(match[1]);
  for (const name of names) {
    if (!environmentVariables.has(name)) environmentVariables.set(name, []);
    environmentVariables.get(name).push(path);
  }
}

const migrationFiles = files.filter((path) => path.startsWith("supabase/migrations/") && path.endsWith(".sql"));
const databaseObjects = [];
for (const path of migrationFiles) {
  const source = sourceByPath.get(path) ?? "";
  const patterns = [
    ["table", /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_."]+)/gi],
    ["function", /create\s+(?:or\s+replace\s+)?function\s+([a-zA-Z0-9_."]+)/gi],
    ["index", /create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_."]+)/gi],
    ["policy", /create\s+policy\s+"?([^"\n]+?)"?\s+on\s+([a-zA-Z0-9_."]+)/gi],
  ];
  for (const [kind, pattern] of patterns) {
    for (const match of source.matchAll(pattern)) {
      databaseObjects.push([kind, match.slice(1).filter(Boolean).join(" on ").replaceAll("|", "\\|"), path]);
    }
  }
}

databaseObjects.sort((left, right) => left[0].localeCompare(right[0]) || left[1].localeCompare(right[1]) || left[2].localeCompare(right[2]));

const workflowFiles = files.filter((path) => path.startsWith(".github/workflows/") && /\.ya?ml$/.test(path));
const packageJson = JSON.parse(sourceByPath.get("package.json") ?? "{}");
const dependencies = Object.entries({ ...packageJson.dependencies, ...packageJson.devDependencies })
  .sort(([left], [right]) => left.localeCompare(right));

const integrationMarkers = {
  Clerk: ["@clerk/", "clerkMiddleware", "currentUser("],
  Supabase: ["@supabase/", "getSupabaseAdmin", ".from("],
  Sanity: ["next-sanity", "@sanity/", "sanityClient", "PortableText"],
  Resend: ["resend", "RESEND_API_KEY"],
  MediaPipe: ["@mediapipe/", "PoseLandmarker"],
  Sentry: ["@sentry/", "SENTRY_"],
  PostHog: ["posthog", "PostHog"],
  Vercel: ["VERCEL_", "@vercel/"],
  Expo: ["expo", "react-native"],
};
const integrationFiles = Object.entries(integrationMarkers).map(([integration, markers]) => {
  const matchingFiles = [...sourceByPath.entries()]
    .filter(([, source]) => markers.some((marker) => source.includes(marker)))
    .map(([path]) => path)
    .sort();
  return [integration, matchingFiles];
});

const roleAndPermissionFiles = [...sourceByPath.entries()]
  .filter(([, source]) => /\b(owner|admin|physio|patient)\b/.test(source) && /(role|permission|ownership|authorize|forbidden|suspended)/i.test(source))
  .map(([path]) => path)
  .sort();

const emailFiles = [...sourceByPath.entries()]
  .filter(([, source]) => /\b(Resend|RESEND_API_KEY|sendEmail|send_email|email template)\b/i.test(source))
  .map(([path]) => path)
  .sort();

const clinicalRuleFiles = [...sourceByPath.entries()]
  .filter(([, source]) => /(7\s*\/\s*10|pain.{0,30}7|dhimbj.{0,30}7|diagnos|fizioterapist|physiotherapist)/i.test(source))
  .map(([path]) => path)
  .sort();

const lines = [
  "# Repository inventory — generated",
  "",
  "> Generated deterministically by `node scripts/generate-rebuild-inventory.mjs`. Do not edit manually.",
  "",
  "## Summary",
  "",
  `- Repository files scanned: **${files.length}**`,
  `- App Router pages and route handlers: **${routeEntries.length}**`,
  `- App Router boundaries: **${appBoundaries.length}**`,
  `- Server-action files: **${serverActionFiles.length}**`,
  `- Supabase migrations: **${migrationFiles.length}**`,
  `- Environment variables referenced: **${environmentVariables.size}**`,
  `- GitHub Actions workflows: **${workflowFiles.length}**`,
  "",
  "## App Router pages and route handlers",
  "",
  markdownTable(["Route", "Kind", "File"], routeEntries.map(([route, kind, path]) => [`\`${route}\``, kind, `\`${path}\``])),
  "",
  "## App Router layouts and boundaries",
  "",
  markdownList(appBoundaries),
  "",
  "## Server actions",
  "",
  markdownList(serverActionFiles),
  "",
  "## Environment contract usage",
  "",
  markdownTable(
    ["Variable", "Referenced by"],
    [...environmentVariables.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, paths]) => [`\`${name}\``, paths.map((path) => `\`${path}\``).join("<br>")]),
  ),
  "",
  "## Database migrations",
  "",
  markdownList(migrationFiles),
  "",
  "## Database objects declared by migrations",
  "",
  markdownTable(["Kind", "Object", "Migration"], databaseObjects.map(([kind, object, path]) => [kind, `\`${object}\``, `\`${path}\``])),
  "",
  "## Dependencies",
  "",
  markdownTable(["Package", "Pinned version"], dependencies.map(([name, version]) => [`\`${name}\``, `\`${version}\``])),
  "",
  "## Integration touchpoints",
  "",
  ...integrationFiles.flatMap(([integration, paths]) => [
    `### ${integration}`,
    "",
    markdownList(paths),
    "",
  ]),
  "## Role and permission touchpoints",
  "",
  markdownList(roleAndPermissionFiles),
  "",
  "## Email notification touchpoints",
  "",
  markdownList(emailFiles),
  "",
  "## Clinical-rule and disclaimer touchpoints",
  "",
  markdownList(clinicalRuleFiles),
  "",
  "## GitHub Actions workflows",
  "",
  markdownList(workflowFiles),
  "",
];

const generated = `${lines.join("\n")}\n`;
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = await readFile(outputPath, "utf8");
  } catch {
    console.error("Repository inventory is missing. Run npm run audit:inventory and commit the generated file.");
    process.exit(1);
  }
  if (current !== generated) {
    console.error("Repository inventory is stale. Run npm run audit:inventory and commit the generated file.");
    process.exit(1);
  }
  console.log("Repository inventory is current.");
} else {
  await writeFile(outputPath, generated, "utf8");
  console.log(`Repository inventory written to ${repositoryPath(outputPath)}.`);
}
