import type {
  FundRegionEnum,
  FundSectorEnum,
  FundStatusEnum,
  FundStrategy,
  FundStructure,
  Prisma,
} from "@/generated/prisma/client";
import { fundSchema } from "@/modules/admin/schemas";
import {
  FUND_REGION_MAP,
  FUND_SECTOR_MAP,
  FUND_STATUS_MAP,
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
} from "@/modules/shared/enum-maps";
import {
  cleanString,
  hashImportValue,
  httpUrlOrEmpty,
  mergeUniqueStrings,
  optionalNumber,
  sameOrderedValues,
  stringArray,
  summarizeImportReport,
  type ImportClassification,
  type ImportReportRow,
} from "./domain";
import type { ImportMutationResult, PreparedRows } from "./deals";

const FUND_IMPORT_SELECT = {
  id: true,
  legacyId: true,
  status: true,
  updatedAt: true,
  managerId: true,
  manager: { select: { name: true } },
  fundName: true,
  ticker: true,
  investmentStrategy: true,
  size: true,
  sizeUsdMm: true,
  vintage: true,
  strategies: true,
  structure: true,
  fundStatus: true,
  sectors: true,
  regions: true,
  sourceUrls: true,
  strategyUrl: true,
} as const;

type ExistingFund = Prisma.FundGetPayload<{
  select: typeof FUND_IMPORT_SELECT;
}>;

type FundClient = Pick<
  Prisma.TransactionClient,
  "fund" | "organization"
>;

export interface PreparedFundImport {
  row: number;
  legacyId: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  investmentStrategy: string;
  size: string;
  sizeUsdMm: number | null;
  vintage: string;
  strategies: FundStrategy[];
  structure: FundStructure;
  fundStatus: FundStatusEnum;
  sectors: FundSectorEnum[];
  regions: FundRegionEnum[];
  sourceUrls: string[];
  strategyUrl: string | null;
}
function rowNumber(row: Record<string, unknown>, index: number): number {
  return typeof row.__row === "number" && Number.isInteger(row.__row)
    ? row.__row
    : index + 1;
}

