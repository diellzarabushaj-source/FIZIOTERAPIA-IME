import Link from "next/link";
import { CalendarDays, CheckCircle2, CreditCard, LifeBuoy, Users } from "@/components/LucideIcons";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  FREE_PATIENT_LIMIT,
  PHYSIO_MONTHLY_PRICE_LABEL,
  getBillingStatusLabel,
  hasActiveSubscription,
  isOwnerRole,
} from "@/lib/billing";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type SubscriptionRow = {
  status: string;
  plan_name: string | null;
  price: number | null;
  currency: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
};

function formatDate(value: string | null): string {
  if (!value) return "Pa periudhë aktive";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pa periudhë aktive";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Belgrade",
  }).format(date);
}

function priceLabel(subscription: SubscriptionRow | null) {
  if (subscription?.price != null) {
    return `${Number(subscription.price).toFixed(2)} ${subscription.currency || "EUR"} / muaj`;
  }
  return PHYSIO_MONTHLY_PRICE_LABEL;
}

export default async function BillingPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const [subscriptionResult, patientCountResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status,plan_name,price,currency,trial_ends_at,current_period_end")
      .eq("physio_id", actor.profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>(),
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("physio_id", actor.profileId),
  ]);

  if (subscriptionResult.error) throw new Error("Abonimi nuk mund të ngarkohet.");
  if (patientCountResult.error) throw new Error("Përdorimi i pacientëve nuk mund të ngarkohet.");

  const subscription = subscriptionResult.data || null;
  const patientCount = patientCountResult.count ?? 0;
  const administrative = isOwnerRole(actor.role);
  const subscribed = hasActiveSubscription(actor.role, subscription);
  const freeRemaining = Math.max(0, FREE_PATIENT_LIMIT - patientCount);
  const periodEnd = subscription?.current_period_end || subscription?.trial_ends_at || null;

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Llogaria dhe abonimi</span>
          <h1>Pagesat</h1>
          <p>Pesë pacientët e parë janë falas. Abonimi kërkohet vetëm kur dëshiron të shtosh pacientin e gjashtë.</p>
        </div>
        <Link className={styles.secondary} href="/support"><LifeBuoy size={17} aria-hidden="true" /> Mbështetja</Link>
      </header>

      <section className={styles.grid} aria-label="Statusi i abonimit">
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Statusi</span><span className={styles.statIcon}><CheckCircle2 size={18} aria-hidden="true" /></span></div>
          <strong>{administrative ? "Administrativ" : subscribed ? "Abonim aktiv" : "Plani falas"}</strong>
          <small>{administrative ? "Pa kufizim pacientësh." : getBillingStatusLabel(subscription)}</small>
        </article>

        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Përdorimi</span><span className={styles.statIcon}><Users size={18} aria-hidden="true" /></span></div>
          <strong>{administrative || subscribed ? `${patientCount} pacientë` : `${patientCount} / ${FREE_PATIENT_LIMIT}`}</strong>
          <small>{administrative || subscribed ? "Nuk aplikohet kufiri falas." : freeRemaining ? `${freeRemaining} vende falas të mbetura.` : "Vendet falas janë përdorur."}</small>
        </article>

        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Çmimi</span><span className={styles.statIcon}><CreditCard size={18} aria-hidden="true" /></span></div>
          <strong>{priceLabel(subscription)}</strong>
          <small>{subscription?.plan_name || "Professional"} · pagesa aktivizohet manualisht për momentin.</small>
        </article>

        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Periudha</span><span className={styles.statIcon}><CalendarDays size={18} aria-hidden="true" /></span></div>
          <strong>{formatDate(periodEnd)}</strong>
          <small>{subscribed ? "Data e përfundimit të periudhës aktuale." : "Nuk ka pagesë aktive."}</small>
        </article>
      </section>

      {!administrative && !subscribed && (
        <section className={styles.section}>
          <div className={freeRemaining > 0 ? styles.successMessage : styles.errorMessage} role="status">
            <strong>
              {freeRemaining > 0
                ? `Mund të shtosh edhe ${freeRemaining} ${freeRemaining === 1 ? "pacient" : "pacientë"} falas.`
                : `Ke përdorur ${FREE_PATIENT_LIMIT} pacientët falas.`}
            </strong>
            <span>
              Të gjitha funksionet për pacientët ekzistues, planet, seancat dhe raportet mbeten të hapura. Vetëm krijimi i pacientit të gjashtë kërkon abonim.
            </span>
            {freeRemaining === 0 && <Link className={styles.primary} href="/support">Kërko aktivizimin e abonimit</Link>}
          </div>
        </section>
      )}
    </>
  );
}
