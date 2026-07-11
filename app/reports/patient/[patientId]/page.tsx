import { redirect } from "next/navigation";

export default async function LegacyPatientReportPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  redirect(`/reports/${patientId}`);
}
