"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookies";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabasePublicEnv();

  browserClient = createBrowserClient(url, publishableKey, {
    cookieOptions: getSupabaseCookieOptions(),
  });

  return browserClient;
}
