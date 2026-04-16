import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isValidAdminLoginId,
  normalizeAdminLoginId,
  toAdminAuthEmail,
} from "./credentials";

export async function hasAnyAdminUsers() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { count } = await supabaseAdmin
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  return (count ?? 0) > 0;
}

export async function registerInitialSuperAdmin(input: {
  loginId: string;
  password: string;
}) {
  const loginId = normalizeAdminLoginId(input.loginId);

  if (!isValidAdminLoginId(loginId)) {
    return { ok: false as const, message: "아이디 형식을 확인하세요." };
  }

  if (input.password.length < 8) {
    return { ok: false as const, message: "비밀번호는 8자 이상이어야 합니다." };
  }

  if (await hasAnyAdminUsers()) {
    return { ok: false as const, message: "초기 관리자 생성이 닫혔습니다." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const authEmail = toAdminAuthEmail(loginId);
  const createUserResult = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      login_id: loginId,
    },
  });

  if (createUserResult.error || !createUserResult.data.user) {
    return {
      ok: false as const,
      message: createUserResult.error?.message ?? "관리자 계정을 생성하지 못했습니다.",
    };
  }

  const authUserId = createUserResult.data.user.id;
  const insertAdminUserResult = await supabaseAdmin.from("admin_users").insert({
    auth_user_id: authUserId,
    login_id: loginId,
    role: "super_admin",
    status: "active",
  });

  if (insertAdminUserResult.error) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    return {
      ok: false as const,
      message: insertAdminUserResult.error.message,
    };
  }

  return { ok: true as const };
}

export async function signInAdminWithLoginId(loginIdInput: string, password: string) {
  const loginId = normalizeAdminLoginId(loginIdInput);

  if (!isValidAdminLoginId(loginId)) {
    return { ok: false as const, message: "아이디 형식을 확인하세요." };
  }

  const supabase = await createSupabaseServerClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email: toAdminAuthEmail(loginId),
    password,
  });

  if (signInResult.error || !signInResult.data.user) {
    return {
      ok: false as const,
      message: signInResult.error?.message ?? "로그인에 실패했습니다.",
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("status")
    .eq("auth_user_id", signInResult.data.user.id)
    .maybeSingle();

  if (adminUser?.status !== "active") {
    await supabase.auth.signOut();
    return { ok: false as const, message: "비활성화된 계정입니다." };
  }

  return { ok: true as const };
}

export async function createBranchAdminAccount(input: {
  branchId: string;
  loginId: string;
  password: string;
}) {
  const loginId = normalizeAdminLoginId(input.loginId);

  if (!isValidAdminLoginId(loginId)) {
    return { ok: false as const, message: "아이디 형식을 확인하세요." };
  }

  if (input.password.length < 8) {
    return { ok: false as const, message: "비밀번호는 8자 이상이어야 합니다." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const authEmail = toAdminAuthEmail(loginId);
  const createUserResult = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      login_id: loginId,
    },
  });

  if (createUserResult.error || !createUserResult.data.user) {
    return {
      ok: false as const,
      message: createUserResult.error?.message ?? "지점 관리자 계정을 생성하지 못했습니다.",
    };
  }

  const authUserId = createUserResult.data.user.id;
  const insertAdminUserResult = await supabaseAdmin
    .from("admin_users")
    .insert({
      auth_user_id: authUserId,
      login_id: loginId,
      role: "branch_admin",
      status: "active",
    })
    .select("id")
    .single();

  if (insertAdminUserResult.error || !insertAdminUserResult.data) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    return {
      ok: false as const,
      message: insertAdminUserResult.error?.message ?? "지점 관리자 계정을 저장하지 못했습니다.",
    };
  }

  const accessResult = await supabaseAdmin.from("admin_user_branch_access").insert({
    admin_user_id: insertAdminUserResult.data.id,
    branch_id: input.branchId,
  });

  if (accessResult.error) {
    await supabaseAdmin.from("admin_users").delete().eq("id", insertAdminUserResult.data.id);
    await supabaseAdmin.auth.admin.deleteUser(authUserId);
    return { ok: false as const, message: accessResult.error.message };
  }

  return { ok: true as const };
}
