import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PHYSIO_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { getBankDetails } from "@/lib/manual-payment";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  cancelPaymentRequestAction,
  createPaymentRequestAction,
  uploadPaymentProofAction,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type PaymentRequest = {
  id: string;
  reference_code: string;
  amount: number | string;
  currency: string;
  duration_months: number;
  status: string;
  proof_filename: string | null;
  submitted_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function statusLabel(status: string) {
  if (status === "proof_uploaded") return "Në verifikim";
  if (status === "approved") return "E aprovuar";
  if (status === "rejected") return "E refuzuar";
  if (status === "cancelled") return "E anuluar";
  return "Në pritje të dëshmisë";
}

export default async function PaymentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selectedRequestId = one(params.request);
  const created = one(params.created) === "1";
  const uploaded = one(params.uploaded) === "1";
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) redirect("/sign-in?redirect_url=/physiotherapist-portal/payment");

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,clinic_name")
    .eq("email", email)
    .maybeSingle<{ id: string; full_name: string | null; clinic_name: string | null }>();
  if (!profile) redirect("/physiotherapist-portal");

  const { data: requests } = await supabase
    .from("payment_requests")
    .select("id,reference_code,amount,currency,duration_months,status,proof_filename,submitted_at,rejection_reason,created_at")
    .eq("physio_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(12)
    .returns<PaymentRequest[]>();

  const rows = requests || [];
  const current = rows.find((item) => item.id === selectedRequestId) || rows.find((item) => ["pending", "proof_uploaded", "rejected"].includes(item.status)) || null;
  const bank = getBankDetails();

  return (
    <main className="page manual-payment-page">
      <nav className="top-nav">
        <BrandMark href="/physiotherapist-portal" />
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Dashboard</a>
          <a href="/physiotherapist-portal/plan-builder">Krijo plan</a>
        </div>
      </nav>

      <section className="admin-billing-hero">
        <div>
          <span className="badge">Pagesë manuale · Kosovë</span>
          <h1>Aktivizo qasjen për {PHYSIO_MONTHLY_PRICE_LABEL}.</h1>
          <p>Bëje transferin bankar, shkruaje referencën unike dhe ngarko dëshminë. Qasja aktivizohet vetëm pasi admini e verifikon pagesën.</p>
        </div>
        <div className="report-date-card">
          <span>Profili</span>
          <strong>{profile.full_name || "Fizioterapeut"}</strong>
          <small>{profile.clinic_name || email}</small>
        </div>
      </section>

      {created ? <div className="fi-alert success">Kërkesa u krijua. Përdore referencën e mëposhtme gjatë pagesës.</div> : null}
      {uploaded ? <div className="fi-alert success">Dëshmia u ngarkua. Pagesa tani është në verifikim.</div> : null}

      {!current ? (
        <section className="dashboard-card wide">
          <div className="section-header-row">
            <div>
              <h2>Krijo kërkesën e pagesës</h2>
              <p>Zgjidh periudhën. Shuma llogaritet me 9.90 EUR për muaj.</p>
            </div>
          </div>
          <form action={createPaymentRequestAction} className="plan-grid">
            <div>
              <label className="label">Periudha</label>
              <select className="input" name="months" defaultValue="1">
                <option value="1">1 muaj · 9.90 EUR</option>
                <option value="3">3 muaj · 29.70 EUR</option>
                <option value="6">6 muaj · 59.40 EUR</option>
                <option value="12">12 muaj · 118.80 EUR</option>
              </select>
            </div>
            <div>
              <label className="label">Veprim</label>
              <button className="button" type="submit">Gjenero referencën</button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="dashboard-card wide">
            <div className="section-header-row">
              <div>
                <h2>Udhëzimet për pagesë</h2>
                <p>Statusi: <b>{statusLabel(current.status)}</b></p>
              </div>
              <span className={`access-pill ${current.status === "approved" ? "active" : ""}`}>{statusLabel(current.status)}</span>
            </div>

            <div className="kpis">
              <article><span>Shuma</span><strong>{Number(current.amount).toFixed(2)} {current.currency}</strong></article>
              <article><span>Periudha</span><strong>{current.duration_months} muaj</strong></article>
              <article><span>Referenca</span><strong>{current.reference_code}</strong></article>
            </div>

            <div className="plan-grid">
              <div><label className="label">Banka</label><div className="input">{bank.bankName}</div></div>
              <div><label className="label">Përfituesi</label><div className="input">{bank.beneficiary}</div></div>
              <div><label className="label">IBAN</label><div className="input">{bank.iban}</div></div>
              <div><label className="label">Numri i llogarisë</label><div className="input">{bank.accountNumber}</div></div>
              <div><label className="label">SWIFT/BIC</label><div className="input">{bank.swift}</div></div>
              <div><label className="label">Përshkrimi i pagesës</label><div className="input"><b>{current.reference_code}</b></div></div>
            </div>
            <p className="role-warning">{bank.instructions}</p>
          </section>

          {current.status !== "approved" && current.status !== "proof_uploaded" ? (
            <section className="dashboard-card wide">
              <h2>Ngarko dëshminë e pagesës</h2>
              <p>Lejohen JPG, PNG, WEBP ose PDF, maksimumi 5 MB.</p>
              {current.status === "rejected" && current.rejection_reason ? (
                <div className="fi-alert danger">Arsyeja e refuzimit: {current.rejection_reason}</div>
              ) : null}
              <form action={uploadPaymentProofAction} className="plan-grid">
                <input type="hidden" name="requestId" value={current.id} />
                <div>
                  <label className="label">Dëshmia</label>
                  <input className="input" name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required />
                </div>
                <div>
                  <label className="label">Dërgo për verifikim</label>
                  <button className="button" type="submit">Ngarko dëshminë</button>
                </div>
              </form>
              {current.status === "pending" || current.status === "rejected" ? (
                <form action={cancelPaymentRequestAction}>
                  <input type="hidden" name="requestId" value={current.id} />
                  <button className="button secondary compact-button" type="submit">Anulo kërkesën</button>
                </form>
              ) : null}
            </section>
          ) : null}

          {current.status === "proof_uploaded" ? (
            <section className="dashboard-card wide">
              <h2>Dëshmia është në verifikim</h2>
              <p>Dokumenti: <b>{current.proof_filename || "Dëshmia e pagesës"}</b>. Admini do ta aprovojë ose refuzojë pas kontrollit.</p>
            </section>
          ) : null}
        </>
      )}

      {rows.length ? (
        <section className="dashboard-card wide">
          <h2>Historiku i kërkesave</h2>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Referenca</th><th>Shuma</th><th>Periudha</th><th>Statusi</th><th>Data</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><a href={`/physiotherapist-portal/payment?request=${item.id}`}><b>{item.reference_code}</b></a></td>
                    <td>{Number(item.amount).toFixed(2)} {item.currency}</td>
                    <td>{item.duration_months} muaj</td>
                    <td>{statusLabel(item.status)}</td>
                    <td>{new Date(item.created_at).toLocaleDateString("sq-AL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
