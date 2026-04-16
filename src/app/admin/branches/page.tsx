import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { getBranchStatusTone } from "@/features/branch-admin/server/workspace";
import { listBranchesForAdmin } from "@/features/branches/server/branches";

export default async function AdminBranchesPage() {
  const admin = await requireAdminContext();

  if (admin.role !== "super_admin") {
    redirect("/admin/branch-settings");
  }

  const branches = await listBranchesForAdmin(admin);

  return (
    <AdminConsoleLayout
      currentPath="/admin/branches"
      title="지점"
      description="전 지점 운영 목록"
      loginId={admin.loginId}
      role={admin.role}
      actions={
        <Link
          href="/admin/branches/new"
          className="inline-flex items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]"
        >
          지점 생성
        </Link>
      }
    >
      <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#17212b] px-6 py-5">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Branches</p>
          <h3 className="mt-2 text-xl font-semibold text-white">지점 목록</h3>
        </div>

        {branches.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#8ea1b2]">등록된 지점이 없습니다.</div>
        ) : (
          <div className="space-y-3 p-4">
            {branches.map((branch) => (
              <Link key={branch.id} href={`/admin/branches/${branch.id}`} className="flex flex-col gap-3 rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4 transition hover:border-[#2f5c82] md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-white">{branch.name}</p>
                  <p className="mt-1 text-sm text-[#8ea1b2]">{branch.address ?? "-"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill tone={getBranchStatusTone(branch.status)}>{branch.status}</StatusPill>
                  <span className="text-sm text-[#a8bac8]">관리자 {branch.assignedAdminCount}</span>
                  <span className="text-sm text-[#a8bac8]">{branch.phone ?? "-"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AdminConsoleLayout>
  );
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{children}</span>;
}
