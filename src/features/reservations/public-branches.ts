export type PublicBranch = {
  id: string;
  slug: string;
  name: string;
  district: string;
  address: string;
  openLabel: string;
  partyTimeLabel: string;
  applicantCountByGender: {
    male: {
      applied: number;
      capacity: number;
    };
    female: {
      applied: number;
      capacity: number;
    };
  };
  availableWeekdays: number[];
};

export const publicBranches: PublicBranch[] = [
  {
    id: "gangnam",
    slug: "gangnam",
    name: "강남점",
    district: "서울 강남",
    address: "서울 강남구 테헤란로 12",
    openLabel: "매일 19:00 - 02:00",
    partyTimeLabel: "20:00 - 23:00",
    applicantCountByGender: {
      male: {
        applied: 3,
        capacity: 5,
      },
      female: {
        applied: 4,
        capacity: 6,
      },
    },
    availableWeekdays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: "hongdae",
    slug: "hongdae",
    name: "홍대점",
    district: "서울 마포",
    address: "서울 마포구 양화로 48",
    openLabel: "화-일 18:00 - 01:00",
    partyTimeLabel: "19:30 - 22:30",
    applicantCountByGender: {
      male: {
        applied: 5,
        capacity: 6,
      },
      female: {
        applied: 2,
        capacity: 5,
      },
    },
    availableWeekdays: [0, 2, 3, 4, 5, 6],
  },
  {
    id: "jamsil",
    slug: "jamsil",
    name: "잠실점",
    district: "서울 송파",
    address: "서울 송파구 올림픽로 240",
    openLabel: "월, 금-일 19:00 - 01:00",
    partyTimeLabel: "20:00 - 23:30",
    applicantCountByGender: {
      male: {
        applied: 5,
        capacity: 5,
      },
      female: {
        applied: 5,
        capacity: 5,
      },
    },
    availableWeekdays: [0, 1, 5, 6],
  },
] as const;

export function listAvailableBranches(date: Date | null) {
  if (!date) {
    return [];
  }

  const weekday = date.getDay();

  return publicBranches.filter((branch) =>
    branch.availableWeekdays.includes(weekday),
  );
}

export function getPublicBranchBySlug(slug: string | null) {
  if (!slug) {
    return null;
  }

  return publicBranches.find((branch) => branch.slug === slug) ?? null;
}

export function isWaitlistOnlyBranch(branch: PublicBranch) {
  return (
    branch.applicantCountByGender.male.applied >=
      branch.applicantCountByGender.male.capacity &&
    branch.applicantCountByGender.female.applied >=
      branch.applicantCountByGender.female.capacity
  );
}
