import { rehomeCompanyRedirects } from "../../src/modules/companies/redirects";
import type {
  ApprovedApplyStore,
  AuditEventWrite,
  CompanyRevisionWrite,
} from "./apply-executor";
import type { ApprovedApplyPlan, FreshApplyState, FreshCompanyState } from "./apply-plan";
import {
  findPrismaCompanyImageRows,
  loadPrismaCompanyImage,
  loadPrismaCompanyImageRow,
  prismaCompanyRowToImage,
  prismaCompanyRowToSnapshot,
} from "./prisma-company-image";
import type {
  CompanyImage,
  ProposalExecutionLock,
  ProductionSnapshot,
  ReconciliationProposal,
} from "./schema";
import { canonicalJson, digestsEqual, sha256Canonical } from "./hash";

interface CrudDelegate {
  findUnique(args: unknown): Promise<unknown>;
  findFirst(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  updateMany(args: unknown): Promise<{ count: number }>;
  delete(args: unknown): Promise<unknown>;
  deleteMany(args: unknown): Promise<{ count: number }>;
  upsert(args: unknown): Promise<unknown>;
  count(args?: unknown): Promise<number>;
}

function delegate(transaction: unknown, name: string): CrudDelegate {
  const value = (transaction as Record<string, unknown>)[name] as Partial<CrudDelegate> | undefined;
  if (!value) throw new Error(`Prisma transaction does not expose ${name}`);
  return value as CrudDelegate;
}

function rawEnum(value: string, map: Record<string, string>, label: string): string {
  const mapped = map[value] ?? value;
  if (!Object.values(map).includes(mapped)) throw new Error(`Unsupported ${label} ${value}`);
  return mapped;
}

const sectors: Record<string, string> = {
  "Power & ET": "POWER_ET",
  POWER_ET: "POWER_ET",
  Utilities: "UTILITIES",
  UTILITIES: "UTILITIES",
  Digital: "DIGITAL",
  DIGITAL: "DIGITAL",
  Midstream: "MIDSTREAM",
  MIDSTREAM: "MIDSTREAM",
  Transportation: "TRANSPORTATION",
  TRANSPORTATION: "TRANSPORTATION",
  "Social Infra": "SOCIAL_INFRA",
  SOCIAL_INFRA: "SOCIAL_INFRA",
};

const regions: Record<string, string> = {
  "North America": "NORTH_AMERICA",
  NORTH_AMERICA: "NORTH_AMERICA",
  Europe: "EUROPE",
  EUROPE: "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  ASIA_PACIFIC: "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  LATIN_AMERICA: "LATIN_AMERICA",
  Global: "GLOBAL",
  GLOBAL: "GLOBAL",
};

const milestoneCategories: Record<string, string> = {
  Founding: "FOUNDING",
  FOUNDING: "FOUNDING",
  Acquisition: "ACQUISITION",
  ACQUISITION: "ACQUISITION",
  Financing: "FINANCING",
  FINANCING: "FINANCING",
  Expansion: "EXPANSION",
  EXPANSION: "EXPANSION",
  Management: "MANAGEMENT",
  MANAGEMENT: "MANAGEMENT",
  Divestiture: "DIVESTITURE",
  DIVESTITURE: "DIVESTITURE",
  IPO: "IPO",
  Other: "OTHER",
  OTHER: "OTHER",
};

function date(value: string | null): Date | null {
  return value === null ? null : new Date(`${value}T00:00:00.000Z`);
}

function timestamp(value: string | null): Date | null {
  return value === null ? null : new Date(value);
}

interface ObservedExecutionDependencies {
  funds: Array<{ id: string; fundName: string; managerId: string; updatedAt: string | Date }>;
  organizations: Array<{ id: string; name: string; updatedAt: string | Date }>;
  redirects: Array<{
    retiredId: string;
    companyId: string;
    reason: string;
    createdAt: string | Date;
  }>;
}

function dependencyTimestamp(value: string | Date): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error("Execution dependency contains an invalid timestamp");
  return parsed.toISOString();
}

function normalizeObservedExecutionDependencies(
  observed: ObservedExecutionDependencies,
): ObservedExecutionDependencies {
  return {
    funds: observed.funds
      .map((row) => ({ ...row, updatedAt: dependencyTimestamp(row.updatedAt) }))
      .sort((left, right) => left.id.localeCompare(right.id, "en")),
    organizations: observed.organizations
      .map((row) => ({ ...row, updatedAt: dependencyTimestamp(row.updatedAt) }))
      .sort((left, right) => left.id.localeCompare(right.id, "en")),
    redirects: observed.redirects
      .map((row) => ({ ...row, createdAt: dependencyTimestamp(row.createdAt) }))
      .sort((left, right) => left.retiredId.localeCompare(right.retiredId, "en")),
  };
}

