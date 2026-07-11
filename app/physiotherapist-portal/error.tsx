"use client";

import Link from "next/link";
import { RouteState } from "@/components/RouteState";

export default function PhysiotherapistPortalError({ reset }: { reset: () => void }) {
  return (
    <RouteState
      eyebrow="Hapësira klinike"
      title="Të dhënat nuk u ngarkuan"
      description="Asnjë ndryshim nuk u ruajt nga kjo faqe. Provo përsëri; nëse problemi vazhdon, kontrollo readiness-in e databazës."
      status="error"
    >
      <button type="button" onClick={reset}>Provo përsëri</button>
      <Link href="/physiotherapist-portal/overview">Kthehu te përmbledhja</Link>
    </RouteState>
  );
}
