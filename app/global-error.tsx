"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/sentry-monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void captureException(error, {
      mechanism: "react_global_error_boundary",
      route: typeof window !== "undefined" ? window.location.pathname : "unknown-route",
      tags: { digest: error.digest || "none" },
    });
  }, [error]);

  return (
    <html lang="sq">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f8f7", color: "#102033" }}>
          <section style={{ width: "min(100%, 560px)", padding: 28, borderRadius: 24, background: "white", border: "1px solid #dfe9e5", boxShadow: "0 18px 50px rgba(16,32,51,.08)", textAlign: "center" }}>
            <h1 style={{ marginTop: 0 }}>Diçka nuk shkoi siç duhet</h1>
            <p style={{ color: "#607681", lineHeight: 1.6 }}>Gabimi u regjistrua automatikisht. Provo përsëri pa humbur të dhënat e ruajtura.</p>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 48, border: 0, borderRadius: 14, padding: "0 20px", background: "#16764f", color: "white", fontWeight: 800, cursor: "pointer" }}
            >
              Provo përsëri
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
