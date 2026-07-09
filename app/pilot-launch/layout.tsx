import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotLaunchLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
