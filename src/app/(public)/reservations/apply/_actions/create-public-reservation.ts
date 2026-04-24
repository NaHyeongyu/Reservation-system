"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPublicReservation } from "@/features/reservations/server/public-reservations";

type CreatePublicReservationActionState = {
  errorMessage: string | null;
};

export async function createPublicReservationAction(
  _previousState: CreatePublicReservationActionState,
  formData: FormData,
): Promise<CreatePublicReservationActionState> {
  const partyId = getFormValue(formData, "partyId");
  const gender = getFormValue(formData, "gender");
  const birthYear = getFormValue(formData, "birthYear");
  const name = getFormValue(formData, "name");
  const instagramId = getFormValue(formData, "instagramId");
  const phoneNumber = getFormValue(formData, "phoneNumber");
  const bankName = getFormValue(formData, "bankName");
  const accountNumber = getFormValue(formData, "accountNumber");
  const partyTermsAgreed = getFormValue(formData, "partyTermsAgreed") === "true";
  const privacyAgreed = getFormValue(formData, "privacyAgreed") === "true";

  if (gender !== "male" && gender !== "female") {
    return { errorMessage: "성별을 선택하세요." };
  }

  const result = await createPublicReservation({
    partyId,
    gender,
    birthYear,
    name,
    instagramId,
    phoneNumber,
    bankName,
    accountNumber,
    partyTermsAgreed,
    privacyAgreed,
  });

  if (!result.ok) {
    return { errorMessage: result.message };
  }

  revalidatePath("/");
  revalidatePath("/reservations/apply");
  revalidatePath("/reservations/complete");
  redirect(`/reservations/complete?code=${result.reservationCode}`);
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
