"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  if (!clerkConfigured) {
    return (
      <div className="auth-controls">
        <Link className="auth-button auth-button-secondary" href="/physiotherapist-portal">Hyr</Link>
        <Link className="auth-button" href="/physiotherapist-portal">Fillo</Link>
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="auth-button auth-button-secondary">Hyr</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="auth-button">Fillo</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <div className="signed-in-pill" aria-label="Llogaria e kyçur">
          <span>Llogaria aktive</span>
          <UserButton />
        </div>
      </Show>
    </div>
  );
}
