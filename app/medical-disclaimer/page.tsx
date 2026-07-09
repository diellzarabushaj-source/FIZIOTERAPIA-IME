import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function MedicalDisclaimerPage() {
  const page = await getLegalPageBySlug("medical-disclaimer");

  return <LegalPage {...page} />;
}
