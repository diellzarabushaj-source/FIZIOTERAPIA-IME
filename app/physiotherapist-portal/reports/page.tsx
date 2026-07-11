import Link from "next/link";
import { FileText, Palette, QrCode, Search } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type SearchParams = Promise<Record<string,string|string[]|undefined>>;
type Patient = { id:string; first_name:string; last_name:string|null; diagnosis:string|null; patient_code:string; updated_at:string|null };
function one(value:string|string[]|undefined){ return Array.isArray(value)?value[0]||"":value||""; }
function name(patient:Patient){ return `${patient.first_name} ${patient.last_name||""}`.trim(); }

export default async function ReportsPage({searchParams}:{searchParams:SearchParams}){
  const params = await searchParams;
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if(!supabase) throw new Error("Supabase nuk është konfiguruar.");
  const search = one(params.q).trim().slice(0,100);
  let query = supabase.from("patients")
    .select("id,first_name,last_name,diagnosis,patient_code,updated_at")
    .eq("status","active").is("archived_at",null)
    .order("updated_at",{ascending:false}).limit(100);
  if(actor.role === "physio") query = query.eq("physio_id",actor.profileId);
  if(search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_code.ilike.%${search}%`);
  const {data,error}=await query.returns<Patient[]>();
  if(error) throw new Error("Raportet nuk mund të ngarkohen.");
  const patients=data||[];
  return <main style={{maxWidth:1200,margin:"0 auto",padding:"28px 20px 80px"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"end",flexWrap:"wrap",marginBottom:24}}>
      <div><span className="badge"><FileText size={15}/> Qendra e raporteve</span><h1>Raporte të personalizuara për pacientin</h1><p>Logo, të dhënat e klinikës, ushtrimet, fotografitë, QR dhe kodi i hyrjes në një dokument.</p></div>
      <Link className="button secondary" href="/physiotherapist-portal/settings/branding"><Palette size={17}/> Personalizo raportin</Link>
    </header>
    <form className="card" style={{padding:16,display:"flex",gap:10,marginBottom:20}}><Search size={20}/><input name="q" defaultValue={search} placeholder="Kërko pacient ose kod..." style={{border:0,outline:0,flex:1,fontSize:16}}/><button className="button" type="submit">Kërko</button></form>
    <section style={{display:"grid",gap:12}}>
      {patients.map(patient=><article className="card" key={patient.id} style={{padding:18,display:"flex",justifyContent:"space-between",gap:18,alignItems:"center",flexWrap:"wrap"}}>
        <div><h2 style={{margin:"0 0 5px"}}>{name(patient)}</h2><p style={{margin:0}}>{patient.diagnosis||"Pa diagnozë të shënuar"}</p><small style={{display:"inline-flex",gap:6,alignItems:"center",marginTop:7}}><QrCode size={14}/> Kodi: <strong>{patient.patient_code}</strong></small></div>
        <div style={{display:"flex",gap:10}}><Link className="button secondary" href={`/physiotherapist-portal/patients/${patient.id}`}>Kartela</Link><Link className="button" href={`/physiotherapist-portal/reports/${patient.id}`}>Krijo raportin</Link></div>
      </article>)}
      {!patients.length&&<div className="card" style={{padding:28,textAlign:"center"}}>Nuk u gjet asnjë pacient.</div>}
    </section>
  </main>;
}
