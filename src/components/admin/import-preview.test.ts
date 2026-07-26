import { describe, expect, it } from "vitest";
import {
  buildImportErrorCsv,
  importIssueIdentifier,
  importIssueLabel,
} from "./import-preview";

describe("import preview helpers", () => {
  it("uses entity-specific stable identifiers", () => {
    expect(importIssueIdentifier({ id: "DEAL-42" }, "deals")).toBe("DEAL-42");
    expect(importIssueIdentifier({ fundId: "FUND-9", fundName: "Fund IX" }, "funds")).toBe("FUND-9");
    expect(importIssueIdentifier({ name: "Acme, Inc.", country: "United States" }, "portfolio"))
      .toBe("Acme, Inc. | United States");
  });

  it("reports the server-provided CSV line and properly escapes CSV cells", () => {
    const csv = buildImportErrorCsv([
      {
        row: 7,
        id: "DEAL-\"7\"",
        code: "INVALID,FIELD",
        error: "Missing buyer, seller\nand source",
      },
    ], "deals");

    expect(csv).toBe([
      "row,identifier,code,error",
      '7,"DEAL-""7""","INVALID,FIELD","Missing buyer, seller\nand source"',
    ].join("\r\n"));
  });

  it("does not fabricate a row when the server omitted one", () => {
    expect(buildImportErrorCsv([{ name: "Acme", error: "Invalid" }], "portfolio"))
      .toBe("row,identifier,code,error\r\n,Acme,,Invalid");
    expect(importIssueLabel({ row: 12, fundId: "FUND-12" }, "funds"))
      .toBe("Row 12 · FUND-12");
  });

  it.each(["=", "+", "-", "@", "\t", "\r"])(
    "neutralizes spreadsheet formulas beginning with %j",
    (prefix) => {
      const dangerous = `${prefix}HYPERLINK("https://example.test")`;
      const csv = buildImportErrorCsv([
        { row: 4, id: dangerous, code: dangerous, error: dangerous },
      ], "deals");
      const escapedCell = `'${dangerous}`.replace(/"/g, '""');

      expect(csv).toContain(`"${escapedCell}"`);
      expect(csv).toMatch(/^row,identifier,code,error\r\n4,/);
    },
  );
});
