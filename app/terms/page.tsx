import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kushtet e përdorimit | Fizioterapia Ime",
  description: "Lexo kushtet për përdorimin e Fizioterapia Ime nga pacientët dhe fizioterapeutët.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const page = await getLegalPageBySlug("terms");

  return <LegalPage {...page} />;
}
