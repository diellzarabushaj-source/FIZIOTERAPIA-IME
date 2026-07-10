import { requireOwnerActor } from "@/lib/backend/access";

export default async function AdminBillingLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerActor();
  return <>{children}</>;
}
