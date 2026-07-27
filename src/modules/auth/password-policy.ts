export const BCRYPT_MAX_PASSWORD_BYTES = 72;

export function exceedsBcryptPasswordLimit(password: string): boolean {
  return Buffer.byteLength(password, "utf8") > BCRYPT_MAX_PASSWORD_BYTES;
}
