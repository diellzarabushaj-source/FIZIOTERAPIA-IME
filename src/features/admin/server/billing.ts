import "server-only";

import type { ActorContext } from "@/lib/backend/access";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { hasActivePhysioAccess } from "@/lib/billing";
import { PAYMENT_PROOF_BUCKET } from "@/lib/manual-payment";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type BillingSubscription = {
  id: string;
  plan_name: string | null;
  price: number | string | null;
  currency: string | null;
  status: string | null;
  current_period_end: string | null;
  invoice_reference: string | null;
  created_at: string | null;
};

export type BillingPhysio = {
  id: string;
  email: string;
  full_name: string | null;
  clinic_name: string | null;
  role: string;
  status: string | null;
  subscriptions?: BillingSubscription[];
};

export type BillingPaymentRequest = {
  id: string;
  reference_code: string;
  amount: number | string;
  currency: string;
  duration_months: number;
  status: string;
  proof_path: string | null;
  proof_filename: string | null;
  submitted_at: string | null;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    clinic_name: string | null;
  } | null;
  proof_url: string | null;
};

export type AdminBillingData = {
  physios: BillingPhysio[];
  requests: BillingPaymentRequest[];
  pendingRequests: BillingPaymentRequest[];
  activeCount: number;
};

export function latestSubscription(physio: BillingPhysio) {
  return [...(physio.subscriptions || [])].sort(
    (left, right) => new Date(right.created_at || 0).getTime()
      - new Date(left.created_at || 0).getTime(),
  )[0] || null;
}

export async function getAdminBillingData(
  actor: ActorContext,
): Promise<BackendResult<AdminBillingData>> {
  if (actor.role !== "owner") {
    return fail("FORBIDDEN", "Billing-u mund të menaxhohet vetëm nga owner-i.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  }

  const [physiosResult, paymentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,clinic_name,role,status,subscriptions(id,plan_name,price,currency,status,current_period_end,invoice_reference,created_at)")
      .in("role", ["physio", "owner", "admin"])
      .order("created_at", { ascending: false })
      .returns<BillingPhysio[]>(),
    supabase
      .from("payment_requests")
      .select("id,reference_code,amount,currency,duration_months,status,proof_path,proof_filename,submitted_at,created_at,profiles!payment_requests_physio_id_fkey(id,email,full_name,clinic_name)")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<Omit<BillingPaymentRequest, "proof_url">[]>(),
  ]);

  if (physiosResult.error || paymentsResult.error) {
    return fail("DATABASE_ERROR", "Të dhënat e billing-ut nuk mund të lexohen.");
  }

  const physios = physiosResult.data || [];
  const rawRequests = paymentsResult.data || [];
  const proofPaths = [...new Set(
    rawRequests
      .map((request) => request.proof_path)
      .filter((path): path is string => Boolean(path)),
  )];

  const signedByPath = new Map<string, string>();
  if (proofPaths.length) {
    const { data: signedRows, error: signedError } = await supabase.storage
      .from(PAYMENT_PROOF_BUCKET)
      .createSignedUrls(proofPaths, 60 * 15);

    if (signedError) {
      return fail("STORAGE_ERROR", "Dëshmitë e pagesave nuk mund të hapen tani.");
    }

    for (const row of signedRows || []) {
      if (row.path && row.signedUrl) signedByPath.set(row.path, row.signedUrl);
    }
  }

  const requests: BillingPaymentRequest[] = rawRequests.map((request) => ({
    ...request,
    proof_url: request.proof_path
      ? signedByPath.get(request.proof_path) || null
      : null,
  }));
  const pendingRequests = requests.filter(
    (request) => request.status === "proof_uploaded",
  );
  const activeCount = physios.filter((physio) => hasActivePhysioAccess(
    physio.role,
    latestSubscription(physio),
  )).length;

  return ok({
    physios,
    requests,
    pendingRequests,
    activeCount,
  });
}