export function assertProposalExecutionDependenciesFresh(
  lock: ProposalExecutionLock,
  observedInput: ObservedExecutionDependencies,
): void {
  const observed = normalizeObservedExecutionDependencies(observedInput);
  for (const [label, current, approved, expectedHash] of [
    ["funds", observed.funds, lock.funds, lock.dependencies.fundsSha256],
    ["organizations", observed.organizations, lock.organizations, lock.dependencies.organizationsSha256],
    ["redirects", observed.redirects, lock.redirects, lock.dependencies.redirectsSha256],
  ] as const) {
    const currentHash = sha256Canonical(current);
    if (!digestsEqual(currentHash, expectedHash) || !digestsEqual(currentHash, sha256Canonical(approved))) {
      throw new Error(`Proposal execution dependency is stale: ${label}`);
    }
  }
}

async function assertLockedExecutionDependenciesFresh(
  transaction: unknown,
  proposal: ReconciliationProposal,
): Promise<void> {
  const lock = proposal.executionLock;
  if (!lock) return;
  const funds = lock.funds.length > 0
    ? await delegate(transaction, "fund").findMany({
        where: { id: { in: lock.funds.map((row) => row.id) } },
        select: { id: true, fundName: true, managerId: true, updatedAt: true },
        orderBy: { id: "asc" },
      }) as ObservedExecutionDependencies["funds"]
    : [];
  const organizations = lock.organizations.length > 0
    ? await delegate(transaction, "organization").findMany({
        where: { id: { in: lock.organizations.map((row) => row.id) } },
        select: { id: true, name: true, updatedAt: true },
        orderBy: { id: "asc" },
      }) as ObservedExecutionDependencies["organizations"]
    : [];
  const targetId = proposal.beforeImage?.id ?? null;
  const redirects = targetId
    ? await delegate(transaction, "companyRedirect").findMany({
        where: { OR: [{ companyId: targetId }, { retiredId: targetId }] },
        select: { retiredId: true, companyId: true, reason: true, createdAt: true },
        orderBy: { retiredId: "asc" },
      }) as ObservedExecutionDependencies["redirects"]
    : [];
  assertProposalExecutionDependenciesFresh(lock, { funds, organizations, redirects });
}

function scalarData(image: CompanyImage) {
  return {
    name: image.name,
    aliases: image.aliases,
    sector: rawEnum(image.sector, sectors, "company sector"),
    subsector: image.subsector,
    region: rawEnum(image.region, regions, "company region"),
    country: image.country,
    countryTags: image.countryTags,
    description: image.description,
    companyStatus: image.companyStatus,
    website: image.website,
    yearFounded: image.yearFounded,
    headquarters: image.headquarters,
    status: image.recordStatus,
    lastVerifiedAt: timestamp(image.lastVerifiedAt),
  };
}

function existingIds<T extends { id: string | null }>(rows: readonly T[]): string[] {
  return rows.flatMap((row) => row.id ? [row.id] : []);
}

export function assertSharedSourceCompatible(input: {
  url: string;
  desiredLabel: string;
  desiredType: string;
  existing: { label: string; type: string } | null;
}): void {
  if (
    input.existing
    && (
      input.existing.label !== input.desiredLabel
      || input.existing.type !== input.desiredType
    )
  ) {
    throw new Error(`Shared Source ${input.url} differs from the approved label/type; requires separate source review`);
  }
}

export function assertOwnershipManagerCompatible(input: {
  approvedManagerName: string;
  organizationName: string | null;
  fundManagerName: string | null;
}): void {
  const persistedManagerName = input.fundManagerName ?? input.organizationName ?? input.approvedManagerName;
  if (persistedManagerName !== input.approvedManagerName) {
    throw new Error(
      `Approved ownership manager ${input.approvedManagerName} cannot round-trip through the linked fund/organization manager ${persistedManagerName}`,
    );
  }
}

