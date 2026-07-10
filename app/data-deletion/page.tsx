import type { Metadata } from "next";
import { DataDeletionRequestForm } from "@/components/DataDeletionRequestForm";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fshirja e të dhënave | Fizioterapia Ime",
  description: "Mëso si të kërkosh qasje, korrigjim, mbyllje të llogarisë ose fshirje të të dhënave në Fizioterapia Ime.",
  alternates: { canonical: "/data-deletion" },
};

export default async function DataDeletionPage() {
  const page = await getLegalPageBySlug("data-deletion");

  return <LegalPage {...page} afterContent={<DataDeletionRequestForm />} />;
}
