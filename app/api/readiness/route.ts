import { NextResponse } from "next/server";
import { checkDatabaseReadiness } from "@/lib/backend/schema-readiness";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const monitorSecret = request.headers.get("x-monitor-secret");
  const canSeeDetails = Boolean(
    process.env.HEALTH_MONITOR_SECRET &&
      monitorSecret &&
      monitorSecret === process.env.HEALTH_MONITOR_SECRET,
  );

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        status: "not_ready",
        timestamp: new Date().toISOString(),
        reason: "database_environment_missing",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  const readiness = await checkDatabaseReadiness(supabase);
  const common = {
    status: readiness.ready ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    schemaVersion: readiness.schemaVersion,
    expectedSchemaVersion: readiness.expectedSchemaVersion,
  };

  const body = canSeeDetails
    ? {
        ...common,
        reason: readiness.reason,
        missingTables: readiness.missingTables,
        missingColumns: readiness.missingColumns,
        missingFunctions: readiness.missingFunctions,
        checkedAt: readiness.checkedAt,
        deploymentVersion: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
        environment: process.env.APP_ENV || process.env.VERCEL_ENV || "unknown",
      }
    : common;

  return NextResponse.json(body, {
    status: readiness.ready ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
