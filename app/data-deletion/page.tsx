import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function DataDeletionPage() {
  const page = await getLegalPageBySlug("data-deletion");

  return <LegalPage {...page} />;
}
