import { requirePhysioActor } from "@/lib/backend/access";
import { DashboardShell } from "./DashboardShell";

export default async function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  await requirePhysioActor();
  return <DashboardShell>{children}</DashboardShell>;
}
