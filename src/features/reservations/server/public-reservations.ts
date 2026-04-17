import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PublicPartyOption,
  PublicReservationCompleteData,
} from "@/features/reservations/shared";

type CreatePublicReservationInput = {
  partyId: string;
  gender: "male" | "female";
  birthDate: string;
  name: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  referralSources: string[];
  partyTermsAgreed: boolean;
  privacyAgreed: boolean;
};

type PublicReservationCreateResult =
  | {
      ok: true;
      reservationCode: string;
      reservationStatus: "pending" | "waitlisted";
    }
  | {
      ok: false;
      message: string;
    };

type PartyRow = {
  id: string;
  branch_id: string;
  title: string;
  status: string;
  start_at: string;
  end_at: string;
  capacity: number;
  male_capacity: number;
  female_capacity: number;
  show_headcount?: boolean | null;
};

type BranchRow = {
  id: string;
  name: string;
  address: string | null;
  instagram_url: string | null;
};

type ReservationRow = {
  id: string;
  party_id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  status: PublicReservationCompleteData["reservationStatus"];
  submitted_at: string;
  applicant_gender?: string | null;
  applicant_birth_date?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  referral_sources?: string[] | null;
  party_terms_agreed?: boolean | null;
  privacy_agreed?: boolean | null;
  party_terms_agreed_at?: string | null;
  privacy_agreed_at?: string | null;
};

export async function listPublicPartyOptions() {
  noStore();
  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: parties, error: partyError } = await supabaseAdmin
    .from("parties")
    .select("*")
    .eq("status", "published")
    .gte("start_at", now)
    .order("start_at", { ascending: true });

  if (partyError || !parties || parties.length === 0) {
    return [] satisfies PublicPartyOption[];
  }

  const partyRows = parties as PartyRow[];
  const branchIds = [...new Set(partyRows.map((party) => party.branch_id))];
  const partyIds = partyRows.map((party) => party.id);

  const [{ data: branches }, { data: reservations }] = await Promise.all([
    supabaseAdmin
      .from("branches")
      .select("id, name, address, instagram_url")
      .in("id", branchIds),
    supabaseAdmin
      .from("reservations")
      .select("*")
      .in("party_id", partyIds)
      .in("status", ["pending", "confirmed", "completed", "waitlisted"]),
  ]);

  const branchMap = new Map(
    ((branches ?? []) as BranchRow[]).map((branch) => [branch.id, branch]),
  );
  const counterMap = buildGenderCounterMap((reservations ?? []) as ReservationRow[]);

  return partyRows
    .map((party) => {
      const branch = branchMap.get(party.branch_id);

      if (!branch) {
        return null;
      }

      const counts = counterMap.get(party.id) ?? { male: 0, female: 0 };
      const maleApplied = counts.male;
      const femaleApplied = counts.female;
      const totalApplied = maleApplied + femaleApplied;

      return {
        id: party.id,
        branchId: branch.id,
        branchName: branch.name,
        branchAddress: branch.address,
        branchInstagramUrl: branch.instagram_url,
        title: party.title,
        startAt: party.start_at,
        endAt: party.end_at,
        capacity: party.capacity,
        maleCapacity: party.male_capacity,
        femaleCapacity: party.female_capacity,
        maleApplied,
        femaleApplied,
        showHeadcount: party.show_headcount ?? true,
        waitlistOnly: totalApplied >= party.capacity,
      } satisfies PublicPartyOption;
    })
    .filter((item): item is PublicPartyOption => item !== null);
}

export async function getPublicPartyOption(partyId: string) {
  noStore();
  const options = await listPublicPartyOptions();
  return options.find((party) => party.id === partyId) ?? null;
}

