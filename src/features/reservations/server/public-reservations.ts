import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { isFeaturedPublicParty } from "@/features/reservations/featured-party";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PublicPartyOption,
  PublicReservationCompleteData,
} from "@/features/reservations/shared";

type CreatePublicReservationInput = {
  partyId: string;
  gender: "male" | "female";
  birthYear: string;
  name: string;
  instagramId: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
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
  applicant_instagram_id?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  referral_sources?: string[] | null;
  party_terms_agreed?: boolean | null;
  privacy_agreed?: boolean | null;
  party_terms_agreed_at?: string | null;
  privacy_agreed_at?: string | null;
};

type CreatePublicReservationRow = {
  reservation_code: string;
  reservation_status: PublicReservationCompleteData["reservationStatus"];
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
      .in("status", ["pending", "confirmed", "completed"]),
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
        waitlistOnly:
          maleApplied >= party.male_capacity &&
          femaleApplied >= party.female_capacity,
      } satisfies PublicPartyOption;
    })
    .filter((item): item is PublicPartyOption => item !== null);
}

export async function getPublicPartyOption(partyId: string) {
  noStore();
  const options = await listPublicPartyOptions();
  return options.find((party) => party.id === partyId) ?? null;
}

export async function getFeaturedPublicPartyOption() {
  noStore();
  const options = await listPublicPartyOptions();
  return options.find(isFeaturedPublicParty) ?? null;
}

export async function createPublicReservation(
  input: CreatePublicReservationInput,
): Promise<PublicReservationCreateResult> {
  if (!input.partyTermsAgreed || !input.privacyAgreed) {
    return { ok: false, message: "필수 동의 항목을 확인하세요." };
  }

  const normalizedName = input.name.trim();
  const instagramId = normalizeInstagramId(input.instagramId);
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
  const birthYear = parseBirthYearInput(input.birthYear);
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.trim();

  if (normalizedName.length === 0) {
    return { ok: false, message: "이름을 입력하세요." };
  }

  if (!instagramId) {
    return { ok: false, message: "인스타그램 ID를 입력하세요." };
  }

  if (normalizedPhone.length < 10) {
    return { ok: false, message: "전화번호 형식을 확인하세요." };
  }

  if (!birthYear) {
    return { ok: false, message: "생년 4자리를 확인하세요." };
  }

  if (bankName.length === 0 || accountNumber.length === 0) {
    return { ok: false, message: "입금 정보를 입력하세요." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: reservation, error: reservationError } = await supabaseAdmin
    .rpc("create_public_reservation_atomic", {
      p_party_id: input.partyId,
      p_name: normalizedName,
      p_phone: normalizedPhone,
      p_gender: input.gender,
      p_birth_date: birthYear,
      p_instagram_id: instagramId,
      p_bank_name: bankName,
      p_account_number: accountNumber,
      p_referral_sources: [],
      p_party_terms_agreed: true,
      p_privacy_agreed: true,
      p_source: "web",
    })
    .single();

  if (reservationError || !reservation) {
    return {
      ok: false,
      message: mapCreatePublicReservationError(reservationError?.message),
    };
  }

  const reservationRow = reservation as CreatePublicReservationRow;

  return {
    ok: true,
    reservationCode: reservationRow.reservation_code,
    reservationStatus:
      reservationRow.reservation_status === "waitlisted" ? "waitlisted" : "pending",
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
    reserverPhone: reservationRow.reserver_phone,
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

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeInstagramId(value: string) {
  const normalized = value.trim().replace(/^@+/, "");

  if (!/^[A-Za-z0-9._]{1,30}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function parseBirthYearInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{4}$/.test(digits)) {
    return null;
  }

  const year = Number(digits);
  const currentYear = new Date().getUTCFullYear();

  if (year < 1900 || year > currentYear) {
    return null;
  }

  return digits;
}

function isMissingPublicReservationColumnError(message: string | undefined) {
  if (!message) {
    return false;
  }

  return [
    "applicant_gender",
    "applicant_birth_date",
    "applicant_instagram_id",
    "bank_name",
    "account_number",
    "referral_sources",
    "party_terms_agreed",
    "privacy_agreed",
  ].some((column) => message.includes(column));
}

function isMissingPublicReservationFunctionError(message: string | undefined) {
  if (!message) {
    return false;
  }

  return (
    message.includes("create_public_reservation_atomic") ||
    message.includes("Could not find the function")
  );
}

function mapCreatePublicReservationError(message: string | undefined) {
  if (!message) {
    return "신청서를 저장하지 못했습니다.";
  }

  if (message.includes("DUPLICATE_PHONE")) {
    return "같은 파티에는 한 번만 신청할 수 있습니다.";
  }

  if (message.includes("PARTY_NOT_AVAILABLE")) {
    return "신청 가능한 파티를 찾지 못했습니다.";
  }

  if (message.includes("INVALID_GENDER")) {
    return "성별을 다시 확인하세요.";
  }

  if (message.includes("INVALID_PHONE")) {
    return "전화번호 형식을 확인하세요.";
  }

  if (message.includes("EMPTY_NAME")) {
    return "이름을 입력하세요.";
  }

  if (message.includes("EMPTY_INSTAGRAM_ID")) {
    return "인스타그램 ID를 입력하세요.";
  }

  if (message.includes("INVALID_INSTAGRAM_ID")) {
    return "인스타그램 ID 형식을 확인하세요.";
  }

  if (message.includes("INVALID_BIRTH_YEAR")) {
    return "생년 4자리를 확인하세요.";
  }

  if (
    isMissingPublicReservationColumnError(message) ||
    isMissingPublicReservationFunctionError(message)
  ) {
    return "DB 스키마 업데이트가 필요합니다. migration을 먼저 적용하세요.";
  }

  return message;
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
