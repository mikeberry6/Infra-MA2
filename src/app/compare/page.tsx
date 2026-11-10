import Link from "next/link";
import { ProfileLink, ProfileSource, RecordProfile } from "@/components/profiles/RecordProfile";
import { withBasePath } from "@/lib/base-path";
import { researchMetadata } from "@/lib/public-metadata";
import { prisma } from "@/lib/prisma";
import { getPublicCompanyProfile, getPublicDealProfile, getPublicFundProfile } from "@/modules/profiles/queries";

export const dynamic = "force-dynamic";
export const metadata = {
  ...researchMetadata("/compare", "Compare infrastructure records", "Compare sourced infrastructure deals, funds, or portfolio companies side by side."),
  robots: { index: false, follow: true },
};

const TYPES = { deal: "Deals", fund: "Funds", company: "PortCos" } as const;
type ComparisonType = keyof typeof TYPES;
type Choice = { id: string; label: string };
type RecordColumn = {
  id: string;
  label: string;
  facts: Record<string, string | null | undefined>;
  url: string;
  source?: string | null;
};
type Query = Record<string, string | string[] | undefined>;
const published = { status: "PUBLISHED" } as const;

async function getChoices(type: ComparisonType): Promise<Choice[]> {
  if (type === "fund") {
    return (await prisma.fund.findMany({
      where: published, orderBy: { fundName: "asc" }, select: { legacyId: true, fundName: true },
    })).map(({ legacyId, fundName }) => ({ id: legacyId, label: fundName }));
  }
  if (type === "company") {
    return (await prisma.company.findMany({
      where: published, orderBy: [{ name: "asc" }, { id: "asc" }], select: { id: true, name: true, country: true },
    })).map(({ id, name, country }) => ({ id, label: [name, country].filter(Boolean).join(" · ") }));
  }
  return (await prisma.deal.findMany({
    where: published, orderBy: [{ date: "desc" }, { legacyId: "asc" }], select: { legacyId: true, target: true, date: true },
  })).map(({ legacyId, target, date }) => ({ id: legacyId, label: `${target} · ${date.toISOString().slice(0, 10)}` }));
}

async function getColumn(type: ComparisonType, id: string): Promise<RecordColumn | null> {
  if (type === "fund") {
    const fund = await getPublicFundProfile(id);
    return fund && {
      id: fund.legacyId, label: fund.fundName, url: `/funds/${fund.legacyId}`,
      source: fund.sizeSourceUrl ?? fund.sourceUrls[0],
      facts: {
        Manager: fund.managerName, Status: fund.status, Vintage: fund.vintage,
        "Reported size": fund.size, "Size basis": fund.sizeBasis, "Size as of": fund.sizeAsOf,
        Strategy: fund.strategies.join(", "), Geography: fund.regions.join(", "),
      },
    };
  }
  if (type === "company") {
    const company = await getPublicCompanyProfile(id);
    return company && {
      id: company.id, label: company.name, url: `/portfolio/${company.id}`, source: company.sources?.[0]?.url,
      facts: {
        Sector: company.sector, Subsector: company.subsector, Country: company.country,
        "Primary owner": company.investmentFirm, Vehicle: company.ownershipVehicle,
        "Initial investment": company.investmentYear?.toString(), Status: company.status,
      },
    };
  }
  const deal = await getPublicDealProfile(id);
  return deal && {
    id: deal.legacyId, label: deal.target, url: `/deals/${deal.legacyId}`, source: deal.sourceUrl,
    facts: {
      Date: deal.date.slice(0, 10), Buyer: deal.buyer, Seller: deal.seller,
      Status: deal.status, Subsector: deal.subsector, Country: deal.country,
      "Deal type": deal.category.join(", "), "Enterprise value": deal.enterpriseValue,
      "Equity value": deal.equityValue, "Asset scale": deal.assetScale,
    },
  };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const type: ComparisonType = query.type === "fund" || query.type === "company" ? query.type : "deal";
  const rawIds = Array.isArray(query.id) ? query.id : query.id ? [query.id] : [];
  const ids = [...new Set(rawIds.filter(Boolean))].slice(0, 3);
  const [choices, results] = await Promise.all([getChoices(type), Promise.all(ids.map((id) => getColumn(type, id)))]);
  const columns = [...new Map(results.flatMap((record) => record ? [[record.id, record] as const] : [])).values()];
  const factNames = columns[0] ? Object.keys(columns[0].facts) : [];
  const backHref = { deal: "/tracker", fund: "/funds", company: "/portfolio" }[type];

  return (
    <RecordProfile title="Compare records" label="Research tools"
      summary="View up to three records of the same type. Figures retain their reported basis and currency."
      backHref={backHref} backLabel="Back to database">
      <nav aria-label="Comparison type" className="flex gap-2">
        {(Object.entries(TYPES) as [ComparisonType, string][]).map(([key, label]) => (
          <Link key={key} href={`/compare?type=${key}`} aria-current={type === key ? "page" : undefined}
            className={`rounded-md border border-[var(--border)] px-3 py-2 type-meta font-medium ${type === key ? "bg-[var(--accent-soft)] text-[var(--accent)]" : ""}`}>
            {label}
          </Link>
        ))}
      </nav>
      <form action={withBasePath("/compare")} method="get" className="grid gap-3 sm:grid-cols-3">
        <input type="hidden" name="type" value={type} />
        {[0, 1, 2].map((index) => (
          <label key={index} className="min-w-0 space-y-1 type-meta">
            <span>Record {index + 1}</span>
            <select name="id" defaultValue={columns[index]?.id ?? ""} className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-2 text-sm">
              <option value="">Choose a record</option>
              {choices.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        ))}
        <button type="submit" className="w-fit rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Compare selected</button>
      </form>
      {results.some((record) => record === null) && <p role="status" className="type-meta">One or more records are unavailable.</p>}
      {columns.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
          <table className="w-full min-w-[400px] text-left text-sm">
            <caption className="sr-only">Selected {TYPES[type].toLowerCase()} comparison</caption>
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3">Field</th>
                {columns.map((record) => <th key={record.id} scope="col" className="min-w-32 px-3 py-3"><ProfileLink href={record.url}>{record.label}</ProfileLink></th>)}
              </tr>
            </thead>
            <tbody>
              {factNames.map((label) => (
                <tr key={label} className="border-t border-[var(--border)]">
                  <th scope="row" className="px-3 py-2.5 font-medium">{label}</th>
                  {columns.map((record) => <td key={record.id} className="px-3 py-2.5 align-top tabular-nums">{record.facts[label] || "Undisclosed"}</td>)}
                </tr>
              ))}
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-3 py-2.5 font-medium">Source</th>
                {columns.map((record) => <td key={record.id} className="px-3 py-2.5 align-top">{record.source ? <ProfileSource href={record.source} /> : "Source unavailable"}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </RecordProfile>
  );
}
