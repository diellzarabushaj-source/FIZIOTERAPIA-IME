import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const layout = read("app/layout.tsx");
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
const manifest = read("app/manifest.ts");
const nextConfig = read("next.config.mjs");
const siteConfig = read("lib/seo/site.ts");

assert.match(layout, /metadataBase:/, "Root metadata must define metadataBase");
assert.doesNotMatch(layout, /alternates:\s*\{\s*canonical:\s*["']\/["']/, "Root layout must not force every page to canonical /");
assert.match(layout, /max-image-preview/, "Googlebot image preview policy must be explicit");
assert.match(layout, /manifest:\s*["']\/manifest\.webmanifest["']/, "Manifest must be linked from root metadata");
assert.match(robots, /PRIVATE_ROUTE_PREFIXES/, "robots.txt must share the private-route source of truth");
assert.match(robots, /\/api\//, "API routes must be excluded from crawling");
assert.match(sitemap, /PUBLIC_ROUTES/, "Sitemap must use the public-route allowlist");
assert.match(sitemap, /x-default/, "Sitemap must include x-default alternate URLs");
assert.match(manifest, /display:\s*["']standalone["']/, "Web manifest must support standalone display");
assert.match(nextConfig, /X-Robots-Tag/, "Private pages must receive an X-Robots-Tag header");
assert.match(nextConfig, /noindex, nofollow, noarchive, nosnippet/, "Private page robots policy must be fail-closed");
assert.match(siteConfig, /https:\/\/fizioterapia-ime\.vercel\.app/, "A stable production URL fallback is required until a custom domain exists");

console.log("Technical SEO contract checks passed.");
