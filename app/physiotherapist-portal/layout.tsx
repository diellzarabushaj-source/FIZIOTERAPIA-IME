import { DashboardShell } from "./DashboardShell";
import "./dashboard.css";
import "./dashboard-polish.css";
import "./dashboard-mobile.css";
import "./dashboard-search.css";
import "./dashboard-actions.css";

export default function PhysiotherapistPortalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
