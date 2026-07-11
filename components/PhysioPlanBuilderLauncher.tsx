"use client";

import { usePathname } from "next/navigation";

export function PhysioPlanBuilderLauncher() {
  const pathname = usePathname();
  if (!pathname.startsWith("/physiotherapist-portal") || pathname.includes("/plan-builder")) return null;

  return (
    <a className="physio-plan-builder-launcher" href="/physiotherapist-portal/plan-builder" aria-label="Hap Clinical Plan Builder">
      <span>＋</span>
      <b>Krijo plan</b>
      <small>Sugjerime klinike · PT aprovon</small>
    </a>
  );
}
