import type { ReactNode } from "react";
import styles from "./RouteState.module.css";

type RouteStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  status?: "loading" | "error" | "neutral";
  children?: ReactNode;
};

export function RouteState({
  eyebrow,
  title,
  description,
  status = "neutral",
  children,
}: RouteStateProps) {
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <section
      className={styles.shell}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-busy={isLoading}
    >
      <div className={[styles.card, isError ? styles.error : ""].filter(Boolean).join(" ")}>
        <span className={styles.icon} aria-hidden="true">{isError ? "!" : isLoading ? "…" : "✓"}</span>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {isLoading && (
          <div className={styles.skeleton} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </section>
  );
}
