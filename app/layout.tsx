import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FizioPlan – Fizioterapia Ime",
  description: "Platforme SaaS per fizioterapi me pacient, fizioterapeut dhe owner dashboard."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
