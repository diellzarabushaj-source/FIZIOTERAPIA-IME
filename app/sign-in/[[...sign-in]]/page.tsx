import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="auth-page">
      <div className="auth-card-large">
        <span className="badge">FizioPlan</span>
        <h1>Hyr në llogari</h1>
        <p>Qasje për fizioterapeutë dhe administrim të platformës.</p>
        {clerkConfigured ? (
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        ) : (
          <div className="role-warning">
            Clerk eshte shtuar ne kod, por mungojne Vercel Environment Variables.
            Shto NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY dhe CLERK_SECRET_KEY per ta aktivizuar login-in.
          </div>
        )}
      </div>
    </main>
  );
}
