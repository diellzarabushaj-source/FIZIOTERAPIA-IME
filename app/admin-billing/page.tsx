import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import {
  ConfirmActionForm,
  ConfirmSubmitButton,
} from "@/components/ConfirmActionForm";
import { requireOwnerActor } from "@/lib/backend/access";
import {
  getBillingStatusLabel,
  hasActivePhysioAccess,
  PHYSIO_MONTHLY_PRICE_LABEL,
} from "@/lib/billing";
import {
  getAdminBillingData,
  latestSubscription,
} from "@/src/features/admin/server/billing";
import {
  activateSubscriptionAction,
  approvePaymentRequestAction,
  createPhysioProfileAction,
  rejectPaymentRequestAction,
  suspendSubscriptionAction,
} from "./actions";

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
  const actor = await requireOwnerActor();
  const billing = await getAdminBillingData(actor);

  if (billing.ok === false) {
    return (
      <main className="page admin-billing-page">
        <nav className="top-nav">
          <BrandMark href="/admin-dashboard" />
          <div className="nav-actions">
            <a href="/admin-dashboard">Admin</a>
            <AuthControls />
          </div>
        </nav>
        <section className="ai-empty-state" role="alert">
          <h1>Billing nuk mund të hapet.</h1>
          <div className="role-warning">{billing.error.message}</div>
        </section>
      </main>
    );
  }

  const { physios, requests, pendingRequests, activeCount } = billing.data;

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
          <p>
            Fizioterapeuti krijon kërkesën, paguan në bankë dhe ngarkon dëshminë.
            Owner-i e kontrollon dokumentin dhe vetëm pastaj e aktivizon qasjen.
          </p>
        </div>
        <div className="report-date-card">
          <span>Në verifikim</span>
          <strong>{pendingRequests.length}</strong>
          <small>{activeCount}/{physios.length} aktivë</small>
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
              <thead>
                <tr>
                  <th>Fizioterapeuti</th>
                  <th>Referenca</th>
                  <th>Shuma</th>
                  <th>Periudha</th>
                  <th>Dëshmia</th>
                  <th>Aprovo</th>
                  <th>Refuzo</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <b>{request.profiles?.full_name || request.profiles?.email || "—"}</b>
                      <br />
                      <small>{request.profiles?.clinic_name || request.profiles?.email}</small>
                    </td>
                    <td>
                      <b>{request.reference_code}</b>
                      <br />
                      <small>{formatDate(request.submitted_at || request.created_at)}</small>
                    </td>
                    <td>{Number(request.amount).toFixed(2)} {request.currency}</td>
                    <td>{request.duration_months} muaj</td>
                    <td>
                      {request.proof_url ? (
                        <a
                          className="button secondary compact-button"
                          href={request.proof_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Hape dëshminë
                        </a>
                      ) : "—"}
                    </td>
                    <td>
                      <ConfirmActionForm
                        action={approvePaymentRequestAction}
                        confirmMessage={`Konfirmo aprovimin e pagesës ${request.reference_code}. Ky veprim aktivizon abonimin dhe regjistrohet në audit log.`}
                      >
                        <input type="hidden" name="requestId" value={request.id} />
                        <ConfirmSubmitButton
                          className="button compact-button"
                          pendingLabel="Duke aprovuar..."
                        >
                          Aprovo
                        </ConfirmSubmitButton>
                      </ConfirmActionForm>
                    </td>
                    <td>
                      <ConfirmActionForm
                        action={rejectPaymentRequestAction}
                        confirmMessage={`Konfirmo refuzimin e pagesës ${request.reference_code}. Arsyeja do të ruhet në audit log.`}
                      >
                        <input type="hidden" name="requestId" value={request.id} />
                        <label className="sr-only" htmlFor={`reject-reason-${request.id}`}>
                          Arsyeja e refuzimit
                        </label>
                        <input
                          id={`reject-reason-${request.id}`}
                          className="input"
                          name="reason"
                          placeholder="Arsyeja e refuzimit"
                          minLength={3}
                          maxLength={500}
                          required
                        />
                        <ConfirmSubmitButton
                          className="button secondary compact-button"
                          pendingLabel="Duke refuzuar..."
                        >
                          Refuzo
                        </ConfirmSubmitButton>
                      </ConfirmActionForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ai-empty-state">
            <p>Nuk ka dëshmi të reja për verifikim.</p>
          </div>
        )}
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Shto fizioterapeut</h2>
            <p>
              Krijo profilin klinik. Fizioterapeuti pastaj hyn dhe e nis vetë
              kërkesën e pagesës.
            </p>
          </div>
          <span className="badge">Owner only</span>
        </div>
        <form action={createPhysioProfileAction} className="kpis plan-grid">
          <div>
            <label className="label" htmlFor="new-physio-email">Email</label>
            <input
              id="new-physio-email"
              className="input"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="physio@example.com"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="new-physio-name">Emri</label>
            <input
              id="new-physio-name"
              className="input"
              name="fullName"
              autoComplete="name"
              placeholder="Emri i fizioterapeutit"
            />
          </div>
          <div>
            <label className="label" htmlFor="new-clinic-name">Klinika</label>
            <input
              id="new-clinic-name"
              className="input"
              name="clinicName"
              autoComplete="organization"
              placeholder="Emri i klinikës"
            />
          </div>
          <div>
            <label className="label">Veprim</label>
            <button className="button" type="submit">Krijo profilin</button>
          </div>
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
            <thead>
              <tr>
                <th>Fizioterapeuti</th>
                <th>Referenca</th>
                <th>Shuma</th>
                <th>Statusi</th>
                <th>Dëshmia</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.profiles?.full_name || request.profiles?.email || "—"}</td>
                  <td>{request.reference_code}</td>
                  <td>{Number(request.amount).toFixed(2)} {request.currency}</td>
                  <td>{requestStatus(request.status)}</td>
                  <td>
                    {request.proof_url ? (
                      <a href={request.proof_url} target="_blank" rel="noreferrer">Hape</a>
                    ) : "—"}
                  </td>
                  <td>{formatDate(request.created_at)}</td>
                </tr>
              ))}
              {!requests.length && (
                <tr><td colSpan={6}>Nuk ka kërkesa pagese.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-card wide admin-billing-table-card">
        <div className="section-header-row">
          <div>
            <h2>Fizioterapeutët dhe qasja</h2>
            <p>
              Statusi i abonimit kontrollon vetëm krijimin e pacientëve të rinj pas
              pesë vendeve falas. Pacientët dhe raportet ekzistuese mbeten të qasshme.
            </p>
          </div>
          <span className="badge">{PHYSIO_MONTHLY_PRICE_LABEL}</span>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Fizioterapeuti</th>
                <th>Email</th>
                <th>Status</th>
                <th>Paguar deri</th>
                <th>Referenca</th>
                <th>Aktivizim manual</th>
                <th>Pezullo</th>
              </tr>
            </thead>
            <tbody>
              {physios.map((physio) => {
                const subscription = latestSubscription(physio);
                const active = hasActivePhysioAccess(physio.role, subscription);
                return (
                  <tr key={physio.id}>
                    <td>
                      <b>{physio.full_name || physio.email}</b>
                      <br />
                      <small>{physio.clinic_name || "—"}</small>
                    </td>
                    <td>{physio.email}</td>
                    <td>
                      {active
                        ? <b className="access-pill active">Active</b>
                        : getBillingStatusLabel(subscription)}
                    </td>
                    <td>{formatDate(subscription?.current_period_end)}</td>
                    <td>{subscription?.invoice_reference || "—"}</td>
                    <td>
                      <ConfirmActionForm
                        action={activateSubscriptionAction}
                        confirmMessage={`Konfirmo aktivizimin manual të abonimit për ${physio.email}. Kontrollo referencën bankare para vazhdimit.`}
                      >
                        <input type="hidden" name="physioId" value={physio.id} />
                        <label className="sr-only" htmlFor={`invoice-${physio.id}`}>
                          Referenca bankare
                        </label>
                        <input
                          id={`invoice-${physio.id}`}
                          className="input"
                          name="invoiceReference"
                          placeholder="Referenca bankare"
                          maxLength={120}
                        />
                        <label className="sr-only" htmlFor={`months-${physio.id}`}>
                          Kohëzgjatja e abonimit
                        </label>
                        <select
                          id={`months-${physio.id}`}
                          className="input"
                          name="months"
                          defaultValue="1"
                        >
                          <option value="1">1 muaj</option>
                          <option value="3">3 muaj</option>
                          <option value="6">6 muaj</option>
                          <option value="12">12 muaj</option>
                        </select>
                        <ConfirmSubmitButton
                          className="button compact-button"
                          pendingLabel="Duke aktivizuar..."
                        >
                          Aktivizo
                        </ConfirmSubmitButton>
                      </ConfirmActionForm>
                    </td>
                    <td>
                      {subscription?.id ? (
                        <ConfirmActionForm
                          action={suspendSubscriptionAction}
                          confirmMessage={`Konfirmo pezullimin e abonimit për ${physio.email}. Pacientët ekzistues nuk do të fshihen.`}
                        >
                          <input
                            type="hidden"
                            name="subscriptionId"
                            value={subscription.id}
                          />
                          <label className="sr-only" htmlFor={`suspend-reason-${physio.id}`}>
                            Arsyeja e pezullimit
                          </label>
                          <input
                            id={`suspend-reason-${physio.id}`}
                            className="input"
                            name="reason"
                            placeholder="Arsyeja e pezullimit"
                            minLength={3}
                            maxLength={500}
                            required
                          />
                          <ConfirmSubmitButton
                            className="button secondary compact-button"
                            pendingLabel="Duke pezulluar..."
                          >
                            Pezullo
                          </ConfirmSubmitButton>
                        </ConfirmActionForm>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
              {!physios.length && (
                <tr><td colSpan={7}>Nuk ka profile të regjistruara.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
