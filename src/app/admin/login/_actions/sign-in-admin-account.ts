"use server";

import { redirect } from "next/navigation";
import { signInAdminWithLoginId } from "@/features/admin-auth/server/register-admin";

type SignInActionState = {
  errorMessage: string | null;
};

export async function signInAdminAccountAction(
  _previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const loginId = getFormValue(formData, "loginId");
  const password = getFormValue(formData, "password");

  const result = await signInAdminWithLoginId(loginId, password);

  if (!result.ok) {
    return { errorMessage: result.message };
  }

  redirect("/admin/dashboard");
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
