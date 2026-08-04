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
  ProductionSnapshot,
  ReconciliationProposal,
} from "./schema";

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

async function ownershipLinks(
  transaction: unknown,
  owner: CompanyImage["ownershipPeriods"][number],
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
  const organization = organizationName
    ? await delegate(transaction, "organization").findUnique({
        where: { name: organizationName },
        select: { id: true, name: true },
      }) as { id: string; name: string } | null
    : null;
  if (organizationName && !organization) {
    throw new Error(`Approved ownership organization does not exist: ${organizationName}`);
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
): Promise<void> {
  for (const owner of image.ownershipPeriods) {
    const links = await ownershipLinks(transaction, owner);
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
  await delegate(transaction, "companyRevision").updateMany({
    where: { companyId: { in: retiredIds } },
    data: { companyId: canonicalId },
  });
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
          await ownershipLinks(transaction, owner);
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
      await syncOwnerships(transaction, companyId, allowedCompanyIds, image);
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