export function prepareFundRows(
  rows: Record<string, unknown>[],
): PreparedRows<PreparedFundImport> {
  const candidates: Array<
    | { prepared: PreparedFundImport; identity: string }
    | { error: ImportReportRow }
  > = [];
  const identityCounts = new Map<string, number>();

  rows.forEach((raw, index) => {
    const row = rowNumber(raw, index);
    const legacyId = cleanString(raw.id || raw.legacyId);
    const fundName = cleanString(raw.fundName);
    if (!legacyId) {
      candidates.push({
        error: {
          row,
          identifier: fundName,
          disposition: "error",
          code: "MISSING_IDENTITY",
          message: "Missing id or legacyId",
        },
      });
      return;
    }

    const sourceUrls = stringArray(raw.sourceUrls);
    const strategyUrl = cleanString(raw.strategyUrl);
    const sizeUsdMm = optionalNumber(raw.sizeUsdMm);
    const parsed = fundSchema.safeParse({
      managerName: cleanString(raw.managerName),
      fundName,
      investmentStrategy: cleanString(raw.investmentStrategy) || undefined,
      size: cleanString(raw.size),
      sizeUsdMm,
      vintage: cleanString(raw.vintage),
      strategies: stringArray(raw.strategies),
      structure: cleanString(raw.structure),
      status: cleanString(raw.status),
      sectors: stringArray(raw.sectors),
      regions: stringArray(raw.regions),
      sourceUrls,
      ticker: cleanString(raw.ticker) || undefined,
      strategyUrl: strategyUrl || undefined,
    });
    const invalidUrl = [...sourceUrls, strategyUrl]
      .filter(Boolean)
      .some((url) => !httpUrlOrEmpty(url));
    if (!parsed.success || invalidUrl) {
      const messages = parsed.success
        ? ["Source URLs must use http or https"]
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

    const structure = FUND_STRUCTURE_MAP[parsed.data.structure] as
      | FundStructure
      | undefined;
    const fundStatus = FUND_STATUS_MAP[parsed.data.status] as
      | FundStatusEnum
      | undefined;
    const strategies = parsed.data.strategies
      .map((value) => FUND_STRATEGY_MAP[value])
      .filter(Boolean) as FundStrategy[];
    const sectors = parsed.data.sectors
      .map((value) => FUND_SECTOR_MAP[value])
      .filter(Boolean) as FundSectorEnum[];
    const regions = parsed.data.regions
      .map((value) => FUND_REGION_MAP[value])
      .filter(Boolean) as FundRegionEnum[];
    if (!structure || !fundStatus || strategies.length === 0) {
      candidates.push({
        error: {
          row,
          identifier: legacyId,
          disposition: "error",
          code: "NORMALIZATION_ERROR",
          message: "Invalid structure, status, or strategy",
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
        managerName: parsed.data.managerName.trim(),
        fundName: parsed.data.fundName.trim(),
        ticker: parsed.data.ticker?.trim() || null,
        investmentStrategy: parsed.data.investmentStrategy?.trim() || "",
        size: parsed.data.size.trim(),
        sizeUsdMm: parsed.data.sizeUsdMm ?? null,
        vintage: parsed.data.vintage.trim(),
        strategies,
        structure,
        fundStatus,
        sectors,
        regions,
        sourceUrls,
        strategyUrl: strategyUrl || null,
      },
    });
  });

  const prepared: PreparedFundImport[] = [];
  const errors: ImportReportRow[] = [];
  for (const candidate of candidates) {
    if ("error" in candidate) errors.push(candidate.error);
    else if ((identityCounts.get(candidate.identity) ?? 0) > 1) {
      errors.push({
        row: candidate.prepared.row,
        identifier: candidate.identity,
        disposition: "error",
        code: "DUPLICATE_IDENTITY",
        message: "Duplicate fund identity in this import",
      });
    } else prepared.push(candidate.prepared);
  }
  return { prepared, errors, total: rows.length };
}

function desiredFundData(
  row: PreparedFundImport,
  existing?: ExistingFund,
) {
  return {
    fundName: row.fundName,
    ticker: row.ticker,
    investmentStrategy: row.investmentStrategy,
    size: row.size,
    sizeUsdMm: row.sizeUsdMm,
    vintage: row.vintage,
    strategies: row.strategies,
    structure: row.structure,
    fundStatus: row.fundStatus,
    sectors: row.sectors,
    regions: row.regions,
    sourceUrls: existing
      ? mergeUniqueStrings(existing.sourceUrls, row.sourceUrls)
      : row.sourceUrls,
    strategyUrl: row.strategyUrl || existing?.strategyUrl || "",
  };
}

function sameFund(row: PreparedFundImport, existing: ExistingFund): boolean {
  const desired = desiredFundData(row, existing);
  return (
    existing.manager.name === row.managerName
    && existing.fundName === desired.fundName
    && existing.ticker === desired.ticker
    && existing.investmentStrategy === desired.investmentStrategy
    && existing.size === desired.size
    && existing.sizeUsdMm === desired.sizeUsdMm
    && existing.vintage === desired.vintage
    && sameOrderedValues(existing.strategies, desired.strategies)
    && existing.structure === desired.structure
    && existing.fundStatus === desired.fundStatus
    && sameOrderedValues(existing.sectors, desired.sectors)
    && sameOrderedValues(existing.regions, desired.regions)
    && sameOrderedValues(existing.sourceUrls, desired.sourceUrls)
    && existing.strategyUrl === desired.strategyUrl
  );
}

function snapshotFunds(existing: ExistingFund[]) {
  return [...existing]
    .sort((left, right) => left.legacyId.localeCompare(right.legacyId))
    .map((fund) => ({
      ...fund,
      updatedAt: fund.updatedAt.toISOString(),
    }));
}

export async function classifyFundImport(
  client: FundClient,
  rows: PreparedRows<PreparedFundImport>,
): Promise<ImportClassification<PreparedFundImport>> {
  const existing = rows.prepared.length
    ? await client.fund.findMany({
        where: {
          OR: [
            {
              legacyId: {
                in: rows.prepared.map((row) => row.legacyId),
              },
            },
            {
              fundName: {
                in: rows.prepared.map((row) => row.fundName),
              },
            },
          ],
        },
        select: FUND_IMPORT_SELECT,
      })
    : [];
  const byId = new Map(existing.map((fund) => [fund.legacyId, fund]));
  const byName = new Map(existing.map((fund) => [fund.fundName, fund]));
  const report = [...rows.errors];
  const actions = new Map<
    string,
    "create" | "update" | "unchanged" | "quarantined"
  >();

  for (const row of rows.prepared) {
    const current = byId.get(row.legacyId);
    const nameOwner = byName.get(row.fundName);
    let action: "create" | "update" | "unchanged" | "quarantined";
    let code: string | undefined;
    let message: string | undefined;
    if (nameOwner && nameOwner.legacyId !== row.legacyId) {
      action = "quarantined";
      code = "FUND_IDENTITY_CONFLICT";
      message = "Fund name belongs to a different canonical fund record";
    } else if (!current) action = "create";
    else if (sameFund(row, current)) action = "unchanged";
    else if (current.status !== "DRAFT") {
      action = "quarantined";
      code = "NON_DRAFT_UPDATE_BLOCKED";
      message = `Existing ${current.status} fund is protected from bulk import`;
    } else action = "update";
    actions.set(row.legacyId, action);
    report.push({
      row: row.row,
      identifier: row.legacyId,
      disposition: action,
      ...(code ? { code, message } : {}),
    });
  }

  const summary = summarizeImportReport(
    rows.total,
    rows.prepared.length,
    report,
  );
  const stateHash = hashImportValue({
    existing: snapshotFunds(existing),
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

export async function commitFundImport(
  client: FundClient,
  classification: ImportClassification<PreparedFundImport>,
): Promise<ImportMutationResult> {
  const existing = classification.prepared.length
    ? await client.fund.findMany({
        where: {
          legacyId: {
            in: classification.prepared.map((row) => row.legacyId),
          },
        },
        select: FUND_IMPORT_SELECT,
      })
    : [];
  const byId = new Map(existing.map((fund) => [fund.legacyId, fund]));
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of classification.prepared) {
    const action = classification.actions.get(row.legacyId);
    if (action !== "create" && action !== "update") continue;
    const current = byId.get(row.legacyId);
    const manager = await client.organization.upsert({
      where: { name: row.managerName },
      update: {},
      create: {
        name: row.managerName,
        types: ["FUND_MANAGER"],
        status: "DRAFT",
      },
      select: { id: true },
    });
    if (action === "create") {
      await client.fund.create({
        data: {
          legacyId: row.legacyId,
          managerId: manager.id,
          ...desiredFundData(row),
          status: "DRAFT",
        },
      });
      createdCount += 1;
    } else {
      if (!current) throw new Error("Import state changed during commit");
      const updated = await client.fund.updateMany({
        where: {
          id: current.id,
          status: "DRAFT",
          updatedAt: current.updatedAt,
        },
        data: {
          managerId: manager.id,
          ...desiredFundData(row, current),
        },
      });
      if (updated.count !== 1) {
        throw new Error("Import state changed during commit");
      }
      updatedCount += 1;
    }
  }

  return {
    imported: createdCount + updatedCount,
    created: createdCount,
    updated: updatedCount,
    unchanged: classification.summary.unchanged,
    quarantined: classification.summary.quarantined,
    changedFields: ["fund", "manager", "sourceUrls"],
  };
}
