import { NextResponse } from "next/server";
import { patientSessionSigningConfigured } from "@/lib/backend-logic";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { hasValidMonitorSecret } from "@/src/server/monitoring/monitor-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const startedAt = Date.now();
const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  const requestStartedAt = Date.now();
  const canSeeDetails = hasValidMonitorSecret(request.headers.get("x-monitor-secret"));

  const checks = {
    supabaseEnvironment: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    database: false,
    clerk: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
    ),
    patientSession: patientSessionSigningConfigured(),
    email: Boolean(process.env.RESEND_API_KEY),
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    checks.database = !error;
  }

  const requiredChecks = ["supabaseEnvironment", "database", "clerk", "patientSession"] as const;
  const failedChecks = requiredChecks.filter((name) => !checks[name]);
  const healthy = failedChecks.length === 0;
  const common = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    failedChecks,
  };

  const body = canSeeDetails
    ? {
        ...common,
        environment: process.env.APP_ENV || process.env.VERCEL_ENV || "unknown",
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        responseTimeMs: Date.now() - requestStartedAt,
        checks,
      }
    : common;

  return NextResponse.json(body, {
    status: healthy ? 200 : 503,
    headers: noStoreHeaders,
  });
}
