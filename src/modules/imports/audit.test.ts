// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { hashImportValue, type ImportReportRow } from "./domain";
import { recordImportAuditEvent } from "./audit";

describe("recordImportAuditEvent", () => {
  it("retains a bounded identifier/disposition report without raw row values", async () => {
    const report: ImportReportRow[] = Array.from(
      { length: 501 },
      (_, index) => ({
        row: index + 1,
        identifier: index === 0 ? "x".repeat(300) : `deal-${index + 1}`,
        disposition: index === 500 ? "error" : "update",
        code: index === 0 ? "C".repeat(100) : undefined,
        message: "raw imported description must not be retained",
      }),
    );
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const tx = { auditEvent: { create } };

    await expect(recordImportAuditEvent(tx as never, {
      actorId: "admin-1",
      previewId: "preview-1",
      entityType: "deals",
      payloadHash: "a".repeat(64),
      summary: {
        total: 501,
        valid: 500,
        creates: 0,
        updates: 500,
        unchanged: 0,
        quarantined: 0,
        errors: 1,
        eligible: 500,
      },
      result: {
        imported: 500,
        created: 0,
        updated: 500,
        unchanged: 0,
        quarantined: 0,
        changedFields: ["deal"],
      },
      report,
    })).resolves.toBe("audit-1");

    const data = create.mock.calls[0][0].data;
    expect(data.metadata).toMatchObject({
      reportHash: hashImportValue(report),
      retainedReportRows: 500,
      reportTruncated: true,
    });
    expect(data.metadata.retainedReport).toHaveLength(500);
    expect(data.metadata.retainedReport[0]).toEqual({
      row: 1,
      identifier: "x".repeat(200),
      disposition: "update",
      code: "C".repeat(80),
    });
    expect(JSON.stringify(data)).not.toContain(
      "raw imported description must not be retained",
    );
    expect(JSON.stringify(data)).not.toContain("deal-501");
  });
});
