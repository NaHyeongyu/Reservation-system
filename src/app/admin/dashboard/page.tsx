import Link from "next/link";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  formatConsoleDateTime,
  getApplicantStatusTone,
  getBranchDashboardSnapshot,
  getBranchStatusTone,
  getPartyStatusTone,
  getBranchWorkspace,
} from "@/features/branch-admin/server/workspace";
import { listBranchesForAdmin } from "@/features/branches/server/branches";

type AdminDashboardPageProps = {
  searchParams?: Promise<{
    created?: string;
    denied?: string;
  }>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();

  if (admin.role === "branch_admin") {
    const branch = await getBranchWorkspace(admin);
    const snapshot = await getBranchDashboardSnapshot(branch.id);

    return (
      <AdminConsoleLayout
        currentPath="/admin/dashboard"
        title={branch.name}
        description="지점 운영 워크스페이스"
        loginId={admin.loginId}
        role={admin.role}
        notice={
          params?.denied === "1" ? <InlineNotice tone="danger">접근 권한이 없습니다.</InlineNotice> : null
        }
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="파티" value={String(snapshot.totalParties)} />
          <MetricCard label="예정" value={String(snapshot.upcomingParties)} />
          <MetricCard label="신청" value={String(snapshot.totalApplicants)} />
          <MetricCard label="대기" value={String(snapshot.pendingApplicants)} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between border-b border-[#17212b] px-6 py-5">
              <div>
                <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Upcoming</p>
                <h3 className="mt-2 text-xl font-semibold text-white">예정 파티</h3>
              </div>
              <Link href="/admin/parties" className="text-sm font-semibold text-[#9fdcff] transition hover:text-white">
                전체 보기
              </Link>
            </div>

            <div className="space-y-3 p-4">
              {snapshot.upcomingPartyRows.length === 0 ? (
                <EmptyBlock>등록된 파티가 없습니다.</EmptyBlock>
              ) : (
                snapshot.upcomingPartyRows.map((party) => (
                  <div
                    key={party.id}
                    className="grid gap-3 rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.2em] text-[#6f8598] uppercase">START</p>
                      <p className="mt-2 text-sm font-semibold text-white">{formatConsoleDateTime(party.start_at)}</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{party.title}</p>
                      <p className="mt-2 text-sm text-[#8ea1b2]">남 {party.male_capacity} / 여 {party.female_capacity}</p>
                    </div>
                    <StatusPill tone={getPartyStatusTone(party.status)}>{party.status}</StatusPill>
                  </div>
                ))
              )}
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Branch</p>
              <div className="mt-5 space-y-4">
                <InfoRow label="전화번호" value={branch.phone ?? "-"} />
                <InfoRow label="주소" value={branch.address ?? "-"} />
                <InfoRow label="상태" value={branch.status} />
                <InfoRow label="인스타그램" value={branch.instagram_url ?? "-"} />
              </div>
            </article>

            <article className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between border-b border-[#17212b] px-6 py-5">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Applicants</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">최근 신청</h3>
                </div>
                <Link href="/admin/applicants" className="text-sm font-semibold text-[#9fdcff] transition hover:text-white">
                  전체 보기
                </Link>
              </div>

              <div className="space-y-3 p-4">
                {snapshot.recentApplicantRows.length === 0 ? (
                  <EmptyBlock>신청 내역이 없습니다.</EmptyBlock>
                ) : (
                  snapshot.recentApplicantRows.map((applicant) => (
                    <div key={applicant.id} className="rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{applicant.reserver_name}</p>
                          <p className="mt-1 text-sm text-[#8ea1b2]">{applicant.party_title ?? "미지정 파티"}</p>
                        </div>
                        <StatusPill tone={getApplicantStatusTone(applicant.status)}>{applicant.status}</StatusPill>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>
      </AdminConsoleLayout>
    );
  }

  const branches = await listBranchesForAdmin(admin);
  const activeBranchCount = branches.filter((branch) => branch.status === "active").length;
  const inactiveBranchCount = branches.filter((branch) => branch.status === "inactive").length;
  const archivedBranchCount = branches.filter((branch) => branch.status === "archived").length;
  const totalAssignedAdminCount = branches.reduce((total, branch) => total + branch.assignedAdminCount, 0);

  return (
    <AdminConsoleLayout
      currentPath="/admin/dashboard"
      title="전 지점 상황"
      description="지점 운영 현황"
      loginId={admin.loginId}
      role={admin.role}
      notice={
        params?.created === "1" ? (
          <InlineNotice tone="info">초기 관리자 계정 생성이 완료되었습니다.</InlineNotice>
        ) : params?.denied === "1" ? (
          <InlineNotice tone="danger">접근 권한이 없습니다.</InlineNotice>
        ) : null
      }
      actions={
        <Link
          href="/admin/branches/new"
          className="inline-flex items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]"
        >
          지점 신규 등록
        </Link>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="지점" value={String(branches.length)} />
        <MetricCard label="활성" value={String(activeBranchCount)} />
        <MetricCard label="비활성" value={String(inactiveBranchCount + archivedBranchCount)} />
        <MetricCard label="관리자" value={String(totalAssignedAdminCount)} />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between border-b border-[#17212b] px-6 py-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Branches</p>
            <h3 className="mt-2 text-xl font-semibold text-white">지점 목록</h3>
          </div>
          <Link href="/admin/branches" className="text-sm font-semibold text-[#9fdcff] transition hover:text-white">
            전체 보기
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm text-[#d9e2ea]">
            <thead>
              <tr className="border-b border-[#17212b] bg-[#0d151d] text-[11px] tracking-[0.18em] text-[#7990a3] uppercase">
                <th className="px-6 py-4 font-medium">지점명</th>
                <th className="px-4 py-4 font-medium">상태</th>
                <th className="px-4 py-4 font-medium">관리자</th>
                <th className="px-4 py-4 font-medium">전화번호</th>
                <th className="px-4 py-4 font-medium">주소</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-b border-[#131c25] last:border-b-0">
                  <td className="px-6 py-4 font-semibold text-white">
                    <Link href={`/admin/branches/${branch.id}`} className="transition hover:text-[#9fdcff]">
                      {branch.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill tone={getBranchStatusTone(branch.status)}>{branch.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4 text-[#a8bac8]">{branch.assignedAdminCount}</td>
                  <td className="px-4 py-4 text-[#a8bac8]">{branch.phone ?? "-"}</td>
                  <td className="px-4 py-4 text-[#a8bac8]">{branch.address ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminConsoleLayout>
  );
}

function InlineNotice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "danger" }) {
  return (
    <section className={tone === "danger" ? "rounded-[24px] border border-[#5a2430] bg-[#1a0d12] px-5 py-4 text-sm leading-7 text-[#ffd7de]" : "rounded-[24px] border border-[#2b5878] bg-[#0d1c27] px-5 py-4 text-sm leading-7 text-[#d9f1ff]"}>
      {children}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.2)]">
      <p className="font-mono text-[11px] tracking-[0.24em] text-[#7c95a8] uppercase">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p>
    </article>
  );
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">{children}</div>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{children}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
