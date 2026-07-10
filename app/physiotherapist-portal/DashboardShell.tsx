import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";
import { PhysioDashboardNav } from "@/components/PhysioDashboardNav";
import { requirePhysioActor } from "@/lib/backend/access";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const actor = await requirePhysioActor();
  const user = await currentUser();
  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut";

  return (
    <div className="pd-shell">
      <aside className="pd-sidebar">
        <div className="pd-brand">
          <strong>Fizioterapia ime</strong>
          <small>Menaxhimi klinik</small>
        </div>

        <PhysioDashboardNav />

        <div className="pd-sidebar-foot">
          <p>{displayName}</p>
          <small>{actor.role === "owner" ? "Administrator" : "Fizioterapeut"}</small>
        </div>
      </aside>

      <div className="pd-workspace">
        <header className="pd-topbar">
          <div className="pd-topbar-title">
            <strong>Dashboard klinik</strong>
            <small>Pacientë, seanca dhe programe në një vend</small>
          </div>
          <AuthControls />
        </header>
        <main className="pd-content">{children}</main>
      </div>
    </div>
  );
}
