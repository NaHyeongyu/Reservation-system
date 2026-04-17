import "server-only";

import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AdminBranchSnapshot,
  AdminSession,
} from "@/features/admin-auth/server/types";

export type BranchListItem = {
  id: string;
  name: string;
  status: "active" | "inactive" | "archived";
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  updated_at: string;
  assignedAdminCount: number;
};

export type BranchDetailItem = {
  id: string;
  name: string;
  status: "active" | "inactive" | "archived";
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function listBranchesForAdmin(admin: AdminSession) {
  const supabaseAdmin = createSupabaseAdminClient();
  let query = supabaseAdmin
    .from("branches")
    .select("id, name, status, phone, address, instagram_url, updated_at")
    .order("created_at", { ascending: false });

  if (admin.role !== "super_admin" && admin.branchIds.length > 0) {
    query = query.in("id", admin.branchIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] satisfies BranchListItem[];
  }

  const branchIds = data.map((branch) => branch.id);
  const countMap = new Map<string, number>();

  if (branchIds.length > 0) {
    const { data: assignments } = await supabaseAdmin
      .from("admin_user_branch_access")
      .select("branch_id")
      .in("branch_id", branchIds);

    for (const assignment of assignments ?? []) {
      countMap.set(assignment.branch_id, (countMap.get(assignment.branch_id) ?? 0) + 1);
    }
  }

  return data.map((branch) => ({
    ...branch,
    assignedAdminCount: countMap.get(branch.id) ?? 0,
  })) satisfies BranchListItem[];
}

export async function getBranchDetailForAdmin(admin: AdminSession, branchId: string) {
  if (admin.role !== "super_admin" && !admin.branchIds.includes(branchId)) {
    return null;
  }

  if (admin.currentBranch && admin.currentBranch.id === branchId) {
    return fromAdminBranchSnapshot(admin.currentBranch);
  }

  return getBranchDetailById(branchId);
}

export async function getAdminBranchSnapshotById(branchId: string) {
  const branch = await getBranchDetailById(branchId);
  return branch ? toAdminBranchSnapshot(branch) : null;
}

const getBranchDetailById = cache(async (branchId: string) => {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("branches")
    .select("id, name, status, phone, address, instagram_url, created_at, updated_at")
    .eq("id", branchId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BranchDetailItem;
});

export async function createBranch(input: {
  name: string;
  phone: string;
  address: string;
  instagramUrl: string;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("branches")
    .insert({
      name: input.name,
      phone: input.phone || null,
      address: input.address || null,
      instagram_url: input.instagramUrl || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "지점을 생성하지 못했습니다.",
    };
  }

  return { ok: true as const, branchId: data.id };
}

export async function updateBranchBasicInfo(input: {
  branchId: string;
  name: string;
  phone: string;
  address: string;
  instagramUrl: string;
}) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("branches")
    .update({
      name: input.name,
      phone: input.phone || null,
      address: input.address || null,
      instagram_url: input.instagramUrl || null,
    })
    .eq("id", input.branchId)
    .select("id, name, status, phone, address, instagram_url, created_at, updated_at")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "지점 정보를 수정하지 못했습니다.",
    };
  }

  return {
    ok: true as const,
    branch: toAdminBranchSnapshot(data as BranchDetailItem),
  };
}

export async function listBranchAdminAssignments(branchId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: assignments, error } = await supabaseAdmin
    .from("admin_user_branch_access")
    .select("admin_user_id")
    .eq("branch_id", branchId);

  if (error || !assignments || assignments.length === 0) {
    return [] as {
      adminUserId: string;
      loginId: string;
      role: string;
      status: string;
    }[];
  }

  const adminIds = assignments.map((item) => item.admin_user_id);
  const { data: adminUsers } = await supabaseAdmin
    .from("admin_users")
    .select("id, login_id, role, status")
    .in("id", adminIds)
    .order("created_at", { ascending: true });

  return (adminUsers ?? []).map((item) => ({
    adminUserId: item.id,
    loginId: item.login_id,
    role: item.role,
    status: item.status,
  }));
}

function toAdminBranchSnapshot(branch: BranchDetailItem): AdminBranchSnapshot {
  return {
    id: branch.id,
    name: branch.name,
    status: branch.status,
    phone: branch.phone,
    address: branch.address,
    instagramUrl: branch.instagram_url,
    createdAt: branch.created_at,
    updatedAt: branch.updated_at,
  };
}

function fromAdminBranchSnapshot(branch: AdminBranchSnapshot): BranchDetailItem {
  return {
    id: branch.id,
    name: branch.name,
    status: branch.status,
    phone: branch.phone,
    address: branch.address,
    instagram_url: branch.instagramUrl,
    created_at: branch.createdAt,
    updated_at: branch.updatedAt,
  };
}
