import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  getSupabasePublicEnv,
  getSupabaseSecretKey,
} from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  const secretKey = getSupabaseSecretKey();

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
