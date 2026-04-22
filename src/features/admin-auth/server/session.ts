import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAdminSessionSecret } from "@/lib/supabase/secret-env";
import type {
  AdminBranchSnapshot,
  AdminSession,
  AdminStatus,
  AdminRole,
} from "./types";

const ADMIN_SESSION_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30 * 6;

type AdminSessionCookiePayload = {
  v: 1;
  iat: number;
  exp: number;
  adminUserId: string;
  authUserId: string;
  loginId: string;
  role: AdminRole;
  status: AdminStatus;
  branchIds: string[];
  currentBranch: AdminBranchSnapshot | null;
};

export async function persistAdminSession(session: AdminSession) {
  const cookieStore = await cookies();
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionCookiePayload = {
    v: 1,
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE,
    adminUserId: session.adminUserId,
    authUserId: session.authUserId,
    loginId: session.loginId,
    role: session.role,
    status: session.status,
    branchIds: session.branchIds,
    currentBranch: session.currentBranch,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export const getAdminSessionFromCookie = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!rawCookie) {
    return null;
  }

  const [encodedPayload, providedSignature] = rawCookie.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as Partial<AdminSessionCookiePayload>;

    if (
      payload.v !== 1 ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      !isValidRole(payload.role) ||
      !isValidStatus(payload.status) ||
      typeof payload.adminUserId !== "string" ||
      typeof payload.authUserId !== "string" ||
      typeof payload.loginId !== "string" ||
      !Array.isArray(payload.branchIds) ||
      payload.branchIds.some((value) => typeof value !== "string") ||
      !isValidCurrentBranch(payload.currentBranch)
    ) {
      return null;
    }

    return {
      adminUserId: payload.adminUserId,
      authUserId: payload.authUserId,
      loginId: payload.loginId,
      role: payload.role,
      status: payload.status,
      branchIds: payload.branchIds,
      currentBranch: payload.currentBranch,
    } satisfies AdminSession;
  } catch {
    return null;
  }
});

function signValue(value: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function isValidRole(value: unknown): value is AdminRole {
  return value === "super_admin" || value === "branch_admin";
}

function isValidStatus(value: unknown): value is AdminStatus {
  return value === "active" || value === "disabled";
}

function isValidCurrentBranch(value: unknown): value is AdminBranchSnapshot | null {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const currentBranch = value as Partial<AdminBranchSnapshot>;

  return (
    typeof currentBranch.id === "string" &&
    typeof currentBranch.name === "string" &&
    isValidBranchStatus(currentBranch.status) &&
    (typeof currentBranch.phone === "string" || currentBranch.phone === null) &&
    (typeof currentBranch.address === "string" || currentBranch.address === null) &&
    (typeof currentBranch.instagramUrl === "string" ||
      currentBranch.instagramUrl === null) &&
    typeof currentBranch.createdAt === "string" &&
    typeof currentBranch.updatedAt === "string"
  );
}

function isValidBranchStatus(value: unknown): value is AdminBranchSnapshot["status"] {
  return value === "active" || value === "inactive" || value === "archived";
}
