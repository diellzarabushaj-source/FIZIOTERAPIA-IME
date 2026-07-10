import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privatësia | Fizioterapia Ime",
  description: "Mëso si Fizioterapia Ime mbledh, përdor dhe mbron të dhënat e pacientëve dhe fizioterapeutëve.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const page = await getLegalPageBySlug("privacy");

  return <LegalPage {...page} />;
}