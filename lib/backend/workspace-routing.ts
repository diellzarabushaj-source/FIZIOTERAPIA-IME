import type { WorkspaceRole } from "./domain.ts";

const workspaceHomeByRole: Record<WorkspaceRole, string> = {
  owner: "/admin-dashboard",
  admin: "/physiotherapist-portal/overview",
  physio: "/physiotherapist-portal/overview",
};

export function getWorkspaceHome(role: WorkspaceRole): string {
  return workspaceHomeByRole[role];
}
