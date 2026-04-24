export type PublicPartyOption = {
  id: string;
  branchId: string;
  branchName: string;
  branchAddress: string | null;
  branchInstagramUrl: string | null;
  title: string;
  startAt: string;
  endAt: string;
  capacity: number;
  maleCapacity: number;
  femaleCapacity: number;
  maleApplied: number;
  femaleApplied: number;
  showHeadcount: boolean;
  waitlistOnly: boolean;
};

export type PublicReservationCompleteData = {
  reservationCode: string;
  reservationStatus:
    | "pending"
    | "confirmed"
    | "waitlisted"
    | "cancelled"
    | "rejected"
    | "completed"
    | "no_show";
  reserverName: string;
  reserverPhone: string;
  branchName: string;
  branchAddress: string | null;
  partyTitle: string;
  partyStartAt: string;
  partyEndAt: string;
};

export function formatPublicDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(value));
}

export function formatPublicTimeLabel(startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

export function getPublicDateKey(value: string) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date(value));
}
