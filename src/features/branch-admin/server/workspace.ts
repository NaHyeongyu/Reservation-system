import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminSession } from "@/features/admin-auth/server/types";
import {
  getBranchDetailForAdmin,
  type BranchListItem,
} from "@/features/branches/server/branches";

export type BranchPartyItem = {
  id: string;
  title: string;
  status: "draft" | "published" | "closed" | "cancelled" | "completed";
  start_at: string;
  end_at: string;
  capacity: number;
  male_capacity: number;
  female_capacity: number;
  male_applied: number;
  female_applied: number;
  male_applicant_count: number;
  female_applicant_count: number;
  male_waitlist_count: number;
  female_waitlist_count: number;
  male_participant_count: number;
  female_participant_count: number;
  show_headcount: boolean;
};

export type BranchApplicantItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  applicant_gender: "male" | "female" | null;
  participant_count: number;
  status:
    | "pending"
    | "confirmed"
    | "waitlisted"
    | "cancelled"
    | "rejected"
    | "completed"
    | "no_show";
  submitted_at: string;
  party_id: string | null;
  party_title: string | null;
  party_start_at: string | null;
};

export type PartyReservationItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  applicant_gender: "male" | "female" | null;
  applicant_birth_date: string | null;
  applicant_instagram_id: string | null;
  bank_name: string | null;
  account_number: string | null;
  referral_sources: string[];
  status:
    | "pending"
    | "confirmed"
    | "waitlisted"
    | "cancelled"
    | "rejected"
    | "completed"
    | "no_show";
  submitted_at: string;
};

export type PartyReservationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "rejected"
  | "completed"
  | "no_show";

export type CreateBranchPartyInput = {
  branchId: string;
  title: string;
  startAt: string;
  endAt: string;
  maleCapacity: number;
  femaleCapacity: number;
  isVisible: boolean;
  showHeadcount: boolean;
};

export type UpdateBranchPartyInput = {
  branchId: string;
  partyId: string;
  title: string;
  startAt: string;
  endAt: string;
  maleCapacity: number;
  femaleCapacity: number;
  isVisible: boolean;
  showHeadcount: boolean;
};

export type BranchPartyTemplate = {
  title: string;
  startTime: string;
  endTime: string;
  maleCapacity: number;
  femaleCapacity: number;
};

export type BranchDashboardDistributionItem = {
  label: string;
  count: number;
  ratio: number;
};

export type BranchDashboardTrendItem = {
  label: string;
  count: number;
};

export type BranchDashboardQueueItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  applicant_gender: "male" | "female" | null;
  applicant_age_band: string;
  applicant_instagram_id: string | null;
  submitted_at: string;
  party_id: string | null;
  party_title: string | null;
  party_start_at: string | null;
};

export type BranchDashboardSnapshot = {
  totalParties: number;
  totalReservations: number;
  pendingApplicants: number;
  waitlistApplicants: number;
  todayReservations: number;
  todayParties: number;
  todayParticipants: number;
  todayCapacity: number;
  weekParties: number;
  averageFillRate: number;
  confirmationRate: number;
  upcomingPartyRows: BranchPartyItem[];
  pendingQueueRows: BranchDashboardQueueItem[];
  waitlistQueueRows: BranchDashboardQueueItem[];
  referralRows: BranchDashboardDistributionItem[];
  genderRows: BranchDashboardDistributionItem[];
  ageRows: BranchDashboardDistributionItem[];
  weekdayTrend: BranchDashboardTrendItem[];
  hourTrend: BranchDashboardTrendItem[];
};

const BRANCH_PARTY_SNAPSHOT_SELECT = [
  "id",
  "title",
  "status",
  "start_at",
  "end_at",
  "capacity",
  "male_capacity",
  "female_capacity",
  "male_applied",
  "female_applied",
  "male_applicant_count",
  "female_applicant_count",
  "male_waitlist_count",
  "female_waitlist_count",
  "male_participant_count",
  "female_participant_count",
  "show_headcount",
].join(", ");

type BranchPartySnapshotRow = Omit<BranchPartyItem, never> & {
  show_headcount?: boolean | null;
};

type BasePartyRow = {
  id: string;
  title: string;
  status: BranchPartyItem["status"];
  start_at: string;
  end_at: string;
  capacity: number;
  male_capacity: number;
  female_capacity: number;
  show_headcount?: boolean | null;
};

type DashboardReservationRow = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
  status: BranchApplicantItem["status"];
  submitted_at: string;
  applicant_gender: "male" | "female" | null;
  applicant_birth_date: string | null;
  applicant_instagram_id: string | null;
  referral_sources: string[];
  party_id: string | null;
  party_title: string | null;
  party_start_at: string | null;
};

