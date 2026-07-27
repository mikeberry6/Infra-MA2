const MINIMUM_ADMIN_PASSWORD_LENGTH = 14;
const MAXIMUM_BCRYPT_PASSWORD_BYTES = 72;

export function normalizeAdminEmail(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function validateAdminEmail(value: string): string | null {
  if (!value) return "ADMIN_EMAIL is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "ADMIN_EMAIL must be a valid email address.";
  }
  return null;
}

export function validateAdminPassword(value: string): string | null {
  if (!value) return "ADMIN_PASSWORD is required.";
  if (value.length < MINIMUM_ADMIN_PASSWORD_LENGTH) {
    return `ADMIN_PASSWORD must be at least ${MINIMUM_ADMIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "ADMIN_PASSWORD must contain uppercase, lowercase, number, and symbol characters.";
  }
  if (Buffer.byteLength(value, "utf8") > MAXIMUM_BCRYPT_PASSWORD_BYTES) {
    return `ADMIN_PASSWORD must be at most ${MAXIMUM_BCRYPT_PASSWORD_BYTES} UTF-8 bytes.`;
  }
  return null;
}
