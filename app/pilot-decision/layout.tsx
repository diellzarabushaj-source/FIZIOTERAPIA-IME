import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotDecisionLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
