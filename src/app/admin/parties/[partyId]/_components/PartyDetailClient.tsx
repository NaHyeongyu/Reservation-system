"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { updatePartyReservationAction } from "@/app/admin/parties/[partyId]/_actions/update-party-reservation";
import { BranchSettingsDialog } from "./BranchSettingsDialog";
import { PartySettingsDialog } from "./PartySettingsDialog";
import { PartyDetailTabs } from "./PartyDetailTabs";

type PartyStatus = "draft" | "published" | "closed" | "cancelled" | "completed";
type ReservationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "rejected"
  | "completed"
  | "no_show";

type ReservationItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  applicant_gender: "male" | "female" | null;
  applicant_birth_date: string | null;
  bank_name: string | null;
  account_number: string | null;
  referral_sources: string[];
  status: ReservationStatus;
  submitted_at: string;
};

type PartyDetailClientProps = {
  branch: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    instagramUrl: string | null;
  };
  party: {
    id: string;
    title: string;
    status: PartyStatus;
    startAt: string;
    endAt: string;
    capacity: number;
    maleCapacity: number;
    femaleCapacity: number;
    showHeadcount: boolean;
  };
  initialReservations: ReservationItem[];
  source: "calendar" | "parties";
  sourceDate: string | null;
  backHref: string;
};

type LocalNotice = {
  id: number;
  tone: "info" | "danger";
  message: string;
  placement?: "bottom" | "center";
};

