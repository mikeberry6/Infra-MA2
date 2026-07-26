import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/config";
import { prisma } from "@/lib/prisma";
import { signedSnapshotMatchesCurrentUser } from "@/modules/auth/session";

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
  const identity = await getSessionIdentity();
  return identity?.role ?? null;
}

export async function getSessionIdentity(): Promise<{ id: string; role: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, updatedAt: true },
  });
  if (!signedSnapshotMatchesCurrentUser(session.user, user)) return null;
  return { id: user.id, role: user.role };
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
