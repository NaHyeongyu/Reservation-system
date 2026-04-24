import type { PublicPartyOption } from "./shared";
import { getPublicDateKey } from "./shared";

export type FeaturedPublicPartyTimelineItem = {
  startTime: string;
  endTime: string;
  title: string;
  tone?: "default" | "break";
};

export const FEATURED_PUBLIC_PARTY = {
  dateKey: "2026-05-05",
  branchKeyword: "제주",
} as const;

export const FEATURED_PUBLIC_PARTY_TIMELINE: FeaturedPublicPartyTimelineItem[] = [
  {
    startTime: "18:30",
    endTime: "19:00",
    title: "입장 및 자리 안내",
  },
  {
    startTime: "19:00",
    endTime: "19:10",
    title: "오프닝 및 진행 안내",
  },
  {
    startTime: "19:10",
    endTime: "19:50",
    title: "첫인상 게임",
  },
  {
    startTime: "19:50",
    endTime: "20:00",
    title: "쉬는 시간",
    tone: "break",
  },
  {
    startTime: "20:00",
    endTime: "21:00",
    title: "친해지길 바라",
  },
  {
    startTime: "21:00",
    endTime: "21:10",
    title: "쉬는 시간",
    tone: "break",
  },
  {
    startTime: "21:10",
    endTime: "21:45",
    title: "본격적으로 놀아볼까요?",
  },
  {
    startTime: "21:45",
    endTime: "22:00",
    title: "내 사랑을 찾아서",
  },
  {
    startTime: "22:00",
    endTime: "22:10",
    title: "쉬는 시간",
    tone: "break",
  },
  {
    startTime: "22:10",
    endTime: "22:40",
    title: "너 나와",
  },
  {
    startTime: "22:40",
    endTime: "23:00",
    title: "나의 진심",
  },
] as const;

export function isFeaturedPublicParty(party: PublicPartyOption) {
  return (
    party.branchName.includes(FEATURED_PUBLIC_PARTY.branchKeyword) &&
    getPublicDateKey(party.startAt) === FEATURED_PUBLIC_PARTY.dateKey
  );
}
