"use server";

import { redirect } from "next/navigation";
import { requireSuperAdminContext } from "@/features/admin-auth/server/admin-context";
import { createBranch } from "@/features/branches/server/branches";

type CreateBranchActionState = {
  errorMessage: string | null;
};

export async function createBranchAction(
  _previousState: CreateBranchActionState,
  formData: FormData,
): Promise<CreateBranchActionState> {
  await requireSuperAdminContext();

  const name = getFormValue(formData, "name");
  const phone = getFormValue(formData, "phone");
  const address = getFormValue(formData, "address");
  const instagramUrl = getFormValue(formData, "instagramUrl");

  if (!name) {
    return { errorMessage: "지점명을 입력하세요." };
  }

  const result = await createBranch({ name, phone, address, instagramUrl });

  if (!result.ok) {
    return { errorMessage: result.message };
  }

  redirect(`/admin/branches/${result.branchId}?created=1`);
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
