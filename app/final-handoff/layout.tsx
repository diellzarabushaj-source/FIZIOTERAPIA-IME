import { requireAdminUser } from "@/lib/admin-auth";

export default async function FinalHandoffLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