const approvedOwnershipOrganizationProvisioning = {
  "AT&T Inc.": "CORPORATE",
  "AgeCare": "CORPORATE",
  "BC Partners": "FUND_MANAGER",
  "BBGI": "FUND_MANAGER",
  "Canadian Business Growth Fund": "FUND_MANAGER",
  "Capital Power Corporation": "CORPORATE",
  "Continental Grain Company": "CORPORATE",
  "Cresta Fund Management": "FUND_MANAGER",
  "Crestview Partners": "FUND_MANAGER",
  "Cox Enterprises": "CORPORATE",
  "CSG Investments, Inc.": "CORPORATE",
  "Donato Ardellini": "OTHER",
  "Dalmore Capital": "FUND_MANAGER",
  "Energy Transfer LP": "CORPORATE",
  "ENGIE": "CORPORATE",
  "Enlightened Hospitality Investments": "FUND_MANAGER",
  "Angeleno Group": "FUND_MANAGER",
  "Avolta, LLC": "CORPORATE",
  "Borrego Energy": "CORPORATE",
  "Eolian employees": "OTHER",
  "ePointZero": "CORPORATE",
  "Eversource Energy": "CORPORATE",
  "Excelsior Energy Capital": "FUND_MANAGER",
  "Extendicare Inc.": "CORPORATE",
  "Ferrovial N.V.": "CORPORATE",
  "GE Renewable Energy": "CORPORATE",
  "GFL Environmental Inc.": "CORPORATE",
  "Jeff Canon and PROENERGY management": "OTHER",
  "HPS Investment Partners": "FUND_MANAGER",
  "Harvestone Group": "CORPORATE",
  "Kinder Morgan, Inc.": "CORPORATE",
  "MAP Energy, LLC": "FUND_MANAGER",
  "MGX": "FUND_MANAGER",
  "Ocean Winds": "CORPORATE",
  "NextDecade Corporation": "CORPORATE",
  "OPTrust": "PENSION",
  "PUC Inc.": "CORPORATE",
  "Revera Inc.": "CORPORATE",
  "Silverpeak": "FUND_MANAGER",
  "Switch management": "OTHER",
  "TC Energy Corporation": "CORPORATE",
  "TotalEnergies": "CORPORATE",
  "XRG P.J.S.C.": "CORPORATE",
  "Énergir L.P.": "CORPORATE",
  "Ingka Investments": "CORPORATE",
  "Invenergy": "CORPORATE",
  "Koninklijke Vopak N.V.": "CORPORATE",
  "Occidental Petroleum Corporation": "CORPORATE",
  "ACON Investments": "FUND_MANAGER",
  "Eos Partners, L.P.": "FUND_MANAGER",
  "TCA Fund Management Group Corp.": "FUND_MANAGER",
  "Walsin Lihwa Corporation": "CORPORATE",
} as const;

export function ownershipOrganizationTypes(
  name: string,
): ["CORPORATE"] | ["FUND_MANAGER"] | ["OTHER"] | ["PENSION"] {
  const type = approvedOwnershipOrganizationProvisioning[
    name as keyof typeof approvedOwnershipOrganizationProvisioning
  ];
  if (!type) {
    throw new Error(`Approved ownership organization is not provisionable: ${name}`);
  }
  return [type];
}

async function assertCitationSourcesCompatible(
  transaction: unknown,
  image: CompanyImage,
): Promise<void> {
  const sources = delegate(transaction, "source");
  for (const citation of image.citations) {
    const existing = await sources.findUnique({
      where: { url: citation.url },
      select: { label: true, type: true },
    }) as { label: string; type: string } | null;
    assertSharedSourceCompatible({
      url: citation.url,
      desiredLabel: citation.label,
      desiredType: citation.sourceType,
      existing,
    });
  }
}

async function requiredUpdate(
  transaction: unknown,
  model: string,
  id: string,
  allowedCompanyIds: string[],
  data: Record<string, unknown>,
): Promise<void> {
  const result = await delegate(transaction, model).updateMany({
    where: { id, companyId: { in: allowedCompanyIds } },
    data,
  });
  if (result.count !== 1) throw new Error(`${model} ${id} changed ownership or disappeared inside the transaction`);
}

async function deleteRetiredRowsNotApproved(input: {
  transaction: unknown;
  model: string;
  retiredCompanyIds: string[];
  approvedIds: string[];
}): Promise<void> {
  if (input.retiredCompanyIds.length === 0) return;
  await delegate(input.transaction, input.model).deleteMany({
    where: {
      companyId: { in: input.retiredCompanyIds },
      ...(input.approvedIds.length > 0 ? { id: { notIn: input.approvedIds } } : {}),
    },
  });
}

