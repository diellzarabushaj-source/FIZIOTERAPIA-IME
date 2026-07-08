import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-card-large">
        <span className="badge">FizioPlan</span>
        <h1>Krijo llogari</h1>
        <p>Llogari për fizioterapeutë, owner/admin dhe ekipin klinik.</p>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </main>
  );
}