export async function getBranchWorkspace(admin: AdminSession) {
  if (admin.role === "super_admin") {
    redirect("/admin/branches");
  }

  const branchId = admin.branchIds[0];

  if (!branchId) {
    redirect("/admin/dashboard?denied=1");
  }

  const branch = await getBranchDetailForAdmin(admin, branchId);

  if (!branch) {
    redirect("/admin/dashboard?denied=1");
  }

  return branch;
}

export async function getBranchDashboardSnapshot(
  branchId: string,
): Promise<BranchDashboardSnapshot> {
  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date();
  const todayKey = getKstDateKey(now);
  const weekLimitIso = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const [
    totalPartiesResult,
    upcomingParties,
    todayPartyRows,
    reservationRowsRaw,
  ] = await Promise.all([
    supabaseAdmin.from("parties").select("id", { count: "exact", head: true }).eq("branch_id", branchId),
    listBranchParties(branchId, 5, true),
    listBranchPartiesOnDate(branchId, todayKey),
    supabaseAdmin
      .from("reservations")
      .select(
        "id, reservation_code, reserver_name, reserver_phone, status, submitted_at, applicant_gender, applicant_birth_date, applicant_instagram_id, referral_sources, party_id, party:parties!reservations_party_branch_fk(title, start_at)",
      )
      .eq("branch_id", branchId)
      .order("submitted_at", { ascending: true }),
  ]);

  const reservationRows = (reservationRowsRaw?.data ?? [])
    .map((item) => toDashboardReservationRow(item))
    .filter((item): item is DashboardReservationRow => item !== null);
  const pendingQueueRows = reservationRows
    .filter((item) => item.status === "pending")
    .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at))
    .slice(0, 8)
    .map(toDashboardQueueItem);
  const waitlistQueueRows = reservationRows
    .filter((item) => item.status === "waitlisted")
    .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at))
    .slice(0, 8)
    .map(toDashboardQueueItem);
  const totalReservations = reservationRows.length;
  const pendingApplicants = reservationRows.filter((item) => item.status === "pending").length;
  const waitlistApplicants = reservationRows.filter((item) => item.status === "waitlisted").length;
  const todayReservations = reservationRows.filter((item) =>
    isSameKstDate(item.submitted_at, todayKey),
  ).length;
  const confirmedReservations = reservationRows.filter(
    (item) => item.status === "confirmed" || item.status === "completed",
  ).length;
  const todayParticipants = todayPartyRows.reduce(
    (total, party) => total + party.male_participant_count + party.female_participant_count,
    0,
  );
  const todayCapacity = todayPartyRows.reduce((total, party) => total + party.capacity, 0);
  const weekParties = upcomingParties.filter((party) => party.start_at <= weekLimitIso).length;
  const averageFillRate =
    upcomingParties.length > 0
      ? upcomingParties.reduce((total, party) => {
          const participants = party.male_participant_count + party.female_participant_count;
          return total + (party.capacity > 0 ? participants / party.capacity : 0);
        }, 0) / upcomingParties.length
      : 0;
  const confirmationRate = totalReservations > 0 ? confirmedReservations / totalReservations : 0;

  return {
    totalParties: totalPartiesResult.count ?? 0,
    totalReservations,
    pendingApplicants,
    waitlistApplicants,
    todayReservations,
    todayParties: todayPartyRows.length,
    todayParticipants,
    todayCapacity,
    weekParties,
    averageFillRate,
    confirmationRate,
    upcomingPartyRows: upcomingParties,
    pendingQueueRows,
    waitlistQueueRows,
    referralRows: buildReferralRows(reservationRows),
    genderRows: buildGenderRows(reservationRows),
    ageRows: buildAgeRows(reservationRows),
    weekdayTrend: buildWeekdayTrend(reservationRows),
    hourTrend: buildHourTrend(reservationRows),
  };
}

export async function listBranchParties(
  branchId: string,
  limit = 24,
  upcomingOnly = false,
) {
  const supabaseAdmin = createSupabaseAdminClient();
  let snapshotQuery = supabaseAdmin
    .from("branch_party_snapshots")
    .select(BRANCH_PARTY_SNAPSHOT_SELECT)
    .eq("branch_id", branchId)
    .order("start_at", { ascending: true })
    .limit(limit);

  if (upcomingOnly) {
    snapshotQuery = snapshotQuery.gte("start_at", new Date().toISOString());
  }

  const { data, error } = await snapshotQuery;

  if (!error && data) {
    return (data as unknown as BranchPartySnapshotRow[]).map(toBranchPartyItem);
  }

  let partyQuery = supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity, show_headcount")
    .eq("branch_id", branchId)
    .order("start_at", { ascending: true })
    .limit(limit);

  if (upcomingOnly) {
    partyQuery = partyQuery.gte("start_at", new Date().toISOString());
  }

  const { data: fallbackData, error: fallbackError } = await partyQuery;

  if (fallbackError || !fallbackData) {
    return [] satisfies BranchPartyItem[];
  }

  return attachAppliedCounts(branchId, fallbackData as BasePartyRow[]);
}

