"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import type { PublicPartyOption } from "@/features/reservations/shared";
import { getPublicDateKey } from "@/features/reservations/shared";
import { useCalendarMonth } from "../hooks/useCalendarMonth";
import {
  reservationDisabledButtonClassName,
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";
import { ReservationBranchPicker } from "./ReservationBranchPicker";
import { ReservationFlowIndicator } from "./ReservationFlowIndicator";

type ReservationCalendarProps = {
  partyOptions: PublicPartyOption[];
};

export function ReservationCalendar({ partyOptions }: ReservationCalendarProps) {
  const {
    currentMonth,
    selectedDate,
    selectedLabel,
    disabledDays,
    handleMonthChange,
    handleSelectDate,
  } = useCalendarMonth();
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const availableDateKeys = useMemo(
    () => new Set(partyOptions.map((party) => getPublicDateKey(party.startAt))),
    [partyOptions],
  );

  const availableParties = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const selectedDateKey = formatCalendarDateKey(selectedDate);
    return partyOptions.filter((party) => getPublicDateKey(party.startAt) === selectedDateKey);
  }, [partyOptions, selectedDate]);

  const selectedParty =
    availableParties.find((party) => party.id === selectedPartyId) ?? null;

  function handlePublicMonthChange(nextMonth: Date) {
    handleMonthChange(nextMonth);
    setSelectedPartyId(null);
  }

  function handlePublicDateSelect(nextDate: Date | undefined) {
    handleSelectDate(nextDate);
    setSelectedPartyId(null);
  }

  return (
    <main className="flex min-h-screen flex-1">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <ReservationFlowIndicator
          steps={[
            { label: "날짜", status: selectedDate ? "complete" : "current" },
            {
              label: "지점",
              status: !selectedDate
                ? "upcoming"
                : selectedParty
                  ? "complete"
                  : "current",
            },
            {
              label: "신청서",
              status: selectedParty ? "current" : "upcoming",
            },
          ]}
        />

        <header className="pb-5">
          <div className="mb-4 flex flex-col items-center gap-3">
            <Image
              src="/jimoon_logo.png"
              alt="Jimoon"
              width={760}
              height={1040}
              priority
              className="h-auto w-14 object-contain sm:w-16"
            />
            <p className="text-sm font-medium tracking-[0.14em] text-brand-white uppercase">
              예약 신청하기
            </p>
          </div>
          <h1 className="flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-brand-white/10 sm:w-20" />
            <span className="text-sm font-semibold tracking-[0.18em] text-brand-white uppercase">
              날짜 선택
            </span>
            <span className="h-px w-14 bg-brand-white/10 sm:w-20" />
          </h1>
        </header>

        <div className="rounded-[26px] border border-line bg-surface p-3 sm:p-4">
          <DayPicker
            locale={ko}
            mode="single"
            month={currentMonth}
            onMonthChange={handlePublicMonthChange}
            selected={selectedDate ?? undefined}
            onSelect={handlePublicDateSelect}
            disabled={[
              ...disabledDays,
              (date) => !availableDateKeys.has(formatCalendarDateKey(date)),
            ]}
            modifiers={{
              sunday: { dayOfWeek: [0] },
              saturday: { dayOfWeek: [6] },
            }}
            modifiersClassNames={{
              sunday: "[&>button]:text-brand-red",
              saturday: "[&>button]:text-sky-400",
            }}
            navLayout="around"
            className="reservation-daypicker"
            classNames={{
              root: "w-full",
              months: "w-full",
              month:
                "grid w-full grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-x-3",
              month_caption: "flex h-10 items-center justify-center",
              caption_label:
                "text-base font-semibold tracking-[0.02em] text-brand-white",
              button_previous:
                "inline-flex h-10 w-10 items-center justify-center justify-self-start rounded-full border border-line bg-brand-black text-brand-white transition hover:border-brand-orange/60 hover:text-brand-orange",
              button_next:
                "inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-line bg-brand-black text-brand-white transition hover:border-brand-orange/60 hover:text-brand-orange",
              chevron: "h-4 w-4 fill-current",
              month_grid: "col-span-3 mt-4 w-full border-collapse",
              weekdays: "border-b border-line",
              weekday:
                "pb-3 text-center text-[11px] font-medium tracking-[0.12em] text-muted",
              week: "",
              day: "py-1 text-center sm:py-1.5",
              day_button:
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-sm font-medium text-brand-white transition hover:border-brand-orange/45 hover:bg-surface-strong sm:h-11 sm:w-11",
              today: "[&>button]:border-line [&>button]:border",
              selected:
                "[&>button]:border-brand-orange [&>button]:bg-brand-orange [&>button]:!text-brand-black",
              outside: "[&>button]:text-brand-white/15",
              disabled:
                "[&>button]:cursor-default [&>button]:!text-brand-white/18 [&>button]:hover:border-transparent [&>button]:hover:bg-transparent",
            }}
            formatters={{
              formatCaption: (month) =>
                new Intl.DateTimeFormat("ko-KR", {
                  year: "numeric",
                  month: "long",
                }).format(month),
              formatWeekdayName: (date) =>
                new Intl.DateTimeFormat("ko-KR", {
                  weekday: "narrow",
                }).format(date),
            }}
          />
        </div>

        <footer className="mt-5 flex flex-col gap-3">
          {selectedDate && selectedLabel ? (
            <ReservationBranchPicker
              parties={availableParties}
              selectedPartyId={selectedPartyId}
              selectedDateLabel={selectedLabel}
              onSelect={setSelectedPartyId}
            />
          ) : (
            <section className="mt-5 rounded-[22px] border border-line bg-surface px-4 py-4">
              <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                가능한 지점
              </p>
              <p className="mt-2 text-sm text-brand-white">
                날짜를 먼저 선택해 주세요.
              </p>
            </section>
          )}

          {selectedParty ? (
            <Link
              href={`/reservations/apply?party=${selectedParty.id}`}
              style={reservationPrimaryButtonStyle}
              className={`mt-1 ${reservationPrimaryButtonClassName}`}
            >
              {selectedParty.waitlistOnly ? "대기자 신청" : "신청서 작성하기"}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              style={reservationPrimaryButtonStyle}
              className={`mt-1 ${reservationDisabledButtonClassName}`}
            >
              신청서 작성하기
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

function formatCalendarDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
