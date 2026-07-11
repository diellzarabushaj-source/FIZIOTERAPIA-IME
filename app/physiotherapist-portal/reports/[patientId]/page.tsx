import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, CalendarDays, KeyRound, QrCode } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PrintReportButton } from "./PrintReportButton";

type Params=Promise<{patientId:string}>;
type Patient={id:string;physio_id:string|null;first_name:string;last_name:string|null;diagnosis:string|null;patient_code:string};
type Plan={id:string;title:string;start_date:string|null;end_date:string|null;status:string};
type Exercise={id:string;sets:number|null;reps:number|null;frequency:string|null;instructions:string|null;exercise_library:{name:string;instructions_sq:string|null;video_url:string|null}|null};
type Branding={clinic_name:string|null;clinician_name:string|null;professional_title:string|null;logo_url:string|null;phone:string|null;email:string|null;address:string|null;website:string|null;report_footer:string|null;show_exercise_images:boolean;show_qr_code:boolean};

function fullName(patient:Patient){return `${patient.first_name} ${patient.last_name||""}`.trim();}
function dateLabel(value:string|null){if(!value)return "—";return new Intl.DateTimeFormat("sq-AL",{day:"2-digit",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T12:00:00Z`));}
function dose(item:Exercise){const parts=[];if(item.sets)parts.push(`${item.sets} sete`);if(item.reps)parts.push(`${item.reps} përsëritje`);if(item.frequency)parts.push(item.frequency);return parts.join(" · ")||"Sipas udhëzimit";}

export default async function PatientReportPage({params}:{params:Params}){
  const {patientId}=await params;
  const actor=await requirePhysioActor();
  const supabase=getSupabaseAdmin();
  if(!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let patientQuery=supabase.from("patients").select("id,physio_id,first_name,last_name,diagnosis,patient_code").eq("id",patientId).eq("status","active");
  if(actor.role==="physio") patientQuery=patientQuery.eq("physio_id",actor.profileId);
  const {data:patient}=await patientQuery.maybeSingle<Patient>();
  if(!patient) notFound();

  let planQuery=supabase.from("plans").select("id,title,start_date,end_date,status").eq("patient_id",patient.id).in("status",["active","approved","pending_review","draft"]).order("updated_at",{ascending:false}).limit(1);
  if(actor.role==="physio") planQuery=planQuery.eq("physio_id",actor.profileId);
  const {data:plans}=await planQuery.returns<Plan[]>();
  const plan=plans?.[0]||null;

  let exercises:Exercise[]=[];
  if(plan){
    const result=await supabase.from("plan_exercises").select("id,sets,reps,frequency,instructions,exercise_library(name,instructions_sq,video_url)").eq("plan_id",plan.id).order("day_number",{ascending:true}).returns<Exercise[]>();
    exercises=result.data||[];
  }

  const {data:branding}=await supabase.from("clinic_branding").select("clinic_name,clinician_name,professional_title,logo_url,phone,email,address,website,report_footer,show_exercise_images,show_qr_code").eq("physio_id",actor.profileId).maybeSingle<Branding>();
  const appUrl=(process.env.NEXT_PUBLIC_APP_URL||"https://fizioterapia-ime.vercel.app").replace(/\/$/,"");
  const patientUrl=`${appUrl}/patient-portal?code=${encodeURIComponent(patient.patient_code)}`;
  const qrDataUrl=branding?.show_qr_code===false?null:await QRCode.toDataURL(patientUrl,{width:280,margin:1,errorCorrectionLevel:"M"});
  const generatedAt=new Intl.DateTimeFormat("sq-AL",{day:"2-digit",month:"long",year:"numeric"}).format(new Date());

  return <main style={{background:"#eef2f7",minHeight:"100vh",padding:"24px 12px 60px"}}>
    <div className="report-toolbar" style={{maxWidth:980,margin:"0 auto 16px",display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><Link className="button secondary" href="/physiotherapist-portal/reports"><ArrowLeft size={17}/> Raportet</Link><PrintReportButton/></div>
    <article className="report-sheet" style={{maxWidth:980,margin:"0 auto",background:"white",padding:42,borderRadius:20,boxShadow:"0 18px 60px rgba(15,23,42,.12)"}}>
      <header style={{display:"grid",gridTemplateColumns:"1fr auto",gap:28,alignItems:"start",borderBottom:"2px solid #e2e8f0",paddingBottom:24}}>
        <div style={{display:"flex",gap:18,alignItems:"center"}}>{branding?.logo_url&&<img src={branding.logo_url} alt={`Logo ${branding.clinic_name||"e klinikës"}`} style={{width:92,height:92,objectFit:"contain"}}/>}<div><span style={{fontWeight:900,color:"#2563eb",letterSpacing:".08em",textTransform:"uppercase",fontSize:12}}>Plan fizioterapeutik</span><h1 style={{margin:"7px 0 6px"}}>{branding?.clinic_name||"Fizioterapia Ime"}</h1><p style={{margin:0}}>{branding?.clinician_name||"Fizioterapeuti përgjegjës"}{branding?.professional_title?` · ${branding.professional_title}`:""}</p></div></div>
        <div style={{textAlign:"right",fontSize:13,lineHeight:1.6}}>{branding?.phone&&<div>{branding.phone}</div>}{branding?.email&&<div>{branding.email}</div>}{branding?.address&&<div>{branding.address}</div>}{branding?.website&&<div>{branding.website}</div>}</div>
      </header>

      <section style={{display:"grid",gridTemplateColumns:"1fr auto",gap:26,padding:"26px 0",borderBottom:"1px solid #e2e8f0"}}>
        <div><h2 style={{margin:"0 0 10px"}}>{fullName(patient)}</h2><p><strong>Gjendja:</strong> {patient.diagnosis||"Nuk është shënuar"}</p><p><strong>Plani:</strong> {plan?.title||"Nuk ka plan aktiv"}</p><p style={{display:"flex",gap:8,alignItems:"center"}}><CalendarDays size={17}/><strong>Periudha:</strong> {dateLabel(plan?.start_date||null)} – {dateLabel(plan?.end_date||null)}</p><p><strong>Raporti u krijua:</strong> {generatedAt}</p></div>
        <div style={{display:"flex",gap:18,alignItems:"center"}}>{qrDataUrl&&<img src={qrDataUrl} alt="QR code për hapjen e planit të pacientit" style={{width:132,height:132}}/>}<div style={{minWidth:160}}><span style={{display:"flex",gap:7,alignItems:"center",fontSize:12,fontWeight:900,textTransform:"uppercase",color:"#64748b"}}><KeyRound size={15}/> Kodi i hyrjes</span><strong style={{display:"block",fontSize:26,letterSpacing:".08em",margin:"8px 0"}}>{patient.patient_code}</strong><small>Skano QR ose hyr në website dhe shkruaj kodin.</small></div></div>
      </section>

      <section style={{paddingTop:26}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,marginBottom:18}}><div><span style={{fontWeight:900,color:"#2563eb",fontSize:12,textTransform:"uppercase"}}>Programi</span><h2 style={{margin:"5px 0 0"}}>Ushtrimet e përshkruara</h2></div><span style={{fontWeight:800}}>{exercises.length} ushtrime</span></div>
        <div style={{display:"grid",gap:14}}>{exercises.map((item,index)=>{
          const media=item.exercise_library?.video_url||null;
          return <article key={item.id} style={{display:"grid",gridTemplateColumns:branding?.show_exercise_images===false?"48px 1fr":"48px 120px 1fr",gap:16,alignItems:"center",padding:16,border:"1px solid #e2e8f0",borderRadius:14,breakInside:"avoid"}}><strong style={{width:38,height:38,borderRadius:999,display:"grid",placeItems:"center",background:"#eff6ff",color:"#1d4ed8"}}>{index+1}</strong>{branding?.show_exercise_images!==false&&<div style={{width:120,height:90,borderRadius:10,background:"#f8fafc",display:"grid",placeItems:"center",overflow:"hidden"}}>{media?<img src={media} alt={`Pamje e ushtrimit ${item.exercise_library?.name||""}`} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<QrCode size={28}/>}</div>}<div><h3 style={{margin:"0 0 6px"}}>{item.exercise_library?.name||"Ushtrim"}</h3><p style={{margin:"0 0 6px",fontWeight:800}}>{dose(item)}</p><p style={{margin:0}}>{item.instructions||item.exercise_library?.instructions_sq||"Ndiq udhëzimin e fizioterapeutit."}</p></div></article>})}{!exercises.length&&<div style={{padding:24,border:"1px dashed #cbd5e1",borderRadius:14}}>Nuk ka ushtrime në planin e zgjedhur.</div>}</div>
      </section>

      <footer style={{marginTop:30,paddingTop:20,borderTop:"1px solid #e2e8f0",fontSize:12,color:"#64748b",display:"flex",justifyContent:"space-between",gap:20}}><p style={{margin:0}}>{branding?.report_footer||"Ky plan është përgatitur individualisht. Pacienti duhet t’i ndjekë udhëzimet dhe ta kontaktojë fizioterapeutin nëse simptomat përkeqësohen."}</p><span style={{whiteSpace:"nowrap"}}>Fizioterapia Ime</span></footer>
    </article>
    <style>{`@media print{body{background:white!important}.report-toolbar{display:none!important}.report-sheet{box-shadow:none!important;border-radius:0!important;max-width:none!important;padding:18mm!important} @page{size:A4;margin:0}} @media(max-width:760px){.report-sheet{padding:22px!important}.report-sheet header,.report-sheet section{grid-template-columns:1fr!important}}`}</style>
  </main>;
}
