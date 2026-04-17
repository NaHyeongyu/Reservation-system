"use server";

import { redirect } from "next/navigation";
import { requireBranchAccessContext } from "@/features/admin-auth/server/admin-context";
import { persistAdminSession } from "@/features/admin-auth/server/session";
import { updateBranchBasicInfo } from "@/features/branches/server/branches";
import {
  deleteBranchParty,
  toKstIso,
  updateBranchParty,
} from "@/features/branch-admin/server/workspace";

export async function updatePartyBasicInfoAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const returnParams = getPartyDetailReturnParams(formData);

  const partyId = getFormValue(formData, "partyId");
  const title = getFormValue(formData, "title");
  const eventDate = getFormValue(formData, "eventDate");
  const startTime = getFormValue(formData, "startTime");
  const endTime = getFormValue(formData, "endTime");
  const maleCapacity = Number.parseInt(getFormValue(formData, "maleCapacity"), 10);
  const femaleCapacity = Number.parseInt(getFormValue(formData, "femaleCapacity"), 10);
  const isVisible = getFormValue(formData, "isVisible") === "true";
  const showHeadcount = getFormValue(formData, "showHeadcount") === "true";

  if (!title) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  if (!Number.isInteger(maleCapacity) || maleCapacity < 0) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  if (!Number.isInteger(femaleCapacity) || femaleCapacity < 0) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  if (maleCapacity + femaleCapacity <= 0) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  const startAt = toKstIso(eventDate, startTime);
  const endAt = toKstIso(eventDate, endTime);

  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  const result = await updateBranchParty({
    branchId,
    partyId,
    title,
    startAt,
    endAt,
    maleCapacity,
    femaleCapacity,
    isVisible,
    showHeadcount,
  });

  if (!result.ok) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "party_update" }));
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "party" }));
}

export async function deletePartyAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  await requireBranchAccessContext(branchId);
  const source = getFormValue(formData, "from");
  const date = getFormValue(formData, "date");

  const partyId = getFormValue(formData, "partyId");
  const result = await deleteBranchParty({ branchId, partyId });

  if (!result.ok) {
    if (result.reason === "has_reservations") {
      redirect(
        buildPartyDetailRedirect(partyId, getPartyDetailReturnParams(formData), {
          error: "party_delete_reserved",
        }),
      );
    }

    redirect(
      buildPartyDetailRedirect(partyId, getPartyDetailReturnParams(formData), {
        error: "party_delete",
      }),
    );
  }

  if (source === "calendar") {
    const calendarQuery =
      /^\d{4}-\d{2}-\d{2}$/.test(date) ? `?date=${date}&deleted=1` : "?deleted=1";
    redirect(`/admin/calendar${calendarQuery}`);
  }

  redirect("/admin/parties?deleted=1");
}

export async function updateBranchInfoAction(formData: FormData) {
  const branchId = getFormValue(formData, "branchId");
  const admin = await requireBranchAccessContext(branchId);
  const returnParams = getPartyDetailReturnParams(formData);

  const partyId = getFormValue(formData, "partyId");
  const name = getFormValue(formData, "name");
  const phone = getFormValue(formData, "phone");
  const address = getFormValue(formData, "address");
  const instagramUrl = getFormValue(formData, "instagramUrl");

  if (!name) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "branch_update" }));
  }

  const result = await updateBranchBasicInfo({
    branchId,
    name,
    phone,
    address,
    instagramUrl,
  });

  if (!result.ok) {
    redirect(buildPartyDetailRedirect(partyId, returnParams, { error: "branch_update" }));
  }

  if (
    admin.role === "branch_admin" &&
    admin.currentBranch &&
    admin.currentBranch.id === branchId
  ) {
    await persistAdminSession({
      ...admin,
      currentBranch: result.branch,
    });
  }

  redirect(buildPartyDetailRedirect(partyId, returnParams, { updated: "branch" }));
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
