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
      firm: p.organization?.name || p.fund?.manager?.name || "",
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

  const sources: SourceView[] | undefined = company.citations?.map((c: any) => ({
    label: c.source.label,
    url: c.source.url,
  }));

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

export async function getAllCompanies(): Promise<CompanyView[]> {
  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    include: COMPANY_INCLUDE,
    orderBy: { name: "asc" },
  });
  return companies.map(toCompanyView);
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
