import { BrandMark } from "@/components/BrandMark";
import { PatientReminderSettings } from "@/components/PatientReminderSettings";
import { UiIcon } from "@/components/UiIcon";

export default function PatientRemindersPage() {
  return (
    <main className="patient-pro-page duo-app-page" style={{ minHeight: "100vh", padding: "24px 12px" }}>
      <div className="patient-pro-phone duo-phone" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="patient-pro-statusbar duo-status"><span>Fizioterapia Ime</span><span>Reminder</span></div>
        <header className="patient-pro-header duo-header">
          <a href="/patient-dashboard" aria-label="Kthehu">‹</a>
          <div><span>Përkujtuesi im</span><small>Rutina e ushtrimeve</small></div>
          <UiIcon name="clock" />
        </header>

        <section className="patient-pro-plan-card duo-lesson-hero">
          <div><span className="patient-pro-pill">Rutina</span><h1>Mos i harro ushtrimet</h1><p>Zgjedh orën dhe ditët kur dëshiron të marrësh kujtesë.</p></div>
        </section>

        <PatientReminderSettings />

        <section className="clinic-panel" style={{ margin: 16 }}>
          <BrandMark compact />
          <h3>Reminder-i nuk e ndryshon planin</h3>
          <p>Ai vetëm të kujton për seancën. Çdo ndryshim klinik bëhet nga fizioterapeuti.</p>
        </section>

        <nav className="patient-pro-bottom-nav duo-bottom-nav" aria-label="Patient reminder navigation">
          <a href="/patient-dashboard"><UiIcon name="home" size={18} /><span>Sot</span></a>
          <a href="/patient-progress"><UiIcon name="progress" size={18} /><span>Progresi</span></a>
          <a className="active" href="/patient-reminders"><UiIcon name="clock" size={18} /><span>Kujtesa</span></a>
          <a href="/patient-dashboard#messages"><UiIcon name="message" size={18} /><span>Mesazhe</span></a>
        </nav>
      </div>
    </main>
  );
}
