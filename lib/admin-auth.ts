import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const defaultAdminEmail = "diellzarabushaj@gmail.com";

export async function requireAdminUser() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) redirect("/admin-hidden");

  const adminEmail = (process.env.ADMIN_EMAIL || defaultAdminEmail).toLowerCase();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!userEmail || userEmail !== adminEmail) redirect("/admin-hidden");

  return { adminEmail, userEmail };
}
