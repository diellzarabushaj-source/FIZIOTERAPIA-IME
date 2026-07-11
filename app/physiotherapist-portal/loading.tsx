import { RouteState } from "@/components/RouteState";

export default function PhysiotherapistPortalLoading() {
  return (
    <RouteState
      eyebrow="Hapësira klinike"
      title="Po ngarkohen të dhënat…"
      description="Pacientët, planet dhe sinjalet klinike po përgatiten. Mos e rifresko faqen gjatë këtij hapi."
      status="loading"
    />
  );
}
