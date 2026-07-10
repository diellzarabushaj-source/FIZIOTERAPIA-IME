import { NextResponse } from "next/server";
import { requirePhysioActor } from "@/lib/backend/access";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

type PatientCandidate = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  status: string | null;
};

function normalize(value: unknown): string {
  return cleanText(value, 120)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sq-AL")
    .replace(/[^a-z0-9]/g, "");
}

function normalizePhone(value: unknown): string {
  return cleanText(value, 40).replace(/\D/g, "");
}

function editDistance(left: string, right: string): number {
  if (!left) return right.length;
  if (!right) return left.length;
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

function isClose(left: string, right: string): boolean {
  if (!left || !right) return false;
  if (left === right) return true;
  const maxLength = Math.max(left.length, right.length);
  return editDistance(left, right) <= (maxLength <= 5 ? 1 : 2);
}

export async function POST(request: Request) {
  try {
    const actor = await requirePhysioActor();
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = normalize(body.firstName);
    const lastName = normalize(body.lastName);
    const dateOfBirth = cleanText(body.dateOfBirth, 10);
    const phone = normalizePhone(body.phone);

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ exact: null, similar: [] }, { headers: privateNoStoreHeaders });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Kontrolli nuk është i disponueshëm për momentin." },
        { status: 503, headers: privateNoStoreHeaders },
      );
    }

    const { data, error } = await supabase
      .from("patients")
      .select("id,first_name,last_name,date_of_birth,phone,status")
      .eq("physio_id", actor.profileId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(500)
      .returns<PatientCandidate[]>();

    if (error) {
      return NextResponse.json(
        { error: "Pacientët nuk mund të kontrollohen." },
        { status: 500, headers: privateNoStoreHeaders },
      );
    }

    const matches = (data || []).map((patient) => {
      const candidateFirst = normalize(patient.first_name);
      const candidateLast = normalize(patient.last_name);
      const candidatePhone = normalizePhone(patient.phone);
      const exactIdentity =
        candidateFirst === firstName &&
        candidateLast === lastName &&
        Boolean(dateOfBirth) &&
        patient.date_of_birth === dateOfBirth;
      const samePhone = phone.length >= 7 && candidatePhone === phone;
      const closeName = isClose(candidateFirst, firstName) && isClose(candidateLast, lastName);
      const sameBirthDate = Boolean(dateOfBirth) && patient.date_of_birth === dateOfBirth;
      const score = exactIdentity ? 100 : (samePhone ? 50 : 0) + (closeName ? 35 : 0) + (sameBirthDate ? 25 : 0);
      return { patient, exactIdentity, score };
    });

    const exactMatch = matches.find((item) => item.exactIdentity)?.patient || null;
    const similar = matches
      .filter((item) => !item.exactIdentity && item.score >= 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ patient }) => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name || "",
        dateOfBirth: patient.date_of_birth,
        phone: patient.phone,
        status: patient.status,
      }));

    return NextResponse.json(
      {
        exact: exactMatch
          ? {
              id: exactMatch.id,
              firstName: exactMatch.first_name,
              lastName: exactMatch.last_name || "",
              dateOfBirth: exactMatch.date_of_birth,
              phone: exactMatch.phone,
              status: exactMatch.status,
            }
          : null,
        similar,
      },
      { headers: privateNoStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: "Nuk ke qasje për këtë kontroll." },
      { status: 401, headers: privateNoStoreHeaders },
    );
  }
}
