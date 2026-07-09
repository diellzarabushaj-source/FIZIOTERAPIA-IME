import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function TermsPage() {
  const page = await getLegalPageBySlug("terms");

  return <LegalPage {...page} />;
}
