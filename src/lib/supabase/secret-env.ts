import "server-only";

export function getSupabaseSecretKey() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY. This key must remain server-side only.",
    );
  }

  return secretKey;
}

export function getAdminSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "Missing admin session secret. Set ADMIN_SESSION_SECRET or SUPABASE_SECRET_KEY.",
    );
  }

  return secret;
}
