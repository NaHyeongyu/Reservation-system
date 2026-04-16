"use client";

import { useState } from "react";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useCalendarMonth() {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  function handleMonthChange(nextMonth: Date) {
    setCurrentMonth(nextMonth);
  }

  function handleSelectDate(nextDate: Date | undefined) {
    setSelectedDate(nextDate ?? null);
  }

  return {
    currentMonth,
    selectedDate,
    selectedLabel: selectedDate ? formatSelectedDate(selectedDate) : null,
    selectedDateParam: selectedDate ? formatDateParam(selectedDate) : null,
    disabledDays: [{ before: startOfDay(new Date()) }],
    handleMonthChange,
    handleSelectDate,
  };
}
