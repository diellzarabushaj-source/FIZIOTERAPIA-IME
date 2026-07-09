import { requireAdminUser } from "@/lib/admin-auth";

export default async function QaChecklistLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