export async function listBranchPartiesOnDate(branchId: string, date: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const startAt = toKstIso(date, "00:00");
  const nextDate = addDays(date, 1);
  const endAt = toKstIso(nextDate, "00:00");

  const { data, error } = await supabaseAdmin
    .from("branch_party_snapshots")
    .select(BRANCH_PARTY_SNAPSHOT_SELECT)
    .eq("branch_id", branchId)
    .gte("start_at", startAt)
    .lt("start_at", endAt)
    .order("start_at", { ascending: true });

  if (!error && data) {
    return (data as unknown as BranchPartySnapshotRow[]).map(toBranchPartyItem);
  }

  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity, show_headcount")
    .eq("branch_id", branchId)
    .gte("start_at", startAt)
    .lt("start_at", endAt)
    .order("start_at", { ascending: true });

  if (fallbackError || !fallbackData) {
    return [] satisfies BranchPartyItem[];
  }

  return attachAppliedCounts(branchId, fallbackData as BasePartyRow[]);
}

export async function getBranchPartyTemplate(branchId: string, selectedDate: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const selectedDayStart = toKstIso(selectedDate, "00:00");

  const { data: previousParty } = await supabaseAdmin
    .from("parties")
    .select("title, start_at, end_at, male_capacity, female_capacity")
    .eq("branch_id", branchId)
    .lt("start_at", selectedDayStart)
    .order("start_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const templateSource =
    previousParty ??
    (
      await supabaseAdmin
        .from("parties")
        .select("title, start_at, end_at, male_capacity, female_capacity")
        .eq("branch_id", branchId)
        .order("start_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data ??
    null;

  if (!templateSource) {
    return null;
  }

  return {
    title: templateSource.title,
    startTime: formatTimeInput(templateSource.start_at),
    endTime: formatTimeInput(templateSource.end_at),
    maleCapacity: templateSource.male_capacity,
    femaleCapacity: templateSource.female_capacity,
  } satisfies BranchPartyTemplate;
}

export async function createBranchParty(input: CreateBranchPartyInput) {
  const existingParties = await listBranchPartiesOnDate(
    input.branchId,
    input.startAt.slice(0, 10),
  );

  if (existingParties.length > 0) {
    return {
      ok: false as const,
      message: "선택한 날짜에는 이미 파티가 있습니다.",
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const totalCapacity = input.maleCapacity + input.femaleCapacity;
  const { data, error } = await supabaseAdmin
    .from("parties")
    .insert({
      branch_id: input.branchId,
      title: input.title,
      status: input.isVisible ? "published" : "draft",
      start_at: input.startAt,
      end_at: input.endAt,
      show_headcount: input.showHeadcount,
      capacity: totalCapacity,
      male_capacity: input.maleCapacity,
      female_capacity: input.femaleCapacity,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "파티를 생성하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
    partyId: data.id,
  };
}

export async function updateBranchParty(input: UpdateBranchPartyInput) {
  const sameDateParties = await listBranchPartiesOnDate(
    input.branchId,
    input.startAt.slice(0, 10),
  );

  if (sameDateParties.some((party) => party.id !== input.partyId)) {
    return {
      ok: false as const,
      message: "선택한 날짜에는 이미 다른 파티가 있습니다.",
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingParty, error: existingPartyError } = await supabaseAdmin
    .from("branch_party_snapshots")
    .select("status, male_participant_count, female_participant_count")
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .maybeSingle();

  let existingStatus: BranchPartyItem["status"] | null = null;
  let occupiedCounts = { male: 0, female: 0 };

  if (!existingPartyError && existingParty) {
    existingStatus = existingParty.status;
    occupiedCounts = {
      male: existingParty.male_participant_count ?? 0,
      female: existingParty.female_participant_count ?? 0,
    };
  } else {
    const [{ data: partyData, error: partyDataError }, { data: occupiedReservations, error: occupiedError }] =
      await Promise.all([
        supabaseAdmin
          .from("parties")
          .select("status")
          .eq("branch_id", input.branchId)
          .eq("id", input.partyId)
          .maybeSingle(),
        supabaseAdmin
          .from("reservations")
          .select("applicant_gender")
          .eq("branch_id", input.branchId)
          .eq("party_id", input.partyId)
          .in("status", ["confirmed", "completed"]),
      ]);

    if (partyDataError || !partyData || occupiedError) {
      return {
        ok: false as const,
        message: "파티를 찾지 못했습니다.",
      };
    }

    existingStatus = partyData.status;
    occupiedCounts = (occupiedReservations ?? []).reduce(
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

  if (input.maleCapacity < occupiedCounts.male || input.femaleCapacity < occupiedCounts.female) {
    return {
      ok: false as const,
      message: "현재 참가 인원보다 적게 설정할 수 없습니다.",
    };
  }

  const totalCapacity = input.maleCapacity + input.femaleCapacity;
  const nextStatus =
    existingStatus === "draft" || existingStatus === "published"
      ? input.isVisible
        ? "published"
        : "draft"
      : existingStatus;
  const { data, error } = await supabaseAdmin
    .from("parties")
    .update({
      title: input.title,
      start_at: input.startAt,
      end_at: input.endAt,
      status: nextStatus,
      show_headcount: input.showHeadcount,
      capacity: totalCapacity,
      male_capacity: input.maleCapacity,
      female_capacity: input.femaleCapacity,
    })
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "파티 기본 정보를 수정하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
  };
}

export async function updatePartyPublicVisibility(input: {
  branchId: string;
  partyId: string;
  isVisible: boolean;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingParty, error: existingPartyError } = await supabaseAdmin
    .from("parties")
    .select("id, status")
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .maybeSingle();

  if (existingPartyError || !existingParty) {
    return {
      ok: false as const,
      message: "파티를 찾지 못했습니다.",
    };
  }

  if (!["draft", "published"].includes(existingParty.status)) {
    return {
      ok: false as const,
      message: "현재 상태에서는 공개 노출을 변경할 수 없습니다.",
    };
  }

  const nextStatus = input.isVisible ? "published" : "draft";
  const { data, error } = await supabaseAdmin
    .from("parties")
    .update({ status: nextStatus })
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "공개 노출 설정을 변경하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
  };
}

export async function deleteBranchParty(input: { branchId: string; partyId: string }) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { count, error: countError } = await supabaseAdmin
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", input.branchId)
    .eq("party_id", input.partyId);

  if (countError) {
    return {
      ok: false as const,
      reason: "unknown" as const,
      message: "예약 내역을 확인하지 못했습니다.",
    };
  }

  if ((count ?? 0) > 0) {
    return {
      ok: false as const,
      reason: "has_reservations" as const,
      message: "예약 내역이 있는 파티는 삭제할 수 없습니다.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("parties")
    .delete()
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      reason: "unknown" as const,
      message: error?.message ?? "파티를 삭제하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
  };
}

export async function getBranchPartyDetail(branchId: string, partyId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("branch_party_snapshots")
    .select(BRANCH_PARTY_SNAPSHOT_SELECT)
    .eq("branch_id", branchId)
    .eq("id", partyId)
    .maybeSingle();

  if (!error && data) {
    return toBranchPartyItem(data as unknown as BranchPartySnapshotRow);
  }

  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity, show_headcount")
    .eq("branch_id", branchId)
    .eq("id", partyId)
    .maybeSingle();

  if (fallbackError || !fallbackData) {
    return null;
  }

  const [party] = await attachAppliedCounts(branchId, [fallbackData as BasePartyRow]);
  return party ?? null;
}

async function attachAppliedCounts(branchId: string, parties: BasePartyRow[]) {
  if (parties.length === 0) {
    return [] satisfies BranchPartyItem[];
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const partyIds = parties.map((party) => party.id);
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("party_id, applicant_gender, status")
    .eq("branch_id", branchId)
    .in("party_id", partyIds)
    .in("status", ["pending", "confirmed", "waitlisted", "completed"]);

  if (error || !data) {
    return parties.map((party) => ({
      ...party,
      male_applied: 0,
      female_applied: 0,
      male_applicant_count: 0,
      female_applicant_count: 0,
      male_waitlist_count: 0,
      female_waitlist_count: 0,
      male_participant_count: 0,
      female_participant_count: 0,
      show_headcount: party.show_headcount ?? true,
    })) satisfies BranchPartyItem[];
  }

  const counterMap = new Map<
    string,
    {
      maleApplied: number;
      femaleApplied: number;
      maleApplicants: number;
      femaleApplicants: number;
      maleWaitlist: number;
      femaleWaitlist: number;
      maleParticipants: number;
      femaleParticipants: number;
    }
  >();

  for (const row of data) {
    const current = counterMap.get(row.party_id) ?? {
      maleApplied: 0,
      femaleApplied: 0,
      maleApplicants: 0,
      femaleApplicants: 0,
      maleWaitlist: 0,
      femaleWaitlist: 0,
      maleParticipants: 0,
      femaleParticipants: 0,
    };

    if (row.applicant_gender === "male") {
      current.maleApplied += 1;

      if (row.status === "pending" || row.status === "waitlisted") {
        current.maleApplicants += 1;
      }

      if (row.status === "waitlisted") {
        current.maleWaitlist += 1;
      }

      if (row.status === "confirmed" || row.status === "completed") {
        current.maleParticipants += 1;
      }
    }

    if (row.applicant_gender === "female") {
      current.femaleApplied += 1;

      if (row.status === "pending" || row.status === "waitlisted") {
        current.femaleApplicants += 1;
      }

      if (row.status === "waitlisted") {
        current.femaleWaitlist += 1;
      }

      if (row.status === "confirmed" || row.status === "completed") {
        current.femaleParticipants += 1;
      }
    }

    counterMap.set(row.party_id, current);
  }

  return parties.map((party) => ({
    ...party,
    male_applied: counterMap.get(party.id)?.maleApplied ?? 0,
    female_applied: counterMap.get(party.id)?.femaleApplied ?? 0,
    male_applicant_count: counterMap.get(party.id)?.maleApplicants ?? 0,
    female_applicant_count: counterMap.get(party.id)?.femaleApplicants ?? 0,
    male_waitlist_count: counterMap.get(party.id)?.maleWaitlist ?? 0,
    female_waitlist_count: counterMap.get(party.id)?.femaleWaitlist ?? 0,
    male_participant_count: counterMap.get(party.id)?.maleParticipants ?? 0,
    female_participant_count: counterMap.get(party.id)?.femaleParticipants ?? 0,
    show_headcount: party.show_headcount ?? true,
  })) satisfies BranchPartyItem[];
}

export async function listBranchApplicants(
  branchId: string,
  limit = 40,
  options?: {
    ascending?: boolean;
    activeOnly?: boolean;
  },
) {
  const supabaseAdmin = createSupabaseAdminClient();
  let query = supabaseAdmin
    .from("reservations")
    .select(
      "id, reservation_code, reserver_name, reserver_phone, applicant_gender, participant_count, status, submitted_at, party_id, party:parties!reservations_party_branch_fk(title, start_at)",
    )
    .eq("branch_id", branchId)
    .order("submitted_at", { ascending: options?.ascending ?? false })
    .limit(limit);

  if (options?.activeOnly) {
    query = query.in("status", ["pending", "confirmed", "waitlisted", "completed"]);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] satisfies BranchApplicantItem[];
  }

  return data.map((item) => ({
    id: item.id,
    reservation_code: item.reservation_code,
    reserver_name: item.reserver_name,
    reserver_phone: item.reserver_phone,
    applicant_gender:
      item.applicant_gender === "male" || item.applicant_gender === "female"
        ? item.applicant_gender
        : null,
    participant_count: item.participant_count,
    status: item.status,
    submitted_at: item.submitted_at,
    party_id: item.party_id,
    party_title: getRelatedParty(item.party)?.title ?? null,
    party_start_at: getRelatedParty(item.party)?.start_at ?? null,
  })) satisfies BranchApplicantItem[];
}

export async function listPartyReservations(branchId: string, partyId: string, limit = 200) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select(
      "id, reservation_code, reserver_name, reserver_phone, applicant_gender, applicant_birth_date, applicant_instagram_id, bank_name, account_number, referral_sources, status, submitted_at",
    )
    .eq("branch_id", branchId)
    .eq("party_id", partyId)
    .order("submitted_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [] satisfies PartyReservationItem[];
  }

  return data.map((item) => ({
    id: item.id,
    reservation_code: item.reservation_code,
    reserver_name: item.reserver_name,
    reserver_phone: item.reserver_phone,
    applicant_gender:
      item.applicant_gender === "male" || item.applicant_gender === "female"
        ? item.applicant_gender
        : null,
    applicant_birth_date: item.applicant_birth_date ?? null,
    applicant_instagram_id: item.applicant_instagram_id ?? null,
    bank_name: item.bank_name ?? null,
    account_number: item.account_number ?? null,
    referral_sources: Array.isArray(item.referral_sources)
      ? item.referral_sources.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [],
    status: item.status,
    submitted_at: item.submitted_at,
  })) satisfies PartyReservationItem[];
}

export async function updatePartyReservationStatus(input: {
  branchId: string;
  partyId: string;
  reservationId: string;
  nextStatus: Extract<PartyReservationStatus, "confirmed" | "cancelled">;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (input.nextStatus === "confirmed") {
    let party:
      | {
          capacity: number;
          male_capacity: number;
          female_capacity: number;
          male_participant_count?: number | null;
          female_participant_count?: number | null;
        }
      | null = null;

    const [{ data: snapshotParty, error: snapshotPartyError }, { data: targetReservation, error: reservationError }] =
      await Promise.all([
        supabaseAdmin
          .from("branch_party_snapshots")
          .select("capacity, male_capacity, female_capacity, male_participant_count, female_participant_count")
          .eq("branch_id", input.branchId)
          .eq("id", input.partyId)
          .maybeSingle(),
        supabaseAdmin
          .from("reservations")
          .select("id, applicant_gender")
          .eq("id", input.reservationId)
          .eq("branch_id", input.branchId)
          .eq("party_id", input.partyId)
          .maybeSingle(),
      ]);

    if (!reservationError && targetReservation && !snapshotPartyError && snapshotParty) {
      party = snapshotParty;
    } else {
      const [
        { data: fallbackParty, error: fallbackPartyError },
        { data: occupiedReservations, error: occupiedError },
      ] = await Promise.all([
        supabaseAdmin
          .from("parties")
          .select("capacity, male_capacity, female_capacity")
          .eq("branch_id", input.branchId)
          .eq("id", input.partyId)
          .maybeSingle(),
        supabaseAdmin
          .from("reservations")
          .select("applicant_gender")
          .eq("branch_id", input.branchId)
          .eq("party_id", input.partyId)
          .in("status", ["confirmed", "completed"]),
      ]);

      if (reservationError || !targetReservation || fallbackPartyError || !fallbackParty || occupiedError) {
        return {
          ok: false as const,
          message: "참가 가능 인원을 확인하지 못했습니다.",
        };
      }

      const occupiedCounts = (occupiedReservations ?? []).reduce(
        (totals, item) => {
          if (item.applicant_gender === "male") {
            totals.male += 1;
          }

          if (item.applicant_gender === "female") {
            totals.female += 1;
          }

          return totals;
        },
        { male: 0, female: 0 },
      );

      party = {
        ...fallbackParty,
        male_participant_count: occupiedCounts.male,
        female_participant_count: occupiedCounts.female,
      };
    }

    if (!targetReservation || !party) {
      return {
        ok: false as const,
        message: "참가 가능 인원을 확인하지 못했습니다.",
      };
    }

    const totalParticipants =
      (party.male_participant_count ?? 0) + (party.female_participant_count ?? 0);

    if (totalParticipants >= party.capacity) {
      return {
        ok: false as const,
        reason: "capacity_full" as const,
        message: "이미 다 찼습니다.",
      };
    }

    if (
      targetReservation.applicant_gender === "male" &&
      (party.male_participant_count ?? 0) >= party.male_capacity
    ) {
      return {
        ok: false as const,
        reason: "male_full" as const,
        message: "남자 정원이 다 찼습니다.",
      };
    }

    if (
      targetReservation.applicant_gender === "female" &&
      (party.female_participant_count ?? 0) >= party.female_capacity
    ) {
      return {
        ok: false as const,
        reason: "female_full" as const,
        message: "여자 정원이 다 찼습니다.",
      };
    }
  }

  const payload =
    input.nextStatus === "confirmed"
      ? {
          status: "confirmed" as const,
          confirmed_at: now,
          cancelled_at: null,
          rejected_at: null,
        }
      : {
          status: "cancelled" as const,
          cancelled_at: now,
          confirmed_at: null,
          rejected_at: null,
        };

  const { data, error } = await supabaseAdmin
    .from("reservations")
    .update(payload)
    .eq("id", input.reservationId)
    .eq("branch_id", input.branchId)
    .eq("party_id", input.partyId)
    .in("status", ["pending", "waitlisted", "confirmed", "completed"])
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "예약 상태를 변경하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
  };
}

function toBranchPartyItem(row: BranchPartySnapshotRow) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    start_at: row.start_at,
    end_at: row.end_at,
    capacity: row.capacity,
    male_capacity: row.male_capacity,
    female_capacity: row.female_capacity,
    male_applied: row.male_applied ?? 0,
    female_applied: row.female_applied ?? 0,
    male_applicant_count: row.male_applicant_count ?? 0,
    female_applicant_count: row.female_applicant_count ?? 0,
    male_waitlist_count: row.male_waitlist_count ?? 0,
    female_waitlist_count: row.female_waitlist_count ?? 0,
    male_participant_count: row.male_participant_count ?? 0,
    female_participant_count: row.female_participant_count ?? 0,
    show_headcount: row.show_headcount ?? true,
  } satisfies BranchPartyItem;
}

function getRelatedParty(
  value: unknown,
): { title: string | null; start_at: string | null } | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" && first !== null
      ? {
          title:
            typeof (first as { title?: unknown }).title === "string"
              ? (first as { title: string }).title
              : null,
          start_at:
            typeof (first as { start_at?: unknown }).start_at === "string"
              ? (first as { start_at: string }).start_at
              : null,
        }
      : null;
  }

  if (typeof value === "object") {
    return {
      title:
        typeof (value as { title?: unknown }).title === "string"
          ? (value as { title: string }).title
          : null,
      start_at:
        typeof (value as { start_at?: unknown }).start_at === "string"
          ? (value as { start_at: string }).start_at
          : null,
    };
  }

  return null;
}

function toDashboardReservationRow(value: unknown): DashboardReservationRow | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as {
    id?: unknown;
    reservation_code?: unknown;
    reserver_name?: unknown;
    reserver_phone?: unknown;
    status?: unknown;
    submitted_at?: unknown;
    applicant_gender?: unknown;
    applicant_birth_date?: unknown;
    applicant_instagram_id?: unknown;
    referral_sources?: unknown;
    party?: unknown;
  };
  const party = getRelatedParty(row.party);

  if (
    typeof row.id !== "string" ||
    typeof row.reservation_code !== "string" ||
    typeof row.reserver_name !== "string" ||
    typeof row.reserver_phone !== "string" ||
    typeof row.status !== "string" ||
    typeof row.submitted_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    reservation_code: row.reservation_code,
    reserver_name: row.reserver_name,
    reserver_phone: row.reserver_phone,
    status: row.status as BranchApplicantItem["status"],
    submitted_at: row.submitted_at,
    applicant_gender:
      row.applicant_gender === "male" || row.applicant_gender === "female"
        ? row.applicant_gender
        : null,
    applicant_birth_date:
      typeof row.applicant_birth_date === "string" ? row.applicant_birth_date : null,
    applicant_instagram_id:
      typeof row.applicant_instagram_id === "string"
        ? row.applicant_instagram_id
        : null,
    referral_sources: Array.isArray(row.referral_sources)
      ? row.referral_sources.filter(
          (item: unknown): item is string => typeof item === "string" && item.trim().length > 0,
        )
      : [],
    party_id:
      typeof (row as { party_id?: unknown }).party_id === "string"
        ? (row as { party_id: string }).party_id
        : null,
    party_title: party?.title ?? null,
    party_start_at: party?.start_at ?? null,
  };
}

function toDashboardQueueItem(row: DashboardReservationRow): BranchDashboardQueueItem {
  return {
    id: row.id,
    reservation_code: row.reservation_code,
    reserver_name: row.reserver_name,
    reserver_phone: row.reserver_phone,
    applicant_gender: row.applicant_gender,
    applicant_age_band: getAgeBandLabel(row.applicant_birth_date),
    applicant_instagram_id: row.applicant_instagram_id,
    submitted_at: row.submitted_at,
    party_id: row.party_id,
    party_title: row.party_title,
    party_start_at: row.party_start_at,
  };
}

function buildReferralRows(
  reservations: DashboardReservationRow[],
): BranchDashboardDistributionItem[] {
  const counts = new Map<string, number>();

  for (const row of reservations) {
    for (const source of row.referral_sources) {
      counts.set(source, (counts.get(source) ?? 0) + 1);
    }
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      ratio: total > 0 ? count / total : 0,
    }));
}

