"use client";

import { Printer } from "lucide-react";

export function PrintReportButton(){
  return <button className="button" type="button" onClick={()=>window.print()}><Printer size={17}/> Printo / Ruaj PDF</button>;
}
