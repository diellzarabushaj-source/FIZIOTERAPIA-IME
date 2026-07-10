import type { ReactNode } from "react";

export function PageSection({
  eyebrow,
  title,
  text,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: ReactNode;
  tone?: "default" | "soft" | "dark";
}) {
  return (
    <section className={`pp-section pp-section-${tone}`}>
      <div className="pp-container">
        <div className="pp-section-head">
          {eyebrow && <span>{eyebrow}</span>}
          <h2>{title}</h2>
          {text && <p>{text}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="pp-card pp-reveal">
      <div className="pp-card-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function StepCard({ number, icon, title, text }: { number: string; icon: string; title: string; text: string }) {
  return (
    <article className="pp-step pp-reveal">
      <span className="pp-step-number">{number}</span>
      <div className="pp-card-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function SafetyNotice({ title, text }: { title: string; text: string }) {
  return (
    <aside className="pp-safety" role="note">
      <span aria-hidden="true">🛡️</span>
      <div><h3>{title}</h3><p>{text}</p></div>
    </aside>
  );
}

export function CTASection({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <section className="pp-cta pp-reveal">
      <div><span>Fizioterapia Ime</span><h2>{title}</h2><p>{text}</p></div>
      <a href={href}>{label} →</a>
    </section>
  );
}

export function FAQList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="pp-faq-list">
      {items.map((item) => (
        <details className="pp-faq" key={item.question}>
          <summary>{item.question}<span aria-hidden="true">+</span></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
