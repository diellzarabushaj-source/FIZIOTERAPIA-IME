import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (clerkConfigured) {
    const { userId } = await auth();
    if (userId) redirect("/auth/continue");
  }

  return (
    <main className="auth-page">
      <div className="auth-card-large">
        <span className="badge">Fizioterapia ime</span>
        <h1>Hyr në llogari</h1>
        <p>Qasje e sigurt për fizioterapeutë dhe administrim të praktikës.</p>
        {clerkConfigured ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/auth/continue"
            signUpFallbackRedirectUrl="/auth/continue"
          />
        ) : (
          <div className="role-warning">
            Clerk është shtuar në kod, por mungojnë Vercel Environment Variables.
            Shto NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY dhe CLERK_SECRET_KEY për ta aktivizuar login-in.
          </div>
        )}
      </div>
    </main>
  );
}
