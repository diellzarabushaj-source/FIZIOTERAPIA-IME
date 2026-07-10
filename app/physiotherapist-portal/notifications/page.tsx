import { requirePhysioActor } from "@/lib/backend/access";
import { listNotificationsForActor } from "@/lib/backend/notifications";
import { archiveNotificationAction, markNotificationReadAction } from "./actions";

function formatDate(value: string) {
  return new Date(value).toLocaleString("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PhysiotherapistNotificationsPage() {
  const actor = await requirePhysioActor();
  const result = await listNotificationsForActor(actor, { limit: 100 });
  const notifications = result.ok ? result.data : [];
  const unreadCount = notifications.filter((item) => item.status === "unread").length;

  return (
    <main className="page">
      <nav className="top-nav">
        <a href="/physiotherapist-portal"><b>Fizioterapia Ime</b></a>
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Dashboard</a>
          <a href="/physiotherapist-portal/plan-builder">Plan Builder</a>
        </div>
      </nav>

      <section className="admin-shell" style={{ display: "block", maxWidth: 980, margin: "0 auto" }}>
        <div className="section-header-row">
          <div>
            <span className="mini-badge">Njoftime klinike</span>
            <h1>Njoftimet</h1>
            <p>{unreadCount} të palexuara · {notifications.length} gjithsej</p>
          </div>
        </div>

        {result.ok === false && (
          <div className="role-warning">{result.error.message}</div>
        )}

        {notifications.length === 0 ? (
          <section className="ai-empty-state">
            <h2>Nuk ka njoftime</h2>
            <p>Alarmet klinike, skadimi i qasjes dhe ngjarjet e rëndësishme do të shfaqen këtu.</p>
          </section>
        ) : (
          <section className="dashboard-card wide">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                style={{
                  borderBottom: "1px solid #e8eef2",
                  padding: "18px 0",
                  opacity: notification.status === "archived" ? 0.6 : 1,
                }}
              >
                <div className="section-header-row">
                  <div>
                    <span className={`mini-badge ${notification.severity === "critical" ? "danger" : ""}`}>
                      {notification.severity === "critical" ? "Urgjente" : notification.type}
                    </span>
                    <h3>{notification.title}</h3>
                    <p>{notification.message || "Pa përshkrim."}</p>
                    <small>{formatDate(notification.created_at)}</small>
                  </div>

                  <div className="portal-actions">
                    {notification.link && notification.status !== "archived" && (
                      <a className="button secondary" href={notification.link}>Hape</a>
                    )}
                    {notification.status === "unread" && (
                      <form action={markNotificationReadAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button className="button" type="submit">Shëno të lexuar</button>
                      </form>
                    )}
                    {notification.status !== "archived" && (
                      <form action={archiveNotificationAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button className="button secondary" type="submit">Arkivo</button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
