import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  Library,
  Plus,
  Sparkles,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { listExercisesForActor } from "@/lib/backend/exercises";
import { listPatientsForActor } from "@/lib/backend/patients";
import {
  templateExerciseNamesAvailable,
  templatesForDiagnosis,
} from "@/lib/clinical-program-matching";
import { createDraftPlanAction } from "../actions";
import { createPlanFromTemplateAction } from "./actions";
import styles from "../../dashboard.module.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function patientName(patient: { first_name: string; last_name: string | null }): string {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function maskedPatientCode(code: string): string {
  return code.length > 8 ? `${code.slice(0, 5)}…${code.slice(-4)}` : `${code.slice(0, 3)}…`;
}

export default async function NewPlanChoicePage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const requestedPatientId = one(params.patientId).slice(0, 80);

  const patientsResult = await listPatientsForActor(actor);
  if (patientsResult.ok === false) throw new Error(patientsResult.error.message);

  const patients = patientsResult.data.filter(
    (patient) => patient.status === "active" && !patient.archived_at,
  );
  const patient = requestedPatientId
    ? patients.find((item) => item.id === requestedPatientId) || null
    : null;
  if (requestedPatientId && !patient) notFound();

  const matchingTemplates = patient ? templatesForDiagnosis(patient.diagnosis) : [];
  let availableTemplates = matchingTemplates;
  if (patient && matchingTemplates.length) {
    const exerciseResult = await listExercisesForActor(actor);
    if (exerciseResult.ok === false) throw new Error(exerciseResult.error.message);
    const exerciseNames = exerciseResult.data.map((exercise) => exercise.name);
    availableTemplates = matchingTemplates.filter((template) =>
      templateExerciseNamesAvailable(template, exerciseNames),
    );
  }

  const defaultTitle = patient?.diagnosis
    ? `Plan rehabilitimi · ${patient.diagnosis}`
    : "Plan rehabilitimi i personalizuar";

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Krijo plan</span>
          <h1>{patient ? `Plani për ${patientName(patient)}` : "Zgjidh pacientin"}</h1>
          <p>
            Fizioterapeuti vendos: e krijon planin vet nga zero ose përdor një plan të gatshëm kur ekziston për diagnozën.
          </p>
        </div>
        <div className={styles.actions}>
          <Link
            className={styles.secondary}
            href={patient ? `/physiotherapist-portal/patients/${patient.id}/program` : "/physiotherapist-portal/programs"}
          >
            <ArrowLeft size={17} aria-hidden="true" /> Kthehu
          </Link>
        </div>
      </header>

      {!patient && (
        <section className={styles.builderPanel}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Hapi 1</span>
              <h2>Zgjidh pacientin</h2>
              <p>Diagnoza e kartelës përdoret për të kontrolluar nëse ekziston plan i gatshëm.</p>
            </div>
          </div>
          <form method="get" className={styles.formGrid}>
            <label className={[styles.field, styles.full].join(" ")}>
              <span>Pacienti</span>
              <select name="patientId" required defaultValue="">
                <option value="">Zgjidh pacientin</option>
                {patients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {patientName(item)} · {maskedPatientCode(item.patient_code)}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.field}>
              <button className={styles.primary} type="submit">
                Vazhdo <Plus size={17} aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      )}

      {patient && (
        <>
          <section className={styles.patientHeader}>
            <div>
              <span className={styles.eyebrow}>Konteksti klinik</span>
              <h2>{patientName(patient)}</h2>
              <div className={styles.meta}>
                <span>Diagnoza: {patient.diagnosis || "Nuk është shënuar"}</span>
                <span>Kodi: {maskedPatientCode(patient.patient_code)}</span>
              </div>
            </div>
            <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}`}>
              Hape kartelën
            </Link>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Zgjidh mënyrën</span>
                <h2>Si dëshiron ta krijosh planin?</h2>
                <p>Të dy mënyrat përfundojnë si draft privat dhe mund të editohen para aktivizimit.</p>
              </div>
            </div>

            <div className={styles.programGrid}>
              <article className={styles.programCard}>
                <div>
                  <div className={styles.badgeRow}>
                    <span className={styles.privateBadge}>Kontroll i plotë</span>
                  </div>
                  <FilePlus2 size={28} aria-hidden="true" />
                  <h3>Krijoje vet nga zero</h3>
                  <p>Zgjidh ushtrimet nga biblioteka, cakto dozën, ditët dhe extra notes sipas pacientit.</p>
                </div>

                <form action={createDraftPlanAction} className={styles.formGrid}>
                  <input type="hidden" name="patientId" value={patient.id} />
                  <label className={[styles.field, styles.full].join(" ")}>
                    <span>Titulli i planit</span>
                    <input name="title" required defaultValue={defaultTitle} maxLength={180} />
                  </label>
                  <label className={styles.field}>
                    <span>Kohëzgjatja</span>
                    <input name="durationDays" type="number" min={1} max={90} defaultValue={14} required />
                    <small className={styles.fieldHint}>1–90 ditë</small>
                  </label>
                  <div className={styles.field}>
                    <button className={styles.primary} type="submit">
                      <Plus size={17} aria-hidden="true" /> Krijo draft bosh
                    </button>
                  </div>
                </form>
              </article>

              <article className={styles.programCard}>
                <div>
                  <div className={styles.badgeRow}>
                    <span className={styles.defaultBadge}>Kursen kohë</span>
                  </div>
                  <Library size={28} aria-hidden="true" />
                  <h3>Zgjidh plan të gatshëm</h3>
                  <p>Shfaqet vetëm kur ekziston plan i plotë për diagnozën dhe ushtrimet janë në bibliotekë.</p>
                </div>
                <div className={styles.meta}>
                  <span>{availableTemplates.length} plane të përshtatshme</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Planet ekzistuese</span>
                <h2>Plane të gatshme për këtë diagnozë</h2>
                <p>Pas zgjedhjes hapet editori: mund të heqësh, shtosh ose ndryshosh çdo ushtrim dhe shënim.</p>
              </div>
              <span className={styles.defaultBadge}>{availableTemplates.length} në dispozicion</span>
            </div>

            {availableTemplates.length ? (
              <div className={styles.programGrid}>
                {availableTemplates.map((template) => (
                  <article className={styles.programCard} key={template.key}>
                    <div>
                      <div className={styles.badgeRow}>
                        <span className={styles.defaultBadge}>{template.durationDays} ditë</span>
                        <span className={styles.statusReview}>{template.exercises.length} ushtrime</span>
                      </div>
                      <Sparkles size={25} aria-hidden="true" />
                      <h3>{template.title}</h3>
                      <p>{template.shortDescription}</p>
                      <div className={styles.programMeta}>
                        <span>{template.diagnosisLabel}</span>
                        <span>Gjithmonë i editueshëm para aktivizimit</span>
                      </div>
                    </div>
                    <form action={createPlanFromTemplateAction}>
                      <input type="hidden" name="patientId" value={patient.id} />
                      <input type="hidden" name="templateKey" value={template.key} />
                      <button className={styles.primary} type="submit">
                        <ClipboardList size={17} aria-hidden="true" /> Përdor këtë plan
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <CheckCircle2 size={30} aria-hidden="true" />
                <h3>Nuk ka plan të gatshëm të plotë për këtë diagnozë</h3>
                <p>
                  {matchingTemplates.length
                    ? "Ekziston një model, por disa ushtrime mungojnë në bibliotekë. Për momentin krijoje planin vet."
                    : "Krijoje planin vet nga zero. Kur të shtohet modeli për këtë diagnozë, do të shfaqet automatikisht këtu."}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
