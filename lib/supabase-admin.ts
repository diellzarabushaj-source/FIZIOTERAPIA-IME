import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function normalizePatientCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function createPatientCode(firstName: string) {
  const prefix = firstName
    .trim()
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "P") || "PAT";
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${number}`;
}

export async function createUniquePatientCode(supabase: SupabaseClient, firstName: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = createPatientCode(firstName);
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("patient_code", code)
      .maybeSingle();

    if (!existing) return code;
  }

  throw new Error("Nuk u gjenerua kod unik për pacientin. Provo përsëri.");
}

export function createPatientUsername(firstName: string, lastName: string, code: string) {
  const slug = `${firstName}-${lastName || "patient"}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "patient";

  return `${slug}-${code.split("-").pop()}`;
}

export function getPatientAccessPath(code: string) {
  return `/p/${encodeURIComponent(normalizePatientCode(code))}`;
}

export function getPatientAccessUrl(code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://fizioterapia-ime.vercel.app";
  const normalizedBase = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  return `${normalizedBase.replace(/\/$/, "")}${getPatientAccessPath(code)}`;
}
