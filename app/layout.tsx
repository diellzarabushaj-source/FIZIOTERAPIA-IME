import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
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
import "./home-premium.css";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "health",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand-mark.svg",
    shortcut: "/brand-mark.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "sq_AL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/app-icon.svg",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} – platformë digjitale për fizioterapi`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/app-icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#174A73",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const content = <><PublicSiteChrome />{children}<PublicSiteFooter /></>;
  return <html lang="sq"><body>{clerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}</body></html>;
}
