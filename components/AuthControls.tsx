"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function AuthControls() {
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
