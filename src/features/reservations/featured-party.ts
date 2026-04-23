import type { PublicPartyOption } from "./shared";
import { getPublicDateKey } from "./shared";

export const FEATURED_PUBLIC_PARTY = {
  dateKey: "2026-05-05",
  branchKeyword: "제주",
} as const;

export function isFeaturedPublicParty(party: PublicPartyOption) {
  return (
    party.branchName.includes(FEATURED_PUBLIC_PARTY.branchKeyword) &&
    getPublicDateKey(party.startAt) === FEATURED_PUBLIC_PARTY.dateKey
  );
}
