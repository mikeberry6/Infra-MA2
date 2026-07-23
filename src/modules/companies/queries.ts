import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { dataCacheKeyParts } from "@/lib/data-cache-namespace";
import {
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
  COMPANY_STATUS_DISPLAY,
  MILESTONE_CATEGORY_DISPLAY,
} from "@/modules/shared/enum-maps";
import type {
  CompanyDetail,
  CompanyListItem,
  CompanyView,
  MilestoneView,
  ExecutiveView,
  SourceView,
  OwnerView,
} from "@/modules/shared/types";
import type { Prisma } from "@/generated/prisma/client";

const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function normalizeMilestoneEvent(event: string): string {
  return event
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|and|or|of|to|from|for|with|by|in|on|as|its|it|was|were|is|are)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function milestoneTokens(event: string): Set<string> {
  return new Set(
    normalizeMilestoneEvent(event)
      .split(/\s+/)
      .filter((token) => token.length >= 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

function milestoneYear(milestone: MilestoneView): number | null {
  const match = `${milestone.date} ${milestone.event}`.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function milestoneDateSpecificity(date: string): number {
  if (/^\w+\s+\d{1,2},\s+\d{4}$/.test(date)) return 4;
  if (/^\w+\s+\d{4}$/.test(date)) return 3;
  if (/^Q[1-4]\s+\d{4}$/.test(date)) return 2;
  if (/^\d{4}$/.test(date)) return 1;
  return 0;
}

function milestoneSortKey(milestone: MilestoneView): number {
  const fullDate = milestone.date.match(/^(\w+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (fullDate) {
    const month = MONTH_INDEX[fullDate[1].toLowerCase()] ?? 1;
    return Number(fullDate[3]) * 10000 + month * 100 + Number(fullDate[2]);
  }

  const monthYear = milestone.date.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTH_INDEX[monthYear[1].toLowerCase()] ?? 1;
    return Number(monthYear[2]) * 10000 + month * 100 + 1;
  }

  const quarter = milestone.date.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarter) {
    const month = (Number(quarter[1]) - 1) * 3 + 1;
    return Number(quarter[2]) * 10000 + month * 100 + 1;
  }

  const year = milestone.date.match(/^(\d{4})$/);
  if (year) return Number(year[1]) * 10000 + 101;
  return 0;
}

function milestoneCategoryPriority(category: string): number {
  switch (category) {
    case "Divestiture":
    case "IPO":
      return 7;
    case "Acquisition":
    case "Financing":
      return 6;
    case "Founding":
      return 5;
    case "Expansion":
      return 4;
    case "Management":
      return 2;
    default:
      return 0;
  }
}

function milestoneDisplayScore(milestone: MilestoneView): number {
  let score = milestoneCategoryPriority(milestone.category) * 10 + milestoneDateSpecificity(milestone.date) * 4;
  if (/\b(completed|closed|completion|closing|commercial operation|began operations|entered service|commissioned)\b/i.test(milestone.event)) {
    score += 6;
  }
  if (/\b(announced|agreement|agreed|planned|expected)\b/i.test(milestone.event)) {
    score -= 4;
  }
  return score;
}

function isDistinctMilestonePair(first: MilestoneView, second: MilestoneView): boolean {
  const text = `${first.event} ${second.event}`.toLowerCase();
  return /\b(follow-on|additional|second|subsequent)\b/.test(text) && /\b(initial|first)\b/.test(text);
}

function shouldCollapseMilestones(first: MilestoneView, second: MilestoneView): boolean {
  const firstNorm = normalizeMilestoneEvent(first.event);
  const secondNorm = normalizeMilestoneEvent(second.event);
  const sameEvent = firstNorm.length >= 18 && firstNorm === secondNorm;
  const nestedEvent =
    Math.min(firstNorm.length, secondNorm.length) >= 45 &&
    (firstNorm.includes(secondNorm) || secondNorm.includes(firstNorm));
  const sameYear = milestoneYear(first) !== null && milestoneYear(first) === milestoneYear(second);
  const strongOverlap =
    sameYear &&
    jaccard(milestoneTokens(first.event), milestoneTokens(second.event)) >= 0.72 &&
    !isDistinctMilestonePair(first, second);
  return sameEvent || nestedEvent || strongOverlap;
}

function betterMilestone(first: MilestoneView, second: MilestoneView): MilestoneView {
  const scoreDiff = milestoneDisplayScore(second) - milestoneDisplayScore(first);
  if (scoreDiff > 0) return second;
  if (scoreDiff < 0) return first;
  return milestoneSortKey(second) > milestoneSortKey(first) ? second : first;
}

function dedupeMilestoneViews(milestones: MilestoneView[]): MilestoneView[] {
  const kept: MilestoneView[] = [];
  for (const milestone of milestones) {
    const index = kept.findIndex((existing) => shouldCollapseMilestones(existing, milestone));
    if (index === -1) {
      kept.push(milestone);
    } else {
      kept[index] = betterMilestone(kept[index], milestone);
    }
  }
  return kept.sort((a, b) => milestoneSortKey(b) - milestoneSortKey(a));
}

function toCompanyView(company: any): CompanyView {
  // Map every ownership period to an OwnerView, then sort: active first,
  // then by investmentYear descending. The first entry becomes the "primary"
  // owner whose values are projected onto the scalar legacy fields below
  // (kept for filters, sorts, search, and CSV export compatibility).
  const ownerships = (company.ownershipPeriods || []).filter(
    (period: any) => !period.fundId || period.fund?.status === "PUBLISHED",
  );
  const owners: OwnerView[] = ownerships
    .map((p: any): OwnerView => ({
      // Prefer the linked fund's manager (the canonical "investor of record")
      // over a free-text organization on the OwnershipPeriod itself. The
      // organization field is often a sleeve or co-investor; the fund manager
      // is the deal counterparty users expect to see.
      firm: p.fund?.manager?.name || p.organization?.name || "",
      vehicle: p.vehicleName || p.fund?.fundName || "",
      fundName: p.fund?.fundName || undefined,
      investmentYear: p.investmentYear ?? undefined,
      exitYear: p.exitYear ?? undefined,
      isActive: !!p.isActive,
      stake: p.stake ?? undefined,
    }))
    .sort((a: OwnerView, b: OwnerView) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return (b.investmentYear ?? 0) - (a.investmentYear ?? 0);
    });

  const primary = owners[0];
  const investmentFirm = primary?.firm || "";
  const ownershipVehicle = primary?.vehicle || "";
  const investmentYear = primary?.investmentYear;

  const milestonesRaw: MilestoneView[] | undefined = company.milestones?.map((m: any) => ({
    date: m.date,
    event: m.event,
    category: MILESTONE_CATEGORY_DISPLAY[m.category as keyof typeof MILESTONE_CATEGORY_DISPLAY] || m.category,
  }));
  const milestones = milestonesRaw?.length ? dedupeMilestoneViews(milestonesRaw) : undefined;

  const management: ExecutiveView[] | undefined = company.managementRoles?.map((r: any) => ({
    name: r.person.name,
    title: r.title,
  }));

  // Dedupe identical citation rows while allowing one URL to support multiple
  // distinct source purposes on the same company scorecard.
  const seenSourceKeys = new Set<string>();
  const sources: SourceView[] | undefined = company.citations
    ?.map((c: any) => ({
      label: c.source.label,
      url: c.source.url,
      type: c.source.type,
      purpose: c.purpose,
      evidenceLabel: c.evidenceLabel || undefined,
    }))
    .filter((s: SourceView) => {
      const sourceKey = `${s.url}|${s.purpose || ""}|${s.evidenceLabel || s.label}`;
      if (seenSourceKeys.has(sourceKey)) return false;
      seenSourceKeys.add(sourceKey);
      return true;
    });

  return {
    id: company.id,
    focusIds: Array.from(new Set([
      company.id,
      ...(company.redirects ?? []).map((redirect: { retiredId: string }) => redirect.retiredId),
    ])),
    name: company.name,
    investmentFirm,
    sector: COMPANY_SECTOR_DISPLAY[company.sector as keyof typeof COMPANY_SECTOR_DISPLAY] || company.sector,
    subsector: company.subsector || "",
    region: COMPANY_REGION_DISPLAY[company.region as keyof typeof COMPANY_REGION_DISPLAY] || company.region,
    country: company.country,
    ownershipVehicle,
    description: company.description || "",
    status: COMPANY_STATUS_DISPLAY[company.companyStatus as keyof typeof COMPANY_STATUS_DISPLAY] || company.companyStatus,
    countryTags: company.countryTags || [],
    website: company.website || undefined,
    yearFounded: company.yearFounded || undefined,
    investmentYear,
    headquarters: company.headquarters || undefined,
    milestones,
    management: management && management.length > 0 ? management : undefined,
    sources: sources && sources.length > 0 ? sources : undefined,
    owners,
  };
}

function toCompanyListItem(company: CompanyView): CompanyListItem {
  return {
    id: company.id,
    focusIds: company.focusIds,
    name: company.name,
    investmentFirm: company.investmentFirm,
    sector: company.sector,
    subsector: company.subsector,
    region: company.region,
    country: company.country,
    ownershipVehicle: company.ownershipVehicle,
    status: company.status,
    countryTags: company.countryTags,
    investmentYear: company.investmentYear,
    owners: company.owners,
  };
}

const PUBLISHED_OWNERSHIP_WHERE = {
  OR: [
    { fundId: null },
    { fund: { is: { status: "PUBLISHED" } } },
  ],
} satisfies Prisma.OwnershipPeriodWhereInput;

const COMPANY_INCLUDE = {
  redirects: {
    select: { retiredId: true },
    orderBy: { retiredId: "asc" as const },
  },
  ownershipPeriods: {
    where: PUBLISHED_OWNERSHIP_WHERE,
    include: {
      organization: { select: { name: true } },
      fund: {
        select: {
          status: true,
          fundName: true,
          manager: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
  milestones: {
    orderBy: { sortDate: "desc" as const },
  },
  managementRoles: {
    include: {
      person: { select: { name: true } },
    },
  },
  citations: {
    include: {
      source: { select: { label: true, url: true, type: true } },
    },
    orderBy: [{ isPrimary: "desc" as const }, { id: "asc" as const }],
  },
};

const COMPANY_LIST_SELECT = {
  id: true,
  redirects: {
    select: { retiredId: true },
    orderBy: { retiredId: "asc" as const },
  },
  name: true,
  sector: true,
  subsector: true,
  region: true,
  country: true,
  countryTags: true,
  companyStatus: true,
  ownershipPeriods: {
    where: PUBLISHED_OWNERSHIP_WHERE,
    select: {
      fundId: true,
      vehicleName: true,
      investmentYear: true,
      isActive: true,
      organization: { select: { name: true } },
      fund: {
        select: {
          status: true,
          fundName: true,
          manager: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

async function getAllCompanyListItemsRaw(): Promise<CompanyListItem[]> {
  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    select: COMPANY_LIST_SELECT,
    orderBy: { name: "asc" },
  });
  return companies.map(toCompanyView).map(toCompanyListItem);
}

async function getAllCompanyDetailsRaw(): Promise<CompanyDetail[]> {
  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
    orderBy: { name: "asc" },
  });
  return companies.map(toCompanyView);
}

const getAllCompaniesListCached = unstable_cache(
  getAllCompanyListItemsRaw,
  dataCacheKeyParts("companies:all:list"),
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

const getAllCompaniesDetailCached = unstable_cache(
  getAllCompanyDetailsRaw,
  dataCacheKeyParts("companies:all:detail"),
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllCompanyListItems(): Promise<CompanyListItem[]> {
  return getAllCompaniesListCached();
}

export async function getAllCompanyDetails(): Promise<CompanyDetail[]> {
  return getAllCompaniesDetailCached();
}

export function getAllCompanies(options: { detail: false }): Promise<CompanyListItem[]>;
export function getAllCompanies(options?: { detail?: true }): Promise<CompanyDetail[]>;
export async function getAllCompanies(
  options: { detail?: boolean } = {},
): Promise<CompanyListItem[] | CompanyDetail[]> {
  return options.detail === false ? getAllCompanyListItems() : getAllCompanyDetails();
}

async function getCompanyByFocusIdRaw(focusId: string): Promise<CompanyView | null> {
  const direct = await prisma.company.findFirst({
    where: { id: focusId, status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
  });
  if (direct) return toCompanyView(direct);

  const redirect = await prisma.companyRedirect.findUnique({
    where: { retiredId: focusId },
    select: { company: { select: { id: true, status: true } } },
  });
  if (redirect?.company.status !== "PUBLISHED") return null;

  const canonical = await prisma.company.findFirst({
    where: { id: redirect.company.id, status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
  });
  return canonical ? toCompanyView(canonical) : null;
}

const getCompanyByFocusIdCached = unstable_cache(
  getCompanyByFocusIdRaw,
  dataCacheKeyParts("companies:by-focus"),
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getCompanyByFocusId(focusId: string): Promise<CompanyView | null> {
  return getCompanyByFocusIdCached(focusId);
}

export async function getCompanyById(id: string): Promise<CompanyView | null> {
  const company = await prisma.company.findFirst({
    where: { id, status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
  });
  return company ? toCompanyView(company) : null;
}

export async function getCompanyCount(): Promise<number> {
  return prisma.company.count({ where: { status: "PUBLISHED" } });
}
