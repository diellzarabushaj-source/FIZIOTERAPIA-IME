import { requirePhysioWorkspaceUser } from "@/lib/physio-auth";

export default async function PatientAccessLayout({ children }: { children: React.ReactNode }) {
  await requirePhysioWorkspaceUser();
  return <>{children}</>;
}
