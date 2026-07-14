import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";
import { PostHogAnalytics } from "@/components/PostHogAnalytics";
import "./globals.css";
import "./design-system.css";
import "./brand.css";
import "./brand-uploaded.css";
import "./phase3.css";
import "./phase4.css";
import "./phase5.css";
import "./phase6.css";
import "./phase10.css";
import "./phase13.css";
import "./phase-code-access.css";
import "./clinic-pro.css";
import "./patient-pro.css";
import "./duo-app.css";
import "./patient-dashboard-mobile-panels.css";
import "./ui-friendly.css";
import "./patient-login-refresh.css";
import "./physio-dashboard-refresh.css";
import "./admin-dashboard-refresh.css";
import "./plan-builder.css";
import "./public-site-fixes.css";
import "./patient-simple.css";
import "./public-design-system.css";
import "./support-center.css";
import "./faq-explorer.css";
import "./legal-pages.css";
import "./data-deletion.css";
import "./site-consistency.css";
import "./floating-fields.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Fizioterapia ime – Platformë për fizioterapeutë",
  description: "Krijo planin e ushtrimeve, dërgoja pacientit me kod ose QR dhe përcill progresin, dhimbjen dhe komentet në një panel.",
  alternates: { canonical: "/" },
  icons: { icon: "/fizioterapia-ime-icon.svg", shortcut: "/fizioterapia-ime-icon.svg", apple: "/fizioterapia-ime-icon.svg" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fizioterapia ime",
    title: "Fizioterapia ime",
    description: "Krijo planin. Dërgoja pacientit. Përcill progresin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fizioterapia ime",
    description: "Krijo planin. Dërgoja pacientit. Përcill progresin.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const content = <><PostHogAnalytics /><PublicSiteChrome />{children}<PublicSiteFooter /></>;
  return <html lang="sq"><body>{clerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}</body></html>;
}
