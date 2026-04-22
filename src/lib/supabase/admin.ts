import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { getSupabaseSecretKey } from "@/lib/supabase/secret-env";

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
