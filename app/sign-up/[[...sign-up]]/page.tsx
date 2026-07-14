import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (clerkConfigured) {
    const { userId } = await auth();
    if (userId) redirect("/auth/continue");
  }

  return (
    <main className="auth-page">
      <div className="auth-card-large">
        <span className="badge">FizioPlan</span>
        <h1>Krijo llogari</h1>
        <p>Llogari për fizioterapeutë, owner/admin dhe ekipin klinik.</p>
        {clerkConfigured ? (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/auth/continue"
          />
        ) : (
          <div className="role-warning">
            Clerk eshte shtuar ne kod, por mungojne Vercel Environment Variables.
            Shto NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY dhe CLERK_SECRET_KEY per ta aktivizuar sign-up.
          </div>
        )}
      </div>
    </main>
  );
}