function buildGenderRows(
  reservations: DashboardReservationRow[],
): BranchDashboardDistributionItem[] {
  const male = reservations.filter((item) => item.applicant_gender === "male").length;
  const female = reservations.filter((item) => item.applicant_gender === "female").length;
  const total = male + female;

  return [
    { label: "남", count: male, ratio: total > 0 ? male / total : 0 },
    { label: "여", count: female, ratio: total > 0 ? female / total : 0 },
  ];
}

function buildAgeRows(
  reservations: DashboardReservationRow[],
): BranchDashboardDistributionItem[] {
  const labels = ["20-24", "25-29", "30-34", "35+"];
  const counts = new Map<string, number>(labels.map((label) => [label, 0]));

  for (const row of reservations) {
    const ageBand = getAgeBandLabel(row.applicant_birth_date);
    if (counts.has(ageBand)) {
      counts.set(ageBand, (counts.get(ageBand) ?? 0) + 1);
    }
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  return labels.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
    ratio: total > 0 ? (counts.get(label) ?? 0) / total : 0,
  }));
}

function buildWeekdayTrend(
  reservations: DashboardReservationRow[],
): BranchDashboardTrendItem[] {
  const labels = ["월", "화", "수", "목", "금", "토", "일"];
  const counts = Array.from({ length: labels.length }, () => 0);

  for (const row of reservations) {
    const weekdayIndex = getKstWeekdayIndex(row.submitted_at);
    counts[weekdayIndex] += 1;
  }

  return labels.map((label, index) => ({
    label,
    count: counts[index],
  }));
}