export function PartyDetailClient({
  branch,
  party,
  initialReservations,
  source,
  sourceDate,
  backHref,
}: PartyDetailClientProps) {
  const [reservations, setReservations] = useState(initialReservations);
  const [pendingReservationId, setPendingReservationId] = useState<string | null>(null);
  const [notice, setNotice] = useState<LocalNotice | null>(null);

  const applicants = useMemo(
    () => reservations.filter((item) => item.status === "pending"),
    [reservations],
  );
  const participants = useMemo(
    () =>
      reservations.filter(
        (item) => item.status === "confirmed" || item.status === "completed",
      ),
    [reservations],
  );
  const waitlist = useMemo(
    () =>
      reservations
        .filter((item) => item.status === "waitlisted")
        .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at)),
    [reservations],
  );
  const applicantQueue = useMemo(
    () =>
      [...applicants, ...waitlist].sort((left, right) =>
        left.submitted_at.localeCompare(right.submitted_at),
      ),
    [applicants, waitlist],
  );
  const waitlistPriorityMap = useMemo(
    () => new Map(waitlist.map((item, index) => [item.id, index + 1])),
    [waitlist],
  );

  const applicantCount = applicants.length;
  const participantCount = participants.length;
  const waitlistCount = waitlist.length;
  const remainingCount = Math.max(party.capacity - participantCount, 0);
  const applicantQueueGenderSummary = getGenderSummary(applicantQueue);
  const participantGenderSummary = getGenderSummary(participants);
  const remainingMaleCount = Math.max(
    party.maleCapacity - participantGenderSummary.male,
    0,
  );
  const remainingFemaleCount = Math.max(
    party.femaleCapacity - participantGenderSummary.female,
    0,
  );
  const isPublicVisible = party.status === "published";
  const canTogglePublicVisibility =
    party.status === "draft" || party.status === "published";

  async function handleReservationAction(
    reservationId: string,
    nextStatus: "confirmed" | "cancelled",
  ) {
    setPendingReservationId(reservationId);

    try {
      const result = await updatePartyReservationAction({
        branchId: branch.id,
        partyId: party.id,
        reservationId,
        nextStatus,
      });

      if (!result.ok) {
        setNotice({
          id: Date.now(),
          tone:
            result.reason === "capacity_full" ||
            result.reason === "male_full" ||
            result.reason === "female_full"
              ? "danger"
              : "danger",
          placement:
            result.reason === "capacity_full" ||
            result.reason === "male_full" ||
            result.reason === "female_full"
              ? "center"
              : "bottom",
          message: result.message ?? "처리에 실패했습니다.",
        });
        return;
      }

      setReservations((current) =>
        current.map((item) =>
          item.id === reservationId ? { ...item, status: nextStatus } : item,
        ),
      );
      setNotice({
        id: Date.now(),
        tone: "info",
        message:
          nextStatus === "confirmed"
            ? "참가자로 처리했습니다."
            : "리스트에서 제거했습니다.",
      });
    } finally {
      setPendingReservationId(null);
    }
  }

  const partyInfoSection = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:gap-6">
      <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">
              Party
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
              {party.title}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusPill tone={getPartyStatusTone(party.status)}>
              {getPartyStatusLabel(party.status)}
            </StatusPill>
            <BranchSettingsDialog
              branchId={branch.id}
              partyId={party.id}
              source={source}
              sourceDate={sourceDate}
              name={branch.name}
              phone={branch.phone}
              address={branch.address}
              instagramUrl={branch.instagramUrl}
            />
            <PartySettingsDialog
              branchId={branch.id}
              partyId={party.id}
              source={source}
              sourceDate={sourceDate}
              title={party.title}
              eventDate={formatDateInput(party.startAt)}
              startTime={formatTimeInput(party.startAt)}
              endTime={formatTimeInput(party.endAt)}
              maleCapacity={party.maleCapacity}
              femaleCapacity={party.femaleCapacity}
              isVisible={isPublicVisible}
              showHeadcount={party.showHeadcount}
              canTogglePublicVisibility={canTogglePublicVisibility}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <InfoRow label="지점명" value={branch.name} />
          <InfoRow label="지점 전화번호" value={branch.phone ?? "-"} />
          <InfoRow label="지점 주소" value={branch.address ?? "-"} />
          <InfoRow label="인스타그램" value={branch.instagramUrl ?? "-"} />
          <InfoRow label="날짜" value={formatConsoleDate(party.startAt)} />
          <InfoRow
            label="시간"
            value={`${formatConsoleTime(party.startAt)} - ${formatConsoleTime(party.endAt)}`}
          />
          <InfoRow label="남자 정원" value={String(party.maleCapacity)} />
          <InfoRow label="여자 정원" value={String(party.femaleCapacity)} />
          <InfoRow label="전체 정원" value={String(party.capacity)} />
        </div>
      </article>

      <article className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">
          Summary
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="신청" value={String(applicantCount)} />
          <MetricCard label="참가" value={String(participantCount)} />
          <MetricCard label="대기" value={String(waitlistCount)} />
          <MetricCard label="잔여석" value={String(remainingCount)} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
              공개 파티
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {isPublicVisible ? "노출" : "비노출"}
            </p>
          </div>

          <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
              공개 화면 인원수
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {party.showHeadcount ? "노출" : "비노출"}
            </p>
          </div>
        </div>
      </article>
    </div>
  );

  const applicantQueueSection = (
    <ReservationColumn
      title="신청 / 대기"
      rows={applicantQueue}
      emptyText="신청 내역이 없습니다."
      canConfirm
      showStatus
      waitlistPriorityMap={waitlistPriorityMap}
      summary={`${applicantCount + waitlistCount}/${party.capacity}명`}
      detail={`신청 ${applicantCount} / 대기 ${waitlistCount} / 남 ${applicantQueueGenderSummary.male}/${party.maleCapacity} / 여 ${applicantQueueGenderSummary.female}/${party.femaleCapacity}`}
      remainingSeats={{ male: remainingMaleCount, female: remainingFemaleCount }}
      pendingReservationId={pendingReservationId}
      onConfirm={(reservationId) => handleReservationAction(reservationId, "confirmed")}
      onCancel={(reservationId) => handleReservationAction(reservationId, "cancelled")}
    />
  );

  const participantSection = (
    <ReservationColumn
      title="참가자"
      rows={participants}
      emptyText="참가자가 없습니다."
      summary={`${participantCount}/${party.capacity}명`}
      detail={`남 ${participantGenderSummary.male}/${party.maleCapacity} / 여 ${participantGenderSummary.female}/${party.femaleCapacity}`}
      pendingReservationId={pendingReservationId}
      onCancel={(reservationId) => handleReservationAction(reservationId, "cancelled")}
    />
  );

  return (
    <section className="space-y-6">
      {notice ? (
        <AdminFlashNotice
          key={notice.id}
          tone={notice.tone}
          message={notice.message}
          placement={notice.placement}
        />
      ) : null}

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
          maleCapacity={party.maleCapacity}
          femaleCapacity={party.femaleCapacity}
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
  );
}

