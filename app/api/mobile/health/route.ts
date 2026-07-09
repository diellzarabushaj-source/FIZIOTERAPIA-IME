import { NextResponse } from "next/server";

function envStatus(name: string) {
  return Boolean(process.env[name]);
}

export async function GET() {
  const checks = {
    supabaseUrl: envStatus("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseServiceRole: envStatus("SUPABASE_SERVICE_ROLE_KEY"),
    clerkPublishable: envStatus("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    clerkSecret: envStatus("CLERK_SECRET_KEY"),
    resendApi: envStatus("RESEND_API_KEY"),
    resendFrom: envStatus("RESEND_FROM_EMAIL"),
    resendReplyTo: envStatus("RESEND_REPLY_TO_EMAIL"),
  };

  const required = [
    checks.supabaseUrl,
    checks.supabaseServiceRole,
    checks.clerkPublishable,
    checks.clerkSecret,
  ];

  const ok = required.every(Boolean);

  return NextResponse.json({
    app: "Fizioterapia ime",
    service: "mobile-api",
    ok,
    status: ok ? "ready" : "missing-required-env",
    checks,
    timestamp: new Date().toISOString(),
    note: "This endpoint reports presence/missing status only. It never returns secret values.",
  }, { status: ok ? 200 : 503 });
}
