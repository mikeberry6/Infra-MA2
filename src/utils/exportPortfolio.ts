import type { CompanyView, MilestoneView, ExecutiveView, SourceView } from "@/modules/shared/types";

function flattenManagement(mgmt?: ExecutiveView[]): string {
  if (!mgmt?.length) return "";
  return mgmt.map((e) => `${e.name} (${e.title})`).join("; ");
}

function flattenMilestones(ms?: MilestoneView[]): string {
  if (!ms?.length) return "";
  return ms.map((m) => `${m.date}: ${m.event} (${m.category})`).join("; ");
}

function flattenSources(sources?: SourceView[]): string {
  if (!sources?.length) return "";
  return sources.map((s) => `${s.evidenceLabel || s.label}: ${s.url}`).join("; ");
}

function flattenCountryTags(tags?: string[]): string {
  if (!tags?.length) return "";
  return tags.join("; ");
}

const COLUMNS = [
  { header: "Company Name", key: "name", width: 30, get: (c: CompanyView) => c.name },
  { header: "Investment Firm", key: "investmentFirm", width: 25, get: (c: CompanyView) => c.investmentFirm },
  { header: "Status", key: "status", width: 10, get: (c: CompanyView) => c.status },
  { header: "Sector", key: "sector", width: 22, get: (c: CompanyView) => c.sector },
  { header: "Subsector", key: "subsector", width: 22, get: (c: CompanyView) => c.subsector },
  { header: "Region", key: "region", width: 16, get: (c: CompanyView) => c.region },
  { header: "Country", key: "country", width: 18, get: (c: CompanyView) => c.country },
  { header: "Country Tags", key: "countryTags", width: 22, get: (c: CompanyView) => flattenCountryTags(c.countryTags) },
  { header: "Ownership Vehicle", key: "ownershipVehicle", width: 30, get: (c: CompanyView) => c.ownershipVehicle },
  { header: "Headquarters", key: "headquarters", width: 20, get: (c: CompanyView) => c.headquarters ?? "" },
  { header: "Year Founded", key: "yearFounded", width: 14, get: (c: CompanyView) => c.yearFounded ?? "" },
  { header: "Investment Year", key: "investmentYear", width: 14, get: (c: CompanyView) => c.investmentYear ?? "" },
  { header: "Website", key: "website", width: 30, get: (c: CompanyView) => c.website ?? "" },
  { header: "Description", key: "description", width: 50, get: (c: CompanyView) => c.description },
  { header: "Management", key: "management", width: 40, get: (c: CompanyView) => flattenManagement(c.management) },
  { header: "Milestones", key: "milestones", width: 60, get: (c: CompanyView) => flattenMilestones(c.milestones) },
  { header: "Sources", key: "sources", width: 40, get: (c: CompanyView) => flattenSources(c.sources) },
] as const;

export async function exportPortfolioToExcel(companies: CompanyView[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Portfolio Companies");

  sheet.columns = COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));

  for (const company of companies) {
    const row: Record<string, string | number> = {};
    for (const col of COLUMNS) {
      row[col.key] = col.get(company);
    }
    sheet.addRow(row);
  }

  // Header styling: bold
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Portfolio_Companies_${date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