async function citationIdsForEvidence(
  transaction: unknown,
  companyId: string,
  urls: readonly string[],
  options: { required: boolean },
): Promise<string[]> {
  if (urls.length === 0) {
    assertRelationEvidencePolicy(options.required ? "PENDING_TRANSACTION" : "HISTORICAL_FACT", urls);
    return [];
  }
  const rows = await delegate(transaction, "citation").findMany({
    where: { companyId, source: { url: { in: [...urls] } } },
    select: { id: true, source: { select: { url: true } } },
  }) as Array<{ id: string; source: { url: string } }>;
  const foundUrls = new Set(rows.map((row) => row.source.url));
  for (const url of urls) {
    if (!foundUrls.has(url)) throw new Error(`Approved relation evidence URL is not a company citation: ${url}`);
  }
  return rows.map((row) => row.id);
}

export function assertRelationEvidencePolicy(
  kind: "PENDING_TRANSACTION" | "HISTORICAL_FACT",
  urls: readonly string[],
): void {
  if (kind === "PENDING_TRANSACTION" && urls.length === 0) {
    throw new Error("Pending ownership transactions require at least one citation URL");
  }
}

async function replaceEvidenceLinks(input: {
  transaction: unknown;
  delegateName: "pendingOwnershipTransactionCitation" | "milestoneCitation" | "managementRoleCitation";
  foreignKey: "pendingOwnershipTransactionId" | "milestoneId" | "managementRoleId";
  relationId: string;
  citationIds: string[];
}): Promise<void> {
  const relation = delegate(input.transaction, input.delegateName);
  await relation.deleteMany({ where: { [input.foreignKey]: input.relationId } });
  for (const citationId of input.citationIds) {
    await relation.create({
      data: { [input.foreignKey]: input.relationId, citationId },
    });
  }
}

async function syncCitations(
  transaction: unknown,
  companyId: string,
  allowedCompanyIds: string[],
  image: CompanyImage,
): Promise<void> {
  const citations = delegate(transaction, "citation");
  const sources = delegate(transaction, "source");
  const desiredExistingIds = existingIds(image.citations);
  await citations.deleteMany({
    where: {
      companyId: { in: allowedCompanyIds },
      ...(desiredExistingIds.length > 0 ? { id: { notIn: desiredExistingIds } } : {}),
    },
  });
  await citations.updateMany({ where: { companyId }, data: { isPrimary: false } });
  let primaryCitationId: string | null = null;
  for (const citation of image.citations) {
    const existingSource = await sources.findUnique({ where: { url: citation.url } }) as
      | { id: string; label: string; type: string }
      | null;
    assertSharedSourceCompatible({
      url: citation.url,
      desiredLabel: citation.label,
      desiredType: citation.sourceType,
      existing: existingSource,
    });
    const source = existingSource ?? await sources.create({
      data: { label: citation.label, url: citation.url, type: citation.sourceType },
    }) as { id: string };
    let citationId: string;
    if (citation.id) {
      await requiredUpdate(transaction, "citation", citation.id, allowedCompanyIds, {
        companyId,
        sourceId: source.id,
        purpose: citation.purpose,
        evidenceLabel: citation.evidenceLabel,
        isPrimary: false,
      });
      citationId = citation.id;
    } else {
      const created = await citations.create({
        data: {
          companyId,
          sourceId: source.id,
          purpose: citation.purpose,
          evidenceLabel: citation.evidenceLabel,
          isPrimary: false,
        },
      }) as { id: string };
      citationId = created.id;
    }
    if (citation.isPrimary) primaryCitationId = citationId;
  }
  if (!primaryCitationId) throw new Error("Approved after-image has no primary citation");
  await citations.update({ where: { id: primaryCitationId }, data: { isPrimary: true } });
  const primaryCount = await citations.count({ where: { companyId, isPrimary: true } });
  if (primaryCount !== 1) throw new Error("Database does not contain exactly one primary company citation");
}

