import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-card-large">
        <span className="badge">FizioPlan</span>
        <h1>Hyr në llogari</h1>
        <p>Qasje për fizioterapeutë dhe administrim të platformës.</p>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    </main>
  );
}
