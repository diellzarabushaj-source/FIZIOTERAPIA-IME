import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE_URL = (process.env.MONITOR_BASE_URL || "https://fizioterapia-ime.vercel.app").replace(/\/$/, "");
const REPORT_PATH = process.env.MONITOR_REPORT_PATH || "reports/production-health.json";
const monitorSecret = process.env.HEALTH_MONITOR_SECRET || "";
const startedAt = Date.now();

const response = await fetch(`${BASE_URL}/api/health`, {
  headers: {
    "user-agent": "fizioterapia-ime-health-monitor/1.0",
    ...(monitorSecret ? { "x-monitor-secret": monitorSecret } : {}),
  },
  cache: "no-store",
}).catch((error) => ({
  ok: false,
  status: 0,
  headers: new Headers(),
  json: async () => ({ status: "unreachable", error: error instanceof Error ? error.message : String(error) }),
}));

const payload = await response.json().catch(() => ({ status: "invalid_json" }));
const cacheControl = response.headers.get("cache-control") || "";
const robots = response.headers.get("x-robots-tag") || "";
const checks = {
  reachable: response.status > 0,
  healthyStatusCode: response.status === 200,
  healthPayload: payload?.status === "ok",
  noStore: cacheControl.includes("no-store"),
  noIndex: robots.includes("noindex"),
};

const failures = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
const report = {
  app: "Fizioterapia ime",
  baseUrl: BASE_URL,
  endpoint: `${BASE_URL}/api/health`,
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  httpStatus: response.status,
  status: failures.length ? "failed" : "passed",
  failures,
  checks,
  payload,
};

const absolute = resolve(REPORT_PATH);
mkdirSync(dirname(absolute), { recursive: true });
writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) process.exit(1);
