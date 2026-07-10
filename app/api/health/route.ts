import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const startedAt = Date.now();

function hasRequiredEnvironment() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY &&
      process.env.PATIENT_SESSION_SECRET,
  );
}

export async function GET(request: Request) {
  const requestStartedAt = Date.now();
  const monitorSecret = request.headers.get("x-monitor-secret");
  const canSeeDetails = Boolean(
    process.env.HEALTH_MONITOR_SECRET &&
      monitorSecret &&
      monitorSecret === process.env.HEALTH_MONITOR_SECRET,
  );

  const environmentReady = hasRequiredEnvironment();
  const supabase = getSupabaseAdmin();
  let databaseReady = false;

  if (supabase) {
    const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    databaseReady = !error;
  }

  const healthy = environmentReady && databaseReady;
  const body = canSeeDetails
    ? {
        status: healthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        environment: process.env.APP_ENV || process.env.VERCEL_ENV || "unknown",
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        responseTimeMs: Date.now() - requestStartedAt,
        checks: {
          environment: environmentReady,
          database: databaseReady,
          clerk: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
          patientSession: Boolean(process.env.PATIENT_SESSION_SECRET),
          email: Boolean(process.env.RESEND_API_KEY),
        },
      }
    : {
        status: healthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
      };

  return NextResponse.json(body, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
