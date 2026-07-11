import { randomBytes } from "node:crypto";
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

/**
 * Generates a non-sequential 48-bit patient access code.
 * The legacy firstName argument remains optional so older server actions do not break.
 */
export function createPatientCode(_firstName?: string) {
  return `FI-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function createUniquePatientCode(supabase: SupabaseClient, _firstName?: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = createPatientCode();
    const { data: existing, error } = await supabase
      .from("patients")
      .select("id")
      .eq("patient_code", code)
      .maybeSingle();

    if (error) throw new Error("Kodi i pacientit nuk mund të verifikohet.");
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

function normalizeConfiguredBaseUrl(value: string, requireHttps: boolean) {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(candidate);

  if (parsed.username || parsed.password) {
    throw new Error("NEXT_PUBLIC_APP_URL nuk duhet të përmbajë kredenciale.");
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_APP_URL duhet të jetë vetëm origin-i i aplikacionit, pa path, query ose hash.");
  }

  const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (requireHttps && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL duhet të përdorë HTTPS jashtë development-it lokal.");
  }
  if (!requireHttps && parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost)) {
    throw new Error("App URL duhet të përdorë HTTPS ose HTTP vetëm në localhost.");
  }

  return parsed.origin;
}

export function resolvePatientAccessBaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const explicitAppUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  const vercelEnvironment = env.VERCEL_ENV?.trim().toLowerCase();
  const isLocalRuntime = env.NODE_ENV === "development" || env.NODE_ENV === "test";

  if (explicitAppUrl) {
    return normalizeConfiguredBaseUrl(explicitAppUrl, !isLocalRuntime);
  }

  if (vercelEnvironment === "preview" && env.VERCEL_URL?.trim()) {
    return normalizeConfiguredBaseUrl(env.VERCEL_URL, true);
  }

  if (isLocalRuntime && !vercelEnvironment) {
    return "http://localhost:3000";
  }

  throw new Error("NEXT_PUBLIC_APP_URL mungon. Gjenerimi i linkut të pacientit është bllokuar për të shmangur dërgimin në ambientin e gabuar.");
}

export function getPatientAccessUrl(code: string) {
  return `${resolvePatientAccessBaseUrl()}${getPatientAccessPath(code)}`;
}
