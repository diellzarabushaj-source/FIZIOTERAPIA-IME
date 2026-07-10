import type { Metadata } from "next";
import { CameraConsentPanel } from "@/components/CameraConsentPanel";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pëlqimi për kamerën | Fizioterapia Ime",
  description: "Mëso si përdoret kamera për AI Movement Check, çfarë analizohet dhe si mund të vazhdosh pa kamerë.",
  alternates: { canonical: "/camera-consent" },
};

export default async function CameraConsentPage() {
  const page = await getLegalPageBySlug("camera-consent");

  return <LegalPage {...page} afterContent={<CameraConsentPanel />} />;
}
