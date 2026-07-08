"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  if (!clerkConfigured) {
    return (
      <div className="auth-controls">
        <a className="auth-button auth-button-secondary" href="/sign-in">Hyr</a>
        <a className="auth-button" href="/sign-up">Krijo llogari</a>
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="auth-button auth-button-secondary">Hyr</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="auth-button">Krijo llogari</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <div className="signed-in-pill">
          <span>Llogaria aktive</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}
