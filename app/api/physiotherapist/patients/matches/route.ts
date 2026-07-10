import { NextRequest, NextResponse } from "next/server";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type PatientCandidate = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  diagnosis: string | null;
  status: string | null;
};

type MatchKind = "exact" | "possible";

type PatientMatch = {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  phone: string | null;
  diagnosis: string | null;
  status: string | null;
  kind: MatchKind;
  reason: string;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sq-AL")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const upper = previous[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + cost);
      diagonal = upper;
    }
  }

  return 1 - previous[b.length] / longest;
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requirePhysioActor();
    const firstName = request.nextUrl.searchParams.get("firstName")?.trim() || "";
    const lastName = request.nextUrl.searchParams.get("lastName")?.trim() || "";
    const dateOfBirth = request.nextUrl.searchParams.get("dateOfBirth")?.trim() || "";
    const phone = request.nextUrl.searchParams.get("phone")?.trim() || "";

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ matches: [] satisfies PatientMatch[] });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Databaza nuk është konfiguruar." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("patients")
      .select("id,first_name,last_name,date_of_birth,phone,diagnosis,status")
      .eq("physio_id", actor.profileId)
      .is("archived_at", null)
      .limit(100)
      .returns<PatientCandidate[]>();

    if (error) {
      return NextResponse.json({ error: "Pacientët nuk mund të kontrollohen tani." }, { status: 500 });
    }

    const normalizedFirstName = normalizeText(firstName);
    const normalizedLastName = normalizeText(lastName);
    const normalizedPhone = normalizePhone(phone);

    const matches = (data || [])
      .map((candidate): PatientMatch | null => {
        const candidateFirstName = normalizeText(candidate.first_name);
        const candidateLastName = normalizeText(candidate.last_name || "");
        const candidatePhone = normalizePhone(candidate.phone || "");
        const firstSimilarity = similarity(normalizedFirstName, candidateFirstName);
        const lastSimilarity = similarity(normalizedLastName, candidateLastName);
        const namesExact = normalizedFirstName === candidateFirstName && normalizedLastName === candidateLastName;
        const birthExact = Boolean(dateOfBirth && candidate.date_of_birth === dateOfBirth);
        const phoneExact = Boolean(normalizedPhone.length >= 7 && candidatePhone === normalizedPhone);

        if (namesExact && birthExact) {
          return {
            id: candidate.id,
            fullName: `${candidate.first_name} ${candidate.last_name || ""}`.trim(),
            dateOfBirth: candidate.date_of_birth,
            phone: candidate.phone,
            diagnosis: candidate.diagnosis,
            status: candidate.status,
            kind: "exact",
            reason: "Emri, mbiemri dhe datëlindja përputhen plotësisht.",
          };
        }

        const namesVerySimilar = firstSimilarity >= 0.82 && lastSimilarity >= 0.82;
        const possible = phoneExact || (birthExact && namesVerySimilar) || (namesExact && !birthExact);
        if (!possible) return null;

        const reason = phoneExact
          ? "Numri i telefonit përputhet me një kartelë ekzistuese."
          : birthExact
            ? "Datëlindja është e njëjtë dhe emri është shumë i ngjashëm."
            : "Emri dhe mbiemri përputhen; kontrollo datëlindjen.";

        return {
          id: candidate.id,
          fullName: `${candidate.first_name} ${candidate.last_name || ""}`.trim(),
          dateOfBirth: candidate.date_of_birth,
          phone: candidate.phone,
          diagnosis: candidate.diagnosis,
          status: candidate.status,
          kind: "possible",
          reason,
        };
      })
      .filter((match): match is PatientMatch => Boolean(match))
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "exact" ? -1 : 1))
      .slice(0, 5);

    return NextResponse.json(
      { matches },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Nuk ke qasje për këtë kontroll." }, { status: 401 });
  }
}
