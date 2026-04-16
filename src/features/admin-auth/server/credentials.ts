const ADMIN_AUTH_EMAIL_DOMAIN = "admin.party-reservation.invalid";
const LOGIN_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/;

export function normalizeAdminLoginId(input: string) {
  return input.trim().toLowerCase();
}

export function isValidAdminLoginId(input: string) {
  return LOGIN_ID_PATTERN.test(normalizeAdminLoginId(input));
}

export function toAdminAuthEmail(loginId: string) {
  return `${normalizeAdminLoginId(loginId)}@${ADMIN_AUTH_EMAIL_DOMAIN}`;
}
