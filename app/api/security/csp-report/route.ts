import { NextResponse } from "next/server";
import { logServerEvent } from "@/lib/backend/safe-logger";

const MAX_REPORT_BYTES = 16_384;

function safeDirective(value: unknown) {
  const text = String(value || "").trim();
  return text.slice(0, 120);
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > MAX_REPORT_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const report =
    typeof payload === "object" && payload !== null && "csp-report" in payload
      ? (payload as { "csp-report"?: Record<string, unknown> })["csp-report"]
      : typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : null;

  if (!report) return NextResponse.json({ ok: false, error: "invalid_report" }, { status: 400 });

  logServerEvent("warn", "csp_violation", {
    violatedDirective: safeDirective(report["violated-directive"] ?? report.effectiveDirective),
    blockedType: safeDirective(report["blocked-uri"] ? "external_or_inline" : "unknown"),
    disposition: safeDirective(report.disposition),
  });

  return new NextResponse(null, { status: 204 });
}
