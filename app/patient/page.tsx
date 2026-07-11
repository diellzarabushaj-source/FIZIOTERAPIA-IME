import { redirect } from "next/navigation";
import { getCurrentPatientSession } from "@/lib/patient-session";

export const dynamic = "force-dynamic";

export default async function PatientPage() {
  const session = await getCurrentPatientSession();
  redirect(session ? "/patient-dashboard" : "/patient-portal");
}
