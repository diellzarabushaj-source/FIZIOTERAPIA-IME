import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "FizioPlan – Fizioterapia Ime",
  description: "Platforme SaaS per fizioterapi me pacient, fizioterapeut dhe owner dashboard."
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
