import { requireAdminUser } from "@/lib/admin-auth";

export default async function LaunchChecklistLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
