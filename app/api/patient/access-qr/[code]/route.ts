import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getActorContext, actorCanAccessPhysioResource } from "@/lib/backend/access";
import { getPatientAccessUrl, getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

type RouteProps = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const actor = await getActorContext();
  if (!actor) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));
  if (!code) return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle<{ id: string; physio_id: string | null; status: string }>();

  if (!patient) return NextResponse.json({ ok: false, error: "patient_not_found" }, { status: 404 });
  if (!actorCanAccessPhysioResource(actor, patient.physio_id)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const svg = await QRCode.toString(getPatientAccessUrl(code), {
    type: "svg",
    margin: 1,
    width: 240,
    color: { dark: "#102033", light: "#FFFFFF" },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
