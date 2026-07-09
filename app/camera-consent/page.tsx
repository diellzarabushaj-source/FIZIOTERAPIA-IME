import { LegalPage } from "@/components/LegalPage";
import { getLegalPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function CameraConsentPage() {
  const page = await getLegalPageBySlug("camera-consent");

  return <LegalPage {...page} />;
}
