import { notFound } from "next/navigation";

function developmentFixturesEnabled() {
  const appEnvironment = String(process.env.APP_ENV || "").trim().toLowerCase();
  if (appEnvironment) return appEnvironment === "development" || appEnvironment === "test";
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "development";
  return process.env.NODE_ENV !== "production";
}

export default function PatientDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!developmentFixturesEnabled()) notFound();
  return <>{children}</>;
}
