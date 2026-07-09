import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotRunbookLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
