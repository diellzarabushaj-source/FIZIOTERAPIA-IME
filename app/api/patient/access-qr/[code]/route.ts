import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPatientAccessUrl, getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

const allowedWorkspaceRoles = new Set(["physio", "owner", "admin"]);

type RouteProps = {
  params: Promise<{ code: string }>;
};

async function canGeneratePatientQr() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) return false;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return false;

  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", email)
    .maybeSingle<{ role: string | null }>();

  return Boolean(profile?.role && allowedWorkspaceRoles.has(profile.role));
}

export async function GET(_request: Request, { params }: RouteProps) {
  if (!(await canGeneratePatientQr())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

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
