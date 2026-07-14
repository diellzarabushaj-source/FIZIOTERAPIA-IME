import type { Metadata } from "next";
import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Qasja në llogari | Fizioterapia ime",
  robots: { index: false, follow: false },
};

type AccountAccessPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AccountAccessPage({ searchParams }: AccountAccessPageProps) {
  const { reason } = await searchParams;
  const temporarilyUnavailable = reason === "temporarily-unavailable";

  return (
    <main className="page admin-hidden-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/support">Support</Link>
          <AuthControls />
        </div>
      </nav>

      <section className="ai-empty-state" role="alert">
        <span className="badge">Qasja në llogari</span>
        <h1>
          {temporarilyUnavailable
            ? "Dashboard-i nuk mund të hapet për momentin."
            : "Llogaria jote nuk ka ende një profil aktiv."}
        </h1>
        <p>
          {temporarilyUnavailable
            ? "Identifikimi u krye, por shërbimi i autorizimit nuk është i disponueshëm. Provo përsëri ose kontakto support-in."
            : "Identifikimi u krye me sukses, por profili duhet të aprovohet ose të lidhet me ekipin përkatës para se të hapet dashboard-i."}
        </p>
        <div className="portal-actions">
          <Link className="button" href="/auth/continue">Provo përsëri</Link>
          <Link className="button secondary" href="/support">Kontakto support</Link>
        </div>
      </section>
    </main>
  );
}
