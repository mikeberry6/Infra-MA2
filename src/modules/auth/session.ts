export const PRIVILEGED_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface SignedAuthSnapshot {
  id?: unknown;
  role?: unknown;
  authVersion?: unknown;
  authenticatedAt?: unknown;
}

export interface CurrentUserSnapshot {
  id: string;
  role: string;
  updatedAt: Date;
}

/**
 * Edge middleware can validate the signed snapshot without opening a database
 * connection. Node-side authorization must still compare it with the current
 * User row before returning private data or performing a mutation.
 */
export function hasUsableSignedAuthSnapshot(
  snapshot: SignedAuthSnapshot | null | undefined,
  now = Date.now(),
): snapshot is SignedAuthSnapshot & {
  id: string;
  role: string;
  authVersion: number;
  authenticatedAt: number;
} {
  if (
    !snapshot ||
    typeof snapshot.id !== "string" ||
    typeof snapshot.role !== "string" ||
    typeof snapshot.authVersion !== "number" ||
    !Number.isFinite(snapshot.authVersion) ||
    typeof snapshot.authenticatedAt !== "number" ||
    !Number.isFinite(snapshot.authenticatedAt)
  ) {
    return false;
  }

  const ageMs = now - snapshot.authenticatedAt;
  return ageMs >= -CLOCK_SKEW_MS && ageMs <= PRIVILEGED_SESSION_MAX_AGE_SECONDS * 1000;
}

/**
 * User.updatedAt acts as the account/session version. A role or password
 * change advances it, while deleting the row makes every prior JWT unusable.
 */
export function signedSnapshotMatchesCurrentUser(
  snapshot: SignedAuthSnapshot | null | undefined,
  user: CurrentUserSnapshot | null,
  now = Date.now(),
): user is CurrentUserSnapshot {
  if (!user || !hasUsableSignedAuthSnapshot(snapshot, now)) return false;
  return (
    snapshot.id === user.id &&
    snapshot.role === user.role &&
    snapshot.authVersion === user.updatedAt.getTime()
  );
}
