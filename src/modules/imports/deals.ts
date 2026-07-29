import type {
  DealCategory,
  DealRegion,
  DealSector,
  DealStatusEnum,
  Prisma,
} from "@/generated/prisma/client";
import { parseDateInput } from "@/lib/format";
import { dealSchema } from "@/modules/admin/schemas";
import {
  DEAL_CATEGORY_MAP,
  DEAL_REGION_MAP,
  DEAL_SECTOR_MAP,
  DEAL_STATUS_MAP,
} from "@/modules/shared/enum-maps";
import {
  cleanString,
  hashImportValue,
  httpUrlOrEmpty,
  partyArray,
  sameDateValue,
  sameOrderedValues,
  sameUnorderedStrings,
  stringArray,
  summarizeImportReport,
  type ImportClassification,
  type ImportReportRow,
} from "./domain";

const DEAL_IMPORT_SELECT = {
  id: true,
  legacyId: true,
  status: true,
  title: true,
  target: true,
  sector: true,
  subsector: true,
  region: true,
  categories: true,
  date: true,
  description: true,
  targetDescription: true,
  country: true,
  enterpriseValue: true,
  equityValue: true,
  stake: true,
  dealStatus: true,
  closingDate: true,
  assetScale: true,
  valuationMultiple: true,
  fundVehicle: true,
  keyHighlights: true,
  updatedAt: true,
  participants: {
    select: {
      role: true,
      displayName: true,
      organization: { select: { name: true } },
    },
  },
  citations: {
    select: {
      sourceId: true,
      source: { select: { url: true, label: true } },
    },
  },
} as const;

type ExistingDeal = Prisma.DealGetPayload<{
  select: typeof DEAL_IMPORT_SELECT;
}>;

type DealClient = Pick<
  Prisma.TransactionClient,
  "deal" | "organization" | "dealParticipant" | "source" | "citation"
>;