export async function createPublicReservation(
  input: CreatePublicReservationInput,
): Promise<PublicReservationCreateResult> {
  const party = await getPublicPartyOption(input.partyId);

  if (!party) {
    return { ok: false, message: "신청 가능한 파티를 찾지 못했습니다." };
  }

  if (!input.partyTermsAgreed || !input.privacyAgreed) {
    return { ok: false, message: "필수 동의 항목을 확인하세요." };
  }

  const normalizedName = input.name.trim();
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
  const birthDate = parseBirthDateInput(input.birthDate);
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.trim();
  const referralSources = dedupeReferralSources(input.referralSources);

  if (normalizedName.length === 0) {
    return { ok: false, message: "이름을 입력하세요." };
  }

  if (normalizedPhone.length < 10) {
    return { ok: false, message: "전화번호 형식을 확인하세요." };
  }

  if (!birthDate) {
    return { ok: false, message: "생년월일 형식을 확인하세요." };
  }

  if (bankName.length === 0 || accountNumber.length === 0) {
    return { ok: false, message: "입금 정보를 입력하세요." };
  }

  if (new Date(party.startAt).getTime() <= Date.now()) {
    return { ok: false, message: "마감된 파티입니다." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: blockingReservations, error: blockingError } = await supabaseAdmin
    .from("reservations")
    .select("id, reserver_phone")
    .eq("party_id", party.id)
    .in("status", ["pending", "confirmed", "waitlisted"]);

  if (blockingError) {
    return { ok: false, message: "기존 신청 정보를 확인하지 못했습니다." };
  }

  const hasDuplicatePhone = (blockingReservations ?? []).some(
    (reservation) =>
      normalizePhoneNumber(reservation.reserver_phone) === normalizedPhone,
  );

  if (hasDuplicatePhone) {
    return { ok: false, message: "같은 파티에는 한 번만 신청할 수 있습니다." };
  }

  const { data: activeReservations, error: activeError } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .eq("party_id", party.id)
    .in("status", ["pending", "confirmed", "completed", "waitlisted"]);

  if (activeError) {
    return { ok: false, message: "신청 가능 인원을 확인하지 못했습니다." };
  }

  const genderCounts = buildGenderCounter((activeReservations ?? []) as ReservationRow[]);
  const totalAppliedCount = (activeReservations ?? []).length;
  const appliedCount = input.gender === "male" ? genderCounts.male : genderCounts.female;
  const availableCapacity =
    input.gender === "male" ? party.maleCapacity : party.femaleCapacity;
  const shouldWaitlist =
    totalAppliedCount >= party.capacity || appliedCount >= availableCapacity;
  const reservationStatus = shouldWaitlist ? "waitlisted" : "pending";
  const now = new Date().toISOString();

  const { data: reservation, error: reservationError } = await supabaseAdmin
    .from("reservations")
    .insert({
      branch_id: party.branchId,
      party_id: party.id,
      source: "web",
      status: reservationStatus,
      reserver_name: normalizedName,
      reserver_phone: normalizedPhone,
      participant_count: 1,
      applicant_gender: input.gender,
      applicant_birth_date: birthDate,
      bank_name: bankName,
      account_number: accountNumber,
      referral_sources: referralSources,
      party_terms_agreed: true,
      privacy_agreed: true,
      party_terms_agreed_at: now,
      privacy_agreed_at: now,
    })
    .select("id, reservation_code, status")
    .single();

  if (reservationError || !reservation) {
    return {
      ok: false,
      message: isMissingPublicReservationColumnError(reservationError?.message)
        ? "DB 스키마 업데이트가 필요합니다. migration을 먼저 적용하세요."
        : reservationError?.message ?? "신청서를 저장하지 못했습니다.",
    };
  }

  const { error: participantError } = await supabaseAdmin.from("participants").insert({
    reservation_id: reservation.id,
    full_name: normalizedName,
    phone: normalizedPhone,
    is_primary: true,
    status: "active",
  });

  if (participantError) {
    await supabaseAdmin.from("reservations").delete().eq("id", reservation.id);

    return {
      ok: false,
      message: participantError.message ?? "신청자 정보를 저장하지 못했습니다.",
    };
  }

  return {
    ok: true,
    reservationCode: reservation.reservation_code,
    reservationStatus:
      reservation.status === "waitlisted" ? "waitlisted" : "pending",
  };
}

export async function getPublicReservationCompleteData(reservationCode: string) {
  noStore();
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: reservation, error: reservationError } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .eq("reservation_code", reservationCode)
    .maybeSingle();

  if (reservationError || !reservation) {
    return null;
  }

  const reservationRow = reservation as ReservationRow;
  const { data: party } = await supabaseAdmin
    .from("parties")
    .select("id, branch_id, title, start_at, end_at")
    .eq("id", reservationRow.party_id)
    .maybeSingle();

  if (!party) {
    return null;
  }

  const { data: branch } = await supabaseAdmin
    .from("branches")
    .select("id, name, address")
    .eq("id", party.branch_id)
    .maybeSingle();

  if (!branch) {
    return null;
  }

  return {
    reservationCode: reservationRow.reservation_code,
    reservationStatus: normalizeReservationStatus(reservationRow.status),
    reserverName: reservationRow.reserver_name,
    branchName: branch.name,
    branchAddress: branch.address,
    partyTitle: party.title,
    partyStartAt: party.start_at,
    partyEndAt: party.end_at,
  } satisfies PublicReservationCompleteData;
}

function buildGenderCounterMap(rows: ReservationRow[]) {
  const counterMap = new Map<string, { male: number; female: number }>();

  for (const row of rows) {
    const current = counterMap.get(row.party_id) ?? { male: 0, female: 0 };

    if (row.applicant_gender === "male") {
      current.male += 1;
    }

    if (row.applicant_gender === "female") {
      current.female += 1;
    }

    counterMap.set(row.party_id, current);
  }

  return counterMap;
}

function buildGenderCounter(rows: ReservationRow[]) {
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

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function parseBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{8}$/.test(digits)) {
    return null;
  }

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const date = new Date(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T00:00:00+09:00`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function dedupeReferralSources(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function isMissingPublicReservationColumnError(message: string | undefined) {
  if (!message) {
    return false;
  }

  return [
    "applicant_gender",
    "applicant_birth_date",
    "bank_name",
    "account_number",
    "referral_sources",
    "party_terms_agreed",
    "privacy_agreed",
  ].some((column) => message.includes(column));
}

function normalizeReservationStatus(
  value: string,
): PublicReservationCompleteData["reservationStatus"] {
  return value === "confirmed" ||
    value === "waitlisted" ||
    value === "cancelled" ||
    value === "rejected" ||
    value === "completed" ||
    value === "no_show"
    ? value
    : "pending";
}
