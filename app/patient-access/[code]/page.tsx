import { BrandMark } from "@/components/BrandMark";
import { getPatientAccessUrl, normalizePatientCode } from "@/lib/supabase-admin";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function PatientAccessCardPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));
  const accessUrl = getPatientAccessUrl(code);

  return (
    <main className="page patient-access-card-page">
      <nav className="top-nav patient-nav no-print">
        <BrandMark />
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Fizioterapeut Portal</a>
          <a href="/patient-portal">Patient Portal</a>
        </div>
      </nav>

      <section className="patient-access-card">
        <div>
          <BrandMark compact />
          <span className="badge">Patient access card</span>
          <h1>Hyrje me kod unik</h1>
          <p>Ky kod eshte personal per nje pacient. Mos e ndaj me persona te tjere.</p>
        </div>

        <div className="patient-access-qr-box">
          <img src={`/api/patient/access-qr/${encodeURIComponent(code)}`} alt={`QR code per ${code}`} />
        </div>

        <div className="patient-access-code-box">
          <span>Kodi i pacientit</span>
          <strong>{code}</strong>
          <small>Skano QR ose shkruaj kodin te Patient Portal.</small>
        </div>

        <div className="patient-access-steps">
          <div><b>1</b><span>Skano QR code</span></div>
          <div><b>2</b><span>Hapet plani personal</span></div>
          <div><b>3</b><span>Kryej ushtrimet dhe raporto dhimbjen</span></div>
        </div>

        <a className="button no-print" href={accessUrl}>Testo linkun e pacientit</a>
        <p className="patient-access-note">AI Movement Check eshte vetem feedback per levizje. Dhimbje 7/10 ose me shume = ndalo dhe kontakto fizioterapeutin.</p>
      </section>
    </main>
  );
}
