import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/config";

export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export async function getSessionRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role ?? null;
}

export async function requireAdmin(): Promise<void> {
  const role = await getSessionRole();
  if (role !== "ADMIN") throw new AuthorizationError();
}

export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const role = await getSessionRole();
  return !!role && roles.includes(role);
}

export const EXPORT_ROLES = ["ADMIN", "ANALYST"];

export async function canExportData(): Promise<boolean> {
  return hasAnyRole(EXPORT_ROLES);
}
