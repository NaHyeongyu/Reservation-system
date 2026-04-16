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
};

export type BranchApplicantItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
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
  party_title: string | null;
  party_start_at: string | null;
};

export type PartyReservationItem = {
  id: string;
  reservation_code: string;
  reserver_name: string;
  reserver_phone: string;
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
};

export type CreateBranchPartyInput = {
  branchId: string;
  title: string;
  startAt: string;
  endAt: string;
  maleCapacity: number;
  femaleCapacity: number;
};

export type BranchPartyTemplate = {
  title: string;
  startTime: string;
  endTime: string;
  maleCapacity: number;
  femaleCapacity: number;
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

export async function getBranchDashboardSnapshot(branchId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const [
    totalPartiesResult,
    upcomingPartiesResult,
    totalApplicantsResult,
    pendingApplicantsResult,
    upcomingParties,
    recentApplicants,
  ] = await Promise.all([
    supabaseAdmin.from("parties").select("id", { count: "exact", head: true }).eq("branch_id", branchId),
    supabaseAdmin
      .from("parties")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("start_at", now)
      .in("status", ["draft", "published", "closed"]),
    supabaseAdmin
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId),
    supabaseAdmin
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("status", "pending"),
    listBranchParties(branchId, 5, true),
    listBranchApplicants(branchId, 6),
  ]);

  return {
    totalParties: totalPartiesResult.count ?? 0,
    upcomingParties: upcomingPartiesResult.count ?? 0,
    totalApplicants: totalApplicantsResult.count ?? 0,
    pendingApplicants: pendingApplicantsResult.count ?? 0,
    upcomingPartyRows: upcomingParties,
    recentApplicantRows: recentApplicants,
  };
}

export async function listBranchParties(
  branchId: string,
  limit = 24,
  upcomingOnly = false,
) {
  const supabaseAdmin = createSupabaseAdminClient();
  let query = supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity")
    .eq("branch_id", branchId)
    .order("start_at", { ascending: true })
    .limit(limit);

  if (upcomingOnly) {
    query = query.gte("start_at", new Date().toISOString());
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] satisfies BranchPartyItem[];
  }

  return data as BranchPartyItem[];
}

export async function listBranchPartiesOnDate(branchId: string, date: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const startAt = toKstIso(date, "00:00");
  const nextDate = addDays(date, 1);
  const endAt = toKstIso(nextDate, "00:00");

  const { data, error } = await supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity")
    .eq("branch_id", branchId)
    .gte("start_at", startAt)
    .lt("start_at", endAt)
    .order("start_at", { ascending: true });

  if (error || !data) {
    return [] satisfies BranchPartyItem[];
  }

  return data as BranchPartyItem[];
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
      status: "draft",
      start_at: input.startAt,
      end_at: input.endAt,
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

export async function getBranchPartyDetail(branchId: string, partyId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("parties")
    .select("id, title, status, start_at, end_at, capacity, male_capacity, female_capacity")
    .eq("branch_id", branchId)
    .eq("id", partyId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BranchPartyItem;
}

export async function listBranchApplicants(branchId: string, limit = 40) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select(
      "id, reservation_code, reserver_name, reserver_phone, participant_count, status, submitted_at, party_id",
    )
    .eq("branch_id", branchId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [] satisfies BranchApplicantItem[];
  }

  const partyIds = [...new Set(data.map((item) => item.party_id).filter(Boolean))];
  const partyMap = new Map<string, { title: string; start_at: string }>();

  if (partyIds.length > 0) {
    const { data: parties } = await supabaseAdmin
      .from("parties")
      .select("id, title, start_at")
      .in("id", partyIds);

    for (const party of parties ?? []) {
      partyMap.set(party.id, {
        title: party.title,
        start_at: party.start_at,
      });
    }
  }

  return data.map((item) => ({
    id: item.id,
    reservation_code: item.reservation_code,
    reserver_name: item.reserver_name,
    reserver_phone: item.reserver_phone,
    participant_count: item.participant_count,
    status: item.status,
    submitted_at: item.submitted_at,
    party_title: item.party_id ? (partyMap.get(item.party_id)?.title ?? null) : null,
    party_start_at: item.party_id ? (partyMap.get(item.party_id)?.start_at ?? null) : null,
  })) satisfies BranchApplicantItem[];
}

export async function listPartyReservations(branchId: string, partyId: string, limit = 200) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select(
      "id, reservation_code, reserver_name, reserver_phone, participant_count, status, submitted_at",
    )
    .eq("branch_id", branchId)
    .eq("party_id", partyId)
    .order("submitted_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [] satisfies PartyReservationItem[];
  }

  return data as PartyReservationItem[];
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
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

export function formatConsoleDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatConsoleTime(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
