import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { PhysioDashboardNav } from "@/components/PhysioDashboardNav";
import { PhysioGlobalSearch } from "@/components/PhysioGlobalSearch";
import { PhysioQuickActions } from "@/components/PhysioQuickActions";
import { requirePhysioActor } from "@/lib/backend/access";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const actor = await requirePhysioActor();
  const user = await currentUser();
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Fizioterapeut";
  const roleLabel = actor.role === "owner"
    ? "Administrator"
    : actor.role === "admin"
      ? "Menaxher klinik"
      : "Fizioterapeut";

  return (
    <div className="pd-shell">
      <a className="pd-skip-link" href="#clinical-main-content">Kalo te përmbajtja</a>

      <aside className="pd-sidebar" aria-label="Navigimi klinik">
        <div className="pd-brand">
          <BrandMark href="/physiotherapist-portal/overview" />
          <small>Paneli i fizioterapeutit</small>
        </div>

        <PhysioDashboardNav />

        <div className="pd-sidebar-foot">
          <div className="pd-user-avatar" aria-hidden="true">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p title={displayName}>{displayName}</p>
            <small>{roleLabel}</small>
          </div>
        </div>
      </aside>

      <div className="pd-workspace">
        <header className="pd-topbar">
          <div className="pd-topbar-search"><PhysioGlobalSearch /></div>
          <div className="pd-topbar-actions">
            <PhysioQuickActions />
            <AuthControls />
          </div>
        </header>
        <main id="clinical-main-content" className="pd-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
