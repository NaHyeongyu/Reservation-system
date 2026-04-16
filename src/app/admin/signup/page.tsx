import { redirect } from "next/navigation";
import { getCurrentAdminContext } from "@/features/admin-auth/server/admin-context";
import { hasAnyAdminUsers } from "@/features/admin-auth/server/register-admin";
import { AdminSignupForm } from "./_components/AdminSignupForm";

export default async function AdminSignupPage() {
  const admin = await getCurrentAdminContext();

  if (admin?.status === "active") {
    redirect("/admin/dashboard");
  }

  if (await hasAnyAdminUsers()) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#04080d] px-4 py-10">
      <div className="grid w-full max-w-[920px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[30px] border border-[#1c2733] bg-[radial-gradient(circle_at_top_left,rgba(122,208,255,0.18),transparent_34%),#0b141d] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Admin</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-white">Setup</h2>
          </div>
        </section>

        <AdminSignupForm />
      </div>
    </main>
  );
}
