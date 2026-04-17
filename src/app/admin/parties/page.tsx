import Link from "next/link";
import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  formatConsoleDate,
  formatConsoleTime,
  getBranchWorkspace,
  getPartyStatusLabel,
  getPartyStatusTone,
  listBranchParties,
} from "@/features/branch-admin/server/workspace";

type AdminPartiesPageProps = {
  searchParams?: Promise<{ created?: string; deleted?: string }>;
};

export default async function AdminPartiesPage({ searchParams }: AdminPartiesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const parties = await listBranchParties(branch.id, 50);

  const publishedCount = parties.filter((party) => party.status === "published").length;
  const draftCount = parties.filter((party) => party.status === "draft").length;
  const closedCount = parties.filter((party) => party.status === "closed").length;

  return (
    <AdminConsoleLayout
      currentPath="/admin/parties"
      title="파티"
      description={branch.name}
      loginId={admin.loginId}
      role={admin.role}
      notice={
        params?.created === "1" ? (
          <AdminFlashNotice
            tone="info"
            message="파티 생성이 완료되었습니다."
            clearKeys={["created", "date"]}
          />
        ) : params?.deleted === "1" ? (
          <AdminFlashNotice
            tone="info"
            message="파티를 삭제했습니다."
            clearKeys={["deleted"]}
          />
        ) : null
      }
      actions={<Link href="/admin/calendar" className="inline-flex w-full items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">파티 생성</Link>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="전체" value={String(parties.length)} />
        <MetricCard label="게시" value={String(publishedCount)} />
        <MetricCard label="초안" value={String(draftCount)} />
        <MetricCard label="마감" value={String(closedCount)} />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#17212b] px-6 py-5">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Parties</p>
          <h3 className="mt-2 text-xl font-semibold text-white">파티 목록</h3>
        </div>

        {parties.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#8ea1b2]">등록된 파티가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm text-[#d9e2ea]">
              <thead>
                <tr className="border-b border-[#17212b] bg-[#0d151d] text-[11px] tracking-[0.18em] text-[#7990a3] uppercase">
                  <th className="px-6 py-4 font-medium">파티명</th>
                  <th className="px-4 py-4 font-medium">상태</th>
                  <th className="px-4 py-4 font-medium">날짜</th>
                  <th className="px-4 py-4 font-medium">시간</th>
                  <th className="px-4 py-4 font-medium">인원</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party.id} className="border-b border-[#131c25] last:border-b-0">
                    <td className="px-6 py-4 font-semibold text-white"><Link href={`/admin/parties/${party.id}?from=parties`} className="transition hover:text-[#9fdcff]">{party.title}</Link></td>
                    <td className="px-4 py-4">
                      <StatusPill tone={getPartyStatusTone(party.status)}>
                        {getPartyStatusLabel(party.status)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-4 text-[#a8bac8]">{formatConsoleDate(party.start_at)}</td>
                    <td className="px-4 py-4 text-[#a8bac8]">{formatConsoleTime(party.start_at)}</td>
                    <td className="px-4 py-4 text-[#a8bac8]">남 {party.male_capacity} / 여 {party.female_capacity}</td>
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
