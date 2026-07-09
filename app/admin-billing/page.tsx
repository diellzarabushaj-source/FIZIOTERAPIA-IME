import { redirect } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getAdminEmail, getSignedInEmail } from "@/lib/admin-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getBillingStatusLabel, hasActivePhysioAccess, PHYSIO_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { activateSubscriptionAction, suspendSubscriptionAction } from "./actions";

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

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
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

  const { data: physios } = await supabase
    .from("profiles")
    .select("id,email,full_name,clinic_name,role,status,subscriptions(id,plan_name,price,currency,status,current_period_end,invoice_reference,created_at)")
    .in("role", ["physio", "owner", "admin"])
    .order("created_at", { ascending: false })
    .returns<Physio[]>();

  const rows = physios || [];
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
          <span className="badge">Manual Billing · Local bank ready</span>
          <h1>Qasja e fizioterapeutëve: {PHYSIO_MONTHLY_PRICE_LABEL}.</h1>
          <p>
            Stripe nuk përdoret tani. Admini e aktivizon manualisht qasjen mujore pasi fizioterapeuti paguan.
            Më vonë kjo lidhet me bankë lokale.
          </p>
        </div>
        <div className="report-date-card">
          <span>Active</span>
          <strong>{activeCount}/{rows.length}</strong>
          <small>fizioterapeutë</small>
        </div>
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Fizioterapeutët dhe subscription status</h2>
            <p>Vetëm status <b>active</b> me periudhë të vlefshme lejon krijim pacientësh/planesh.</p>
          </div>
          <span className="badge">29.90 EUR / muaj</span>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr><th>Fizioterapeuti</th><th>Email</th><th>Status</th><th>Paguar deri</th><th>Invoice</th><th>Aktivizo</th><th>Blloko</th></tr>
            </thead>
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
                        <input className="input" name="invoiceReference" placeholder="FI-2026-07" />
                        <input type="hidden" name="months" value="1" />
                        <button className="button compact-button" type="submit">+ 1 muaj</button>
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
