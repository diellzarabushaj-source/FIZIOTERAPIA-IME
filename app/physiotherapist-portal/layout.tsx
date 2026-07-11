import { DashboardShell } from "./DashboardShell";
import "./dashboard.css";
import "./dashboard-polish.css";

export default function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
