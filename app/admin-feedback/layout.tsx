import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminFeedbackLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return <>{children}</>;
}
