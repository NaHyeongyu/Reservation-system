"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { createBranchParty, getBranchWorkspace, toKstIso } from "@/features/branch-admin/server/workspace";

type CreatePartyActionState = {
  errorMessage: string | null;
};

export async function createPartyAction(_previousState: CreatePartyActionState, formData: FormData): Promise<CreatePartyActionState> {
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);

  const title = getFormValue(formData, "title");
  const eventDate = getFormValue(formData, "eventDate");
  const startTime = getFormValue(formData, "startTime");
  const endTime = getFormValue(formData, "endTime");
  const maleCapacity = Number.parseInt(getFormValue(formData, "maleCapacity"), 10);
  const femaleCapacity = Number.parseInt(getFormValue(formData, "femaleCapacity"), 10);

  if (!title) {
    return { errorMessage: "파티명을 입력하세요." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { errorMessage: "날짜를 확인하세요." };
  }

  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return { errorMessage: "시간을 확인하세요." };
  }

  if (!Number.isInteger(maleCapacity) || maleCapacity < 0) {
    return { errorMessage: "남자 인원을 확인하세요." };
  }

  if (!Number.isInteger(femaleCapacity) || femaleCapacity < 0) {
    return { errorMessage: "여자 인원을 확인하세요." };
  }

  if (maleCapacity + femaleCapacity <= 0) {
    return { errorMessage: "인원을 확인하세요." };
  }

  const startAt = toKstIso(eventDate, startTime);
  const endAt = toKstIso(eventDate, endTime);

  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    return { errorMessage: "종료 시간은 시작 시간보다 뒤여야 합니다." };
  }

  const result = await createBranchParty({ branchId: branch.id, title, startAt, endAt, maleCapacity, femaleCapacity });

  if (!result.ok) {
    return { errorMessage: result.message };
  }

  redirect(`/admin/parties?created=1&date=${eventDate}`);
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
