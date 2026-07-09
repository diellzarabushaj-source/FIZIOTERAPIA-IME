import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteFooter } from "@/components/SiteFooter";
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
import "./workflow-illustrations.css";
import "./homepage-workflow.css";
import "./ui-friendly.css";
import "./patient-login-refresh.css";
import "./physio-dashboard-refresh.css";
import "./admin-dashboard-refresh.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Fizioterapia Ime – Platformë digjitale për fizioterapi",
  description: "Website dhe platformë digjitale për plane fizioterapie, udhëzime të qarta për pacientë dhe mbështetje për fizioterapeutë.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/brand-mark.svg",
    shortcut: "/brand-mark.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fizioterapia Ime",
    title: "Fizioterapia Ime",
    description: "Lëviz më mirë, jeto më mirë. Website dhe platformë moderne për fizioterapi digjitale.",
    images: ["/app-icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fizioterapia Ime",
    description: "Website dhe platformë moderne për fizioterapi digjitale.",
    images: ["/app-icon.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const content = (
    <>
      {children}
      <SiteFooter />
    </>
  );

  return (
    <html lang="sq">
      <body>
        {clerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
