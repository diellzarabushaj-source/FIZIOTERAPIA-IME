import { NextResponse } from "next/server";
import { requirePhysioActor } from "@/lib/backend/access";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PatientMatchRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  diagnosis: string | null;
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

export async function POST(request: Request) {
  try {
    const actor = await requirePhysioActor();
    const body = await request.json().catch(() => ({}));
    const firstName = cleanText(body?.firstName, 80);
    const lastName = cleanText(body?.lastName, 80);
    const dateOfBirth = cleanText(body?.dateOfBirth, 10);
    const phone = cleanText(body?.phone, 40);

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ exact: null, possible: [] });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Databaza nuk është e disponueshme." }, { status: 503 });
    }

    let query = supabase
      .from("patients")
      .select("id,first_name,last_name,date_of_birth,phone,diagnosis,status")
      .eq("physio_id", actor.profileId)
      .is("archived_at", null)
      .limit(25);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      query = query.or(`date_of_birth.eq.${dateOfBirth},first_name.ilike.%${firstName.replace(/[%_,]/g, "")}%`);
    } else {
      query = query.ilike("first_name", `%${firstName.replace(/[%_,]/g, "")}%`);
    }

    const { data, error } = await query.returns<PatientMatchRow[]>();
    if (error) {
      return NextResponse.json({ error: "Kontrolli i pacientit dështoi." }, { status: 500 });
    }

    const normalizedFirst = normalize(firstName);
    const normalizedLast = normalize(lastName);
    const normalizedPhone = normalizePhone(phone);

    const scored = (data || []).map((patient) => {
      const sameFirst = normalize(patient.first_name) === normalizedFirst;
      const sameLast = normalize(patient.last_name) === normalizedLast;
      const sameBirth = Boolean(dateOfBirth && patient.date_of_birth === dateOfBirth);
      const samePhone = Boolean(
        normalizedPhone.length >= 7 && normalizePhone(patient.phone).length >= 7 && normalizePhone(patient.phone) === normalizedPhone,
      );
      const exact = sameFirst && sameLast && sameBirth;
      const score = Number(sameFirst) + Number(sameLast) + Number(sameBirth) * 2 + Number(samePhone) * 2;
      return { patient, exact, score, samePhone, sameBirth };
    });

    const exact = scored.find((item) => item.exact)?.patient || null;
    const possible = scored
      .filter((item) => !item.exact && item.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ patient, samePhone, sameBirth }) => ({
        ...patient,
        reasons: [sameBirth ? "datëlindje e njëjtë" : null, samePhone ? "telefon i njëjtë" : null].filter(Boolean),
      }));

    return NextResponse.json(
      { exact, possible },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Nuk je i autorizuar." }, { status: 401 });
  }
}
