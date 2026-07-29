import { describe, expect, it } from "vitest";
import {
  buildImportReportCsv,
  makeFormulaSafe,
  parseImportPreview,
} from "./import-preview";

describe("import preview helpers", () => {
  it("accepts the complete preview contract and rejects incomplete responses", () => {
    const preview = {
      preview: true,
      token: "single-use-token",
      expiresAt: "2099-01-01T12:00:00.000Z",
      summary: {
        total: 2,
        valid: 1,
        creates: 1,
        updates: 0,
        unchanged: 0,
        quarantined: 0,
        errors: 1,
        eligible: 1,
      },
      report: [
        {
          row: 2,
          identifier: "DEAL-1",
          disposition: "create",
        },
        {
          row: 3,
          identifier: "DEAL-2",
          disposition: "error",
          code: "INVALID_ROW",
          message: "Buyer is required",
        },
      ],
    };

    expect(parseImportPreview(preview)).toEqual(preview);
    expect(parseImportPreview({ ...preview, token: "" })).toBeNull();
    expect(
      parseImportPreview({
        ...preview,
        summary: { ...preview.summary, eligible: -1 },
      }),
    ).toBeNull();
    expect(
      parseImportPreview({
        ...preview,
        report: [{ ...preview.report[0], disposition: "published" }],
      }),
    ).toBeNull();
  });

  it("neutralizes spreadsheet formula prefixes in every report field", () => {
    expect(makeFormulaSafe("=HYPERLINK(\"https://example.invalid\")")).toBe(
      "'=HYPERLINK(\"https://example.invalid\")",
    );
    expect(makeFormulaSafe("  +SUM(1,1)")).toBe("'  +SUM(1,1)");
    expect(makeFormulaSafe("@command")).toBe("'@command");
    expect(makeFormulaSafe("ordinary-value")).toBe("ordinary-value");

    const csv = buildImportReportCsv([
      {
        row: 2,
        identifier: "=2+2",
        disposition: "error",
        code: "+COMMAND",
        message: "@unsafe, with comma",
      },
    ]);

    expect(csv).toContain("2,'=2+2,error,'+COMMAND");
    expect(csv).toContain("\"'@unsafe, with comma\"");
  });

  it("quotes embedded commas, quotes, and newlines in a row-level report", () => {
    const csv = buildImportReportCsv([
      {
        row: 4,
        identifier: 'Fund "Alpha", LP',
        disposition: "quarantined",
        message: "Published record\nrequires review",
      },
    ]);

    expect(csv).toContain('"Fund ""Alpha"", LP"');
    expect(csv).toContain('"Published record\nrequires review"');
  });
});