export async function ownershipLinks(
  transaction: unknown,
  owner: CompanyImage["ownershipPeriods"][number],
  phase: "VALIDATE" | "APPLY" = "VALIDATE",
): Promise<{ organizationId: string | null; fundId: string | null }> {
  let fund: { id: string; managerId: string; manager: { name: string } } | null = null;
  if (owner.fundName) {
    fund = await delegate(transaction, "fund").findUnique({
      where: { fundName: owner.fundName },
      select: { id: true, managerId: true, manager: { select: { name: true } } },
    }) as { id: string; managerId: string; manager: { name: string } } | null;
    if (!fund) throw new Error(`Approved ownership fund does not exist: ${owner.fundName}`);
  }
  const organizationName = owner.organizationName ?? (fund ? null : owner.managerName);
  let organization = organizationName
    ? await delegate(transaction, "organization").findUnique({
        where: { name: organizationName },
        select: { id: true, name: true, types: true, status: true },
      }) as { id: string; name: string; types: string[]; status: string } | null
    : null;
  const provisionedTypes = organizationName && Object.hasOwn(
    approvedOwnershipOrganizationProvisioning,
    organizationName,
  ) ? ownershipOrganizationTypes(organizationName) : null;
  if (organization) {
    if (organization.status !== "PUBLISHED") {
      throw new Error(`Approved ownership organization is not published: ${organization.name}`);
    }
    if (provisionedTypes && !provisionedTypes.every((type) => organization!.types.includes(type))) {
      throw new Error(`Approved ownership organization has an incompatible type: ${organization.name}`);
    }
  }
  if (organizationName && !organization) {
    if (owner.id !== null) {
      throw new Error(`Approved existing ownership organization does not exist: ${organizationName}`);
    }
    if (!provisionedTypes) {
      throw new Error(`Approved ownership organization does not exist: ${organizationName}`);
    }
    if (phase === "VALIDATE") {
      assertOwnershipManagerCompatible({
        approvedManagerName: owner.managerName,
        organizationName,
        fundManagerName: fund?.manager.name ?? null,
      });
      return { organizationId: null, fundId: fund?.id ?? null };
    }
    organization = await delegate(transaction, "organization").create({
      data: {
        name: organizationName,
        types: provisionedTypes,
        status: "PUBLISHED",
      },
      select: { id: true, name: true, types: true, status: true },
    }) as { id: string; name: string; types: string[]; status: string };
  }
  assertOwnershipManagerCompatible({
    approvedManagerName: owner.managerName,
    organizationName: organization?.name ?? null,
    fundManagerName: fund?.manager.name ?? null,
  });
  return { organizationId: organization?.id ?? null, fundId: fund?.id ?? null };
}

async function syncOwnerships(
  transaction: unknown,
  companyId: string,
  allowedCompanyIds: string[],
  image: CompanyImage,
  retractedOwnershipIds: string[],
): Promise<void> {
  if (retractedOwnershipIds.length > 0) {
    const approvedIds = new Set(existingIds(image.ownershipPeriods));
    if (new Set(retractedOwnershipIds).size !== retractedOwnershipIds.length) {
      throw new Error("Retracted ownership ids must be unique");
    }
    if (retractedOwnershipIds.some((id) => approvedIds.has(id))) {
      throw new Error("A retracted ownership period is still present in the approved after-image");
    }
    const deleted = await delegate(transaction, "ownershipPeriod").deleteMany({
      where: { id: { in: retractedOwnershipIds }, companyId },
    });
    if (deleted.count !== retractedOwnershipIds.length) {
      throw new Error("Retracted ownership period set changed inside the transaction");
    }
  }
  for (const owner of image.ownershipPeriods) {
    const links = await ownershipLinks(transaction, owner, "APPLY");
    const data = {
      companyId,
      ...links,
      vehicleName: owner.vehicleName,
      stake: owner.stake,
      investmentYear: owner.investmentYear,
      exitYear: owner.exitYear,
      isActive: owner.isActive,
      transactionState: owner.transactionState,
    };
    if (owner.id) await requiredUpdate(transaction, "ownershipPeriod", owner.id, allowedCompanyIds, data);
    else await delegate(transaction, "ownershipPeriod").create({ data });
  }
}

async function syncPendingTransactions(
  prismaTransaction: unknown,
  companyId: string,
  allowedCompanyIds: string[],
  image: CompanyImage,
): Promise<void> {
  const pending = delegate(prismaTransaction, "pendingOwnershipTransaction");
  const desiredIds = existingIds(image.pendingOwnershipTransactions);
  await pending.deleteMany({
    where: {
      companyId: { in: allowedCompanyIds },
      ...(desiredIds.length > 0 ? { id: { notIn: desiredIds } } : {}),
    },
  });
  for (const pendingImage of image.pendingOwnershipTransactions) {
    const counterparty = await delegate(prismaTransaction, "organization").findUnique({
      where: { name: pendingImage.counterpartyName },
      select: { id: true },
    }) as { id: string } | null;
    const data = {
      companyId,
      direction: pendingImage.direction,
      state: pendingImage.transactionState,
      counterpartyName: pendingImage.counterpartyName,
      counterpartyOrganizationId: counterparty?.id ?? null,
      transactionDescription: pendingImage.transactionDescription,
      announcedAt: date(pendingImage.announcedAt),
      expectedClosing: pendingImage.expectedClosing,
      relatedOwnershipPeriodIds: pendingImage.relatedOwnershipPeriodIds,
    };
    let id: string;
    if (pendingImage.id) {
      await requiredUpdate(
        prismaTransaction,
        "pendingOwnershipTransaction",
        pendingImage.id,
        allowedCompanyIds,
        data,
      );
      id = pendingImage.id;
    } else {
      const created = await pending.create({ data }) as { id: string };
      id = created.id;
    }
    const citationIds = await citationIdsForEvidence(
      prismaTransaction,
      companyId,
      pendingImage.evidenceUrls,
      { required: true },
    );
    await replaceEvidenceLinks({
      transaction: prismaTransaction,
      delegateName: "pendingOwnershipTransactionCitation",
      foreignKey: "pendingOwnershipTransactionId",
      relationId: id,
      citationIds,
    });
  }
}

