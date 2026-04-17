import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminBranchSnapshotById } from "@/features/branches/server/branches";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminSession, AdminStatus } from "./types";
import { getAdminSessionFromCookie } from "./session";

const getCurrentAuthUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user;
});

const getAdminUserByAuthUserId = cache(async (authUserId: string) => {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: adminUser, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, login_id, role, status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !adminUser) {
    return null;
  }

  return adminUser;
});

export const getCurrentAdminContext = cache(async (): Promise<AdminSession | null> => {
  const cookieSession = await getAdminSessionFromCookie();

  if (cookieSession) {
    if (
      cookieSession.role === "branch_admin" &&
      !cookieSession.currentBranch &&
      cookieSession.branchIds[0]
    ) {
      const currentBranch = await getAdminBranchSnapshotById(cookieSession.branchIds[0]);
      return {
        ...cookieSession,
        currentBranch,
      };
    }

    return cookieSession;
  }

  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  const adminUser = await getAdminUserByAuthUserId(user.id);

  if (!adminUser) {
    return null;
  }

  const branchIds =
    adminUser.role === "super_admin" ? [] : await getBranchIdsForAdmin(adminUser.id);
  const currentBranch =
    adminUser.role === "branch_admin" && branchIds[0]
      ? await getAdminBranchSnapshotById(branchIds[0])
      : null;

  return {
    adminUserId: adminUser.id,
    authUserId: adminUser.auth_user_id,
    loginId: adminUser.login_id,
    role: adminUser.role,
    status: adminUser.status as AdminStatus,
    branchIds,
    currentBranch,
  };
});

export async function requireAdminContext() {
  const admin = await getCurrentAdminContext();

  if (!admin) {
    redirect("/admin/login");
  }

  if (admin.status !== "active") {
    redirect("/admin/login?disabled=1");
  }

  return admin;
}

export async function requireSuperAdminContext() {
  const admin = await requireAdminContext();

  if (admin.role !== "super_admin") {
    redirect("/admin/dashboard?denied=1");
  }

  return admin;
}

export async function requireBranchAccessContext(branchId: string) {
  const admin = await requireAdminContext();

  if (admin.role === "super_admin") {
    return admin;
  }

  if (!admin.branchIds.includes(branchId)) {
    redirect("/admin/dashboard?denied=1");
  }

  return admin;
}

const getBranchIdsForAdmin = cache(async (adminUserId: string) => {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("admin_user_branch_access")
    .select("branch_id")
    .eq("admin_user_id", adminUserId);

  if (error || !data) {
    return [];
  }

  return data.map((item) => item.branch_id);
});
