"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  if (!clerkConfigured) {
    return (
      <div className="auth-controls">
        <Link className="auth-button auth-button-secondary" href="/sign-in">Hyr</Link>
        <Link className="auth-button" href="/sign-up">Fillo</Link>
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <Link className="auth-button auth-button-secondary" href="/sign-in">Hyr</Link>
        <Link className="auth-button" href="/sign-up">Fillo</Link>
      </Show>
      <Show when="signed-in">
        <div className="signed-in-pill" aria-label="Llogaria e kyçur">
          <Link href="/auth/continue">Hape dashboard-in</Link>
          <UserButton />
        </div>
      </Show>
    </div>
  );
}