async function syncMilestones(
  transaction: unknown,
  companyId: string,
  allowedCompanyIds: string[],
  image: CompanyImage,
): Promise<void> {
  for (const milestone of image.milestones) {
    const data = {
      companyId,
      date: milestone.date,
      event: milestone.event,
      category: rawEnum(milestone.category, milestoneCategories, "milestone category"),
      sortDate: timestamp(milestone.sortDate),
    };
    let id: string;
    if (milestone.id) {
      await requiredUpdate(transaction, "milestone", milestone.id, allowedCompanyIds, data);
      id = milestone.id;
    } else {
      const created = await delegate(transaction, "milestone").create({ data }) as { id: string };
      id = created.id;
    }
    await replaceEvidenceLinks({
      transaction,
      delegateName: "milestoneCitation",
      foreignKey: "milestoneId",
      relationId: id,
      citationIds: await citationIdsForEvidence(
        transaction,
        companyId,
        milestone.evidenceUrls,
        { required: false },
      ),
    });
  }
}

async function syncManagement(
  transaction: unknown,
  companyId: string,
  allowedCompanyIds: string[],
  image: CompanyImage,
): Promise<void> {
  const roles = delegate(transaction, "managementRole");
  const people = delegate(transaction, "person");
  for (const role of image.managementRoles) {
    let personId: string;
    if (role.id) {
      const current = await roles.findUnique({
        where: { id: role.id },
        include: { person: { select: { id: true, name: true } } },
      }) as { companyId: string; person: { id: string; name: string } } | null;
      if (!current || !allowedCompanyIds.includes(current.companyId)) {
        throw new Error(`ManagementRole ${role.id} changed ownership or disappeared`);
      }
      if (current.person.name !== role.personName) {
        throw new Error(`Existing Person name change requires separate person review: ${role.personName}`);
      }
      personId = current.person.id;
    } else {
      const person = await people.findFirst({
        where: { name: role.personName },
        select: { id: true },
      }) as { id: string } | null ?? await people.create({
        data: { name: role.personName },
      }) as { id: string };
      personId = person.id;
    }
    const data = {
      companyId,
      personId,
      title: role.title,
      isCurrent: role.isCurrent,
      startDate: date(role.startDate),
      endDate: date(role.endDate),
    };
    let id: string;
    if (role.id) {
      await requiredUpdate(transaction, "managementRole", role.id, allowedCompanyIds, data);
      id = role.id;
    } else {
      const created = await roles.create({ data }) as { id: string };
      id = created.id;
    }
    await replaceEvidenceLinks({
      transaction,
      delegateName: "managementRoleCitation",
      foreignKey: "managementRoleId",
      relationId: id,
      citationIds: await citationIdsForEvidence(
        transaction,
        companyId,
        role.evidenceUrls,
        { required: false },
      ),
    });
  }
}

export interface CompanyRevisionHistoryRow {
  id: string;
  companyId: string;
  proposalHash: string;
  beforeJson: unknown | null;
  afterJson: unknown;
  changedFields: string[];
  approver: string;
  appliedAt: string | Date;
  pipelineRunId: string | null;
}

function revisionTimestamp(value: string | Date): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error("CompanyRevision collision contains an invalid appliedAt timestamp");
  }
  return parsed.toISOString();
}

