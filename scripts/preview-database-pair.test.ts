import { lstat, mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DATABASE_PASSWORD_BYTES,
  DATABASE_USERNAME_BYTES,
} from "./assert-playwright-artifact-secret-safety.ts";
import {
  assertPreviewDatabasePair,
  type PreviewDatabasePairEvidence,
  writePreviewDatabasePairEvidence,
} from "./preview-database-pair.ts";

const directHost = "ep-preview-branch.c-5.us-east-1.aws.neon.tech";
const pooledHost = "ep-preview-branch-pooler.c-5.us-east-1.aws.neon.tech";
const databaseUsername = "preview_user";
const databasePassword = "Str0ng_Preview.Secret-2026";
const encodedDatabasePassword = encodeURIComponent(databasePassword);
const directUrl =
  `postgresql://${databaseUsername}:${encodedDatabasePassword}@${directHost}/neondb?sslmode=require`;
const pooledUrl =
  `postgresql://${databaseUsername}:${encodedDatabasePassword}@${pooledHost}/neondb?sslmode=require`;
const evidence: PreviewDatabasePairEvidence = {
  schemaVersion: 1,
  target: "preview",
  result: "passed",
  database: "neondb",
  pooledHost,
  directHost,
  port: "5432",
};

function input(overrides: Partial<Parameters<typeof assertPreviewDatabasePair>[0]> = {}) {
  return {
    pooledUrl,
    directUrl,
    expectedPooledHost: pooledHost,
    expectedDirectHost: directHost,
    expectedDatabase: "neondb",
    forbiddenHosts: [
      "ep-production-pooler.c-5.us-east-1.aws.neon.tech",
      "ep-production.c-5.us-east-1.aws.neon.tech",
    ],
    ...overrides,
  };
}

describe("Preview Neon pooled/direct identity guard", () => {
  it("accepts the exact Neon endpoint pair and connection identity", () => {
    expect(assertPreviewDatabasePair(input())).toMatchObject({
      pooled: { host: pooledHost, database: "neondb", port: "5432" },
      direct: { host: directHost, database: "neondb", port: "5432" },
    });
  });

  it("rejects a pooled URL from another Neon endpoint", () => {
    expect(() => assertPreviewDatabasePair(input({
      pooledUrl: pooledUrl.replace("ep-preview-branch-pooler", "ep-other-pooler"),
    }))).toThrow("database_url_host_not_pooled_pair");
  });

  it.each([
    ["username", pooledUrl.replace(databaseUsername, "other_user")],
    [
      "password",
      pooledUrl.replace(
        encodedDatabasePassword,
        "Other-Strong.Secret-2026",
      ),
    ],
    ["database", pooledUrl.replace("/neondb?", "/other?")],
    ["port", pooledUrl.replace(pooledHost, `${pooledHost}:5433`)],
  ])("rejects a mismatched %s", (_field, mismatchedPooledUrl) => {
    expect(() => assertPreviewDatabasePair(input({
      pooledUrl: mismatchedPooledUrl,
    }))).toThrow("database_connection_identity_mismatch");
  });

  it.each([
    [
      "short username",
      "u".repeat(DATABASE_USERNAME_BYTES.min - 1),
      databasePassword,
    ],
    [
      "oversized username",
      "u".repeat(DATABASE_USERNAME_BYTES.max + 1),
      databasePassword,
    ],
    [
      "short password",
      databaseUsername,
      "P".repeat(DATABASE_PASSWORD_BYTES.min - 1),
    ],
    [
      "oversized password",
      databaseUsername,
      "P".repeat(DATABASE_PASSWORD_BYTES.max + 1),
    ],
    [
      "decoded whitespace in password",
      databaseUsername,
      "Strong Preview Password 2026",
    ],
  ])("rejects %s before using the connection", (_case, username, password) => {
    const unsafeDirectUrl =
      `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${directHost}/neondb?sslmode=require`;
    let message = "";
    try {
      assertPreviewDatabasePair(input({ directUrl: unsafeDirectUrl }));
    } catch (error) {
      message = String(error);
    }
    expect(message).toContain("database_url_unpooled_invalid");
    expect(message).not.toContain(username);
    expect(message).not.toContain(password);
    expect(message).not.toContain("postgresql://");
  });

  it("rejects traversal without creating an outside file", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "preview-database-pair-"));
    const outside = `${repositoryRoot}-outside.json`;
    try {
      await expect(writePreviewDatabasePairEvidence({
        evidence,
        repositoryRoot,
        output: `../${path.basename(outside)}`,
      })).rejects.toThrow("under tmp/");
      await expect(lstat(outside)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
      await rm(outside, { force: true });
    }
  });

  it("rejects a symlinked output parent without writing outside tmp", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "preview-database-pair-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "preview-database-pair-outside-"));
    try {
      await mkdir(path.join(repositoryRoot, "tmp"));
      await symlink(outside, path.join(repositoryRoot, "tmp", "linked"));
      await expect(writePreviewDatabasePairEvidence({
        evidence,
        repositoryRoot,
        output: "tmp/linked/database-pair.json",
      })).rejects.toThrow("plain directory");
      await expect(lstat(path.join(outside, "database-pair.json")))
        .rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  it("writes once and rejects overwrite while preserving prior evidence", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "preview-database-pair-"));
    const output = "tmp/evidence/database-pair.json";
    try {
      const outputFile = await writePreviewDatabasePairEvidence({
        evidence,
        repositoryRoot,
        output,
      });
      const original = await readFile(outputFile, "utf8");
      await expect(writePreviewDatabasePairEvidence({
        evidence: { ...evidence, database: "replacement" },
        repositoryRoot,
        output,
      })).rejects.toMatchObject({ code: "EEXIST" });
      await expect(readFile(outputFile, "utf8")).resolves.toBe(original);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });
});
