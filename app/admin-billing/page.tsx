import { redirect } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getAdminEmail, getSignedInEmail } from "@/lib/admin-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getBillingStatusLabel, hasActivePhysioAccess, PHYSIO_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { PAYMENT_PROOF_BUCKET } from "@/lib/manual-payment";
import {
  activateSubscriptionAction,
  approvePaymentRequestAction,
  createPhysioProfileAction,
  rejectPaymentRequestAction,
  suspendSubscriptionAction,
} from "./actions";

type Physio = {
  id: string;
  email: string;
  full_name: string | null;
  clinic_name: string | null;
  role: string;
  status: string | null;
  subscriptions?: Subscription[];
};

type Subscription = {
  id: string;
  plan_name: string | null;
  price: number | string | null;
  currency: string | null;
  status: string | null;
  current_period_end: string | null;
  invoice_reference: string | null;
  created_at: string | null;
};

type PaymentRequest = {
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
  profiles: { id: string; email: string; full_name: string | null; clinic_name: string | null } | null;
  proof_url?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function requestStatus(status: string) {
  if (status === "proof_uploaded") return "Në verifikim";
  if (status === "approved") return "E aprovuar";
  if (status === "rejected") return "E refuzuar";
  if (status === "cancelled") return "E anuluar";
  return "Pa dëshmi";
}

export default async function AdminBillingPage() {
  const adminEmail = getAdminEmail();
  const email = await getSignedInEmail();
  if (email !== adminEmail) redirect("/admin-hidden");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="page admin-billing-page">
        <section className="ai-empty-state">
          <h1>Billing nuk mund të hapet.</h1>
          <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>
        </section>
      </main>
    );
  }

  const [{ data: physios }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,clinic_name,role,status,subscriptions(id,plan_name,price,currency,status,current_period_end,invoice_reference,created_at)")
      .in("role", ["physio", "owner", "admin"])
      .order("created_at", { ascending: false })
      .returns<Physio[]>(),
    supabase
      .from("payment_requests")
      .select("id,reference_code,amount,currency,duration_months,status,proof_path,proof_filename,submitted_at,created_at,profiles!payment_requests_physio_id_fkey(id,email,full_name,clinic_name)")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<PaymentRequest[]>(),
  ]);

  const rows = physios || [];
  const requests = await Promise.all(
    (paymentRows || []).map(async (request) => {
      if (!request.proof_path) return { ...request, proof_url: null };
      const { data } = await supabase.storage.from(PAYMENT_PROOF_BUCKET).createSignedUrl(request.proof_path, 60 * 15);
      return { ...request, proof_url: data?.signedUrl || null };
    }),
  );
  const pendingRequests = requests.filter((request) => request.status === "proof_uploaded");
  const activeCount = rows.filter((physio) => {
    const latestSubscription = [...(physio.subscriptions || [])].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
    return hasActivePhysioAccess(physio.role, latestSubscription);
  }).length;

  return (
    <main className="page admin-billing-page">
      <nav className="top-nav">
        <BrandMark href="/admin-dashboard" />
        <div className="nav-actions">
          <a href="/admin-dashboard">Admin</a>
          <a href="/physiotherapist-portal">Physio portal</a>
          <AuthControls />
        </div>
      </nav>

      <section className="admin-billing-hero">
        <div>
          <span className="badge">Manual Billing · Kosovë</span>
          <h1>Qasja e fizioterapeutëve: {PHYSIO_MONTHLY_PRICE_LABEL}.</h1>
          <p>Fizioterapeuti krijon kërkesën, paguan në bankë dhe ngarkon dëshminë. Admini e kontrollon dokumentin dhe vetëm pastaj e aktivizon qasjen.</p>
        </div>
        <div className="report-date-card">
          <span>Në verifikim</span>
          <strong>{pendingRequests.length}</strong>
          <small>{activeCount}/{rows.length} aktivë</small>
        </div>
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Pagesat në pritje të verifikimit</h2>
            <p>Kontrollo emrin, shumën, referencën dhe dëshminë para aprovimit.</p>
          </div>
          <span className="badge">{pendingRequests.length} pending</span>
        </div>
        {pendingRequests.length ? (
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Fizioterapeuti</th><th>Referenca</th><th>Shuma</th><th>Periudha</th><th>Dëshmia</th><th>Aprovo</th><th>Refuzo</th></tr></thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td><b>{request.profiles?.full_name || request.profiles?.email || "—"}</b><br /><small>{request.profiles?.clinic_name || request.profiles?.email}</small></td>
                    <td><b>{request.reference_code}</b><br /><small>{formatDate(request.submitted_at || request.created_at)}</small></td>
                    <td>{Number(request.amount).toFixed(2)} {request.currency}</td>
                    <td>{request.duration_months} muaj</td>
                    <td>{request.proof_url ? <a className="button secondary compact-button" href={request.proof_url} target="_blank" rel="noreferrer">Hape dëshminë</a> : "—"}</td>
                    <td>
                      <form action={approvePaymentRequestAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button className="button compact-button" type="submit">Aprovo</button>
                      </form>
                    </td>
                    <td>
                      <form action={rejectPaymentRequestAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <input className="input" name="reason" placeholder="Arsyeja" required />
                        <button className="button secondary compact-button" type="submit">Refuzo</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="ai-empty-state"><p>Nuk ka dëshmi të reja për verifikim.</p></div>}
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Shto fizioterapeut</h2>
            <p>Krijo profilin klinik. Fizioterapeuti pastaj hyn dhe e nis vetë kërkesën e pagesës.</p>
          </div>
          <span className="badge">Admin only</span>
        </div>
        <form action={createPhysioProfileAction} className="kpis plan-grid">
          <div><label className="label">Email</label><input className="input" name="email" type="email" placeholder="physio@example.com" required /></div>
          <div><label className="label">Emri</label><input className="input" name="fullName" placeholder="Emri i fizioterapeutit" /></div>
          <div><label className="label">Klinika</label><input className="input" name="clinicName" placeholder="Emri i klinikës" /></div>
          <div><label className="label">Veprim</label><button className="button" type="submit">Krijo profilin</button></div>
        </form>
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Historiku i kërkesave</h2>
            <p>Gjurmë e plotë e kërkesave bankare dhe statusit të tyre.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Fizioterapeuti</th><th>Referenca</th><th>Shuma</th><th>Statusi</th><th>Dëshmia</th><th>Data</th></tr></thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.profiles?.full_name || request.profiles?.email || "—"}</td>
                  <td>{request.reference_code}</td>
                  <td>{Number(request.amount).toFixed(2)} {request.currency}</td>
                  <td>{requestStatus(request.status)}</td>
                  <td>{request.proof_url ? <a href={request.proof_url} target="_blank" rel="noreferrer">Hape</a> : "—"}</td>
                  <td>{formatDate(request.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Fizioterapeutët dhe qasja</h2>
            <p>Vetëm status <b>active</b> me periudhë të vlefshme lejon krijim pacientësh dhe planesh.</p>
          </div>
          <span className="badge">{PHYSIO_MONTHLY_PRICE_LABEL}</span>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Fizioterapeuti</th><th>Email</th><th>Status</th><th>Paguar deri</th><th>Referenca</th><th>Aktivizim manual</th><th>Blloko</th></tr></thead>
            <tbody>
              {rows.map((physio) => {
                const latestSubscription = [...(physio.subscriptions || [])].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
                const active = hasActivePhysioAccess(physio.role, latestSubscription);
                return (
                  <tr key={physio.id}>
                    <td><b>{physio.full_name || physio.email}</b><br /><small>{physio.clinic_name || "—"}</small></td>
                    <td>{physio.email}</td>
                    <td>{active ? <b className="access-pill active">Active</b> : getBillingStatusLabel(latestSubscription)}</td>
                    <td>{formatDate(latestSubscription?.current_period_end)}</td>
                    <td>{latestSubscription?.invoice_reference || "—"}</td>
                    <td>
                      <form action={activateSubscriptionAction}>
                        <input type="hidden" name="physioId" value={physio.id} />
                        <input className="input" name="invoiceReference" placeholder="Referenca bankare" />
                        <select className="input" name="months" defaultValue="1">
                          <option value="1">1 muaj</option><option value="3">3 muaj</option><option value="6">6 muaj</option><option value="12">12 muaj</option>
                        </select>
                        <button className="button compact-button" type="submit">Aktivizo</button>
                      </form>
                    </td>
                    <td>
                      {latestSubscription?.id ? (
                        <form action={suspendSubscriptionAction}>
                          <input type="hidden" name="subscriptionId" value={latestSubscription.id} />
                          <button className="button secondary compact-button" type="submit">Blloko</button>
                        </form>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