function mergeRevisionJson(
  canonicalValue: unknown,
  retiredValue: unknown,
  proposalHash: string,
  field: "beforeJson" | "afterJson",
): unknown {
  if (canonicalJson(canonicalValue) === canonicalJson(retiredValue)) return canonicalValue;
  if (!Array.isArray(canonicalValue) || !Array.isArray(retiredValue)) {
    throw new Error(
      `CompanyRevision collision ${proposalHash} has incompatible ${field} history`,
    );
  }
  const seen = new Set<string>();
  return [...canonicalValue, ...retiredValue].filter((value) => {
    const fingerprint = canonicalJson(value);
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}

export function mergeCompanyRevisionHistory(
  canonicalRevision: CompanyRevisionHistoryRow,
  retiredRevision: CompanyRevisionHistoryRow,
): CompanyRevisionHistoryRow {
  if (canonicalRevision.proposalHash !== retiredRevision.proposalHash) {
    throw new Error("CompanyRevision history merge requires the same proposal hash");
  }
  const proposalHash = canonicalRevision.proposalHash;
  if (
    canonicalRevision.approver !== retiredRevision.approver
    || canonicalRevision.pipelineRunId !== retiredRevision.pipelineRunId
    || revisionTimestamp(canonicalRevision.appliedAt) !== revisionTimestamp(retiredRevision.appliedAt)
  ) {
    throw new Error(`CompanyRevision collision ${proposalHash} has incompatible audit metadata`);
  }
  return {
    ...canonicalRevision,
    beforeJson: mergeRevisionJson(
      canonicalRevision.beforeJson,
      retiredRevision.beforeJson,
      proposalHash,
      "beforeJson",
    ),
    afterJson: mergeRevisionJson(
      canonicalRevision.afterJson,
      retiredRevision.afterJson,
      proposalHash,
      "afterJson",
    ),
    changedFields: [...new Set([
      ...canonicalRevision.changedFields,
      ...retiredRevision.changedFields,
    ])].sort(),
  };
}

async function rehomeCompanyRevisionHistory(
  transaction: unknown,
  canonicalId: string,
  retiredIds: string[],
): Promise<void> {
  if (retiredIds.length === 0) return;
  const revisions = delegate(transaction, "companyRevision");
  const rows = await revisions.findMany({
    where: { companyId: { in: [canonicalId, ...retiredIds] } },
    orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
  }) as CompanyRevisionHistoryRow[];
  const canonicalByProposalHash = new Map(
    rows
      .filter((row) => row.companyId === canonicalId)
      .map((row) => [row.proposalHash, row] as const),
  );
  for (const retired of rows.filter((row) => retiredIds.includes(row.companyId))) {
    const canonical = canonicalByProposalHash.get(retired.proposalHash);
    if (!canonical) {
      const moved = await revisions.updateMany({
        where: { id: retired.id, companyId: retired.companyId },
        data: { companyId: canonicalId },
      });
      if (moved.count !== 1) {
        throw new Error(`CompanyRevision ${retired.id} changed ownership or disappeared inside the transaction`);
      }
      canonicalByProposalHash.set(retired.proposalHash, {
        ...retired,
        companyId: canonicalId,
      });
      continue;
    }
    const merged = mergeCompanyRevisionHistory(canonical, retired);
    await revisions.update({
      where: { id: canonical.id },
      data: {
        beforeJson: merged.beforeJson,
        afterJson: merged.afterJson,
        changedFields: merged.changedFields,
      },
    });
    await revisions.delete({ where: { id: retired.id } });
    canonicalByProposalHash.set(retired.proposalHash, merged);
  }
}

async function mergeUnmodeledHistory(
  transaction: unknown,
  canonicalId: string,
  retiredIds: string[],
): Promise<void> {
  const news = delegate(transaction, "newsMention");
  const retiredNews = await news.findMany({ where: { companyId: { in: retiredIds } } }) as Array<{
    id: string;
    companyId: string;
    newsItemId: string;
    mentionType: string;
    label: string;
    confidence: string;
    reason: string | null;
    fundId: string | null;
    organizationId: string | null;
    dealId: string | null;
  }>;
  for (const item of retiredNews) {
    const duplicate = await news.findFirst({
      where: {
        companyId: canonicalId,
        newsItemId: item.newsItemId,
        mentionType: item.mentionType,
        label: item.label,
      },
    }) as typeof item | null;
    if (duplicate) {
      const material = (row: typeof item) => JSON.stringify([
        row.confidence,
        row.reason,
        row.fundId,
        row.organizationId,
        row.dealId,
      ]);
      if (material(duplicate) !== material(item)) {
        throw new Error(`NewsMention collision ${item.id} is materially different`);
      }
      await news.delete({ where: { id: item.id } });
    } else {
      await news.update({ where: { id: item.id }, data: { companyId: canonicalId } });
    }
  }
  await rehomeCompanyRevisionHistory(transaction, canonicalId, retiredIds);
  for (const retiredId of retiredIds) {
    await rehomeCompanyRedirects(transaction as never, retiredId, canonicalId);
  }
}

export function createPrismaApprovedApplyStore(options: {
  databaseTargetFingerprint: string;
}): ApprovedApplyStore<unknown> {
  return {
    async loadFreshState(
      transaction: unknown,
      proposal: ReconciliationProposal,
      _approvedSnapshot: ProductionSnapshot,
    ): Promise<FreshApplyState> {
      const load = async (id: string): Promise<FreshCompanyState> => {
        const row = await loadPrismaCompanyImageRow(transaction, id);
        if (!row) throw new Error(`Company ${id} no longer exists`);
        return {
          image: prismaCompanyRowToImage(row),
          snapshot: prismaCompanyRowToSnapshot(row),
        };
      };
      const target = proposal.beforeImage?.id ? await load(proposal.beforeImage.id) : null;
      const retiredCompanies = await Promise.all(proposal.retiredCompanyIds.map(load));
      await assertLockedExecutionDependenciesFresh(transaction, proposal);
      const createMatches = proposal.actions.includes("CREATE_COMPANY") && proposal.afterImage
        ? await findPrismaCompanyImageRows(
            transaction,
            proposal.afterImage.name,
            proposal.afterImage.country,
          )
        : [];
      if (proposal.afterImage) {
        await assertCitationSourcesCompatible(transaction, proposal.afterImage);
        for (const owner of proposal.afterImage.ownershipPeriods) {
          await ownershipLinks(transaction, owner, "VALIDATE");
        }
      }
      return {
        databaseTargetFingerprint: options.databaseTargetFingerprint,
        target,
        retiredCompanies,
        createNameCountryMatches: createMatches.map((row) => ({
          image: prismaCompanyRowToImage(row),
          snapshot: prismaCompanyRowToSnapshot(row),
        })),
      };
    },

    async applyMutationPlan(transaction: unknown, plan: ApprovedApplyPlan): Promise<{ companyId: string }> {
      const image = plan.afterImage;
      const companies = delegate(transaction, "company");
      let companyId: string;
      if (plan.canonicalCompanyId === null) {
        const created = await companies.create({ data: scalarData(image) }) as { id: string };
        companyId = created.id;
      } else {
        companyId = plan.canonicalCompanyId;
      }
      const allowedCompanyIds = [companyId, ...plan.retiredCompanyIds];
      for (const [model, rows] of [
        ["ownershipPeriod", image.ownershipPeriods],
        ["pendingOwnershipTransaction", image.pendingOwnershipTransactions],
        ["milestone", image.milestones],
        ["managementRole", image.managementRoles],
        ["citation", image.citations],
      ] as const) {
        await deleteRetiredRowsNotApproved({
          transaction,
          model,
          retiredCompanyIds: plan.retiredCompanyIds,
          approvedIds: existingIds(rows as ReadonlyArray<{ id: string | null }>),
        });
      }

      await syncCitations(transaction, companyId, allowedCompanyIds, image);
      await syncOwnerships(
        transaction,
        companyId,
        allowedCompanyIds,
        image,
        plan.mutations
          .filter((mutation) => mutation.kind === "RETRACT_ERRONEOUS_OWNERSHIP")
          .flatMap((mutation) => mutation.relationIds),
      );
      await syncPendingTransactions(transaction, companyId, allowedCompanyIds, image);
      await syncMilestones(transaction, companyId, allowedCompanyIds, image);
      await syncManagement(transaction, companyId, allowedCompanyIds, image);

      if (plan.retiredCompanyIds.length > 0) {
        await mergeUnmodeledHistory(transaction, companyId, plan.retiredCompanyIds);
        const deleted = await companies.deleteMany({ where: { id: { in: plan.retiredCompanyIds } } });
        if (deleted.count !== plan.retiredCompanyIds.length) {
          throw new Error("Reviewed retired-company set changed inside the transaction");
        }
      }
      await companies.update({ where: { id: companyId }, data: scalarData(image) });
      return { companyId };
    },

    async loadAppliedCompanyImage(transaction: unknown, companyId: string): Promise<CompanyImage> {
      const image = await loadPrismaCompanyImage(transaction, companyId);
      if (!image) throw new Error("Applied company disappeared inside the transaction");
      return image;
    },

    async createCompanyRevision(transaction: unknown, revision: CompanyRevisionWrite): Promise<{ id: string }> {
      return await delegate(transaction, "companyRevision").create({ data: revision }) as { id: string };
    },

    async createAuditEvent(transaction: unknown, audit: AuditEventWrite): Promise<{ id: string }> {
      return await delegate(transaction, "auditEvent").create({
        data: { actorId: null, ...audit },
      }) as { id: string };
    },
  };
}
