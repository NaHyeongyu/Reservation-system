import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import {
  cancelPartyReservationAction,
  confirmPartyReservationAction,
} from "@/app/admin/parties/[partyId]/_actions/update-party-reservation";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  formatConsoleDate,
  formatConsoleDateTime,
  formatConsoleTime,
  formatTimeInput,
  getApplicantStatusLabel,
  getBranchWorkspace,
  getPartyStatusTone,
  getPartyStatusLabel,
  getBranchPartyDetail,
  listPartyReservations,
  type PartyReservationItem,
} from "@/features/branch-admin/server/workspace";
import { PartySettingsDialog } from "./_components/PartySettingsDialog";
import { PartyDetailTabs } from "./_components/PartyDetailTabs";

type AdminPartyDetailPageProps = {
  params: Promise<{ partyId: string }>;
  searchParams?: Promise<{
    updated?: string;
    error?: string;
    from?: string;
    date?: string;
  }>;
};

export default async function AdminPartyDetailPage({
  params,
  searchParams,
}: AdminPartyDetailPageProps) {
  const routeParams = await params;
  const query = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const [party, reservations] = await Promise.all([
    getBranchPartyDetail(branch.id, routeParams.partyId),
    listPartyReservations(branch.id, routeParams.partyId, 300),
  ]);

  if (!party) {
    notFound();
  }

  const applicants = reservations.filter((item) => item.status === "pending");
  const participants = reservations.filter(
    (item) => item.status === "confirmed" || item.status === "completed",
  );
  const waitlist = reservations
    .filter((item) => item.status === "waitlisted")
    .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at));
  const applicantQueue = [...applicants, ...waitlist].sort((left, right) =>
    left.submitted_at.localeCompare(right.submitted_at),
  );
  const waitlistPriorityMap = new Map(waitlist.map((item, index) => [item.id, index + 1]));

  const applicantCount = applicants.length;
  const participantCount = participants.length;
  const waitlistCount = waitlist.length;
  const remainingCount = Math.max(party.capacity - participantCount, 0);
  const applicantQueueGenderSummary = getGenderSummary(applicantQueue);
  const participantGenderSummary = getGenderSummary(participants);
  const remainingMaleCount = Math.max(
    party.male_capacity - participantGenderSummary.male,
    0,
  );
  const remainingFemaleCount = Math.max(
    party.female_capacity - participantGenderSummary.female,
    0,
  );
  const isPublicVisible = party.status === "published";
  const canTogglePublicVisibility = party.status === "draft" || party.status === "published";
  const detailSource = query?.from === "calendar" ? "calendar" : "parties";
  const sourceDate =
    detailSource === "calendar" && query?.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
      ? query.date
      : formatDateInput(party.start_at);
  const backHref =
    detailSource === "calendar"
      ? `/admin/calendar?date=${sourceDate}`
      : "/admin/parties";
  const partyInfoSection = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:gap-6">
      <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Party</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
              {party.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={getPartyStatusTone(party.status)}>
              {getPartyStatusLabel(party.status)}
            </StatusPill>
            <PartySettingsDialog
              branchId={branch.id}
              partyId={party.id}
              source={detailSource}
              sourceDate={detailSource === "calendar" ? sourceDate : null}
              title={party.title}
              eventDate={formatDateInput(party.start_at)}
              startTime={formatTimeInput(party.start_at)}
              endTime={formatTimeInput(party.end_at)}
              maleCapacity={party.male_capacity}
              femaleCapacity={party.female_capacity}
              isVisible={isPublicVisible}
              showHeadcount={party.show_headcount}
              canTogglePublicVisibility={canTogglePublicVisibility}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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

      <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Summary</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="신청" value={String(applicantCount)} />
          <MetricCard label="참가" value={String(participantCount)} />
          <MetricCard label="대기" value={String(waitlistCount)} />
          <MetricCard label="잔여석" value={String(remainingCount)} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
            <div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
                  공개 파티
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isPublicVisible ? "노출" : "비노출"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
            <div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
                  공개 화면 인원수
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {party.show_headcount ? "노출" : "비노출"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );

  const applicantQueueSection = (
    <ReservationColumn
      title="신청 / 대기"
      rows={applicantQueue}
      branchId={branch.id}
      partyId={party.id}
      emptyText="신청 내역이 없습니다."
      canConfirm
      showStatus
      waitlistPriorityMap={waitlistPriorityMap}
      summary={`${applicantCount + waitlistCount}/${party.capacity}명`}
      detail={`신청 ${applicantCount} / 대기 ${waitlistCount} / 남 ${applicantQueueGenderSummary.male}/${party.male_capacity} / 여 ${applicantQueueGenderSummary.female}/${party.female_capacity}`}
      remainingSeats={{ male: remainingMaleCount, female: remainingFemaleCount }}
      source={detailSource}
      sourceDate={detailSource === "calendar" ? sourceDate : null}
    />
  );

  const participantSection = (
    <ReservationColumn
      title="참가자"
      rows={participants}
      branchId={branch.id}
      partyId={party.id}
      emptyText="참가자가 없습니다."
      summary={`${participantCount}/${party.capacity}명`}
      detail={`남 ${participantGenderSummary.male}/${party.male_capacity} / 여 ${participantGenderSummary.female}/${party.female_capacity}`}
      source={detailSource}
      sourceDate={detailSource === "calendar" ? sourceDate : null}
    />
  );

  return (
    <AdminConsoleLayout
      currentPath="/admin/parties"
      title={party.title}
      description={branch.name}
      loginId={admin.loginId}
      role={admin.role}
      notice={
        query?.updated === "confirmed" ? (
          <AdminFlashNotice
            tone="info"
            message="참가자로 처리했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "cancelled" ? (
          <AdminFlashNotice
            tone="info"
            message="리스트에서 제거했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "visibility" ? (
          <AdminFlashNotice
            tone="info"
            message="인원수 노출 설정을 변경했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "party_visibility" ? (
          <AdminFlashNotice
            tone="info"
            message="파티 노출 설정을 변경했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "party" ? (
          <AdminFlashNotice
            tone="info"
            message="파티 기본 정보를 수정했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.error ? (
          <AdminFlashNotice
            tone="danger"
            placement={
              query.error === "capacity_full" ||
              query.error === "male_full" ||
              query.error === "female_full"
                ? "center"
                : "bottom"
            }
            message={
              query.error === "capacity_full"
                ? "이미 다 찼습니다."
                : query.error === "male_full"
                ? "남자 정원이 다 찼습니다."
                : query.error === "female_full"
                ? "여자 정원이 다 찼습니다."
                : query.error === "party_update"
                ? "파티 기본 정보 수정에 실패했습니다."
                : query.error === "party_delete_reserved"
                ? "예약 내역이 있는 파티는 삭제할 수 없습니다."
                : query.error === "party_delete"
                ? "파티 삭제에 실패했습니다."
                : query.error === "party_visibility"
                ? "파티 노출 설정 변경에 실패했습니다."
                : query.error === "visibility"
                ? "인원수 노출 설정 변경에 실패했습니다."
                : "처리에 실패했습니다."
            }
            clearKeys={["error"]}
          />
        ) : null
      }
    >
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#22303d] bg-[#0f1822] px-4 py-2.5 text-sm font-semibold text-[#d9e2ea] transition hover:border-[#7ad0ff] hover:text-white sm:rounded-[14px]"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9.75 3.5L5.25 8L9.75 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            뒤로
          </Link>
        </div>

        <div className="lg:hidden">
          <PartyDetailTabs
            partyInfo={partyInfoSection}
            applicantQueue={applicantQueueSection}
            participants={participantSection}
            participantCount={participantCount}
            participantCapacity={party.capacity}
            maleCapacity={party.male_capacity}
            femaleCapacity={party.female_capacity}
          />
        </div>

        <div className="hidden space-y-6 lg:block">
          {partyInfoSection}
          <section className="grid gap-6 xl:grid-cols-2">
            {applicantQueueSection}
            {participantSection}
          </section>
        </div>
      </section>
    </AdminConsoleLayout>
  );
}

