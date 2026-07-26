import { describe, expect, it } from "vitest";
import {
  databaseSecretMaskCommands,
  escapeGithubCommandData,
  registerGithubDatabaseSecretMasks,
} from "./register-github-database-secret-masks.ts";

function databaseUrl(
  host: string,
  password = "Str0ng_Preview.Secret-2026",
): string {
  return `postgresql://preview_user:${password}@${host}/neondb?sslmode=require`;
}

describe("GitHub database secret mask registration", () => {
  it("escapes GitHub workflow command data in the required order", () => {
    expect(escapeGithubCommandData("percent%line\r\nnext")).toBe(
      "percent%25line%0D%0Anext",
    );
  });

  it("emits masks for the full URL and canonical credential components", () => {
    const password = "Str0ng_Preview.Secret-2026";
    const url = databaseUrl("ep-preview.example", password);
    const commands = databaseSecretMaskCommands([url]);

    for (const value of [
      url,
      "preview_user",
      password,
      Buffer.from(password).toString("base64"),
    ]) {
      expect(commands).toContain(
        `::add-mask::${escapeGithubCommandData(value)}`,
      );
    }
    expect(new Set(commands).size).toBe(commands.length);
  });

  it.each([
    "postgresql://preview%5Fuser:Str0ng_Preview.Secret-2026@ep-preview.example/neondb",
    "postgresql://preview_user:Str0ng%5FPreview.Secret-2026@ep-preview.example/neondb",
    "postgresql://preview_user:Str0ng@Preview:Secret-2026@ep-preview.example/neondb",
  ])("rejects noncanonical or escaped database credentials before output", (url) => {
    expect(() => databaseSecretMaskCommands([url])).toThrow(
      "Database secret mask registration failed.",
    );
  });

  it("writes only add-mask commands for every requested database URL", () => {
    const output: string[] = [];
    registerGithubDatabaseSecretMasks({
      argv: [
        "--database-url-env=PREVIEW_DATABASE_URL",
        "--database-url-env=PREVIEW_MIGRATION_DATABASE_URL",
      ],
      environment: {
        PREVIEW_DATABASE_URL: databaseUrl("ep-preview-pooler.example"),
        PREVIEW_MIGRATION_DATABASE_URL: databaseUrl("ep-preview.example"),
      },
      write: (value) => output.push(value),
    });

    expect(output.length).toBeGreaterThan(0);
    expect(output.every((value) =>
      value.startsWith("::add-mask::") && value.endsWith("\n"),
    )).toBe(true);
    expect(output.join("")).not.toContain("\r");
  });

  it("validates all URLs before output and fails without leaking values", () => {
    const validUrl = databaseUrl("ep-preview-pooler.example");
    const leakedValue = "do-not-leak-this-malformed-database-value";
    const output: string[] = [];
    let message = "";
    try {
      registerGithubDatabaseSecretMasks({
        argv: [
          "--database-url-env=PREVIEW_DATABASE_URL",
          "--database-url-env=PREVIEW_MIGRATION_DATABASE_URL",
        ],
        environment: {
          PREVIEW_DATABASE_URL: validUrl,
          PREVIEW_MIGRATION_DATABASE_URL: leakedValue,
        },
        write: (value) => output.push(value),
      });
    } catch (error) {
      message = String(error);
    }

    expect(output).toEqual([]);
    expect(message).toContain("Database secret mask registration failed.");
    expect(message).not.toContain(validUrl);
    expect(message).not.toContain(leakedValue);
  });

  it.each([
    { argv: [] },
    { argv: ["--database-url-env="] },
    { argv: ["--database-url-env=lowercase"] },
    { argv: ["--unknown=PREVIEW_DATABASE_URL"] },
  ])("rejects invalid arguments without secret-bearing output: $argv", ({ argv }) => {
    const output: string[] = [];
    expect(() => registerGithubDatabaseSecretMasks({
      argv,
      environment: {},
      write: (value) => output.push(value),
    })).toThrow("Database secret mask registration failed.");
    expect(output).toEqual([]);
  });
});
