import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
