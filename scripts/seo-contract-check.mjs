import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const failures = [];

function requireText(file, text, message) {
  const content = read(file);
  if (!content.includes(text)) failures.push(`${file}: ${message}`);
}

function forbidText(file, text, message) {
  const content = read(file);
  if (content.includes(text)) failures.push(`${file}: ${message}`);
}

requireText("app/robots.ts", "PRIVATE_ROUTE_PREFIXES", "robots must share the private-route source of truth");
requireText("app/robots.ts", "sitemap:", "robots must advertise the sitemap");
requireText("app/sitemap.ts", "getBlogPosts", "sitemap must include Sanity/fallback blog posts");
requireText("app/sitemap.ts", "lastModified: post.date", "blog URLs must use content dates");
requireText("app/layout.tsx", "title: {", "root metadata must use a title template");
requireText("app/layout.tsx", "manifest: \"/manifest.webmanifest\"", "root metadata must expose the web manifest");
forbidText("app/layout.tsx", "alternates: { canonical: \"/\" }", "root layout must not force homepage canonical on every route");
requireText("next.config.mjs", "X-Robots-Tag", "private routes must emit noindex headers");
requireText("next.config.mjs", "noindex, nofollow, noarchive, nosnippet", "private routes need strict crawler protection");
requireText("app/manifest.ts", "start_url: \"/\"", "manifest must define a stable start URL");

const siteConfig = read("lib/seo/site.ts");
for (const route of ["/admin", "/physiotherapist-portal", "/patient-dashboard", "/api/"]) {
  if (!siteConfig.includes(`\"${route}`)) failures.push(`lib/seo/site.ts: missing private route prefix ${route}`);
}

if (failures.length) {
  console.error("Technical SEO contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Technical SEO contract passed.");