function buildHourTrend(
  reservations: DashboardReservationRow[],
): BranchDashboardTrendItem[] {
  const counts = Array.from({ length: 24 }, () => 0);

  for (const row of reservations) {
    const hour = getKstHour(row.submitted_at);
    counts[hour] += 1;
  }

  return counts.map((count, hour) => ({
    label: `${String(hour).padStart(2, "0")}시`,
    count,
  }));
}

export async function updatePartyHeadcountVisibility(input: {
  branchId: string;
  partyId: string;
  showHeadcount: boolean;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("parties")
    .update({
      show_headcount: input.showHeadcount,
    })
    .eq("branch_id", input.branchId)
    .eq("id", input.partyId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "인원수 노출 설정을 변경하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
  };
}

export function groupPartiesByDay(parties: BranchPartyItem[]) {
  const groups = new Map<string, BranchPartyItem[]>();

  for (const party of parties) {
    const key = party.start_at.slice(0, 10);
    const items = groups.get(key) ?? [];
    items.push(party);
    groups.set(key, items);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, items]) => ({
      key,
      date: parseDateKey(key),
      parties: items.sort((left, right) => left.start_at.localeCompare(right.start_at)),
    }));
}

export function formatConsoleDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(value));
}

export function formatConsoleDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function formatConsoleTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function formatTimeInput(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function getBranchStatusTone(status: BranchListItem["status"]) {
  return status === "active"
    ? "border-[#285c43] bg-[#0f2018] text-[#8ee2b4]"
    : status === "inactive"
      ? "border-[#665529] bg-[#211a0d] text-[#f0d18a]"
      : "border-[#3c4854] bg-[#131920] text-[#a5b3bf]";
}

export function getBranchStatusLabel(status: BranchListItem["status"]) {
  return status === "active"
    ? "활성"
    : status === "inactive"
      ? "비활성"
      : "보관";
}

export function getPartyStatusTone(status: BranchPartyItem["status"]) {
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

export function getPartyStatusLabel(status: BranchPartyItem["status"]) {
  return status === "published"
    ? "게시"
    : status === "draft"
      ? "초안"
      : status === "closed"
        ? "마감"
        : status === "cancelled"
          ? "취소"
          : "완료";
}

export function getApplicantStatusTone(status: BranchApplicantItem["status"]) {
  return status === "confirmed"
    ? "border-[#285c43] bg-[#0f2018] text-[#8ee2b4]"
    : status === "pending"
      ? "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]"
      : status === "waitlisted"
        ? "border-[#665529] bg-[#211a0d] text-[#f0d18a]"
        : status === "cancelled" || status === "rejected"
          ? "border-[#5a2430] bg-[#1a0d12] text-[#ffd7de]"
        : "border-[#3c4854] bg-[#131920] text-[#a5b3bf]";
}

export function getApplicantStatusLabel(status: BranchApplicantItem["status"]) {
  return status === "confirmed"
    ? "참가"
    : status === "pending"
      ? "신청"
      : status === "waitlisted"
        ? "대기"
        : status === "cancelled"
          ? "취소"
          : status === "rejected"
            ? "거절"
            : status === "completed"
              ? "완료"
              : "미참석";
}

export function toKstIso(date: string, time: string) {
  return new Date(`${date}T${time}:00+09:00`).toISOString();
}

function addDays(date: string, days: number) {
  const current = new Date(`${date}T00:00:00+09:00`);
  current.setDate(current.getDate() + days);

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getKstDateKey(value: Date | string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function isSameKstDate(value: string, dateKey: string) {
  return getKstDateKey(value) === dateKey;
}

function getKstWeekdayIndex(value: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date(value));

  return weekday === "Mon"
    ? 0
    : weekday === "Tue"
      ? 1
      : weekday === "Wed"
        ? 2
        : weekday === "Thu"
          ? 3
          : weekday === "Fri"
            ? 4
            : weekday === "Sat"
              ? 5
              : 6;
}

function getKstHour(value: string) {
  return Number.parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(value)),
    10,
  );
}

function getAgeBandLabel(birthYearValue: string | null) {
  const age = getKoreanAge(birthYearValue);

  if (age === null) {
    return "-";
  }

  if (age < 25) {
    return "20-24";
  }

  if (age < 30) {
    return "25-29";
  }

  if (age < 35) {
    return "30-34";
  }

  return "35+";
}

function getKoreanAge(birthYearValue: string | null) {
  if (!birthYearValue) {
    return null;
  }

  const todayKey = getKstDateKey(new Date());
  const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);
  const normalizedValue = birthYearValue.trim();

  if (/^\d{4}$/.test(normalizedValue)) {
    return todayYear - Number(normalizedValue);
  }

  const [birthYear, birthMonth, birthDay] = normalizedValue.split("-").map(Number);

  if (!birthYear || !birthMonth || !birthDay) {
    return null;
  }

  let age = todayYear - birthYear;

  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age -= 1;
  }

  return age;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
