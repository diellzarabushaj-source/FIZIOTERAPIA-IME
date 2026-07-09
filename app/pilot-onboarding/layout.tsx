import { requireAdminUser } from "@/lib/admin-auth";

export default async function PilotOnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
