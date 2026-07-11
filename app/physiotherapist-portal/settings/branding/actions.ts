"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function saveBrandingAction(formData:FormData){
  const actor=await requirePhysioActor();
  const supabase=getSupabaseAdmin();
  if(!supabase) throw new Error("Supabase nuk është konfiguruar.");
  const payload={
    physio_id:actor.profileId,
    clinic_name:cleanText(formData.get("clinicName"),120)||null,
    clinician_name:cleanText(formData.get("clinicianName"),120)||null,
    professional_title:cleanText(formData.get("professionalTitle"),120)||null,
    logo_url:cleanText(formData.get("logoUrl"),500)||null,
    phone:cleanText(formData.get("phone"),80)||null,
    email:cleanText(formData.get("email"),160)||null,
    address:cleanText(formData.get("address"),240)||null,
    website:cleanText(formData.get("website"),240)||null,
    report_footer:cleanText(formData.get("reportFooter"),500)||null,
    show_exercise_images:formData.get("showExerciseImages")==="on",
    show_qr_code:formData.get("showQrCode")==="on"
  };
  const {error}=await supabase.from("clinic_branding").upsert(payload,{onConflict:"physio_id"});
  if(error) throw new Error("Branding-u nuk u ruajt.");
  revalidatePath("/physiotherapist-portal/settings/branding");
  revalidatePath("/physiotherapist-portal/reports");
  redirect("/physiotherapist-portal/settings/branding?saved=1");
}
