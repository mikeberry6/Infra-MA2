import { exceedsBcryptPasswordLimit } from "../src/modules/auth/password-policy";

export function normalizeAdminEmail(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function validateAdminEmail(value: string): string | null {
  if (
    value.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return "ADMIN_EMAIL must be a valid email address.";
  }
  return null;
}

export function validateAdminPassword(value: string): string | null {
  if (value.length < 14) return "ADMIN_PASSWORD must contain at least 14 characters.";
  if (exceedsBcryptPasswordLimit(value)) {
    return "ADMIN_PASSWORD must not exceed 72 UTF-8 bytes.";
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
    return "ADMIN_PASSWORD must include upper- and lowercase letters.";
  }
  if (!/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "ADMIN_PASSWORD must include a number and a symbol.";
  }
  return null;
}
