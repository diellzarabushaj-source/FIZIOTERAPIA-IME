import Link from "next/link";
import { CalendarDays, CheckCircle2, CreditCard, LifeBuoy } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { hasActivePhysioAccess } from "@/lib/billing";
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
  if (!value) return "Pa datë";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BillingPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("status,plan_name,price,currency,trial_ends_at,current_period_end")
    .eq("physio_id", actor.profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRow>();

  if (error) throw new Error("Abonimi nuk mund të ngarkohet.");
  const active = hasActivePhysioAccess(actor.role, subscription);

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Llogaria dhe abonimi</span>
          <h1>Pagesat</h1>
          <p>Status i qartë i qasjes në dashboard dhe periudha aktuale e abonimit.</p>
        </div>
        <Link className={styles.secondary} href="/support"><LifeBuoy size={17} /> Mbështetja</Link>
      </header>

      <section className={styles.quickGrid}>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Statusi</span><span className={styles.statIcon}><CheckCircle2 size={18} /></span></div>
          <strong>{active ? "Aktiv" : "Joaktiv"}</strong>
          <small>{actor.role === "owner" || actor.role === "admin" ? "Qasje administrative." : subscription?.status || "Pa abonim"}</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Plani</span><span className={styles.statIcon}><CreditCard size={18} /></span></div>
          <strong>{subscription?.plan_name || "Professional"}</strong>
          <small>{subscription?.price ? subscription.price + " " + (subscription.currency || "EUR") + " / muaj" : "29.90 EUR / muaj"}</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Periudha</span><span className={styles.statIcon}><CalendarDays size={18} /></span></div>
          <strong>{formatDate(subscription?.current_period_end || subscription?.trial_ends_at || null)}</strong>
          <small>Kontakto mbështetjen për faturë ose ndryshim të planit.</small>
        </article>
      </section>

      {!active && (
        <section className={styles.section}>
          <div className={styles.errorMessage}>
            <strong>Qasja në krijimin e planeve është e kufizuar.</strong>
            <span>Kontakto ekipin për aktivizim ose verifikim të pagesës.</span>
            <Link className={styles.primary} href="/support">Kërko aktivizim</Link>
          </div>
        </section>
      )}
    </>
  );
}
