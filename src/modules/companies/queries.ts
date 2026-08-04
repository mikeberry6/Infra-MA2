import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import {
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
  COMPANY_STATUS_DISPLAY,
  MILESTONE_CATEGORY_DISPLAY,
} from "@/modules/shared/enum-maps";
import { dedupeMilestoneViews } from "@/modules/companies/milestone-view";
import type { CompanyView, MilestoneView, ExecutiveView, SourceView, OwnerView } from "@/modules/shared/types";

function toCompanyView(company: any): CompanyView {
  // Map every ownership period to an OwnerView, then sort: active first,
  // then by investmentYear descending. The first entry becomes the "primary"
  // owner whose values are projected onto the scalar legacy fields below
  // (kept for filters, sorts, search, and CSV export compatibility).
  const ownerships = company.ownershipPeriods || [];
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
      ...(company.redirects ?? []).map(
        (redirect: { retiredId: string }) => redirect.retiredId,
      ),
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

const COMPANY_INCLUDE = {
  ownershipPeriods: {
    include: {
      organization: { select: { name: true } },
      fund: {
        select: {
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
  },
  redirects: {
    select: { retiredId: true },
  },
};

const COMPANY_LIST_SELECT = {
  id: true,
  name: true,
  sector: true,
  subsector: true,
  region: true,
  country: true,
  countryTags: true,
  companyStatus: true,
  ownershipPeriods: COMPANY_INCLUDE.ownershipPeriods,
  redirects: COMPANY_INCLUDE.redirects,
} as const;

async function getAllCompaniesRaw(options: { detail?: boolean } = {}): Promise<CompanyView[]> {
  const companies = options.detail === false
    ? await prisma.company.findMany({
        where: { status: "PUBLISHED" },
        select: COMPANY_LIST_SELECT,
        orderBy: { name: "asc" },
      })
    : await prisma.company.findMany({
        where: { status: "PUBLISHED" },
        include: COMPANY_INCLUDE,
        orderBy: { name: "asc" },
      });
  return companies.map(toCompanyView);
}

const getAllCompaniesListCached = unstable_cache(
  () => getAllCompaniesRaw({ detail: false }),
  ["companies:all:list:canonical-v1"],
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

const getAllCompaniesDetailCached = unstable_cache(
  () => getAllCompaniesRaw({ detail: true }),
  ["companies:all:detail:canonical-v1"],
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllCompanies(options: { detail?: boolean } = {}): Promise<CompanyView[]> {
  return options.detail === false
    ? getAllCompaniesListCached()
    : getAllCompaniesDetailCached();
}

async function getCompanyByFocusIdRaw(
  focusId: string,
  // This value is intentionally unused by the query body. unstable_cache
  // includes function arguments in its cache key, allowing a just-applied
  // after-image hash to receive a fresh cache entry for verification.
  _cacheVersion: string,
): Promise<CompanyView | null> {
  const company = await prisma.company.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [
        { id: focusId },
        { redirects: { some: { retiredId: focusId } } },
      ],
    },
    include: COMPANY_INCLUDE,
  });
  return company ? toCompanyView(company) : null;
}

const getCompanyByFocusIdCached = unstable_cache(
  getCompanyByFocusIdRaw,
  ["companies:by-focus:canonical-v1"],
  { tags: [CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getCompanyByFocusId(
  focusId: string,
  cacheVersion = "default",
): Promise<CompanyView | null> {
  return getCompanyByFocusIdCached(focusId, cacheVersion);
}

export async function getCompanyById(id: string): Promise<CompanyView | null> {
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { id },
        { redirects: { some: { retiredId: id } } },
      ],
    },
    include: COMPANY_INCLUDE,
  });
  return company ? toCompanyView(company) : null;
}

export async function getCompanyCount(): Promise<number> {
  return prisma.company.count({ where: { status: "PUBLISHED" } });
}
