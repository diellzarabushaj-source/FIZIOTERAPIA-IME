import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function PrivacyPage() {
  const page = await getLegalPageBySlug("privacy");

  return <LegalPage {...page} />;
}
