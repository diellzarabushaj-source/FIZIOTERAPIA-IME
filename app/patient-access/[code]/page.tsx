import { BrandMark } from "@/components/BrandMark";
import { getPatientAccessUrl, normalizePatientCode } from "@/lib/supabase-admin";

type PageProps = { params: Promise<{ code: string }> };

export default async function PatientAccessCardPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));
  const accessUrl = getPatientAccessUrl(code);

  return (
    <main className="page patient-access-card-page">
      <nav className="top-nav patient-nav no-print"><BrandMark /><div className="nav-actions"><a href="/physiotherapist-portal">Kthehu te portali</a></div></nav>
      <section className="patient-access-card">
        <div><BrandMark compact /><span className="badge">Kodi i pacientit</span><h1>Hyrje e thjeshtë në plan</h1><p>Ky kod është personal. Pacienti e shkruan dhe hyn direkt në dashboard-in e vet.</p></div>
        <div className="patient-access-qr-box"><img src={`/api/patient/access-qr/${encodeURIComponent(code)}`} alt={`QR code për ${code}`} /></div>
        <div className="patient-access-code-box"><span>Kodi i pacientit</span><strong>{code}</strong><small>Skano QR ose shkruaj kodin te hyrja e pacientit.</small></div>
        <div className="patient-access-steps"><div><b>1</b><span>Hape linkun ose skano QR</span></div><div><b>2</b><span>Shkruaj kodin</span></div><div><b>3</b><span>Hyn direkt në plan</span></div></div>
        <a className="button no-print" href={accessUrl}>Hape hyrjen e pacientit</a>
        <p className="patient-access-note">Dhimbje 7/10 ose më shumë = ndalo ushtrimet dhe kontakto fizioterapeutin.</p>
      </section>
    </main>
  );
}
