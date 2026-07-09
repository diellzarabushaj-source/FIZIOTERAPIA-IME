import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminBillingLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
