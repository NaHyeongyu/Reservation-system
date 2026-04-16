"use server";

import { redirect } from "next/navigation";
import { registerInitialSuperAdmin, signInAdminWithLoginId } from "@/features/admin-auth/server/register-admin";

type CreateAdminActionState = {
  errorMessage: string | null;
};

export async function createAdminAccountAction(
  _previousState: CreateAdminActionState,
  formData: FormData,
): Promise<CreateAdminActionState> {
  const loginId = getFormValue(formData, "loginId");
  const password = getFormValue(formData, "password");

  const registerResult = await registerInitialSuperAdmin({ loginId, password });

  if (!registerResult.ok) {
    return { errorMessage: registerResult.message };
  }

  const signInResult = await signInAdminWithLoginId(loginId, password);

  if (!signInResult.ok) {
    return { errorMessage: signInResult.message };
  }

  redirect("/admin/dashboard?created=1");
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
