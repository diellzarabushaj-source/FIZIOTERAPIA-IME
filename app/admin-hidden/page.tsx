import { redirect } from "next/navigation";

export default function AdminHiddenPage() {
  redirect("/admin-dashboard");
}
