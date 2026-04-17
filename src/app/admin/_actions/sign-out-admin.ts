"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/features/admin-auth/server/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAdminAction() {
  await clearAdminSession();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
