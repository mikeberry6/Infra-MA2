import { snapshotCompanySha256 } from "./artifacts";
import { companyImageSchema, type CompanyImage, type SnapshotCompany } from "./schema";
import { seedKey } from "./snapshot";

export const PRISMA_COMPANY_IMAGE_INCLUDE = {
  _count: {
    select: {
      ownershipPeriods: true,
      pendingOwnershipTransactions: true,
      milestones: true,
      managementRoles: true,
      citations: true,
      redirects: true,
    },
  },
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
    orderBy: { id: "asc" },
  },
  pendingOwnershipTransactions: {
    include: {
      citations: {
        include: {
          citation: { include: { source: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  },
  milestones: {
    include: {
      citations: {
        include: {
          citation: { include: { source: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  },
  managementRoles: {
    include: {
      person: { select: { name: true } },
      citations: {
        include: {
          citation: { include: { source: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  },
  citations: {
    include: { source: true },
    orderBy: { id: "asc" },
  },
} as const;

interface RawSource {
  label: string;
  url: string;
  type: string;
}

interface RawCitation {
  id: string;
  source: RawSource;
  isPrimary: boolean;
  purpose: string;
  evidenceLabel: string | null;
}

interface RawEvidenceJoin {
  citation: { source: { url: string } };
}

export interface RawPrismaCompanyImageRow {
  id: string;
  name: string;
  aliases: string[];
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[];
  description: string;
  companyStatus: string;
  status: string;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  updatedAt: Date | string;
  lastVerifiedAt: Date | string | null;
  _count: {
    ownershipPeriods: number;
    pendingOwnershipTransactions: number;
    milestones: number;
    managementRoles: number;
    citations: number;
    redirects: number;
  };
  ownershipPeriods: Array<{
    id: string;
    vehicleName: string | null;
    stake: string | null;
    investmentYear: number | null;
    exitYear: number | null;
    isActive: boolean;
    transactionState: string;
    organization: { name: string } | null;
    fund: { fundName: string; manager: { name: string } } | null;
  }>;
  pendingOwnershipTransactions: Array<{
    id: string;
    direction: string;
    state: string;
    counterpartyName: string;
    transactionDescription: string;
    announcedAt: Date | string | null;
    expectedClosing: string | null;
    relatedOwnershipPeriodIds: string[];
    citations: RawEvidenceJoin[];
  }>;
  milestones: Array<{
    id: string;
    date: string;
    event: string;
    category: string;
    sortDate: Date | string | null;
    citations: RawEvidenceJoin[];
  }>;
  managementRoles: Array<{
    id: string;
    title: string;
    isCurrent: boolean;
    startDate: Date | string | null;
    endDate: Date | string | null;
    person: { name: string };
    citations: RawEvidenceJoin[];
  }>;
  citations: RawCitation[];
}

interface CompanyReadDelegate {
  findUnique(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown>;
}

function companyDelegate(transaction: unknown): CompanyReadDelegate {
  const candidate = transaction as { company?: Partial<CompanyReadDelegate> };
  if (
    !candidate.company
    || typeof candidate.company.findUnique !== "function"
    || typeof candidate.company.findMany !== "function"
  ) {
    throw new Error("Prisma transaction does not expose the Company read delegate");
  }
  return candidate.company as CompanyReadDelegate;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Prisma company image contains an invalid timestamp");
  return date.toISOString();
}

function dateOnly(value: Date | string | null): string | null {
  return value === null ? null : iso(value).slice(0, 10);
}

function evidenceUrls(joins: readonly RawEvidenceJoin[]): string[] {
  return [...new Set(joins.map((join) => join.citation.source.url))]
    .sort((left, right) => left.localeCompare(right));
}

export function prismaCompanyRowToImage(row: RawPrismaCompanyImageRow): CompanyImage {
  return companyImageSchema.parse({
    id: row.id,
    name: row.name,
    aliases: [...row.aliases],
    // CompanyImage is a persistence/audit image, not a UI view. Keep raw
    // Prisma enum values so a proposal round-trips byte-for-byte.
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    country: row.country,
    countryTags: [...row.countryTags],
    description: row.description,
    companyStatus: row.companyStatus,
    recordStatus: row.status,
    website: row.website,
    yearFounded: row.yearFounded,
    headquarters: row.headquarters,
    lastVerifiedAt: row.lastVerifiedAt === null ? null : iso(row.lastVerifiedAt),
    ownershipPeriods: row.ownershipPeriods.map((ownership) => {
      const managerName = ownership.fund?.manager.name ?? ownership.organization?.name;
      if (!managerName) throw new Error(`Ownership period ${ownership.id} lacks a resolvable manager`);
      return {
        id: ownership.id,
        managerName,
        organizationName: ownership.organization?.name ?? null,
        fundName: ownership.fund?.fundName ?? null,
        vehicleName: ownership.vehicleName,
        stake: ownership.stake,
        investmentYear: ownership.investmentYear,
        exitYear: ownership.exitYear,
        isActive: ownership.isActive,
        transactionState: ownership.transactionState,
      };
    }),
    pendingOwnershipTransactions: row.pendingOwnershipTransactions.map((transaction) => ({
      id: transaction.id,
      direction: transaction.direction,
      transactionState: transaction.state,
      counterpartyName: transaction.counterpartyName,
      transactionDescription: transaction.transactionDescription,
      announcedAt: dateOnly(transaction.announcedAt),
      expectedClosing: transaction.expectedClosing,
      relatedOwnershipPeriodIds: [...transaction.relatedOwnershipPeriodIds],
      evidenceUrls: evidenceUrls(transaction.citations),
    })),
    milestones: row.milestones.map((milestone) => ({
      id: milestone.id,
      date: milestone.date,
      event: milestone.event,
      category: milestone.category,
      sortDate: milestone.sortDate === null ? null : iso(milestone.sortDate),
      evidenceUrls: evidenceUrls(milestone.citations),
    })),
    managementRoles: row.managementRoles.map((role) => ({
      id: role.id,
      personName: role.person.name,
      title: role.title,
      isCurrent: role.isCurrent,
      startDate: dateOnly(role.startDate),
      endDate: dateOnly(role.endDate),
      evidenceUrls: evidenceUrls(role.citations),
    })),
    citations: row.citations.map((citation) => ({
      id: citation.id,
      label: citation.source.label,
      url: citation.source.url,
      sourceType: citation.source.type,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
      isPrimary: citation.isPrimary,
    })),
  });
}

export function prismaCompanyRowToSnapshot(row: RawPrismaCompanyImageRow): SnapshotCompany {
  const input: Omit<SnapshotCompany, "companySnapshotSha256"> = {
    id: row.id,
    seedKey: seedKey(row.name, row.country),
    name: row.name,
    country: row.country,
    countryTags: [...row.countryTags].sort((left, right) => left.localeCompare(right)),
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    companyStatus: row.companyStatus as SnapshotCompany["companyStatus"],
    recordStatus: row.status as SnapshotCompany["recordStatus"],
    website: row.website,
    updatedAt: iso(row.updatedAt),
    lastVerifiedAt: row.lastVerifiedAt === null ? null : iso(row.lastVerifiedAt),
    relationCounts: { ...row._count },
  };
  return { ...input, companySnapshotSha256: snapshotCompanySha256(input) };
}

export async function loadPrismaCompanyImageRow(
  transaction: unknown,
  companyId: string,
): Promise<RawPrismaCompanyImageRow | null> {
  return await companyDelegate(transaction).findUnique({
    where: { id: companyId },
    include: PRISMA_COMPANY_IMAGE_INCLUDE,
  }) as RawPrismaCompanyImageRow | null;
}

export async function loadPrismaCompanyImage(
  transaction: unknown,
  companyId: string,
): Promise<CompanyImage | null> {
  const row = await loadPrismaCompanyImageRow(transaction, companyId);
  return row ? prismaCompanyRowToImage(row) : null;
}

export async function findPrismaCompanyImageRows(
  transaction: unknown,
  name: string,
  country: string,
): Promise<RawPrismaCompanyImageRow[]> {
  return await companyDelegate(transaction).findMany({
    where: { name, country },
    include: PRISMA_COMPANY_IMAGE_INCLUDE,
    orderBy: { id: "asc" },
  }) as RawPrismaCompanyImageRow[];
}
