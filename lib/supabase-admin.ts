import { createClient } from "@supabase/supabase-js";

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

export function createPatientCode(firstName: string) {
  const prefix = firstName
    .trim()
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "P") || "PAT";
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
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