export interface PreparedDealImport {
  row: number;
  legacyId: string;
  title: string;
  target: string;
  sector: DealSector;
  subsector: string;
  region: DealRegion;
  categories: DealCategory[];
  date: string;
  description: string;
  targetDescription: string;
  country: string;
  enterpriseValue: string | null;
  equityValue: string | null;
  stake: string | null;
  dealStatus: DealStatusEnum;
  closingDate: string | null;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[];
  buyers: string[];
  sellers: string[];
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface PreparedRows<T> {
  prepared: T[];
  errors: ImportReportRow[];
  total: number;
}

function rowNumber(row: Record<string, unknown>, index: number): number {
  return typeof row.__row === "number" && Number.isInteger(row.__row)
    ? row.__row
    : index + 1;
}

export function prepareDealRows(
  rows: Record<string, unknown>[],
): PreparedRows<PreparedDealImport> {
  const candidates: Array<
    | { prepared: PreparedDealImport; identity: string }
    | { error: ImportReportRow }
  > = [];
  const identityCounts = new Map<string, number>();

  rows.forEach((raw, index) => {
    const row = rowNumber(raw, index);
    const legacyId = cleanString(raw.id || raw.legacyId);
    const buyers = partyArray(raw.buyers ?? raw.buyer);
    const sellers = partyArray(raw.sellers ?? raw.seller);
    const sourceUrl = cleanString(raw.sourceUrl);
    const sourceName = cleanString(raw.sourceName);

    if (!legacyId) {
      candidates.push({
        error: {
          row,
          identifier: "",
          disposition: "error",
          code: "MISSING_IDENTITY",
          message: "Missing id or legacyId",
        },
      });
      return;
    }

    const parsed = dealSchema.safeParse({
      title: cleanString(raw.title),
      target: cleanString(raw.target),
      buyer: buyers.join(" / ") || cleanString(raw.buyer),
      seller: sellers.join(" / ") || cleanString(raw.seller),
      sector: cleanString(raw.sector),
      subsector: cleanString(raw.subsector),
      region: cleanString(raw.region),
      category: stringArray(raw.category),
      date: cleanString(raw.date),
      description: cleanString(raw.description),
      targetDescription: cleanString(raw.targetDescription),
      country: cleanString(raw.country),
      status: cleanString(raw.status),
      enterpriseValue: cleanString(raw.enterpriseValue) || undefined,
      equityValue: cleanString(raw.equityValue) || undefined,
      stake: cleanString(raw.stake) || undefined,
      closingDate: cleanString(raw.closingDate) || undefined,
      assetScale: cleanString(raw.assetScale) || undefined,
      valuationMultiple: cleanString(raw.valuationMultiple) || undefined,
      fundVehicle: cleanString(raw.fundVehicle) || undefined,
      keyHighlights: stringArray(raw.keyHighlights),
      sourceName: sourceName || undefined,
      sourceUrl: sourceUrl || undefined,
    });
    if (!parsed.success || !httpUrlOrEmpty(sourceUrl)) {
      const messages = parsed.success
        ? ["Source URL must use http or https"]
        : parsed.error.issues.map((issue) => issue.message);
      candidates.push({
        error: {
          row,
          identifier: legacyId,
          disposition: "error",
          code: "VALIDATION_ERROR",
          message: messages.join(", "),
        },
      });
      return;
    }

    const date = parseDateInput(parsed.data.date);
    const closingDate = parseDateInput(parsed.data.closingDate);
    const sector = DEAL_SECTOR_MAP[parsed.data.sector] as DealSector | undefined;
    const region = DEAL_REGION_MAP[parsed.data.region] as DealRegion | undefined;
    const dealStatus = DEAL_STATUS_MAP[parsed.data.status] as
      | DealStatusEnum
      | undefined;
    const categories = parsed.data.category
      .map((category) => DEAL_CATEGORY_MAP[category])
      .filter(Boolean) as DealCategory[];

    if (!date || !sector || !region || !dealStatus || categories.length === 0) {
      candidates.push({
        error: {
          row,
          identifier: legacyId,
          disposition: "error",
          code: "NORMALIZATION_ERROR",
          message: "Invalid date, sector, region, category, or status",
        },
      });
      return;
    }

    identityCounts.set(legacyId, (identityCounts.get(legacyId) ?? 0) + 1);
    candidates.push({
      identity: legacyId,
      prepared: {
        row,
        legacyId,
        title: parsed.data.title.trim(),
        target: parsed.data.target.trim(),
        sector,
        subsector: parsed.data.subsector.trim(),
        region,
        categories,
        date: date.toISOString(),
        description: parsed.data.description.trim(),
        targetDescription: parsed.data.targetDescription.trim(),
        country: parsed.data.country.trim(),
        enterpriseValue: parsed.data.enterpriseValue?.trim() || null,
        equityValue: parsed.data.equityValue?.trim() || null,
        stake: parsed.data.stake?.trim() || null,
        dealStatus,
        closingDate: closingDate?.toISOString() ?? null,
        assetScale: parsed.data.assetScale?.trim() || null,
        valuationMultiple: parsed.data.valuationMultiple?.trim() || null,
        fundVehicle: parsed.data.fundVehicle?.trim() || null,
        keyHighlights: parsed.data.keyHighlights ?? [],
        buyers,
        sellers,
        sourceName: sourceName || null,
        sourceUrl: sourceUrl || null,
      },
    });
  });

  const prepared: PreparedDealImport[] = [];
  const errors: ImportReportRow[] = [];
  for (const candidate of candidates) {
    if ("error" in candidate) {
      errors.push(candidate.error);
    } else if ((identityCounts.get(candidate.identity) ?? 0) > 1) {
      errors.push({
        row: candidate.prepared.row,
        identifier: candidate.identity,
        disposition: "error",
        code: "DUPLICATE_IDENTITY",
        message: "Duplicate deal identity in this import",
      });
    } else {
      prepared.push(candidate.prepared);
    }
  }
  return { prepared, errors, total: rows.length };
}

function desiredDealData(row: PreparedDealImport) {
  return {
    title: row.title,
    target: row.target,
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    categories: row.categories,
    date: new Date(row.date),
    description: row.description,
    targetDescription: row.targetDescription,
    country: row.country,
    enterpriseValue: row.enterpriseValue,
    equityValue: row.equityValue,
    stake: row.stake,
    dealStatus: row.dealStatus,
    closingDate: row.closingDate ? new Date(row.closingDate) : null,
    assetScale: row.assetScale,
    valuationMultiple: row.valuationMultiple,
    fundVehicle: row.fundVehicle,
    keyHighlights: row.keyHighlights,
  };
}

function partyNames(existing: ExistingDeal, role: "BUYER" | "SELLER"): string[] {
  return existing.participants
    .filter((participant) => participant.role === role)
    .map(
      (participant) =>
        participant.displayName || participant.organization.name,
    );
}

function sameDeal(row: PreparedDealImport, existing: ExistingDeal): boolean {
  const sourceAlreadyLinked = !row.sourceUrl
    || existing.citations.some(
      (citation) => citation.source.url === row.sourceUrl,
    );
  return (
    existing.title === row.title
    && existing.target === row.target
    && existing.sector === row.sector
    && existing.subsector === row.subsector
    && existing.region === row.region
    && sameOrderedValues(existing.categories, row.categories)
    && sameDateValue(existing.date, row.date)
    && existing.description === row.description
    && existing.targetDescription === row.targetDescription
    && existing.country === row.country
    && existing.enterpriseValue === row.enterpriseValue
    && existing.equityValue === row.equityValue
    && existing.stake === row.stake
    && existing.dealStatus === row.dealStatus
    && sameDateValue(existing.closingDate, row.closingDate)
    && existing.assetScale === row.assetScale
    && existing.valuationMultiple === row.valuationMultiple
    && existing.fundVehicle === row.fundVehicle
    && sameOrderedValues(existing.keyHighlights, row.keyHighlights)
    && sameUnorderedStrings(partyNames(existing, "BUYER"), row.buyers)
    && sameUnorderedStrings(partyNames(existing, "SELLER"), row.sellers)
    && sourceAlreadyLinked
  );
}

function snapshotDeals(existing: ExistingDeal[]) {
  return [...existing]
    .sort((left, right) => left.legacyId.localeCompare(right.legacyId))
    .map((deal) => ({
      ...deal,
      date: deal.date.toISOString(),
      closingDate: deal.closingDate?.toISOString() ?? null,
      updatedAt: deal.updatedAt.toISOString(),
      participants: [...deal.participants]
        .map((participant) => ({
          role: participant.role,
          displayName: participant.displayName,
          organizationName: participant.organization.name,
        }))
        .sort((left, right) =>
          `${left.role}:${left.displayName}:${left.organizationName}`.localeCompare(
            `${right.role}:${right.displayName}:${right.organizationName}`,
          )),
      citations: [...deal.citations]
        .map((citation) => ({
          sourceId: citation.sourceId,
          url: citation.source.url,
          label: citation.source.label,
        }))
        .sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
    }));
}

export async function classifyDealImport(
  client: DealClient,
  rows: PreparedRows<PreparedDealImport>,
): Promise<ImportClassification<PreparedDealImport>> {
  const existing = rows.prepared.length
    ? await client.deal.findMany({
        where: { legacyId: { in: rows.prepared.map((row) => row.legacyId) } },
        select: DEAL_IMPORT_SELECT,
      })
    : [];
  const existingById = new Map(existing.map((deal) => [deal.legacyId, deal]));
  const report = [...rows.errors];
  const actions = new Map<
    string,
    "create" | "update" | "unchanged" | "quarantined"
  >();

  for (const row of rows.prepared) {
    const current = existingById.get(row.legacyId);
    let action: "create" | "update" | "unchanged" | "quarantined";
    if (!current) action = "create";
    else if (sameDeal(row, current)) action = "unchanged";
    else if (current.status !== "DRAFT") action = "quarantined";
    else action = "update";
    actions.set(row.legacyId, action);
    report.push({
      row: row.row,
      identifier: row.legacyId,
      disposition: action,
      ...(action === "quarantined"
        ? {
            code: "NON_DRAFT_UPDATE_BLOCKED",
            message: `Existing ${current?.status} deal is protected from bulk import`,
          }
        : {}),
    });
  }

  const summary = summarizeImportReport(
    rows.total,
    rows.prepared.length,
    report,
  );
  const stateHash = hashImportValue({
    existing: snapshotDeals(existing),
    actions: [...actions.entries()].sort(([left], [right]) =>
      left.localeCompare(right)),
  });
  return {
    prepared: rows.prepared,
    report: report.sort((left, right) => left.row - right.row),
    summary,
    stateHash,
    actions,
  };
}

async function syncParties(
  client: DealClient,
  dealId: string,
  role: "BUYER" | "SELLER",
  desired: string[],
  existing: ExistingDeal | undefined,
) {
  const current = existing ? partyNames(existing, role) : [];
  if (sameUnorderedStrings(current, desired)) return;
  await client.dealParticipant.deleteMany({ where: { dealId, role } });
  for (const name of desired) {
    const organization = await client.organization.upsert({
      where: { name },
      update: {},
      create: { name, types: ["OTHER"], status: "DRAFT" },
      select: { id: true },
    });
    await client.dealParticipant.create({
      data: {
        dealId,
        organizationId: organization.id,
        role,
        displayName: name,
      },
    });
  }
}

export interface ImportMutationResult {
  imported: number;
  created: number;
  updated: number;
  unchanged: number;
  quarantined: number;
  changedFields: string[];
}

export async function commitDealImport(
  client: DealClient,
  classification: ImportClassification<PreparedDealImport>,
): Promise<ImportMutationResult> {
  const existing = classification.prepared.length
    ? await client.deal.findMany({
        where: {
          legacyId: {
            in: classification.prepared.map((row) => row.legacyId),
          },
        },
        select: DEAL_IMPORT_SELECT,
      })
    : [];
  const existingById = new Map(existing.map((deal) => [deal.legacyId, deal]));
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of classification.prepared) {
    const action = classification.actions.get(row.legacyId);
    if (action !== "create" && action !== "update") continue;
    const current = existingById.get(row.legacyId);
    let dealId: string;
    if (action === "create") {
      const created = await client.deal.create({
        data: {
          legacyId: row.legacyId,
          ...desiredDealData(row),
          status: "DRAFT",
        },
        select: { id: true },
      });
      dealId = created.id;
      createdCount += 1;
    } else {
      if (!current) throw new Error("Import state changed during commit");
      const updated = await client.deal.updateMany({
        where: {
          id: current.id,
          status: "DRAFT",
          updatedAt: current.updatedAt,
        },
        data: desiredDealData(row),
      });
      if (updated.count !== 1) {
        throw new Error("Import state changed during commit");
      }
      dealId = current.id;
      updatedCount += 1;
    }

    await syncParties(client, dealId, "BUYER", row.buyers, current);
    await syncParties(client, dealId, "SELLER", row.sellers, current);

    if (
      row.sourceUrl
      && !current?.citations.some(
        (citation) => citation.source.url === row.sourceUrl,
      )
    ) {
      const source = await client.source.upsert({
        where: { url: row.sourceUrl },
        update: {},
        create: {
          url: row.sourceUrl,
          label: row.sourceName || row.sourceUrl,
          type: "ARTICLE",
        },
        select: { id: true },
      });
      const linked = await client.citation.findFirst({
        where: { dealId, sourceId: source.id },
        select: { id: true },
      });
      if (!linked) {
        await client.citation.create({
          data: { dealId, sourceId: source.id },
        });
      }
    }
  }

  return {
    imported: createdCount + updatedCount,
    created: createdCount,
    updated: updatedCount,
    unchanged: classification.summary.unchanged,
    quarantined: classification.summary.quarantined,
    changedFields: [
      "deal",
      "buyers",
      "sellers",
      "citations",
    ],
  };
}
