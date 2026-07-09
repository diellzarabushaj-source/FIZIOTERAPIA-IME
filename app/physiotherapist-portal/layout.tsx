import { requirePhysioWorkspaceUser } from "@/lib/physio-auth";

export default async function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  await requirePhysioWorkspaceUser();
  return <>{children}</>;
}
