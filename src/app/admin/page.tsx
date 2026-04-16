import { redirect } from "next/navigation";
import { getCurrentAdminContext } from "@/features/admin-auth/server/admin-context";
import { hasAnyAdminUsers } from "@/features/admin-auth/server/register-admin";

export default async function AdminEntryPage() {
  const admin = await getCurrentAdminContext();

  if (admin?.status === "active") {
    redirect("/admin/dashboard");
  }

  if (await hasAnyAdminUsers()) {
    redirect("/admin/login");
  }

  redirect("/admin/signup");
}