function ReservationColumn({
  title,
  rows,
  branchId,
  partyId,
  emptyText,
  canConfirm = false,
  showStatus = false,
  waitlistPriorityMap,
  summary,
  detail,
  remainingSeats,
  source,
  sourceDate,
}: {
  title: string;
  rows: {
    id: string;
    reservation_code: string;
    reserver_name: string;
    reserver_phone: string;
    applicant_gender: PartyReservationItem["applicant_gender"];
    applicant_birth_date: string | null;
    bank_name: string | null;
    account_number: string | null;
    referral_sources: string[];
    status: PartyReservationItem["status"];
    submitted_at: string;
  }[];
  branchId: string;
  partyId: string;
  emptyText: string;
  canConfirm?: boolean;
  showStatus?: boolean;
  waitlistPriorityMap?: Map<string, number>;
  summary?: string;
  detail?: string;
  remainingSeats?: { male: number; female: number };
  source: "calendar" | "parties";
  sourceDate: string | null;
}) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[26px]">
      <div className="border-b border-[#17212b] px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">{title}</p>
          {summary ? (
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{summary}</p>
              {detail ? <p className="mt-1 text-xs text-[#7f94a7]">{detail}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto p-3 xl:max-h-[calc(100vh-24rem)] 2xl:max-h-[calc(100vh-22rem)]">
        {rows.length === 0 ? (
          <EmptyBlock>{emptyText}</EmptyBlock>
        ) : (
          rows.map((row) => {
            const confirmDisabled =
              canConfirm && remainingSeats
                ? isConfirmDisabled(row.applicant_gender, remainingSeats)
                : false;

            return (
              <article key={row.id} className="rounded-[18px] border border-[#18222d] bg-[#0f1822] px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {showStatus ? <StatusBadge status={row.status} /> : null}
                    {waitlistPriorityMap?.has(row.id) ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#2b5878] bg-[#0d1c27] px-1.5 text-[10px] font-semibold text-[#d9f1ff]">
                        {waitlistPriorityMap.get(row.id)}
                      </span>
                    ) : null}
                    <GenderBadge gender={row.applicant_gender} />
                    <p className="truncate text-sm font-semibold text-white">{row.reserver_name}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7f94a7]">{row.reservation_code}</p>
                </div>
              </div>

              <div className="mt-3 text-sm text-[#9db0bf]">
                <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                  <CompactField label="성별" value={formatGenderLabel(row.applicant_gender)} />
                  <CompactField label="생년월일" value={formatBirthDate(row.applicant_birth_date)} />
                  <CompactField label="전화번호" value={row.reserver_phone} />
                  <CompactField label="은행명" value={row.bank_name ?? "-"} />
                  <CompactField label="계좌번호" value={row.account_number ?? "-"} />
                  <CompactField label="유입경로" value={formatReferralSources(row.referral_sources)} />
                  <CompactField label="신청시간" value={formatConsoleDateTime(row.submitted_at)} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {canConfirm && remainingSeats ? (
                  <div className="mr-1 flex flex-wrap items-center gap-1">
                    <SeatPill label="남은 남" value={remainingSeats.male} />
                    <SeatPill label="남은 여" value={remainingSeats.female} />
                  </div>
                ) : null}
                {canConfirm ? (
                  <form action={confirmPartyReservationAction}>
                    <input type="hidden" name="partyId" value={partyId} />
                    <input type="hidden" name="branchId" value={branchId} />
                    <input type="hidden" name="reservationId" value={row.id} />
                    <input type="hidden" name="from" value={source} />
                    {sourceDate ? <input type="hidden" name="date" value={sourceDate} /> : null}
                    <button
                      type="submit"
                      disabled={confirmDisabled}
                      title={
                        confirmDisabled
                          ? row.applicant_gender === "male"
                            ? "남자석이 없습니다."
                            : row.applicant_gender === "female"
                            ? "여자석이 없습니다."
                            : "참가 가능 좌석이 없습니다."
                          : undefined
                      }
                      className={[
                        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:rounded-[12px]",
                        confirmDisabled
                          ? "cursor-not-allowed border border-[#2b3642] bg-[#121a22] text-[#6f8191]"
                          : "border border-[#2f5c82] bg-[#0f2231] text-[#d9f1ff] hover:border-[#7ad0ff] hover:bg-[#143247] hover:text-white",
                      ].join(" ")}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3 w-3"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.25 8.25L6.4 11.4L12.75 5.05"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      참가
                    </button>
                  </form>
                ) : null}

                <form action={cancelPartyReservationAction}>
                  <input type="hidden" name="partyId" value={partyId} />
                  <input type="hidden" name="branchId" value={branchId} />
                  <input type="hidden" name="reservationId" value={row.id} />
                  <input type="hidden" name="from" value={source} />
                  {sourceDate ? <input type="hidden" name="date" value={sourceDate} /> : null}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#6b2a38] bg-[#180d12] px-3 py-1.5 text-[11px] font-semibold text-[#ffd7de] transition hover:border-[#c25269] hover:bg-[#221118] hover:text-white sm:rounded-[12px]"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.25 3.5H9.75M2.75 4.5H13.25M5.25 6.5V11M8 6.5V11M10.75 6.5V11M4.75 13H11.25C11.6642 13 12 12.6642 12 12.25V4.5H4V12.25C4 12.6642 4.33579 13 4.75 13Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    삭제
                  </button>
                </form>
              </div>
              </article>
            );
          })
        )}
      </div>
    </article>
  );
}

