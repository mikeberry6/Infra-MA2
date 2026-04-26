import { prisma } from "@/lib/prisma";
import {
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
  COMPANY_STATUS_DISPLAY,
  MILESTONE_CATEGORY_DISPLAY,
} from "@/modules/shared/enum-maps";
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

  const milestones: MilestoneView[] | undefined = company.milestones?.map((m: any) => ({
    date: m.date,
    event: m.event,
    category: MILESTONE_CATEGORY_DISPLAY[m.category as keyof typeof MILESTONE_CATEGORY_DISPLAY] || m.category,
  }));

  const management: ExecutiveView[] | undefined = company.managementRoles?.map((r: any) => ({
    name: r.person.name,
    title: r.title,
  }));

  // Dedupe by URL: the underlying Citation table can contain multiple rows for
  // the same (companyId, sourceId), and rendering each one would surface the
  // same link N times in the drawer. Keep insertion order so the first cite wins.
  const seenSourceUrls = new Set<string>();
  const sources: SourceView[] | undefined = company.citations
    ?.map((c: any) => ({ label: c.source.label, url: c.source.url }))
    .filter((s: SourceView) => {
      if (seenSourceUrls.has(s.url)) return false;
      seenSourceUrls.add(s.url);
      return true;
    });

  return {
    id: company.id,
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
    milestones: milestones && milestones.length > 0 ? milestones : undefined,
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
      source: { select: { label: true, url: true } },
    },
  },
};

// Merge multiple CompanyView records that share a name. The DB currently has
// duplicate Company rows for ~12 companies (e.g. one row with country="United
// States" and another with country="United States / Canada"); the existing
// (name, country) unique key doesn't catch these. We merge at the view layer
// so the UI shows one card per company without a destructive DB change.
function mergeByName(views: CompanyView[]): CompanyView {
  if (views.length === 1) return views[0];
  // Pick the row with the most ownership periods as the "spine" (its scalar
  // fields propagate). Ties go to the longer description.
  const spine = [...views].sort((a, b) => {
    if (b.owners.length !== a.owners.length) return b.owners.length - a.owners.length;
    return (b.description?.length ?? 0) - (a.description?.length ?? 0);
  })[0];

  const dedup = <T,>(items: T[], key: (t: T) => string): T[] => {
    const seen = new Set<string>();
    return items.filter((t) => {
      const k = key(t);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const owners = dedup(
    views.flatMap((v) => v.owners),
    (o) => `${o.firm}|${o.vehicle}|${o.investmentYear ?? ""}|${o.exitYear ?? ""}`,
  ).sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return (b.investmentYear ?? 0) - (a.investmentYear ?? 0);
  });
  const primary = owners[0];

  const milestones = dedup(
    views.flatMap((v) => v.milestones ?? []),
    (m) => `${m.date}|${m.event}`,
  );
  const management = dedup(
    views.flatMap((v) => v.management ?? []),
    (e) => `${e.name}|${e.title}`,
  );
  const sources = dedup(
    views.flatMap((v) => v.sources ?? []),
    (s) => s.url,
  );
  const countryTags = Array.from(new Set(views.flatMap((v) => v.countryTags ?? [])));

  return {
    ...spine,
    investmentFirm: primary?.firm || spine.investmentFirm,
    ownershipVehicle: primary?.vehicle || spine.ownershipVehicle,
    investmentYear: primary?.investmentYear ?? spine.investmentYear,
    countryTags,
    milestones: milestones.length > 0 ? milestones : undefined,
    management: management.length > 0 ? management : undefined,
    sources: sources.length > 0 ? sources : undefined,
    owners,
  };
}

export async function getAllCompanies(): Promise<CompanyView[]> {
  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
    orderBy: { name: "asc" },
  });
  const views = companies.map(toCompanyView);
  const byName = new Map<string, CompanyView[]>();
  for (const v of views) {
    const list = byName.get(v.name) ?? [];
    list.push(v);
    byName.set(v.name, list);
  }
  return Array.from(byName.values())
    .map(mergeByName)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompanyById(id: string): Promise<CompanyView | null> {
  const company = await prisma.company.findUnique({
    where: { id },
    include: COMPANY_INCLUDE,
  });
  return company ? toCompanyView(company) : null;
}

export async function getCompanyCount(): Promise<number> {
  return prisma.company.count({ where: { status: "PUBLISHED" } });
}
