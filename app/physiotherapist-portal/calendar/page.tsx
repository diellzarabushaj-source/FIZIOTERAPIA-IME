import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { CLINIC_TIME_ZONE } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Session = { id:string; patient_id:string; session_date:string; status:string; pain_before:number|null; pain_after:number|null };
type Patient = { id:string; first_name:string; last_name:string|null; diagnosis:string|null };

function one(value:string|string[]|undefined){ return Array.isArray(value) ? value[0] || "" : value || ""; }
function monthKey(date:Date){ return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}`; }
function fullName(patient?:Patient){ return patient ? `${patient.first_name} ${patient.last_name || ""}`.trim() : "Pacient"; }
function statusLabel(status:string){ return status === "completed" ? "E përfunduar" : status === "in_progress" ? "Në zhvillim" : status === "cancelled" ? "E anuluar" : "E planifikuar"; }

export default async function CalendarPage({ searchParams }:{ searchParams:SearchParams }){
  const params = await searchParams;
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if(!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const requested = /^\d{4}-\d{2}$/.test(one(params.month)) ? one(params.month) : monthKey(new Date());
  const [year, month] = requested.split("-").map(Number);
  const start = new Date(Date.UTC(year, month-1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const previous = monthKey(new Date(Date.UTC(year, month-2, 1)));
  const next = monthKey(new Date(Date.UTC(year, month, 1)));

  let query = supabase.from("patient_sessions")
    .select("id,patient_id,session_date,status,pain_before,pain_after")
    .gte("session_date", start.toISOString())
    .lt("session_date", end.toISOString())
    .order("session_date", { ascending:true });
  if(actor.role === "physio") query = query.eq("physio_id", actor.profileId);
  const { data:rows, error } = await query.returns<Session[]>();
  if(error) throw new Error("Kalendari nuk mund të ngarkohet.");
  const sessions = rows || [];

  const ids = [...new Set(sessions.map(item => item.patient_id))];
  let patients:Patient[] = [];
  if(ids.length){
    let patientQuery = supabase.from("patients").select("id,first_name,last_name,diagnosis").in("id", ids);
    if(actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);
    const result = await patientQuery.returns<Patient[]>();
    patients = result.data || [];
  }
  const patientMap = new Map(patients.map(item => [item.id,item]));
  const firstWeekday = (start.getUTCDay()+6)%7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone:CLINIC_TIME_ZONE, year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
  const title = new Intl.DateTimeFormat("sq-AL", { timeZone:"UTC", month:"long", year:"numeric" }).format(start);
  const byDay = new Map<string,Session[]>();
  sessions.forEach(session => {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone:CLINIC_TIME_ZONE, year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date(session.session_date));
    byDay.set(key, [...(byDay.get(key)||[]), session]);
  });

  return <main style={{maxWidth:1400,margin:"0 auto",padding:"28px 20px 80px"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"end",marginBottom:24,flexWrap:"wrap"}}>
      <div><span className="badge"><CalendarDays size={15}/> Kalendari klinik</span><h1 style={{marginBottom:8}}>Sot, javët dhe pacientët në një pamje</h1><p style={{margin:0}}>Data e sotme theksohet automatikisht sipas zonës kohore të klinikës.</p></div>
      <div style={{display:"flex",gap:10}}><Link className="button secondary" href={`/physiotherapist-portal/calendar?month=${previous}`}><ChevronLeft size={17}/> Muaji i kaluar</Link><Link className="button secondary" href={`/physiotherapist-portal/calendar?month=${next}`}>Muaji tjetër <ChevronRight size={17}/></Link></div>
    </header>

    <section className="card" style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{margin:0,textTransform:"capitalize"}}>{title}</h2><strong>{sessions.length} seanca</strong></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:8}}>
        {["Hën","Mar","Mër","Enj","Pre","Sht","Die"].map(day => <div key={day} style={{fontWeight:900,padding:"10px 8px",textAlign:"center",color:"#64748b"}}>{day}</div>)}
        {Array.from({length:firstWeekday}).map((_,index)=><div key={`blank-${index}`} />)}
        {Array.from({length:daysInMonth},(_,index)=>index+1).map(day => {
          const key = `${requested}-${String(day).padStart(2,"0")}`;
          const items = byDay.get(key)||[];
          const isToday = key === today;
          return <article key={key} style={{minHeight:150,border:isToday?"2px solid #2563eb":"1px solid #e2e8f0",borderRadius:16,padding:12,background:isToday?"#eff6ff":"#fff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><strong style={{fontSize:18}}>{day}</strong>{isToday&&<span style={{fontSize:12,fontWeight:900,color:"#1d4ed8"}}>SOT</span>}</div>
            <div style={{display:"grid",gap:8}}>{items.slice(0,3).map(session => {
              const patient = patientMap.get(session.patient_id);
              const time = new Intl.DateTimeFormat("sq-AL", { timeZone:CLINIC_TIME_ZONE, hour:"2-digit", minute:"2-digit" }).format(new Date(session.session_date));
              return <Link key={session.id} href={`/physiotherapist-portal/patients/${session.patient_id}?sessionId=${session.id}#session-form`} style={{display:"grid",gap:3,padding:8,borderRadius:10,background:"#f8fafc",textDecoration:"none"}}><span style={{display:"flex",gap:6,alignItems:"center",fontWeight:900}}><Clock3 size={14}/>{time}</span><span style={{display:"flex",gap:6,alignItems:"center",fontSize:13}}><UserRound size={13}/>{fullName(patient)}</span><small>{statusLabel(session.status)}</small></Link>
            })}{items.length>3&&<small>+{items.length-3} seanca të tjera</small>}</div>
          </article>;
        })}
      </div>
    </section>
  </main>;
}
