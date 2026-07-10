import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Njoftimi mjekësor | Fizioterapia Ime",
  description:
    "Kupto kufijtë e platformës, rolin e fizioterapeutit dhe çfarë duhet të bësh në rast dhimbjeje të fortë ose simptomash urgjente.",
  alternates: { canonical: "/medical-disclaimer" },
  robots: { index: true, follow: true },
};

export default async function MedicalDisclaimerPage() {
  const page = await getLegalPageBySlug("medical-disclaimer");

  return <LegalPage {...page} />;
}
