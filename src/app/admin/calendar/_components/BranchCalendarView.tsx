"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useMemo, useState, type ReactNode } from "react";
import { DayPicker, type DayProps } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import type { BranchPartyItem } from "@/features/branch-admin/server/workspace";

type BranchCalendarViewProps = {
  parties: BranchPartyItem[];
  initialSelectedDate?: string;
};

type PartyGroup = {
  key: string;
  date: Date;
  parties: BranchPartyItem[];
};

export function BranchCalendarView({ parties, initialSelectedDate }: BranchCalendarViewProps) {
  const groupedByDate = useMemo(() => buildPartyGroups(parties), [parties]);
  const partyDates = useMemo(() => groupedByDate.map((group) => group.date), [groupedByDate]);
  const partyMap = useMemo(() => new Map(groupedByDate.map((group) => [group.key, group.parties])), [groupedByDate]);

  const today = startOfDay(new Date());
  const resolvedInitialDate = useMemo(() => {
    if (initialSelectedDate && /^\d{4}-\d{2}-\d{2}$/.test(initialSelectedDate)) {
      return parseDateKey(initialSelectedDate);
    }

    return groupedByDate[0]?.date ?? today;
  }, [groupedByDate, initialSelectedDate, today]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(resolvedInitialDate));
  const [selectedDate, setSelectedDate] = useState<Date>(resolvedInitialDate);

  const selectedKey = toDateKey(selectedDate);
  const selectedGroup = groupedByDate.find((group) => group.key === selectedKey) ?? null;
  const selectedSummary = useMemo(
    () => summarizePartyCounts(selectedGroup?.parties ?? []),
    [selectedGroup],
  );
  const selectedPrimaryParty = selectedGroup?.parties[0] ?? null;

  const CalendarDay = (props: DayProps) => {
    const { day, modifiers, className, children, ...tdProps } = props;
    const dateKey = toDateKey(startOfDay(day.date));
    const cellParties = partyMap.get(dateKey) ?? [];
    const isMuted = modifiers.outside || modifiers.disabled;
    const dayButton = isValidElement<{ className?: string }>(children)
      ? cloneElement(children, {
          className: [
            children.props.className,
            "inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[11px] font-semibold text-white transition hover:border-[#31424f] hover:bg-[#13202c] sm:h-9 sm:w-9 sm:rounded-[10px] sm:text-sm",
          ]
            .filter(Boolean)
            .join(" "),
        })
      : children;

    return (
      <td {...tdProps} className={[className, "w-[14.285%] align-top p-px sm:p-1"].filter(Boolean).join(" ")}>
        <div
          className={[
            "h-[68px] w-full overflow-hidden rounded-[12px] p-1 text-left sm:h-[102px] sm:rounded-[16px] sm:border sm:border-[#17212b] sm:bg-[#0b141d] sm:p-2 lg:h-[120px] xl:h-[132px]",
            modifiers.selected ? "sm:border-[#7ad0ff] sm:bg-[#122130]" : "",
            modifiers.today ? "sm:border-[#31424f]" : "",
            isMuted ? "opacity-45 sm:bg-[#0a1118] sm:opacity-55" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="flex items-start justify-center pt-0.5 sm:justify-between sm:pt-0">{dayButton}</div>

          {!modifiers.hidden && !modifiers.outside && cellParties.length > 0 ? (
            <>
              <div className="mt-3 flex flex-col items-center gap-1 sm:hidden">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#142130] px-1 text-[8px] font-semibold text-[#dff4ff]">
                  {cellParties.length}
                </span>
                {cellParties[0] ? (
                  <div className="flex flex-col items-center gap-0.5 text-[8px] font-medium text-[#8fb7d6]">
                    <span>{formatTimeRange(cellParties[0].start_at, cellParties[0].end_at)}</span>
                    <span>신 {getPendingCount(cellParties[0])} · 대 {getWaitlistCount(cellParties[0])}</span>
                    <span>참 {getParticipantCount(cellParties[0])} · 설 {cellParties[0].capacity}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-1.5 hidden max-h-[calc(100%-2rem)] flex-col gap-1 overflow-hidden sm:mt-2 sm:flex sm:max-h-[calc(100%-2.75rem)]">
                {cellParties.slice(0, 2).map((party, index) => (
                  <BadgeLink
                    key={party.id}
                    href={`/admin/parties/${party.id}?from=calendar&date=${dateKey}`}
                    className={index === 1 ? "hidden sm:inline-flex" : ""}
                    timeLabel={formatTimeRange(party.start_at, party.end_at)}
                    participantCount={getParticipantCount(party)}
                    pendingCount={getPendingCount(party)}
                    waitlistCount={getWaitlistCount(party)}
                    capacity={party.capacity}
                  >
                    {party.title}
                  </BadgeLink>
                ))}
                {cellParties.length > 2 ? <span className="px-1 text-[9px] font-medium text-[#7c95a8]">+{cellParties.length - 2}</span> : null}
              </div>
            </>
          ) : null}
        </div>
      </td>
    );
  };

  return (
    <section className="space-y-4 lg:space-y-6">
      <article className="flex min-h-0 flex-col bg-[#0b141d] lg:min-h-[calc(100vh-6rem)] lg:overflow-hidden lg:rounded-[30px] lg:border lg:border-[#1c2733] lg:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#17212b] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Calendar</p>
              <h3 className="mt-1.5 text-lg font-semibold text-white">월간 일정</h3>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Metric label="선택 날짜" value={formatSelectedDate(selectedDate)} compact />
              <Metric
                label="신청 / 대기"
                value={`${selectedSummary.pending} / ${selectedSummary.waitlist}`}
                compact
              />
              <Metric
                label="참가 / 설정"
                value={`${selectedSummary.participants} / ${selectedSummary.capacity}`}
                compact
              />
              <Metric
                label="파티 시간"
                value={
                  selectedPrimaryParty
                    ? formatTimeRange(selectedPrimaryParty.start_at, selectedPrimaryParty.end_at)
                    : "-"
                }
                description={
                  selectedGroup && selectedGroup.parties.length > 1
                    ? `${selectedGroup.parties.length}건`
                    : undefined
                }
                compact
              />
              {selectedGroup ? (
                <Link href={`/admin/parties/${selectedGroup.parties[0].id}?from=calendar&date=${selectedKey}`} className="inline-flex min-h-[54px] min-w-[112px] items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-3.5 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                  파티 상세
                </Link>
              ) : (
                <Link href={`/admin/parties/new?date=${selectedKey}`} className="inline-flex min-h-[54px] min-w-[112px] items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-3.5 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                  파티 생성
                </Link>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
            <Metric label="선택 날짜" value={formatSelectedDate(selectedDate)} compact />
            <Metric
              label="파티 시간"
              value={
                selectedPrimaryParty
                  ? formatTimeRange(selectedPrimaryParty.start_at, selectedPrimaryParty.end_at)
                  : "-"
              }
              compact
            />
            <Metric label="신청 / 대기" value={`${selectedSummary.pending} / ${selectedSummary.waitlist}`} compact />
            <Metric label="참가 / 설정" value={`${selectedSummary.participants} / ${selectedSummary.capacity}`} compact />
          </div>
        </div>

        <div className="flex-1 px-0 pb-0 pt-1.5 sm:p-3 lg:flex lg:p-4">
          <div className="px-2 pb-2 sm:rounded-[22px] sm:border sm:border-[#18222d] sm:bg-[#0f1822] sm:p-3 lg:flex lg:flex-1 lg:p-4">
            <DayPicker
              locale={ko}
              mode="single"
              required
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              selected={selectedDate}
              onSelect={(nextDate) => {
                if (nextDate) {
                  setSelectedDate(startOfDay(nextDate));
                }
              }}
              modifiers={{ hasParty: partyDates, sunday: { dayOfWeek: [0] }, saturday: { dayOfWeek: [6] } }}
              modifiersClassNames={{
                hasParty: "[&>button]:border-[#2f5c82] [&>button]:bg-[#122130] [&>button]:text-[#dff4ff]",
                sunday: "[&>button]:text-[#ff8c96]",
                saturday: "[&>button]:text-[#88d3ff]",
              }}
              navLayout="around"
              className="branch-admin-daypicker"
              components={{ Day: CalendarDay }}
              classNames={{
                root: "w-full lg:flex lg:flex-1",
                months: "w-full lg:flex-1",
                month: "grid w-full grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-x-1.5 sm:grid-cols-[44px_minmax(0,1fr)_44px] sm:gap-x-3",
                month_caption: "flex h-10 items-center justify-center sm:h-11",
                caption_label: "text-[15px] font-semibold tracking-[0.02em] text-white sm:text-base",
                button_previous: "inline-flex h-8 w-8 items-center justify-center justify-self-start rounded-full border border-[#22303d] bg-[#091119] text-white transition hover:border-[#7ad0ff] hover:text-[#7ad0ff] sm:h-11 sm:w-11",
                button_next: "inline-flex h-8 w-8 items-center justify-center justify-self-end rounded-full border border-[#22303d] bg-[#091119] text-white transition hover:border-[#7ad0ff] hover:text-[#7ad0ff] sm:h-11 sm:w-11",
                chevron: "h-4 w-4 fill-current",
                month_grid: "col-span-3 mt-2.5 w-full table-fixed border-collapse sm:mt-4",
                weekdays: "border-b border-[#17212b]",
                weekday: "w-[14.285%] pb-1.5 text-center text-[10px] font-medium tracking-[0.08em] text-[#70879a] sm:pb-3 sm:text-[11px]",
                week: "",
                day: "w-[14.285%] align-top p-px sm:p-1",
                day_button: "inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[11px] font-medium text-white transition hover:border-[#31424f] hover:bg-[#13202c] sm:h-9 sm:w-9 sm:rounded-[10px] sm:text-sm",
                today: "[&>button]:border-[#31424f] [&>button]:bg-[#13202c]",
                selected: "[&>button]:border-[#7ad0ff] [&>button]:bg-[#7ad0ff] [&>button]:text-[#071019]",
                outside: "[&>button]:text-white/18",
                disabled: "[&>button]:cursor-default [&>button]:text-white/18 [&>button]:hover:border-transparent [&>button]:hover:bg-transparent",
              }}
              formatters={{
                formatCaption: (month) => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(month),
                formatWeekdayName: (date) => new Intl.DateTimeFormat("ko-KR", { weekday: "narrow" }).format(date),
              }}
              />
          </div>
        </div>
      </article>

      <section className="grid gap-3 lg:hidden">
        <div className="grid grid-cols-2 gap-2.5">
          <Metric
            label="신청 / 대기"
            value={`${selectedSummary.pending} / ${selectedSummary.waitlist}`}
          />
          <Metric
            label="참가 / 설정"
            value={`${selectedSummary.participants} / ${selectedSummary.capacity}`}
          />
          <Metric
            label="파티 시간"
            value={
              selectedPrimaryParty
                ? formatTimeRange(selectedPrimaryParty.start_at, selectedPrimaryParty.end_at)
                : "-"
            }
          />
          <Metric label="월간 일정" value={String(groupedByDate.length)} />
        </div>

        <div className="sticky bottom-3 z-10 -mx-1 px-1">
          <div className="rounded-[18px] border border-[#22303d] bg-[#0b141d]/95 p-2.5 shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">선택 날짜</p>
            <p className="mt-1 text-sm font-semibold text-white">{formatSelectedDate(selectedDate)}</p>
            <div className="mt-1.5 space-y-0.5 text-[11px] text-[#8ea1b2]">
              <p>신청 {selectedSummary.pending} / 대기 {selectedSummary.waitlist}</p>
              <p>참가 {selectedSummary.participants} / 설정 {selectedSummary.capacity}</p>
              <p>{selectedPrimaryParty ? formatTimeRange(selectedPrimaryParty.start_at, selectedPrimaryParty.end_at) : "-"}</p>
            </div>

            {selectedGroup ? (
              <Link href={`/admin/parties/${selectedGroup.parties[0].id}?from=calendar&date=${selectedKey}`} className="mt-2.5 inline-flex w-full items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                파티 보기
              </Link>
            ) : (
              <Link href={`/admin/parties/new?date=${selectedKey}`} className="mt-2.5 inline-flex w-full items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                파티 생성하기
              </Link>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

function buildPartyGroups(parties: BranchPartyItem[]): PartyGroup[] {
  const groups = new Map<string, BranchPartyItem[]>();

  for (const party of parties) {
    const key = party.start_at.slice(0, 10);
    const items = groups.get(key) ?? [];
    items.push(party);
    groups.set(key, items);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, items]) => ({ key, date: parseDateKey(key), parties: items.sort((left, right) => left.start_at.localeCompare(right.start_at)) }));
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function formatSelectedDate(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(value);
}

function summarizePartyCounts(parties: BranchPartyItem[]) {
  return parties.reduce(
    (totals, party) => {
      totals.capacity += party.capacity;
      totals.pending += getPendingCount(party);
      totals.waitlist += getWaitlistCount(party);
      totals.participants += getParticipantCount(party);
      return totals;
    },
    {
      capacity: 0,
      pending: 0,
      waitlist: 0,
      participants: 0,
    },
  );
}

function getPendingCount(party: BranchPartyItem) {
  return Math.max(
    party.male_applicant_count +
      party.female_applicant_count -
      party.male_waitlist_count -
      party.female_waitlist_count,
    0,
  );
}

function getWaitlistCount(party: BranchPartyItem) {
  return party.male_waitlist_count + party.female_waitlist_count;
}

function getParticipantCount(party: BranchPartyItem) {
  return party.male_participant_count + party.female_participant_count;
}

function formatTimeRange(startAt: string, endAt: string) {
  return `${formatTimeValue(startAt)}-${formatTimeValue(endAt)}`;
}

function formatTimeValue(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function Metric({
  label,
  value,
  description,
  compact = false,
}: {
  label: string;
  value: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[16px] border border-[#17212b] bg-[#0b141d] px-3.5 ${compact ? "min-w-[120px] py-2.5" : "py-3"}`}>
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p>
      <p className="mt-1.5 text-[13px] font-semibold text-white">{value}</p>
      {description ? <p className="mt-0.5 text-[10px] text-[#7f94a7]">{description}</p> : null}
    </div>
  );
}

function BadgeLink({
  href,
  children,
  className,
  timeLabel,
  participantCount,
  pendingCount,
  waitlistCount,
  capacity,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  timeLabel: string;
  participantCount: number;
  pendingCount: number;
  waitlistCount: number;
  capacity: number;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex w-full max-w-full flex-col rounded-[8px] border border-[#2f5c82] bg-[#102131] px-1.5 py-1 text-[9px] font-semibold text-[#dff4ff] transition hover:border-[#7ad0ff] hover:bg-[#153047] sm:rounded-[9px] sm:px-1.5 sm:py-1 sm:text-[10px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="truncate">{children}</span>
      <span className="mt-0.5 text-[7px] font-medium text-[#8fb7d6] sm:text-[8px]">
        {timeLabel}
      </span>
      <span className="mt-0.5 text-[7px] font-medium text-[#8fb7d6] sm:text-[8px]">
        신 {pendingCount} · 대 {waitlistCount}
      </span>
      <span className="mt-0.5 text-[7px] font-medium text-[#8fb7d6] sm:text-[8px]">
        참 {participantCount} · 설 {capacity}
      </span>
    </Link>
  );
}
