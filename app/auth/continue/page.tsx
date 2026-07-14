import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/backend/access";
import { getWorkspaceHome } from "@/lib/backend/workspace-routing";

export default async function ContinueAfterAuthenticationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/auth/continue");
  }

  let actor = null;
  let lookupFailed = false;

  try {
    actor = await getActorContext();
  } catch {
    lookupFailed = true;
  }

  if (lookupFailed) {
    redirect("/account-access?reason=temporarily-unavailable");
  }

  if (!actor) {
    redirect("/account-access?reason=profile-not-active");
  }

  redirect(getWorkspaceHome(actor.role));
}
