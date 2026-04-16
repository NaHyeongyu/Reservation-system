import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { formatConsoleDateTime, getApplicantStatusTone, getBranchWorkspace, listBranchApplicants } from "@/features/branch-admin/server/workspace";

export default async function AdminApplicantsPage() {
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const applicants = await listBranchApplicants(branch.id, 60);

  const pendingCount = applicants.filter((item) => item.status === "pending").length;
  const confirmedCount = applicants.filter((item) => item.status === "confirmed").length;
  const waitlistedCount = applicants.filter((item) => item.status === "waitlisted").length;

  return (
    <AdminConsoleLayout currentPath="/admin/applicants" title="신청자" description={branch.name} loginId={admin.loginId} role={admin.role}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="전체" value={String(applicants.length)} />
        <MetricCard label="대기" value={String(pendingCount)} />
        <MetricCard label="확정" value={String(confirmedCount)} />
        <MetricCard label="웨이팅" value={String(waitlistedCount)} />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#17212b] px-6 py-5">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Applicants</p>
          <h3 className="mt-2 text-xl font-semibold text-white">신청 목록</h3>
        </div>

        {applicants.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#8ea1b2]">신청 내역이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm text-[#d9e2ea]">
              <thead>
                <tr className="border-b border-[#17212b] bg-[#0d151d] text-[11px] tracking-[0.18em] text-[#7990a3] uppercase">
                  <th className="px-6 py-4 font-medium">이름</th>
                  <th className="px-4 py-4 font-medium">파티</th>
                  <th className="px-4 py-4 font-medium">전화번호</th>
                  <th className="px-4 py-4 font-medium">인원</th>
                  <th className="px-4 py-4 font-medium">상태</th>
                  <th className="px-4 py-4 font-medium">접수</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <tr key={applicant.id} className="border-b border-[#131c25] last:border-b-0">
                    <td className="px-6 py-4"><p className="font-semibold text-white">{applicant.reserver_name}</p><p className="mt-1 text-xs text-[#8ea1b2]">{applicant.reservation_code}</p></td>
                    <td className="px-4 py-4 text-[#a8bac8]">{applicant.party_title ?? "-"}</td>
                    <td className="px-4 py-4 text-[#a8bac8]">{applicant.reserver_phone}</td>
                    <td className="px-4 py-4 text-[#a8bac8]">{applicant.participant_count}</td>
                    <td className="px-4 py-4"><StatusPill tone={getApplicantStatusTone(applicant.status)}>{applicant.status}</StatusPill></td>
                    <td className="px-4 py-4 text-[#a8bac8]">{formatConsoleDateTime(applicant.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminConsoleLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.2)]"><p className="font-mono text-[11px] tracking-[0.24em] text-[#7c95a8] uppercase">{label}</p><p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p></article>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{children}</span>;
}
