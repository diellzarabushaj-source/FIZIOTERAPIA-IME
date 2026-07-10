import { requirePhysioActor } from "@/lib/backend/access";
import { DashboardShell } from "./DashboardShell";
import "./dashboard.css";

export default async function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  await requirePhysioActor();
  return <DashboardShell>{children}</DashboardShell>;
}
