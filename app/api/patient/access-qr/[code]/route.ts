import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPatientAccessUrl, normalizePatientCode } from "@/lib/supabase-admin";

type RouteProps = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const accessUrl = getPatientAccessUrl(code);
  const svg = await QRCode.toString(accessUrl, {
    type: "svg",
    margin: 1,
    width: 240,
    color: {
      dark: "#102033",
      light: "#FFFFFF",
    },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