function formatDateInput(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatBirthDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatGenderLabel(value: PartyReservationItem["applicant_gender"]) {
  if (value === "male") {
    return "남";
  }

  if (value === "female") {
    return "여";
  }

  return "-";
}

function formatReferralSources(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

function getGenderSummary(
  rows: Array<{ applicant_gender: PartyReservationItem["applicant_gender"] }>,
) {
  return rows.reduce(
    (totals, row) => {
      if (row.applicant_gender === "male") {
        totals.male += 1;
      }

      if (row.applicant_gender === "female") {
        totals.female += 1;
      }

      return totals;
    },
    { male: 0, female: 0 },
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

function CompactField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#17212b] bg-[#0b141d] px-2.5 py-2">
      <p className="font-mono text-[9px] tracking-[0.16em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-1 text-[13px] leading-5 text-[#d3dde5] break-all">{value}</p>
    </div>
  );
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-7 text-center text-sm text-[#8ea1b2]">
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

function StatusBadge({
  status,
}: {
  status: PartyReservationItem["status"];
}) {
  const config =
    status === "waitlisted"
      ? {
          label: getApplicantStatusLabel(status),
          className: "border-[#665529] bg-[#211a0d] text-[#f0d18a]",
        }
      : {
          label: getApplicantStatusLabel(status),
          className: "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]",
        };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function GenderBadge({
  gender,
}: {
  gender: PartyReservationItem["applicant_gender"];
}) {
  const config =
    gender === "male"
      ? {
          label: "남",
          className: "border-[#365f8f] bg-[#0f2033] text-[#9cd2ff]",
        }
      : gender === "female"
      ? {
          label: "여",
          className: "border-[#8a4662] bg-[#26131d] text-[#ffb8d0]",
        }
      : {
          label: "-",
          className: "border-[#36424f] bg-[#121b24] text-[#93a4b4]",
        };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function SeatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex rounded-full border border-[#22303d] bg-[#0b141d] px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-[#9db0bf]">
      {label} {value}
    </span>
  );
}

function isConfirmDisabled(
  gender: PartyReservationItem["applicant_gender"],
  remainingSeats: { male: number; female: number },
) {
  if (gender === "male") {
    return remainingSeats.male <= 0;
  }

  if (gender === "female") {
    return remainingSeats.female <= 0;
  }

  return remainingSeats.male + remainingSeats.female <= 0;
}
