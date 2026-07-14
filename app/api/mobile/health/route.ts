import { NextResponse } from "next/server";
import { patientSessionSigningConfigured } from "@/lib/backend-logic";
import { patientSessionRegistryEnabled } from "@/lib/backend/patient-sessions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { hasValidMonitorSecret } from "@/src/server/monitoring/monitor-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  const canSeeDetails = hasValidMonitorSecret(request.headers.get("x-monitor-secret"));
  const environment = process.env.APP_ENV || process.env.VERCEL_ENV || "unknown";
  const productionLike = environment === "production";
  const registryEnabled = patientSessionRegistryEnabled();
  const supabase = getSupabaseAdmin();

  const checks = {
    databaseEnvironment: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    database: false,
    patientSessionSigning: patientSessionSigningConfigured(),
    patientSessionRegistry: productionLike ? registryEnabled : true,
  };

  if (supabase) {
    const { error } = await supabase
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    checks.database = !error;
  }

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const ready = failedChecks.length === 0;
  const common = {
    service: "mobile-api",
    status: ready ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    failedChecks,
  };

  const body = canSeeDetails
    ? {
        ...common,
        environment,
        deploymentVersion: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
        checks,
        registryMode: registryEnabled ? "revocable" : "signed_fallback",
      }
    : common;

  return NextResponse.json(body, {
    status: ready ? 200 : 503,
    headers: noStoreHeaders,
  });
}
