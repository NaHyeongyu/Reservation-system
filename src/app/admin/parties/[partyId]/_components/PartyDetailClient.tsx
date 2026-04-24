"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type ReservationGenderFilter = "all" | "male" | "female";

type ReservationItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  applicant_gender: "male" | "female" | null;
  applicant_birth_date: string | null;
  applicant_instagram_id: string | null;
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
  const [selectedQueueReservationId, setSelectedQueueReservationId] = useState<string | null>(
    null,
  );
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [queueGenderFilter, setQueueGenderFilter] =
    useState<ReservationGenderFilter>("all");
  const [participantGenderFilter, setParticipantGenderFilter] =
    useState<ReservationGenderFilter>("all");

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
  const filteredApplicants = useMemo(
    () => filterReservationsByGender(applicants, queueGenderFilter),
    [applicants, queueGenderFilter],
  );
  const filteredWaitlist = useMemo(
    () => filterReservationsByGender(waitlist, queueGenderFilter),
    [waitlist, queueGenderFilter],
  );
  const filteredApplicantQueue = useMemo(
    () => filterReservationsByGender(applicantQueue, queueGenderFilter),
    [applicantQueue, queueGenderFilter],
  );
  const filteredParticipants = useMemo(
    () => filterReservationsByGender(participants, participantGenderFilter),
    [participants, participantGenderFilter],
  );
  const selectedQueueReservation = useMemo(
    () =>
      selectedQueueReservationId
        ? applicantQueue.find((item) => item.id === selectedQueueReservationId) ?? null
        : null,
    [applicantQueue, selectedQueueReservationId],
  );
  const selectedParticipant = useMemo(
    () =>
      selectedParticipantId
        ? participants.find((item) => item.id === selectedParticipantId) ?? null
        : null,
    [participants, selectedParticipantId],
  );
  const waitlistPriorityMap = useMemo(
    () => new Map(filteredWaitlist.map((item, index) => [item.id, index + 1])),
    [filteredWaitlist],
  );
  const applicantCount = applicants.length;
  const participantCount = participants.length;
  const waitlistCount = waitlist.length;
  const remainingCount = Math.max(party.capacity - participantCount, 0);
  const filteredApplicantCount = filteredApplicants.length;
  const filteredParticipantCount = filteredParticipants.length;
  const filteredWaitlistCount = filteredWaitlist.length;
  const applicantQueueGenderSummary = getGenderSummary(filteredApplicantQueue);
  const participantGenderSummary = getGenderSummary(participants);
  const filteredParticipantGenderSummary = getGenderSummary(filteredParticipants);
  const remainingMaleCount = Math.max(
    party.maleCapacity - participantGenderSummary.male,
    0,
  );
  const remainingFemaleCount = Math.max(
    party.femaleCapacity - participantGenderSummary.female,
    0,
  );
  const queueFilterCounts = useMemo(
    () => getGenderFilterCounts(applicantQueue),
    [applicantQueue],
  );
  const participantFilterCounts = useMemo(
    () => getGenderFilterCounts(participants),
    [participants],
  );
  const isPublicVisible = party.status === "published";
  const canTogglePublicVisibility =
    party.status === "draft" || party.status === "published";
  const selectedDetailReservation = selectedQueueReservation ?? selectedParticipant;

  useEffect(() => {
    if (!selectedDetailReservation) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedQueueReservationId(null);
        setSelectedParticipantId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDetailReservation]);

  function handleSelectQueueReservation(reservationId: string) {
    setSelectedParticipantId(null);
    setSelectedQueueReservationId(reservationId);
  }

  function handleSelectParticipantReservation(reservationId: string) {
    setSelectedQueueReservationId(null);
    setSelectedParticipantId(reservationId);
  }

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
      if (selectedQueueReservationId === reservationId) {
        setSelectedQueueReservationId(null);
      }
      if (selectedParticipantId === reservationId) {
        setSelectedParticipantId(null);
      }
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
      rows={filteredApplicantQueue}
      emptyText="신청 내역이 없습니다."
      canConfirm
      showStatus
      waitlistPriorityMap={waitlistPriorityMap}
      summary={getQueueSummaryLabel(
        queueGenderFilter,
        filteredApplicantCount,
        filteredWaitlistCount,
        party.capacity,
        party.maleCapacity,
        party.femaleCapacity,
      )}
      detail={
        queueGenderFilter === "all"
          ? `신청 ${filteredApplicantCount} / 대기 ${filteredWaitlistCount} / 남 ${applicantQueueGenderSummary.male}/${party.maleCapacity} / 여 ${applicantQueueGenderSummary.female}/${party.femaleCapacity}`
          : `신청 ${filteredApplicantCount} / 대기 ${filteredWaitlistCount}`
      }
      genderFilter={queueGenderFilter}
      onGenderFilterChange={setQueueGenderFilter}
      filterCounts={queueFilterCounts}
      selectedReservationId={selectedQueueReservationId}
      onSelectReservation={handleSelectQueueReservation}
      remainingSeats={{ male: remainingMaleCount, female: remainingFemaleCount }}
      pendingReservationId={pendingReservationId}
      onConfirm={(reservationId) => handleReservationAction(reservationId, "confirmed")}
      onCancel={(reservationId) => handleReservationAction(reservationId, "cancelled")}
    />
  );

  const participantSection = (
    <ReservationColumn
      title="참가자"
      rows={filteredParticipants}
      emptyText="참가자가 없습니다."
      summary={getParticipantSummaryLabel(
        participantGenderFilter,
        filteredParticipantCount,
        party.capacity,
        party.maleCapacity,
        party.femaleCapacity,
      )}
      detail={
        participantGenderFilter === "all"
          ? `남 ${filteredParticipantGenderSummary.male}/${party.maleCapacity} / 여 ${filteredParticipantGenderSummary.female}/${party.femaleCapacity}`
          : null
      }
      genderFilter={participantGenderFilter}
      onGenderFilterChange={setParticipantGenderFilter}
      filterCounts={participantFilterCounts}
      selectedReservationId={selectedParticipantId}
      onSelectReservation={handleSelectParticipantReservation}
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

      {selectedQueueReservation ? (
        <ReservationDetailDialog
          eyebrow="Reservation"
          title="신청 / 대기 상세"
          reservation={selectedQueueReservation}
          onClose={() => setSelectedQueueReservationId(null)}
        />
      ) : selectedParticipant ? (
        <ReservationDetailDialog
          eyebrow="Participant"
          title="참가자 상세"
          reservation={selectedParticipant}
          onClose={() => setSelectedParticipantId(null)}
        />
      ) : null}

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
  genderFilter = "all",
  onGenderFilterChange,
  filterCounts,
  selectedReservationId,
  onSelectReservation,
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
  detail?: string | null;
  genderFilter?: ReservationGenderFilter;
  onGenderFilterChange: (value: ReservationGenderFilter) => void;
  filterCounts: { all: number; male: number; female: number };
  selectedReservationId?: string | null;
  onSelectReservation?: (reservationId: string) => void;
  remainingSeats?: { male: number; female: number };
  pendingReservationId: string | null;
  onConfirm?: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[26px]">
      <div className="border-b border-[#17212b] px-4 py-4">
        <div className="flex flex-col gap-3">
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

          <GenderFilterTabs
            value={genderFilter}
            onChange={onGenderFilterChange}
            allCount={filterCounts.all}
            maleCount={filterCounts.male}
            femaleCount={filterCounts.female}
          />
        </div>
      </div>

      <div className="space-y-2 p-3">
        {rows.length === 0 ? (
          <EmptyBlock>{emptyText}</EmptyBlock>
        ) : (
          rows.map((row) => {
            const confirmDisabled =
              (canConfirm && remainingSeats
                ? isConfirmDisabled(row.applicant_gender, remainingSeats)
                : false) || pendingReservationId !== null;

            const cancelDisabled = pendingReservationId !== null;
            const isSelectable = Boolean(onSelectReservation);
            const isSelected = selectedReservationId === row.id;

            return (
              <article
                key={row.id}
                role={isSelectable ? "button" : undefined}
                tabIndex={isSelectable ? 0 : undefined}
                aria-pressed={isSelectable ? isSelected : undefined}
                onClick={
                  isSelectable && onSelectReservation
                    ? () => onSelectReservation(row.id)
                    : undefined
                }
                onKeyDown={
                  isSelectable && onSelectReservation
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectReservation(row.id);
                        }
                      }
                    : undefined
                }
                className={[
                  "rounded-[16px] border bg-[#0f1822] px-3 py-2.5",
                  isSelectable ? "cursor-pointer transition focus:outline-none" : "",
                  isSelected
                    ? "border-[#3f7aa3] bg-[#122130] shadow-[0_0_0_1px_rgba(122,208,255,0.18)]"
                    : "border-[#18222d]",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    {showStatus ? <StatusBadge status={row.status} /> : null}
                    {waitlistPriorityMap?.has(row.id) ? (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-[#2b5878] bg-[#0d1c27] px-1.5 text-[10px] font-semibold text-[#d9f1ff]">
                        {waitlistPriorityMap.get(row.id)}
                      </span>
                    ) : null}
                    <GenderBadge gender={row.applicant_gender} />
                    <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-white">
                      {row.reserver_name}
                    </p>
                    <span className="shrink-0 text-xs text-[#9db0bf]">
                      {formatBirthYear(row.applicant_birth_date)}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-[#8ea1b2]">
                    <span>{row.reserver_phone || "전화번호 없음"}</span>
                    <span>{formatConsoleDateTime(row.submitted_at)}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {canConfirm && onConfirm ? (
                    <button
                      type="button"
                      disabled={confirmDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        onConfirm(row.id);
                      }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onCancel(row.id);
                    }}
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

function ReservationDetailDialog({
  eyebrow,
  title,
  reservation,
  onClose,
}: {
  eyebrow: string;
  title: string;
  reservation: ReservationItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#04080ccc]/80 px-3 py-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#1c2733] bg-[#0b141d] shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
        <div className="flex items-center justify-between border-b border-[#17212b] px-5 py-4 sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.24em] text-[#7fc3ff] uppercase">
              {eyebrow}
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#223140] bg-[#0f1822] text-[#9cb0c0] transition hover:border-[#7ad0ff] hover:text-white"
            aria-label="팝업 닫기"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-[18px] border border-[#2b5878] bg-[#10202d] px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={reservation.status} />
                  <GenderBadge gender={reservation.applicant_gender} />
                </div>
                <p className="mt-2 text-base font-semibold text-white">
                  {reservation.reserver_name}
                </p>
                <p className="mt-1 text-xs text-[#9fc7e1]">
                  {reservation.reservation_code}
                </p>
              </div>
              <p className="text-xs text-[#8ea1b2]">
                신청 {formatConsoleDateTime(reservation.submitted_at)}
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <DisclosureField
                label="전화번호"
                value={reservation.reserver_phone || "-"}
              />
              <DisclosureField
                label="생년"
                value={formatBirthYear(reservation.applicant_birth_date)}
              />
              {formatInstagramUrl(reservation.applicant_instagram_id) ? (
                <DisclosureLinkField
                  label="인스타그램 주소"
                  value={formatInstagramAddress(reservation.applicant_instagram_id)}
                  href={formatInstagramUrl(reservation.applicant_instagram_id)}
                />
              ) : (
                <DisclosureField label="인스타그램 주소" value="-" />
              )}
              <DisclosureField
                label="입금정보"
                value={formatBankAccount(reservation.bank_name, reservation.account_number)}
              />
              <DisclosureField
                label="유입경로"
                value={formatReferralSources(reservation.referral_sources)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenderFilterTabs({
  value,
  onChange,
  allCount,
  maleCount,
  femaleCount,
}: {
  value: ReservationGenderFilter;
  onChange: (value: ReservationGenderFilter) => void;
  allCount: number;
  maleCount: number;
  femaleCount: number;
}) {
  const options: Array<{
    value: ReservationGenderFilter;
    label: string;
    count: number;
    activeClassName: string;
  }> = [
    {
      value: "all",
      label: "전체",
      count: allCount,
      activeClassName: "border-[#2f5c82] bg-[#0f2231] text-[#d9f1ff]",
    },
    {
      value: "male",
      label: "남자",
      count: maleCount,
      activeClassName: "border-[#365f8f] bg-[#0f2033] text-[#9cd2ff]",
    },
    {
      value: "female",
      label: "여자",
      count: femaleCount,
      activeClassName: "border-[#8a4662] bg-[#26131d] text-[#ffb8d0]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "flex min-h-[52px] flex-col items-center justify-center rounded-[14px] border px-3 py-2 text-center transition",
              isActive
                ? option.activeClassName
                : "border-transparent bg-[#0f1822] text-[#a8bac8] hover:border-[#22303d] hover:text-white",
            ].join(" ")}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            <span className="mt-1 text-[11px] opacity-80">{option.count}명</span>
          </button>
        );
      })}
    </div>
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

function filterReservationsByGender(
  rows: ReservationItem[],
  genderFilter: ReservationGenderFilter,
) {
  if (genderFilter === "all") {
    return rows;
  }

  return rows.filter((row) => row.applicant_gender === genderFilter);
}

function getGenderFilterCounts(rows: ReservationItem[]) {
  const summary = getGenderSummary(rows);

  return {
    all: rows.length,
    male: summary.male,
    female: summary.female,
  };
}

function getQueueSummaryLabel(
  genderFilter: ReservationGenderFilter,
  applicantCount: number,
  waitlistCount: number,
  capacity: number,
  maleCapacity: number,
  femaleCapacity: number,
) {
  const total = applicantCount + waitlistCount;

  if (genderFilter === "male") {
    return `${total}/${maleCapacity}명`;
  }

  if (genderFilter === "female") {
    return `${total}/${femaleCapacity}명`;
  }

  return `${total}/${capacity}명`;
}

function getParticipantSummaryLabel(
  genderFilter: ReservationGenderFilter,
  participantCount: number,
  capacity: number,
  maleCapacity: number,
  femaleCapacity: number,
) {
  if (genderFilter === "male") {
    return `${participantCount}/${maleCapacity}명`;
  }

  if (genderFilter === "female") {
    return `${participantCount}/${femaleCapacity}명`;
  }

  return `${participantCount}/${capacity}명`;
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

function DisclosureField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#17212b] bg-[#0b141d] px-3 py-2.5">
      <p className="font-mono text-[9px] tracking-[0.16em] text-[#70879a] uppercase">
        {label}
      </p>
      <p className="mt-1 break-all text-[13px] leading-5 text-[#d3dde5]">{value}</p>
    </div>
  );
}

function DisclosureLinkField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string | null;
}) {
  if (!href) {
    return <DisclosureField label={label} value={value} />;
  }

  return (
    <div className="rounded-[14px] border border-[#17212b] bg-[#0b141d] px-3 py-2.5">
      <p className="font-mono text-[9px] tracking-[0.16em] text-[#70879a] uppercase">
        {label}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="mt-1 inline-flex max-w-full items-center text-[13px] leading-5 text-[#9fd7ff] underline decoration-[#2f5c82] underline-offset-4 transition hover:text-white"
      >
        <span className="truncate">{value}</span>
      </a>
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

function formatBirthYear(value: string | null) {
  if (!value) {
    return "-";
  }

  const [year] = value.split("-");

  return year ? `${year}년` : "-";
}

function formatInstagramAddress(value: string | null) {
  const handle = normalizeInstagramHandle(value);

  return handle ? `instagram.com/${handle}` : "-";
}

function formatInstagramUrl(value: string | null) {
  const handle = normalizeInstagramHandle(value);

  return handle ? `https://www.instagram.com/${encodeURIComponent(handle)}` : null;
}

function normalizeInstagramHandle(value: string | null) {
  const handle = value?.trim().replace(/^@+/, "");

  return handle && handle.length > 0 ? handle : null;
}

function formatReferralSources(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

function formatBankAccount(bankName: string | null, accountNumber: string | null) {
  if (bankName && accountNumber) {
    return `${bankName} · ${accountNumber}`;
  }

  return bankName ?? accountNumber ?? "-";
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
