import type { Metadata } from "next";
import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { requireOwnerActor } from "@/lib/backend/access";
import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";
import { getAdminDashboardData } from "@/src/features/admin/server/dashboard";

export const metadata: Metadata = {
  title: "Owner Dashboard | Fizioterapia ime",
  description: "Kontrolli operacional, billing, readiness dhe auditimi i platformës.",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(ready: boolean) {
  return ready ? "access-pill active" : "access-pill locked";
}

function ReadinessRow({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return (
    <li className="admin-readiness-row">
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <span className={statusClass(ready)}>{ready ? "Gati" : "Kërkon veprim"}</span>
    </li>
  );
}

export default async function AdminDashboardPage() {
  const actor = await requireOwnerActor();
  const data = await getAdminDashboardData();
  const { metrics, readiness } = data;
  const monthlyRecurringRevenue = metrics.activeSubscriptions * PHYSIO_MONTHLY_PRICE_EUR;
  const clinicalAlerts = metrics.highPainAlerts + metrics.lowMovementScoreAlerts;

  return (
    <main className="page admin-dashboard-page">
      <nav className="top-nav admin-nav" aria-label="Navigimi i owner-it">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/physiotherapist-portal">Physio Portal</Link>
          <Link href="/admin-billing">Billing</Link>
          <Link href="/support">Support</Link>
          <AuthControls />
        </div>
      </nav>

      <section className="admin-shell">
        <aside className="admin-sidebar" aria-label="Seksionet e dashboard-it">
          <div className="patient-avatar" aria-hidden="true">OW</div>
          <h2>Owner Dashboard</h2>
          <p>{actor.email}</p>
          <div className="generated-box">
            <b>Rregullat e pilotit</b>
            <br />5 pacientë falas
            <br />9.90 EUR / muaj
            <br />AI: feedback për lëvizjen
          </div>
          <div className="side-menu">
            <a className="active" href="#overview">Përmbledhje</a>
            <a href="#readiness">Readiness</a>
            <a href="#profiles">Profilet</a>
            <a href="#audit">Audit</a>
            <a href="#safety">Siguria klinike</a>
          </div>
        </aside>

        <div className="admin-main">
          <section id="overview" className="admin-hero">
            <div>
              <span className="badge">Owner Control Center · database-backed access</span>
              <h1>Gjendja operative e platformës.</h1>
              <p>
                Shiko kapacitetin, billing-un, sinjalet klinike, readiness-in dhe veprimet e fundit
                administrative pa ekspozuar shënime, diagnoza ose identifikues pacientësh.
              </p>
            </div>
            <div className="admin-revenue-card" aria-label={`MRR ${monthlyRecurringRevenue.toFixed(2)} euro`}>
              <span>MRR</span>
              <strong>{monthlyRecurringRevenue.toFixed(2)}</strong>
              <small>EUR / muaj</small>
            </div>
          </section>

          {!data.configured ? (
            <div className="role-warning" role="alert">
              Disa query operative dështuan ose databaza nuk është konfiguruar. Dashboard-i po
              dështojnë sigurt dhe nuk po paraqet të dhëna të pjesshme si të sakta.
            </div>
          ) : null}

          <section className="dashboard-kpis admin-kpis" aria-label="Metrikat kryesore">
            <article className="kpi-card">
              <span>Fizioterapeutë</span>
              <strong>{metrics.physiotherapists}</strong>
              <small>{metrics.activePhysiotherapists} profile aktive</small>
            </article>
            <article className="kpi-card">
              <span>Abonime aktive</span>
              <strong>{metrics.activeSubscriptions}</strong>
              <small>Skadim në të ardhmen</small>
            </article>
            <article className="kpi-card">
              <span>Pacientë</span>
              <strong>{metrics.patients}</strong>
              <small>{metrics.activePatients} aktivë</small>
            </article>
            <article className="kpi-card">
              <span>Plane aktive</span>
              <strong>{metrics.activePlans}</strong>
              <small>Plane profesionale në përdorim</small>
            </article>
            <article className="kpi-card">
              <span>Sinjale klinike</span>
              <strong>{clinicalAlerts}</strong>
              <small>
                {metrics.highPainAlerts} dhimbje 7/10+ · {metrics.lowMovementScoreAlerts} movement score &lt;60
              </small>
            </article>
            <article className="kpi-card">
              <span>Email failures</span>
              <strong>{metrics.notificationFailures}</strong>
              <small>Transaksioni klinik nuk duhet të korruptohet</small>
            </article>
          </section>

          <section id="readiness" className="dashboard-card wide admin-section-card">
            <div className="section-header-row">
              <div>
                <span className="mini-badge">Deployment safety</span>
                <h2>Readiness</h2>
                <p>Kontrollet dështojnë sigurt; detajet e secrets nuk paraqiten në UI.</p>
              </div>
              <Link className="button" href="/readiness-report">Hap raportin</Link>
            </div>
            <ul className="admin-readiness-list">
              <ReadinessRow
                label="Database connectivity"
                ready={readiness.database}
                detail="Query operative me service boundary server-side"
              />
              <ReadinessRow
                label="Schema contract"
                ready={readiness.schema}
                detail={`${readiness.schemaVersion ?? "e panjohur"} / pritet ${readiness.expectedSchemaVersion}`}
              />
              <ReadinessRow
                label="Patient session signing"
                ready={readiness.patientSessionSigning}
                detail="Secret i dedikuar dhe cookie/session signature"
              />
              <ReadinessRow
                label="Revocable patient registry"
                ready={readiness.patientSessionRegistry}
                detail="Revokim, expiry dhe registry server-side"
              />
            </ul>
          </section>

          <section id="profiles" className="dashboard-card wide admin-section-card">
            <div className="section-header-row">
              <div>
                <span className="mini-badge">Identity + lifecycle</span>
                <h2>Profilet e fundit</h2>
                <p>Clerk verifikon identitetin; roli dhe statusi vijnë nga databaza.</p>
              </div>
              <Link className="button" href="/admin-billing">Menaxho aprovimet dhe billing</Link>
            </div>
            <div className="table-scroll">
              <table className="table admin-table">
                <caption className="sr-only">Profilet e fundit të stafit</caption>
                <thead>
                  <tr>
                    <th scope="col">Profili</th>
                    <th scope="col">Roli</th>
                    <th scope="col">Statusi</th>
                    <th scope="col">Abonimi</th>
                    <th scope="col">Skadon</th>
                  </tr>
                </thead>
                <tbody>
                  {data.profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td>
                        <b>{profile.fullName || profile.email}</b>
                        <br />
                        <small>{profile.clinicName || profile.email}</small>
                      </td>
                      <td>{profile.role}</td>
                      <td>{profile.status || "pending"}</td>
                      <td>{profile.subscriptionStatus || "free tier"}</td>
                      <td>{formatDate(profile.subscriptionEndsAt)}</td>
                    </tr>
                  ))}
                  {data.profiles.length === 0 ? (
                    <tr><td colSpan={5}>Nuk ka profile për t’u paraqitur.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section id="audit" className="dashboard-card wide admin-section-card">
            <div className="section-header-row">
              <div>
                <span className="mini-badge">Accountability</span>
                <h2>Audit events</h2>
                <p>Paraqiten vetëm metadata operative; snapshots klinike dhe identifikuesit redaktohen.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table className="table admin-table">
                <caption className="sr-only">Ngjarjet e fundit të auditimit</caption>
                <thead>
                  <tr>
                    <th scope="col">Veprimi</th>
                    <th scope="col">Roli</th>
                    <th scope="col">Entiteti</th>
                    <th scope="col">Koha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.audit.map((event) => (
                    <tr key={event.id}>
                      <td><code>{event.action}</code></td>
                      <td>{event.actorRole || "system"}</td>
                      <td>{event.entityType}</td>
                      <td>{formatDate(event.createdAt)}</td>
                    </tr>
                  ))}
                  {data.audit.length === 0 ? (
                    <tr><td colSpan={4}>Nuk ka audit events për t’u paraqitur.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section id="safety" className="dashboard-grid">
            <article className="dashboard-card wide admin-section-card">
              <span className="mini-badge">Clinical safety</span>
              <h2>Rregulla të bllokuara</h2>
              <ul>
                <li>Platforma nuk cakton diagnozë dhe nuk përshkruan terapi.</li>
                <li>Plani vjen vetëm nga profesionisti përgjegjës.</li>
                <li>AI Movement Check jep vetëm feedback për cilësinë e lëvizjes.</li>
                <li>Dhimbja 7/10 ose më shumë ndalon ushtrimin dhe kërkon kontakt me fizioterapistin.</li>
              </ul>
            </article>
            <article className="dashboard-card admin-section-card">
              <span className="mini-badge">Data minimization</span>
              <h2>Pa PHI në overview</h2>
              <p>
                Ky dashboard nuk lexon ose paraqet emra pacientësh, diagnoza, shënime klinike,
                access codes, session tokens ose përmbajtje të raporteve.
              </p>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
