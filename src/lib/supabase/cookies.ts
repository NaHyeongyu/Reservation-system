import type { CookieOptionsWithName } from "@supabase/ssr";

const SIX_MONTHS_IN_SECONDS = 60 * 60 * 24 * 30 * 6;

export function getSupabaseCookieOptions(): CookieOptionsWithName {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SIX_MONTHS_IN_SECONDS,
  };
}
