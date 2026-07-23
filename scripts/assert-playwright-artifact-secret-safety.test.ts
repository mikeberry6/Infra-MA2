import { deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
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
      "trace.zip!/trace.trace",
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
      "index.html!/embedded-report-1.zip!/report.json",
    ]);
  });

  it("passes safe HTML and nested archives without false positives", () => {
    const safe = zipEntry("report.json", Buffer.from('{"steps":[{"title":"Sign in"}]}'));
    const html = Buffer.from(
      `<script>window.playwrightReportBase64 = "data:application/zip;base64,${safe.toString("base64")}";</script>`,
    );
    expect(scanBufferForSecret(html, "index.html", representations)).toEqual([]);
  });
});
