"use server";

import { redirect } from "next/navigation";
import { requireBranchAccessContext } from "@/features/admin-auth/server/admin-context";
import {
  updatePartyPublicVisibility,
  updatePartyHeadcountVisibility,
  updatePartyReservationStatus,
} from "@/features/branch-admin/server/workspace";

export async function confirmPartyReservationAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const partyId = getFormValue(formData, "partyId");
  const reservationId = getFormValue(formData, "reservationId");
  const returnParams = getPartyDetailReturnParams(formData);

  const result = await updatePartyReservationStatus({
    branchId,
    partyId,
    reservationId,
    nextStatus: "confirmed",
  });

  if (!result.ok) {
    if (
      result.reason === "capacity_full" ||
      result.reason === "male_full" ||
      result.reason === "female_full"
    ) {
      redirect(buildPartyDetailRedirect(partyId, returnParams, { error: result.reason }));
    }

    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "confirm" }));
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "confirmed" }));
}

export async function cancelPartyReservationAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const partyId = getFormValue(formData, "partyId");
  const reservationId = getFormValue(formData, "reservationId");
  const returnParams = getPartyDetailReturnParams(formData);

  const result = await updatePartyReservationStatus({
    branchId,
    partyId,
    reservationId,
    nextStatus: "cancelled",
  });

  if (!result.ok) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "cancel" }));
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "cancelled" }));
}

export async function updatePartyHeadcountVisibilityAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const partyId = getFormValue(formData, "partyId");
  const showHeadcount = getFormValue(formData, "showHeadcount") === "true";
  const returnParams = getPartyDetailReturnParams(formData);

  const result = await updatePartyHeadcountVisibility({
    branchId,
    partyId,
    showHeadcount,
  });

  if (!result.ok) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "visibility" }));
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "visibility" }));
}

export async function updatePartyPublicVisibilityAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const partyId = getFormValue(formData, "partyId");
  const isVisible = getFormValue(formData, "isVisible") === "true";
  const returnParams = getPartyDetailReturnParams(formData);

  const result = await updatePartyPublicVisibility({
    branchId,
    partyId,
    isVisible,
  });

  if (!result.ok) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_visibility" }));
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "party_visibility" }));
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPartyDetailReturnParams(formData: FormData) {
  const params = new URLSearchParams();
  const source = getFormValue(formData, "from");
  const date = getFormValue(formData, "date");

  if (source === "calendar" || source === "parties") {
    params.set("from", source);
  }

  if (source === "calendar" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    params.set("date", date);
  }

  return params;
}

function buildPartyDetailRedirect(
  partyId: string,
  params: URLSearchParams,
  extra: Record<string, string>,
) {
  const nextParams = new URLSearchParams(params);

  for (const [key, value] of Object.entries(extra)) {
    nextParams.set(key, value);
  }

  return `/admin/parties/${partyId}?${nextParams.toString()}`;
}
