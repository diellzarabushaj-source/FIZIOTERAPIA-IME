import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";
import "./brand.css";
import "./phase3.css";
import "./phase4.css";
import "./phase5.css";
import "./phase6.css";
import "./phase10.css";

export const metadata: Metadata = {
  title: "Fizioterapia ime – Digital physiotherapy platform",
  description: "Platformë SaaS për fizioterapi me patient app, physiotherapist dashboard, AI Movement Check dhe billing 29.90 EUR/muaj.",
  icons: {
    icon: "/brand-mark.svg",
    shortcut: "/brand-mark.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    title: "Fizioterapia ime",
    description: "Lëviz më mirë, jeto më mirë. Platformë moderne për fizioterapi digjitale.",
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
