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
  return sources.map((s) => `${s.label}: ${s.url}`).join("; ");
}

function flattenCountryTags(tags?: string[]): string {
  if (!tags?.length) return "";
  return tags.join("; ");
}

const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: "Company Name", key: "name", width: 30 },
  { header: "Investment Firm", key: "investmentFirm", width: 25 },
  { header: "Status", key: "status", width: 10 },
  { header: "Sector", key: "sector", width: 22 },
  { header: "Subsector", key: "subsector", width: 22 },
  { header: "Region", key: "region", width: 16 },
  { header: "Country", key: "country", width: 18 },
  { header: "Country Tags", key: "countryTags", width: 22 },
  { header: "Ownership Vehicle", key: "ownershipVehicle", width: 30 },
  { header: "Headquarters", key: "headquarters", width: 20 },
  { header: "Year Founded", key: "yearFounded", width: 14 },
  { header: "Investment Year", key: "investmentYear", width: 14 },
  { header: "Website", key: "website", width: 30 },
  { header: "Description", key: "description", width: 50 },
  { header: "Management", key: "management", width: 40 },
  { header: "Milestones", key: "milestones", width: 60 },
  { header: "Sources", key: "sources", width: 40 },
];

function toRow(c: CompanyView): Record<string, string | number | undefined> {
  return {
    "Company Name": c.name,
    "Investment Firm": c.investmentFirm,
    "Status": c.status,
    "Sector": c.sector,
    "Subsector": c.subsector,
    "Region": c.region,
    "Country": c.country,
    "Country Tags": flattenCountryTags(c.countryTags),
    "Ownership Vehicle": c.ownershipVehicle,
    "Headquarters": c.headquarters ?? "",
    "Year Founded": c.yearFounded,
    "Investment Year": c.investmentYear,
    "Website": c.website ?? "",
    "Description": c.description,
    "Management": flattenManagement(c.management),
    "Milestones": flattenMilestones(c.milestones),
    "Sources": flattenSources(c.sources),
  };
}

export async function exportPortfolioToExcel(companies: CompanyView[]): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = companies.map(toRow);
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: COLUMNS.map((c) => c.header),
  });
  ws["!cols"] = COLUMNS.map((c) => ({ wch: c.width }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Portfolio Companies");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Portfolio_Companies_${date}.xlsx`);
}
