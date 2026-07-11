import { DashboardShell } from "./DashboardShell";
import "./dashboard.css";
import "./dashboard-polish.css";
import "./dashboard-mobile.css";

export default function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
