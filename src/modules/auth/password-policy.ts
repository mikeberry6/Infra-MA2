export const BCRYPT_MAX_PASSWORD_BYTES = 72;

export function exceedsBcryptPasswordLimit(value: string): boolean {
  return Buffer.byteLength(value, "utf8") > BCRYPT_MAX_PASSWORD_BYTES;
}
