"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useMemo, useState, type ReactNode } from "react";
import { DayPicker, type DayProps } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import type { BranchPartyItem } from "@/features/branch-admin/server/workspace";

type BranchCalendarViewProps = {
  parties: BranchPartyItem[];
};

type PartyGroup = {
  key: string;
  date: Date;
  parties: BranchPartyItem[];
};

export function BranchCalendarView({ parties }: BranchCalendarViewProps) {
  const groupedByDate = useMemo(() => buildPartyGroups(parties), [parties]);
  const partyDates = useMemo(() => groupedByDate.map((group) => group.date), [groupedByDate]);
  const partyMap = useMemo(() => new Map(groupedByDate.map((group) => [group.key, group.parties])), [groupedByDate]);

  const today = startOfDay(new Date());
  const initialSelectedDate = groupedByDate[0]?.date ?? today;
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialSelectedDate));
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);

  const selectedKey = toDateKey(selectedDate);
  const selectedGroup = groupedByDate.find((group) => group.key === selectedKey) ?? null;

  const CalendarDay = (props: DayProps) => {
    const { day, modifiers, className, children, ...tdProps } = props;
    const dateKey = toDateKey(startOfDay(day.date));
    const cellParties = partyMap.get(dateKey) ?? [];
    const isMuted = modifiers.outside || modifiers.disabled;
    const dayButton = isValidElement<{ className?: string }>(children)
      ? cloneElement(children, {
          className: [
            children.props.className,
            "inline-flex h-7 w-7 items-center justify-center rounded-[10px] border border-transparent text-[11px] font-semibold text-white transition hover:border-[#31424f] hover:bg-[#13202c] sm:h-9 sm:w-9 sm:text-sm",
          ]
            .filter(Boolean)
            .join(" "),
        })
      : children;

    return (
      <td {...tdProps} className={[className, "w-[14.285%] align-top p-0.5 sm:p-1"].filter(Boolean).join(" ")}>
        <div
          className={[
            "h-[72px] w-full overflow-hidden rounded-[16px] border border-[#17212b] bg-[#0b141d] p-1.5 text-left sm:h-[96px] sm:rounded-[18px] sm:p-2.5 lg:h-[122px] xl:h-[132px]",
            modifiers.selected ? "border-[#7ad0ff] bg-[#122130]" : "",
            modifiers.today ? "border-[#31424f]" : "",
            isMuted ? "bg-[#0a1118] opacity-55" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="flex items-start justify-between gap-2">{dayButton}</div>

          {!modifiers.hidden && !modifiers.outside && cellParties.length > 0 ? (
            <div className="mt-1.5 flex max-h-[calc(100%-2rem)] flex-col gap-1 overflow-hidden sm:mt-2 sm:max-h-[calc(100%-2.75rem)]">
              {cellParties.slice(0, 2).map((party, index) => (
                <BadgeLink key={party.id} href={`/admin/parties/${party.id}`} className={index === 1 ? "hidden sm:inline-flex" : ""}>
                  {party.title}
                </BadgeLink>
              ))}
              {cellParties.length > 1 ? <span className="px-1 text-[10px] font-medium text-[#7c95a8] sm:hidden">+{cellParties.length - 1}</span> : null}
              {cellParties.length > 2 ? <span className="hidden px-1 text-[10px] font-medium text-[#7c95a8] sm:inline">+{cellParties.length - 2}</span> : null}
            </div>
          ) : null}
        </div>
      </td>
    );
  };

  return (
    <section className="space-y-6">
      <article className="flex min-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:min-h-[calc(100vh-6rem)]">
        <div className="border-b border-[#17212b] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Calendar</p>
              <h3 className="mt-2 text-xl font-semibold text-white">월간 일정</h3>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Metric label="선택 날짜" value={formatSelectedDate(selectedDate)} compact />
              <Metric label="이벤트" value={String(selectedGroup?.parties.length ?? 0)} compact />
              {selectedGroup ? (
                <Link href={`/admin/parties/${selectedGroup.parties[0].id}`} className="inline-flex min-h-[64px] min-w-[132px] items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-4 py-4 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                  파티 상세
                </Link>
              ) : (
                <Link href={`/admin/parties/new?date=${selectedKey}`} className="inline-flex min-h-[64px] min-w-[132px] items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-4 py-4 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                  파티 생성
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 sm:p-4 lg:flex lg:p-6">
          <div className="rounded-[26px] border border-[#18222d] bg-[#0f1822] p-2 sm:p-4 lg:flex lg:flex-1 lg:p-6">
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
                month: "grid w-full grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-x-2 sm:grid-cols-[44px_minmax(0,1fr)_44px] sm:gap-x-3",
                month_caption: "flex h-10 items-center justify-center",
                caption_label: "text-sm font-semibold tracking-[0.02em] text-white sm:text-base",
                button_previous: "inline-flex h-9 w-9 items-center justify-center justify-self-start rounded-full border border-[#22303d] bg-[#091119] text-white transition hover:border-[#7ad0ff] hover:text-[#7ad0ff] sm:h-11 sm:w-11",
                button_next: "inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full border border-[#22303d] bg-[#091119] text-white transition hover:border-[#7ad0ff] hover:text-[#7ad0ff] sm:h-11 sm:w-11",
                chevron: "h-4 w-4 fill-current",
                month_grid: "col-span-3 mt-4 w-full table-fixed border-collapse",
                weekdays: "border-b border-[#17212b]",
                weekday: "w-[14.285%] pb-2 text-center text-[10px] font-medium tracking-[0.12em] text-[#70879a] sm:pb-3 sm:text-[11px]",
                week: "",
                day: "w-[14.285%] align-top p-0.5 sm:p-1",
                day_button: "inline-flex h-7 w-7 items-center justify-center rounded-[10px] border border-transparent text-[11px] font-medium text-white transition hover:border-[#31424f] hover:bg-[#13202c] sm:h-9 sm:w-9 sm:text-sm",
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

      <section className="grid gap-6 lg:hidden xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Metric label="선택 날짜" value={formatSelectedDate(selectedDate)} />
          <Metric label="이벤트" value={String(selectedGroup?.parties.length ?? 0)} />
          <Metric label="월간 일정" value={String(groupedByDate.length)} />
          {selectedGroup ? (
            <Link href={`/admin/parties/${selectedGroup.parties[0].id}`} className="inline-flex items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-4 py-4 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">파티 상세</Link>
          ) : (
            <Link href={`/admin/parties/new?date=${selectedKey}`} className="inline-flex items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-4 py-4 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">파티 생성</Link>
          )}
        </div>

        <article className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="border-b border-[#17212b] px-4 py-4 sm:px-6 sm:py-5">
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Agenda</p>
            <h3 className="mt-2 text-xl font-semibold text-white">일정 목록</h3>
          </div>

          <div className="space-y-3 p-4 sm:p-5 lg:p-6">
            {selectedGroup ? (
              selectedGroup.parties.map((party) => (
                <div key={party.id} className="rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link href={`/admin/parties/${party.id}`} className="text-base font-semibold text-white transition hover:text-[#9fdcff]">{party.title}</Link>
                      <p className="mt-1 text-sm text-[#8ea1b2]">{formatDateTimeRange(party.start_at, party.end_at)}</p>
                    </div>
                    <StatusPill tone={getPartyStatusTone(party.status)}>{party.status}</StatusPill>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniInfo label="남자" value={String(party.male_capacity)} />
                    <MiniInfo label="여자" value={String(party.female_capacity)} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyBlock>선택한 날짜에 파티가 없습니다.</EmptyBlock>
            )}
          </div>
        </article>
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

function formatDateTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(start)} - ${new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(end)}`;
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <div className={`rounded-[18px] border border-[#17212b] bg-[#0b141d] px-4 ${compact ? "min-w-[132px] py-3" : "py-4"}`}><p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] border border-[#17212b] bg-[#0b141d] px-3 py-3"><p className="font-mono text-[10px] tracking-[0.2em] text-[#70879a] uppercase">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">{children}</div>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase ${tone}`}>{children}</span>;
}

function BadgeLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={["inline-flex w-full max-w-full items-center rounded-[9px] border border-[#2f5c82] bg-[#102131] px-1.5 py-1 text-[9px] font-semibold text-[#dff4ff] transition hover:border-[#7ad0ff] hover:bg-[#153047] sm:rounded-[10px] sm:px-2 sm:text-[11px]", className].filter(Boolean).join(" ")}><span className="truncate">{children}</span></Link>;
}

function getPartyStatusTone(status: BranchPartyItem["status"]) {
  return status === "published"
    ? "border-[#285c43] bg-[#0f2018] text-[#8ee2b4]"
    : status === "draft"
      ? "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]"
      : status === "closed"
        ? "border-[#665529] bg-[#211a0d] text-[#f0d18a]"
        : status === "cancelled"
          ? "border-[#5a2430] bg-[#1a0d12] text-[#ffd7de]"
          : "border-[#3c4854] bg-[#131920] text-[#a5b3bf]";
}
