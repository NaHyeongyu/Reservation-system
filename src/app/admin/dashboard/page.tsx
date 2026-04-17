import Link from "next/link";
import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { BranchDashboardCharts } from "./_components/BranchDashboardCharts";
import type {
  BranchDashboardQueueItem,
  BranchPartyItem,
} from "@/features/branch-admin/server/workspace";
import {
  formatConsoleDateTime,
  getBranchDashboardSnapshot,
  getBranchStatusLabel,
  getBranchStatusTone,
  getBranchWorkspace,
  getPartyStatusLabel,
  getPartyStatusTone,
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
    const branch = admin.currentBranch
      ? {
          id: admin.currentBranch.id,
          name: admin.currentBranch.name,
          status: admin.currentBranch.status,
          phone: admin.currentBranch.phone,
          address: admin.currentBranch.address,
          instagram_url: admin.currentBranch.instagramUrl,
        }
      : await getBranchWorkspace(admin);
    const snapshot = await getBranchDashboardSnapshot(branch.id);

    return (
      <AdminConsoleLayout
        currentPath="/admin/dashboard"
        title={branch.name}
        description="운영 대시보드"
        loginId={admin.loginId}
        role={admin.role}
        notice={
          params?.denied === "1" ? (
            <AdminFlashNotice
              tone="danger"
              message="접근 권한이 없습니다."
              clearKeys={["denied"]}
            />
          ) : null
        }
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard label="전체 예약" value={String(snapshot.totalReservations)} />
          <MetricCard label="오늘 접수" value={String(snapshot.todayReservations)} />
          <MetricCard label="확인 필요" value={String(snapshot.pendingApplicants)} />
          <MetricCard label="현재 대기" value={String(snapshot.waitlistApplicants)} />
          <MetricCard
            label="오늘 참가 / 설정"
            value={`${snapshot.todayParticipants}/${snapshot.todayCapacity}`}
            detail={`${snapshot.todayParties}개 파티`}
          />
          <MetricCard
            label="확정률"
            value={formatPercent(snapshot.confirmationRate)}
            detail={`이번주 파티 ${snapshot.weekParties}개`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <QueuePanel
            title="신청 대기"
            rows={snapshot.pendingQueueRows}
            emptyText="확인할 신청이 없습니다."
          />
          <QueuePanel
            title="대기자"
            rows={snapshot.waitlistQueueRows}
            emptyText="현재 대기자가 없습니다."
            tone="waitlist"
          />
        </section>

        <section className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between border-b border-[#17212b] px-6 py-5">
            <div>
              <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">
                Party Health
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">파티 운영 현황</h3>
            </div>
            <Link href="/admin/parties" className="text-sm font-semibold text-[#9fdcff] transition hover:text-white">
              전체 보기
            </Link>
          </div>

          {snapshot.upcomingPartyRows.length === 0 ? (
            <EmptyBlock>예정 파티가 없습니다.</EmptyBlock>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm text-[#d9e2ea]">
                <thead>
                  <tr className="border-b border-[#17212b] bg-[#0d151d] text-[11px] tracking-[0.18em] text-[#7990a3] uppercase">
                    <th className="px-6 py-4 font-medium">파티</th>
                    <th className="px-4 py-4 font-medium">시간</th>
                    <th className="px-4 py-4 font-medium">신청 / 대기</th>
                    <th className="px-4 py-4 font-medium">참가 / 설정</th>
                    <th className="px-4 py-4 font-medium">상태</th>
                    <th className="px-4 py-4 font-medium">체크</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.upcomingPartyRows.map((party) => {
                    const pendingCount = getPendingCount(party);
                    const waitlistCount = getWaitlistCount(party);
                    const participantCount = getParticipantCount(party);
                    const risk = getPartyRisk(party);

                    return (
                      <tr key={party.id} className="border-b border-[#131c25] last:border-b-0">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/parties/${party.id}?from=parties`}
                            className="font-semibold text-white transition hover:text-[#9fdcff]"
                          >
                            {party.title}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-[#a8bac8]">
                          {formatConsoleDateTime(party.start_at)}
                        </td>
                        <td className="px-4 py-4 text-[#a8bac8]">
                          {pendingCount} / {waitlistCount}
                        </td>
                        <td className="px-4 py-4 text-[#a8bac8]">
                          {participantCount} / {party.capacity}
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill tone={getPartyStatusTone(party.status)}>
                            {getPartyStatusLabel(party.status)}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4">
                          <RiskPill tone={risk.tone}>{risk.label}</RiskPill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <BranchDashboardCharts
          referralRows={snapshot.referralRows}
          genderRows={snapshot.genderRows}
          ageRows={snapshot.ageRows}
          weekdayTrend={snapshot.weekdayTrend}
          hourTrend={snapshot.hourTrend}
        />

        <section>
          <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Insight</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoRow label="평균 채움률" value={formatPercent(snapshot.averageFillRate)} />
              <InfoRow label="이번주 파티" value={`${snapshot.weekParties}개`} />
              <InfoRow label="지금 신청 대기" value={`${snapshot.pendingApplicants}명`} />
              <InfoRow label="지금 대기자" value={`${snapshot.waitlistApplicants}명`} />
            </div>
          </article>
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
          <AdminFlashNotice
            tone="info"
            message="초기 관리자 계정 생성이 완료되었습니다."
            clearKeys={["created"]}
          />
        ) : params?.denied === "1" ? (
          <AdminFlashNotice
            tone="danger"
            message="접근 권한이 없습니다."
            clearKeys={["denied"]}
          />
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
                    <StatusPill tone={getBranchStatusTone(branch.status)}>
                      {getBranchStatusLabel(branch.status)}
                    </StatusPill>
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

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.2)]">
      <p className="font-mono text-[11px] tracking-[0.24em] text-[#7c95a8] uppercase">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm text-[#7f94a7]">{detail}</p> : null}
    </article>
  );
}

function QueuePanel({
  title,
  rows,
  emptyText,
  tone = "pending",
}: {
  title: string;
  rows: BranchDashboardQueueItem[];
  emptyText: string;
  tone?: "pending" | "waitlist";
}) {
  const groups = groupQueueRowsByParty(rows);

  return (
    <article className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-[#17212b] px-6 py-5">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">
            {tone === "waitlist" ? "Waitlist" : "Pending"}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${
            tone === "waitlist"
              ? "border-[#665529] bg-[#211a0d] text-[#f0d18a]"
              : "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]"
          }`}
        >
          {rows.length}명
        </span>
      </div>

      <div className="space-y-3 p-4">
        {groups.length === 0 ? (
          <EmptyBlock>{emptyText}</EmptyBlock>
        ) : (
          groups.map((group, index) => (
            <details
              key={group.key}
              open={index === 0}
              className="group overflow-hidden rounded-[24px] border border-[#18222d] bg-[#0f1822]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[#17212b] px-4 py-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {group.partyTitle}
                  </p>
                  <p className="mt-1 text-sm text-[#8ea1b2]">
                    {group.partyStartAt ? formatConsoleDateTime(group.partyStartAt) : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#22303d] bg-[#0b141d] px-2.5 py-1 text-[10px] text-[#9db0bf]">
                    {group.rows.length}명
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#22303d] bg-[#0b141d] text-[#9fdcff] transition group-open:rotate-180">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path
                        d="M4.5 6.25L8 9.75L11.5 6.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </summary>

              <div className="space-y-2 p-3">
                {group.rows.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-[18px] border border-[#17212b] bg-[#0b141d] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <GenderBadge gender={row.applicant_gender} />
                          <p className="truncate text-sm font-semibold text-white">
                            {row.reserver_name}
                          </p>
                          <span className="rounded-full border border-[#22303d] bg-[#0f1822] px-2 py-0.5 text-[10px] text-[#9db0bf]">
                            {row.applicant_age_band}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#8ea1b2]">{row.reserver_phone}</p>
                      </div>
                      <p className="text-xs text-[#7f94a7]">
                        {formatConsoleDateTime(row.submitted_at)}
                      </p>
                    </div>
                  </article>
                ))}

                {group.partyId ? (
                  <div className="flex justify-end px-1 pt-1">
                    <Link
                      href={`/admin/parties/${group.partyId}?from=parties`}
                      className="text-sm font-semibold text-[#9fdcff] transition hover:text-white"
                    >
                      파티 상세 보기
                    </Link>
                  </div>
                ) : null}
              </div>
            </details>
          ))
        )}
      </div>
    </article>
  );
}

function groupQueueRowsByParty(rows: BranchDashboardQueueItem[]) {
  const groups = new Map<
    string,
    {
      key: string;
      partyId: string | null;
      partyTitle: string;
      partyStartAt: string | null;
      rows: BranchDashboardQueueItem[];
    }
  >();

  for (const row of rows) {
    const key = row.party_id ?? `unknown:${row.party_title ?? row.id}`;
    const current = groups.get(key) ?? {
      key,
      partyId: row.party_id,
      partyTitle: row.party_title ?? "미지정 파티",
      partyStartAt: row.party_start_at,
      rows: [],
    };
    current.rows.push(row);
    groups.set(key, current);
  }

  return [...groups.values()].sort((left, right) => {
    const leftTime = left.partyStartAt ? new Date(left.partyStartAt).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.partyStartAt ? new Date(right.partyStartAt).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">
      {children}
    </div>
  );
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{children}</span>;
}

function RiskPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${tone}`}>{children}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function GenderBadge({ gender }: { gender: BranchDashboardQueueItem["applicant_gender"] }) {
  const config =
    gender === "male"
      ? { label: "남", className: "border-[#365f8f] bg-[#0f2033] text-[#9cd2ff]" }
      : gender === "female"
        ? { label: "여", className: "border-[#8a4662] bg-[#26131d] text-[#ffb8d0]" }
        : { label: "-", className: "border-[#36424f] bg-[#121b24] text-[#93a4b4]" };

  return <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase ${config.className}`}>{config.label}</span>;
}

function getPendingCount(party: BranchPartyItem) {
  return (
    party.male_applicant_count +
    party.female_applicant_count -
    party.male_waitlist_count -
    party.female_waitlist_count
  );
}

function getWaitlistCount(party: BranchPartyItem) {
  return party.male_waitlist_count + party.female_waitlist_count;
}

function getParticipantCount(party: BranchPartyItem) {
  return party.male_participant_count + party.female_participant_count;
}

function getPartyRisk(party: BranchPartyItem) {
  const pendingCount = getPendingCount(party);
  const waitlistCount = getWaitlistCount(party);
  const participantCount = getParticipantCount(party);
  const startsSoon = new Date(party.start_at).getTime() - Date.now() <= 1000 * 60 * 60 * 24;

  if (startsSoon && pendingCount > 0) {
    return {
      label: "신청 확인",
      tone: "border-[#5b4b25] bg-[#1f180b] text-[#f0d18a]",
    };
  }

  if (waitlistCount > 0 && participantCount < party.capacity) {
    return {
      label: "대기 해소",
      tone: "border-[#2f5c82] bg-[#0f2231] text-[#d9f1ff]",
    };
  }

  if (participantCount >= party.capacity) {
    return {
      label: "정원 도달",
      tone: "border-[#285c43] bg-[#0f2018] text-[#8ee2b4]",
    };
  }

  return {
    label: "정상",
    tone: "border-[#22303d] bg-[#111a23] text-[#aab9c7]",
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
