import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./brand.css";

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

  return (
    <html lang="sq">
      <body>
        {clerkConfigured ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
