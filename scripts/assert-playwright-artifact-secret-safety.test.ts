import { deflateRawSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DATABASE_PASSWORD_BYTES,
  databaseUrlSecretRepresentations,
  main,
  parseDatabaseUrlSecretCredentials,
  scanBufferForSecret,
  secretRepresentations,
} from "./assert-playwright-artifact-secret-safety";

function zipEntry(name: string, value: Buffer): Buffer {
  const nameBuffer = Buffer.from(name);
  const compressed = deflateRawSync(value);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(value.length, 22);
  local.writeUInt16LE(nameBuffer.length, 26);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(value.length, 24);
  central.writeUInt16LE(nameBuffer.length, 28);

  const centralOffset = local.length + nameBuffer.length + compressed.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + nameBuffer.length, 12);
  end.writeUInt32LE(centralOffset, 16);

  return Buffer.concat([
    local,
    nameBuffer,
    compressed,
    central,
    nameBuffer,
    end,
  ]);
}

describe("Playwright artifact secret scanner", () => {
  const canary = "Synthetic-\"Canary\\Password-\n91!";
  const canaryBuffer = Buffer.from(canary);
  const representations = secretRepresentations(canary);

  it("finds a JSON-escaped credential hidden inside a deflated trace archive", () => {
    const trace = zipEntry(
      "trace.trace",
      Buffer.from(JSON.stringify({ type: "before", params: { value: canary } })),
    );
    expect(trace.indexOf(canaryBuffer)).toBe(-1);
    expect(scanBufferForSecret(trace, "trace.zip", representations)).toEqual([
      expect.stringMatching(/^artifact-[0-9a-f]{16}!\/zip-entry-1$/),
    ]);
  });

  it("skips encoded-looking ZIP container noise and scans the decompressed entry", () => {
    const trace = zipEntry(
      "%25252525252541-%255Cu0053.trace",
      Buffer.from(JSON.stringify({ credential: canary })),
    );
    expect(scanBufferForSecret(trace, "noisy-trace.zip", representations)).toEqual([
      expect.stringMatching(/^artifact-[0-9a-f]{16}!\/zip-entry-1$/),
    ]);
  });

  it("finds a credential in the HTML reporter's embedded ZIP payload", () => {
    const report = zipEntry(
      "report.json",
      Buffer.from(JSON.stringify({ steps: [{ title: `Fill "${canary}"` }] })),
    );
    const html = Buffer.from(
      `<script>window.playwrightReportBase64 = "data:application/zip;base64,${report.toString("base64")}";</script>`,
    );
    expect(html.indexOf(canaryBuffer)).toBe(-1);
    expect(scanBufferForSecret(html, "index.html", representations)).toEqual([
      expect.stringMatching(
        /^artifact-[0-9a-f]{16}!\/embedded-zip-1!\/zip-entry-1$/,
      ),
    ]);
  });

  it("passes safe HTML and nested archives without false positives", () => {
    const safe = zipEntry("report.json", Buffer.from('{"steps":[{"title":"Sign in"}]}'));
    const html = Buffer.from(
      `<script>window.playwrightReportBase64 = "data:application/zip;base64,${safe.toString("base64")}";</script>`,
    );
    expect(scanBufferForSecret(html, "index.html", representations)).toEqual([]);
  });

  it("scans the exact database URL and raw, decoded, and encoded credentials", () => {
    const decodedUsername = "preview.user";
    const decodedPassword = "Str0ng_Preview.Secret-2026";
    const rawUsername = decodedUsername;
    const rawPassword = decodedPassword;
    const databaseUrl =
      `postgresql://${rawUsername}:${rawPassword}@ep-preview.example/neondb?sslmode=require`;
    const databaseRepresentations = databaseUrlSecretRepresentations(databaseUrl);

    expect(parseDatabaseUrlSecretCredentials(databaseUrl)).toEqual({
      decodedPassword,
      decodedUsername,
      rawPassword,
      rawUsername,
    });
    expect(scanBufferForSecret(
      Buffer.from(`database password fragment: ${decodedPassword}`),
      "decoded.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    expect(scanBufferForSecret(
      Buffer.from(`encoded=${rawPassword}`),
      "encoded.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    const form = new URLSearchParams();
    form.set("password", decodedPassword);
    const formEncodedPassword = form.toString().slice("password=".length);
    const lowerCasePercentPassword = formEncodedPassword.replace(
      /%[0-9a-f]{2}/gi,
      (triplet) => `%${triplet.slice(1).toLowerCase()}`,
    );
    expect(scanBufferForSecret(
      Buffer.from(`form-encoded=${formEncodedPassword}`),
      "form-encoded.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    expect(scanBufferForSecret(
      Buffer.from(`lower-percent=${lowerCasePercentPassword}`),
      "lower-percent.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    expect(scanBufferForSecret(
      Buffer.from(`database role=${decodedUsername}`),
      "decoded-user.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    expect(scanBufferForSecret(
      Buffer.from(`encoded-role=${rawUsername}`),
      "encoded-user.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    expect(scanBufferForSecret(
      Buffer.from(`connection=${databaseUrl}`),
      "connection.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    const connectionForm = new URLSearchParams();
    connectionForm.set("connection", databaseUrl);
    expect(scanBufferForSecret(
      Buffer.from(connectionForm.toString()),
      "form-connection.log",
      databaseRepresentations,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
  });

  it("recursively decodes mixed-case percent, form, and JSON escape views", () => {
    const secret = "Strong:Preview/Secret-2026!";
    const secretNeedles = secretRepresentations(secret);
    const form = new URLSearchParams({ secret }).toString().slice("secret=".length);
    const mixedPercent = form.replace("%3A", "%3a");
    const jsonUnicode =
      "\\u0053trong\\u003aPreview\\u002fSecret-2026\\u0021";
    const nestedJson = JSON.stringify(jsonUnicode).slice(1, -1);
    const ordinaryJsonEscape = secret.replace("/", "\\/");
    const invalidUtf8Prefix = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from(`credential=${mixedPercent}`),
    ]);

    for (const [label, artifact] of [
      ["mixed-percent", mixedPercent],
      ["form", form],
      ["json-unicode", jsonUnicode],
      ["nested-json", nestedJson],
      ["ordinary-json", ordinaryJsonEscape],
    ]) {
      expect(scanBufferForSecret(
        Buffer.from(`credential=${artifact}`),
        label,
        secretNeedles,
      )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
    }
    expect(scanBufferForSecret(
      invalidUtf8Prefix,
      "invalid-utf8-prefix",
      secretNeedles,
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);

    const spacedSecret = "Strong Preview Secret-2026";
    const formWithPlus = new URLSearchParams({ secret: spacedSecret })
      .toString()
      .slice("secret=".length);
    expect(scanBufferForSecret(
      Buffer.from(`credential=${formWithPlus}`),
      "form-plus",
      secretRepresentations(spacedSecret),
    )).toEqual([expect.stringMatching(/^artifact-[0-9a-f]{16}$/)]);
  });

  it("rejects weak, oversized, escaped, or noncanonical database credentials without echoing them", () => {
    const weakPassword = "tiny-password";
    const oversizedPassword = "P".repeat(DATABASE_PASSWORD_BYTES.max + 1);
    for (const databaseUrl of [
      "postgresql://short:Strong-Preview-Password-2026@preview.example/neondb",
      `postgresql://preview_user:${weakPassword}@preview.example/neondb`,
      `postgresql://preview_user:${oversizedPassword}@preview.example/neondb`,
      "postgresql://preview%5Fuser:Strong-Preview-Password-2026@preview.example/neondb",
      "postgresql://preview_user:Strong%2DPreview%2DPassword%2D2026@preview.example/neondb",
      "postgresql://preview_user:Strong%40Preview%3ASecret-2026@preview.example/neondb",
    ]) {
      let message = "";
      try {
        parseDatabaseUrlSecretCredentials(databaseUrl);
      } catch (error) {
        message = String(error);
      }
      expect(message).toContain("database_url_secret_invalid");
      expect(message).not.toContain(databaseUrl);
      expect(message).not.toContain(weakPassword);
      expect(message).not.toContain(oversizedPassword);
    }
  });

  it("supports database URL environment scanning without retaining the URL", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-scan-"));
    const artifact = path.join(repositoryRoot, "artifact.log");
    const output = "tmp/scan-report.json";
    const decodedPassword = "Str0ng_Preview.Secret-2026";
    const databaseUrl =
      `postgresql://preview_user:${decodedPassword}@preview.example/neondb?sslmode=require`;
    try {
      await writeFile(artifact, `redacted-prefix ${decodedPassword} redacted-suffix`);
      await expect(main([
        `--root=${artifact}`,
        "--database-url-secret-env=TEST_DATABASE_URL_SECRET",
        `--output=${output}`,
      ], {
        repositoryRoot,
        environment: { TEST_DATABASE_URL_SECRET: databaseUrl },
      })).rejects.toThrow("Artifact secret scan failed.");
      const report = await readFile(path.join(repositoryRoot, output), "utf8");
      expect(report).toContain('"status": "failed"');
      expect(report).toContain('"rootsScanned": 1');
      expect(report).not.toContain(databaseUrl);
      expect(report).not.toContain(decodedPassword);
      expect(report).not.toContain(artifact);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("never retains a secret-bearing archive entry name", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-scan-"));
    const artifact = path.join(repositoryRoot, "trace.zip");
    const output = "tmp/scan-report.json";
    const maliciousName = `${canary}.trace`;
    try {
      await writeFile(artifact, zipEntry(maliciousName, Buffer.from(canary)));
      await expect(main([
        `--root=${artifact}`,
        "--secret-env=SCAN_CANARY",
        `--output=${output}`,
      ], {
        repositoryRoot,
        environment: { SCAN_CANARY: canary },
      })).rejects.toThrow("Artifact secret scan failed.");
      const report = await readFile(path.join(repositoryRoot, output), "utf8");
      expect(report).not.toContain(canary);
      expect(report).not.toContain(maliciousName);
      expect(report).not.toContain(artifact);
      expect(report).toMatch(/artifact-1/);
      expect(report).toMatch(/zip-entry-1/);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("never includes a malicious archive name in parser failures", () => {
    const maliciousName = `${canary}.trace`;
    const archive = zipEntry(maliciousName, Buffer.from("safe content"));
    const centralOffset = archive.lastIndexOf(
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
    );
    archive.writeUInt32LE(archive.length + 100, centralOffset + 42);
    let message = "";
    try {
      scanBufferForSecret(archive, `${canary}-root`, representations);
    } catch (error) {
      message = String(error);
    }
    expect(message).toContain("ZIP local entry 1 is malformed.");
    expect(message).not.toContain(canary);
    expect(message).not.toContain(maliciousName);
  });

  it("rejects traversal, symlinked parents, and overwrite without altering outside or prior files", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-scan-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-outside-"));
    const artifact = path.join(repositoryRoot, "artifact.log");
    const environment = { SCAN_CANARY: canary };
    try {
      await writeFile(artifact, "safe artifact");
      await expect(main([
        `--root=${artifact}`,
        "--secret-env=SCAN_CANARY",
        `--output=${path.join(outsideRoot, "escaped.json")}`,
      ], { repositoryRoot, environment })).rejects.toThrow(
        "Artifact secret scan failed.",
      );
      await expect(access(path.join(outsideRoot, "escaped.json")))
        .rejects.toMatchObject({ code: "ENOENT" });

      await mkdir(path.join(repositoryRoot, "tmp"));
      await symlink(outsideRoot, path.join(repositoryRoot, "tmp", "linked"));
      await expect(main([
        `--root=${artifact}`,
        "--secret-env=SCAN_CANARY",
        "--output=tmp/linked/report.json",
      ], { repositoryRoot, environment })).rejects.toThrow(
        "Artifact secret scan failed.",
      );
      await expect(access(path.join(outsideRoot, "report.json")))
        .rejects.toMatchObject({ code: "ENOENT" });

      const output = "tmp/report.json";
      await main([
        `--root=${artifact}`,
        "--secret-env=SCAN_CANARY",
        `--output=${output}`,
      ], { repositoryRoot, environment });
      const original = await readFile(path.join(repositoryRoot, output), "utf8");
      await expect(main([
        `--root=${artifact}`,
        "--secret-env=SCAN_CANARY",
        `--output=${output}`,
      ], { repositoryRoot, environment })).rejects.toThrow(
        "Artifact secret scan failed.",
      );
      await expect(readFile(path.join(repositoryRoot, output), "utf8"))
        .resolves.toBe(original);
    } finally {
      await Promise.all([
        rm(repositoryRoot, { recursive: true, force: true }),
        rm(outsideRoot, { recursive: true, force: true }),
      ]);
    }
  });

  it("fails generically for every missing root and for an empty total scan", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-scan-"));
    const emptyRoot = path.join(repositoryRoot, "empty");
    await mkdir(emptyRoot);
    try {
      for (const root of [
        path.join(repositoryRoot, "missing-secret-path"),
        emptyRoot,
      ]) {
        let message = "";
        try {
          await main([
            `--root=${root}`,
            "--secret-env=SCAN_CANARY",
            "--output=tmp/report.json",
          ], {
            repositoryRoot,
            environment: { SCAN_CANARY: canary },
          });
        } catch (error) {
          message = String(error);
        }
        expect(message).toContain("Artifact secret scan failed.");
        expect(message).not.toContain(root);
        expect(message).not.toContain(canary);
      }
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("emits only a generic CLI failure for a secret-bearing missing path", async () => {
    const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "artifact-secret-cli-"));
    const script = path.join(
      process.cwd(),
      "scripts/assert-playwright-artifact-secret-safety.ts",
    );
    const secretPath = path.join(repositoryRoot, canary.replaceAll("/", "_"));
    try {
      const result = spawnSync(process.execPath, [
        "--experimental-strip-types",
        script,
        `--root=${secretPath}`,
        "--secret-env=SCAN_CANARY",
        "--output=tmp/report.json",
      ], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, SCAN_CANARY: canary },
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Artifact secret scan failed.");
      expect(result.stderr).not.toContain(canary);
      expect(result.stderr).not.toContain(secretPath);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });
});
