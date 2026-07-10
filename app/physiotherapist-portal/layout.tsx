import { requirePhysioActor } from "@/lib/backend/access";

export default async function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  await requirePhysioActor();
  return <>{children}</>;
}