function ReservationColumn({
  title,
  rows,
  emptyText,
  canConfirm = false,
  showStatus = false,
  waitlistPriorityMap,
  summary,
  detail,
  remainingSeats,
  pendingReservationId,
  onConfirm,
  onCancel,
}: {
  title: string;
  rows: ReservationItem[];
  emptyText: string;
  canConfirm?: boolean;
  showStatus?: boolean;
  waitlistPriorityMap?: Map<string, number>;
  summary?: string;
  detail?: string;
  remainingSeats?: { male: number; female: number };
  pendingReservationId: string | null;
  onConfirm?: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[26px]">
      <div className="border-b border-[#17212b] px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">
            {title}
          </p>
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
              (canConfirm && remainingSeats
                ? isConfirmDisabled(row.applicant_gender, remainingSeats)
                : false) || pendingReservationId !== null;

            const cancelDisabled = pendingReservationId !== null;

            return (
              <article
                key={row.id}
                className="rounded-[18px] border border-[#18222d] bg-[#0f1822] px-3 py-3"
              >
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
                      <p className="truncate text-sm font-semibold text-white">
                        {row.reserver_name}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-[#7f94a7]">
                      {row.reservation_code}
                    </p>
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
                  {canConfirm && onConfirm ? (
                    <button
                      type="button"
                      disabled={confirmDisabled}
                      onClick={() => onConfirm(row.id)}
                      title={
                        confirmDisabled && pendingReservationId === null
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
                      {pendingReservationId === row.id ? "처리 중..." : "참가"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={cancelDisabled}
                    onClick={() => onCancel(row.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#6b2a38] bg-[#180d12] px-3 py-1.5 text-[11px] font-semibold text-[#ffd7de] transition hover:border-[#c25269] hover:bg-[#221118] hover:text-white disabled:cursor-not-allowed disabled:border-[#3d2a31] disabled:bg-[#151114] disabled:text-[#826771] sm:rounded-[12px]"
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
                    {pendingReservationId === row.id ? "처리 중..." : "삭제"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </article>
  );
}

function getGenderSummary(
  rows: Array<{ applicant_gender: ReservationItem["applicant_gender"] }>,
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
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function CompactField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#17212b] bg-[#0b141d] px-2.5 py-2">
      <p className="font-mono text-[9px] tracking-[0.16em] text-[#70879a] uppercase">
        {label}
      </p>
      <p className="mt-1 break-all text-[13px] leading-5 text-[#d3dde5]">{value}</p>
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

function StatusBadge({ status }: { status: ReservationStatus }) {
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
  gender: ReservationItem["applicant_gender"];
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
  gender: ReservationItem["applicant_gender"],
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

function formatGenderLabel(value: ReservationItem["applicant_gender"]) {
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

function formatConsoleDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

function formatConsoleDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConsoleTime(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeInput(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function getApplicantStatusLabel(status: ReservationStatus) {
  return status === "pending"
    ? "신청"
    : status === "confirmed"
      ? "참가"
      : status === "waitlisted"
        ? "대기"
        : status === "cancelled"
          ? "취소"
          : status === "rejected"
            ? "거절"
            : status === "completed"
              ? "완료"
              : "미참석";
}

function getPartyStatusTone(status: PartyStatus) {
  return status === "published"
    ? "border-[#285c43] bg-[#0f2018] text-[#8ee2b4]"
    : status === "draft"
      ? "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]"
      : status === "closed"
        ? "border-[#665529] bg-[#211a0d] text-[#f0d18a]"
        : status === "cancelled"
          ? "border-[#6a3944] bg-[#221118] text-[#ffb9c5]"
          : "border-[#4e5760] bg-[#161c23] text-[#c1cbd4]";
}

function getPartyStatusLabel(status: PartyStatus) {
  return status === "published"
    ? "게시"
    : status === "draft"
      ? "초안"
      : status === "closed"
        ? "마감"
        : status === "cancelled"
          ? "취소"
          : "완료";
}
