import { notFound } from "next/navigation";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  formatConsoleDate,
  formatConsoleDateTime,
  formatConsoleTime,
  getBranchWorkspace,
  getPartyStatusTone,
  getBranchPartyDetail,
  listPartyReservations,
} from "@/features/branch-admin/server/workspace";

type AdminPartyDetailPageProps = {
  params: Promise<{ partyId: string }>;
};

export default async function AdminPartyDetailPage({ params }: AdminPartyDetailPageProps) {
  const routeParams = await params;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const party = await getBranchPartyDetail(branch.id, routeParams.partyId);

  if (!party) {
    notFound();
  }

  const reservations = await listPartyReservations(branch.id, party.id, 300);

  const applicants = reservations.filter((item) => item.status === "pending");
  const participants = reservations.filter(
    (item) => item.status === "confirmed" || item.status === "completed",
  );
  const waitlist = reservations
    .filter((item) => item.status === "waitlisted")
    .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at));

  const applicantCount = applicants.reduce(
    (total, item) => total + item.participant_count,
    0,
  );
  const participantCount = participants.reduce(
    (total, item) => total + item.participant_count,
    0,
  );
  const waitlistCount = waitlist.reduce(
    (total, item) => total + item.participant_count,
    0,
  );
  const remainingCount = Math.max(party.capacity - participantCount, 0);

  return (
    <AdminConsoleLayout
      currentPath="/admin/parties"
      title={party.title}
      description={branch.name}
      loginId={admin.loginId}
      role={admin.role}
    >
      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Party</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {party.title}
                </h2>
              </div>
              <StatusPill tone={getPartyStatusTone(party.status)}>{party.status}</StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow label="지점" value={branch.name} />
              <InfoRow label="날짜" value={formatConsoleDate(party.start_at)} />
              <InfoRow
                label="시간"
                value={`${formatConsoleTime(party.start_at)} - ${formatConsoleTime(party.end_at)}`}
              />
              <InfoRow label="남자 정원" value={String(party.male_capacity)} />
              <InfoRow label="여자 정원" value={String(party.female_capacity)} />
              <InfoRow label="전체 정원" value={String(party.capacity)} />
            </div>
          </article>

          <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Summary</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <MetricCard label="신청" value={String(applicantCount)} />
              <MetricCard label="참가" value={String(participantCount)} />
              <MetricCard label="대기" value={String(waitlistCount)} />
              <MetricCard label="잔여석" value={String(remainingCount)} />
            </div>
          </article>
        </div>

        <section className="grid gap-6 xl:grid-cols-3">
          <ReservationColumn title="신청자" rows={applicants} emptyText="신청자가 없습니다." />
          <ReservationColumn title="참가자" rows={participants} emptyText="참가자가 없습니다." />
          <ReservationColumn
            title="대기자"
            rows={waitlist}
            emptyText="대기자가 없습니다."
            showPriority
          />
        </section>
      </section>
    </AdminConsoleLayout>
  );
}

function ReservationColumn({
  title,
  rows,
  emptyText,
  showPriority = false,
}: {
  title: string;
  rows: {
    id: string;
    reservation_code: string;
    reserver_name: string;
    reserver_phone: string;
    participant_count: number;
    status: string;
    submitted_at: string;
  }[];
  emptyText: string;
  showPriority?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="border-b border-[#17212b] px-5 py-5">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">{title}</p>
      </div>

      <div className="space-y-3 p-4">
        {rows.length === 0 ? (
          <EmptyBlock>{emptyText}</EmptyBlock>
        ) : (
          rows.map((row, index) => (
            <article key={row.id} className="rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {showPriority ? (
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#2b5878] bg-[#0d1c27] px-2 text-[11px] font-semibold text-[#d9f1ff]">
                        {index + 1}
                      </span>
                    ) : null}
                    <p className="truncate text-base font-semibold text-white">{row.reserver_name}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#7f94a7]">{row.reservation_code}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-white">{row.participant_count}명</p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#9db0bf]">
                <DetailLine label="전화" value={row.reserver_phone} />
                <DetailLine label="접수" value={formatConsoleDateTime(row.submitted_at)} />
              </div>
            </article>
          ))
        )}
      </div>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] tracking-[0.18em] text-[#70879a] uppercase">{label}</span>
      <span className="text-right text-sm text-[#c7d4de]">{value}</span>
    </div>
  );
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">
      {children}
    </div>
  );
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}
    >
      {children}
    </span>
  );
}
