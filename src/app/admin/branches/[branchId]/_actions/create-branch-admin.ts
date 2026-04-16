"use server";

import { redirect } from "next/navigation";
import { requireSuperAdminContext } from "@/features/admin-auth/server/admin-context";
import { createBranchAdminAccount } from "@/features/admin-auth/server/register-admin";

type CreateBranchAdminActionState = {
  errorMessage: string | null;
};

export async function createBranchAdminAction(
  _previousState: CreateBranchAdminActionState,
  formData: FormData,
): Promise<CreateBranchAdminActionState> {
  await requireSuperAdminContext();

  const branchId = getFormValue(formData, "branchId");
  const loginId = getFormValue(formData, "loginId");
  const password = getFormValue(formData, "password");

  const result = await createBranchAdminAccount({ branchId, loginId, password });

  if (!result.ok) {
    return { errorMessage: result.message };
  }

  redirect(`/admin/branches/${branchId}?adminCreated=1`);
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
