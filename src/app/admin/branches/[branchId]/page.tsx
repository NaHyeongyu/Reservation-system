import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { getBranchStatusTone } from "@/features/branch-admin/server/workspace";
import { getBranchDetailForAdmin, listBranchAdminAssignments } from "@/features/branches/server/branches";
import { BranchAdminCreateForm } from "./_components/BranchAdminCreateForm";

type AdminBranchDetailPageProps = {
  params: Promise<{ branchId: string }>;
  searchParams?: Promise<{ created?: string; adminCreated?: string }>;
};

export default async function AdminBranchDetailPage({ params, searchParams }: AdminBranchDetailPageProps) {
  const routeParams = await params;
  const query = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();

  if (admin.role !== "super_admin") {
    redirect("/admin/branch-settings");
  }

  const branch = await getBranchDetailForAdmin(admin, routeParams.branchId);

  if (!branch) {
    notFound();
  }

  const branchAdmins = await listBranchAdminAssignments(routeParams.branchId);

  return (
    <AdminConsoleLayout
      currentPath="/admin/branches"
      title={branch.name}
      description="지점 상세"
      loginId={admin.loginId}
      role={admin.role}
      actions={<Link href="/admin/branches" className="inline-flex items-center justify-center rounded-[16px] border border-[#2b3947] bg-[#0b1218] px-4 py-3 text-sm font-semibold text-[#dfe8ef] transition hover:border-[#7ad0ff] hover:text-white">목록으로</Link>}
      notice={query?.created === "1" ? <InlineNotice>지점 생성이 완료되었습니다.</InlineNotice> : query?.adminCreated === "1" ? <InlineNotice>지점 관리자 계정 생성이 완료되었습니다.</InlineNotice> : null}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="상태" value={branch.status} tone={getBranchStatusTone(branch.status)} />
        <MetricCard label="관리자" value={String(branchAdmins.length)} />
        <MetricCard label="전화번호" value={branch.phone ?? "-"} />
        <MetricCard label="업데이트" value={formatDate(branch.updated_at)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Branch</p>
          <div className="mt-5 space-y-4">
            <ProfileRow label="지점명" value={branch.name} />
            <ProfileRow label="전화번호" value={branch.phone ?? "-"} />
            <ProfileRow label="주소" value={branch.address ?? "-"} />
            <ProfileRow label="인스타그램" value={branch.instagram_url ?? "-"} />
          </div>
        </article>

        <BranchAdminCreateForm branchId={branch.id} />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#17212b] px-6 py-5">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Operators</p>
          <h3 className="mt-2 text-xl font-semibold text-white">관리자</h3>
        </div>

        <div className="space-y-3 p-4">
          {branchAdmins.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">연결된 관리자가 없습니다.</div>
          ) : (
            branchAdmins.map((assignment) => (
              <div key={assignment.adminUserId} className="flex items-center justify-between rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4">
                <div>
                  <p className="text-base font-semibold text-white">{assignment.loginId}</p>
                  <p className="mt-1 text-sm text-[#8ea1b2]">{assignment.role}</p>
                </div>
                <span className="rounded-full border border-[#285c43] bg-[#0f2018] px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase text-[#8ee2b4]">{assignment.status}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminConsoleLayout>
  );
}

function InlineNotice({ children }: { children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-[#2b5878] bg-[#0d1c27] px-5 py-4 text-sm leading-7 text-[#d9f1ff]">{children}</section>;
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.2)]">
      <p className="font-mono text-[11px] tracking-[0.24em] text-[#7c95a8] uppercase">{label}</p>
      {tone ? <span className={`mt-4 inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{value}</span> : <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>}
    </article>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4"><p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
