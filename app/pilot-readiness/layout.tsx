import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotReadinessLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
