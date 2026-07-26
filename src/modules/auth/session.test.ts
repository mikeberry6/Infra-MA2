import { describe, expect, it } from "vitest";
import {
  PRIVILEGED_SESSION_MAX_AGE_SECONDS,
  hasUsableSignedAuthSnapshot,
  signedSnapshotMatchesCurrentUser,
} from "@/modules/auth/session";

describe("signed authorization snapshots", () => {
  const now = 1_800_000_000_000;
  const snapshot = {
    id: "admin-1",
    role: "ADMIN",
    authVersion: 1_700_000_000_000,
    authenticatedAt: now - 1_000,
  };
  const user = {
    id: "admin-1",
    role: "ADMIN",
    updatedAt: new Date(snapshot.authVersion),
  };

  it("accepts a complete, current snapshot", () => {
    expect(hasUsableSignedAuthSnapshot(snapshot, now)).toBe(true);
    expect(signedSnapshotMatchesCurrentUser(snapshot, user, now)).toBe(true);
  });

  it("rejects legacy, expired, and implausibly future snapshots", () => {
    expect(hasUsableSignedAuthSnapshot({ id: "admin-1", role: "ADMIN" }, now)).toBe(false);
    expect(hasUsableSignedAuthSnapshot({
      ...snapshot,
      authenticatedAt: now - PRIVILEGED_SESSION_MAX_AGE_SECONDS * 1_000 - 1,
    }, now)).toBe(false);
    expect(hasUsableSignedAuthSnapshot({ ...snapshot, authenticatedAt: now + 5 * 60 * 1_000 + 1 }, now)).toBe(false);
  });

  it("rejects role, identity, account-version, and deletion mismatches", () => {
    expect(signedSnapshotMatchesCurrentUser(snapshot, { ...user, role: "ANALYST" }, now)).toBe(false);
    expect(signedSnapshotMatchesCurrentUser(snapshot, { ...user, id: "other" }, now)).toBe(false);
    expect(signedSnapshotMatchesCurrentUser(snapshot, { ...user, updatedAt: new Date(snapshot.authVersion + 1) }, now)).toBe(false);
    expect(signedSnapshotMatchesCurrentUser(snapshot, null, now)).toBe(false);
  });
});
