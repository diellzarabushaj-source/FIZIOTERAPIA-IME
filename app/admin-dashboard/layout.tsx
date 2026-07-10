import { requireOwnerActor } from "@/lib/backend/access";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerActor();
  return <>{children}</>;
}
