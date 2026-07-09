import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotCommunicationsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
