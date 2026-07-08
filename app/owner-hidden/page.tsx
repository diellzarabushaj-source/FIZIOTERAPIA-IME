import { redirect } from "next/navigation";

export default function OwnerHiddenPage() {
  redirect("/admin-hidden");
}
