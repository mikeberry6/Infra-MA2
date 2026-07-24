import { describe, expect, it } from "vitest";

describe("Excel export dependency compatibility", () => {
  it("creates and serializes a workbook with the reviewed transitive overrides", async () => {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Portfolio Companies");
    sheet.addRow(["Company", "Fund"]);
    sheet.addRow(["Example Infrastructure", "Example Fund"]);

    const buffer = await workbook.xlsx.writeBuffer();

    expect(buffer.byteLength).toBeGreaterThan(100);
  });
});
