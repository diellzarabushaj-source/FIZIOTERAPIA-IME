import { CheckCircle2, Image as ImageIcon, Palette } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { saveBrandingAction } from "./actions";

type SearchParams=Promise<Record<string,string|string[]|undefined>>;
type Branding={clinic_name:string|null;clinician_name:string|null;professional_title:string|null;logo_url:string|null;phone:string|null;email:string|null;address:string|null;website:string|null;report_footer:string|null;show_exercise_images:boolean;show_qr_code:boolean};

export default async function BrandingPage({searchParams}:{searchParams:SearchParams}){
  const params=await searchParams;
  const actor=await requirePhysioActor();
  const supabase=getSupabaseAdmin();
  if(!supabase) throw new Error("Supabase nuk është konfiguruar.");
  const {data}=await supabase.from("clinic_branding").select("clinic_name,clinician_name,professional_title,logo_url,phone,email,address,website,report_footer,show_exercise_images,show_qr_code").eq("physio_id",actor.profileId).maybeSingle<Branding>();
  const saved=(Array.isArray(params.saved)?params.saved[0]:params.saved)==="1";
  return <main style={{maxWidth:1000,margin:"0 auto",padding:"28px 20px 80px"}}>
    <header style={{marginBottom:24}}><span className="badge"><Palette size={15}/> Identiteti i klinikës</span><h1>Personalizo çdo raport</h1><p>Vendose një herë logon dhe kontaktet; pastaj çdo raport del automatikisht me identitetin tënd.</p></header>
    {saved&&<div className="card" style={{padding:16,marginBottom:18,display:"flex",gap:10,alignItems:"center",color:"#166534"}}><CheckCircle2 size={20}/> Branding-u u ruajt.</div>}
    <form action={saveBrandingAction} className="card" style={{padding:24,display:"grid",gap:18}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16}}>
        <label>Emri i klinikës<input name="clinicName" defaultValue={data?.clinic_name||""}/></label>
        <label>Emri i profesionistit<input name="clinicianName" defaultValue={data?.clinician_name||""}/></label>
        <label>Titulli profesional<input name="professionalTitle" defaultValue={data?.professional_title||""} placeholder="Fizioterapeut i licencuar"/></label>
        <label>Telefoni<input name="phone" defaultValue={data?.phone||""}/></label>
        <label>Email<input name="email" type="email" defaultValue={data?.email||""}/></label>
        <label>Website<input name="website" defaultValue={data?.website||""}/></label>
      </div>
      <label>Adresa<input name="address" defaultValue={data?.address||""}/></label>
      <label><span style={{display:"flex",gap:8,alignItems:"center"}}><ImageIcon size={17}/> URL e logos</span><input name="logoUrl" type="url" defaultValue={data?.logo_url||""} placeholder="https://.../logo.png"/><small>Përdor një PNG/WebP të qartë me sfond transparent.</small></label>
      <label>Teksti në fund të raportit<textarea name="reportFooter" rows={3} defaultValue={data?.report_footer||""} placeholder="Ky plan është përgatitur individualisht..."/></label>
      <div style={{display:"flex",gap:24,flexWrap:"wrap"}}><label><input type="checkbox" name="showExerciseImages" defaultChecked={data?.show_exercise_images!==false}/> Shfaq fotografitë e ushtrimeve</label><label><input type="checkbox" name="showQrCode" defaultChecked={data?.show_qr_code!==false}/> Shfaq QR code</label></div>
      <button className="button" type="submit">Ruaj personalizimin</button>
    </form>
  </main>;
}
