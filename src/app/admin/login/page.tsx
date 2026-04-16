import { redirect } from "next/navigation";
import { getCurrentAdminContext } from "@/features/admin-auth/server/admin-context";
import { AdminLoginForm } from "./_components/AdminLoginForm";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    disabled?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const admin = await getCurrentAdminContext();
  const params = searchParams ? await searchParams : undefined;

  if (admin?.status === "active") {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#04080d] px-4 py-10">
      <div className="grid w-full max-w-[920px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[30px] border border-[#1c2733] bg-[radial-gradient(circle_at_top_left,rgba(122,208,255,0.18),transparent_34%),#0b141d] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Admin</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-white">Access</h2>
          </div>
        </section>

        <div className="space-y-4">
          {params?.disabled === "1" ? (
            <div className="rounded-[18px] border border-[#5a2430] bg-[#1a0d12] px-4 py-3 text-sm text-[#ffd7de]">
              비활성화된 계정입니다.
            </div>
          ) : null}
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
