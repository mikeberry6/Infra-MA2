import { NextRequest, NextResponse } from "next/server";
import type { CompanyRegion, CompanySector, CompanyStatus, Prisma } from "@/generated/prisma/client";
import { companyDedupKeys } from "@/lib/company-key";
import { parseCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { revalidateAppData } from "@/lib/revalidation";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import {
  AuthorizationError,
  getSessionIdentity,
  isAuthorizationError,
  requireAdmin,
} from "@/modules/auth/guards";
import {
  companyIdentityConflictMessage,
  findCompanyIdentityConflicts,
} from "@/modules/companies/canonical-identity";
import { MUTABLE_COMPANY_WHERE } from "@/modules/companies/retirement";
import { commitImport } from "@/modules/imports/commit";
import {
  assertImportStateHash,
  hashImportValue,
  ImportPreviewTokenError,
  issueImportPreviewToken,
  MAX_IMPORT_ROWS,
  sameImportValue,
  StaleImportPreviewError,
  summarizeImportClassifications,
  verifyImportPreviewToken,
  type ImportIssue,
  type ImportRowClassification,
} from "@/modules/imports/preview";
import {
  COMPANY_REGION_MAP,
  COMPANY_SECTOR_MAP,
  COMPANY_STATUS_MAP,
} from "@/modules/shared/enum-maps";

type CompanyImportRow = CompanyInput & { row: number };
type NormalizedCompanyRow = Record<string, unknown> & { name: string; country: string };

interface CompanyValidation {
  normalizedRows: NormalizedCompanyRow[];
  validByIndex: Map<number, CompanyImportRow>;
  errorsByIndex: Map<number, ImportIssue>;
}

interface OwnershipChange {
  row: number;
  name: string;
  country: string;
  action: "create" | "replace" | "retire";
  from: string[];
  to?: string;
  code: "OWNERSHIP_CREATE" | "OWNERSHIP_REPLACE" | "OWNERSHIP_RETIRE";
  message: string;
}

interface CompanyPlanItem {
  row: number;
  normalized: NormalizedCompanyRow;
  classification: ImportRowClassification;
  valid?: CompanyImportRow;
  existingId?: string;
  existingStatus?: string;
  matchedFundId?: string;
  scalarChanged?: boolean;
  ownershipChanged?: boolean;
  citationChanged?: boolean;
  ownershipChange?: OwnershipChange;
  issue?: ImportIssue;
}

interface CompanyPlan {
  state: Awaited<ReturnType<typeof loadPortfolioState>>;
  items: CompanyPlanItem[];
}

const COMPANY_STATE_SELECT = {
  id: true,
  name: true,
  country: true,
  status: true,
  updatedAt: true,
  sector: true,
  subsector: true,
  region: true,
  countryTags: true,
  description: true,
  companyStatus: true,
  website: true,
  yearFounded: true,
  headquarters: true,
  retirement: { select: { companyId: true } },
  redirects: {
    select: { retiredId: true },
    orderBy: { retiredId: "asc" as const },
  },
  ownershipPeriods: {
    select: {
      id: true,
      fundId: true,
      vehicleName: true,
      investmentYear: true,
      isActive: true,
      organization: { select: { name: true } },
    },
    orderBy: { id: "asc" as const },
  },
  citations: {
    where: { isPrimary: true },
    select: { source: { select: { url: true, label: true } } },
    orderBy: { id: "asc" as const },
  },
} as const;

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function numberValue(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizedCompanyCandidate(company: Record<string, unknown>): NormalizedCompanyRow {
  return {
    name: stringValue(company.name).trim(),
    country: stringValue(company.country).trim(),
    sector: stringValue(company.sector).trim(),
    subsector: stringValue(company.subsector).trim(),
    region: stringValue(company.region).trim(),
    description: stringValue(company.description),
    status: stringValue(company.status).trim() || "Active",
    website: stringValue(company.website).trim(),
    yearFounded: numberValue(company.yearFounded),
    investmentYear: numberValue(company.investmentYear),
    headquarters: stringValue(company.headquarters).trim(),
    investmentFirm: stringValue(company.investmentFirm).trim(),
    ownershipVehicle: stringValue(company.ownershipVehicle).trim(),
    countryTags: toArray(company.countryTags),
    sourceName: stringValue(company.sourceName).trim(),
    sourceUrl: stringValue(company.sourceUrl).trim(),
  };
}

function duplicateCompanyIndexes(rows: readonly NormalizedCompanyRow[]): Set<number> {
  const indexesByKey = new Map<string, number[]>();
  rows.forEach((row, index) => {
    for (const key of companyDedupKeys(row.name)) {
      const indexes = indexesByKey.get(key) ?? [];
      indexes.push(index);
      indexesByKey.set(key, indexes);
    }
  });
  return new Set(
    Array.from(indexesByKey.values())
      .filter((indexes) => indexes.length > 1)
      .flat(),
  );
}

function validateCompanyRows(companies: Record<string, unknown>[]): CompanyValidation {
  const candidates = companies.map(normalizedCompanyCandidate);
  const duplicates = duplicateCompanyIndexes(candidates);
  const normalizedRows: NormalizedCompanyRow[] = [];
  const validByIndex = new Map<number, CompanyImportRow>();
  const errorsByIndex = new Map<number, ImportIssue>();

  candidates.forEach((candidate, index) => {
    const row = index + 2;
    const parsed = companySchema.safeParse(candidate);
    const normalized = parsed.success ? { ...parsed.data } : candidate;
    normalizedRows.push(normalized);

    if (duplicates.has(index)) {
      errorsByIndex.set(index, {
        row,
        name: candidate.name,
        country: candidate.country,
        code: "DUPLICATE_UPLOAD_IDENTITY",
        error: "Duplicate canonical company identity appears more than once in this upload",
      });
      return;
    }
    if (!parsed.success) {
      errorsByIndex.set(index, {
        row,
        name: candidate.name,
        country: candidate.country,
        code: "VALIDATION_ERROR",
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }
    validByIndex.set(index, { ...parsed.data, row });
  });

  return { normalizedRows, validByIndex, errorsByIndex };
}

function identityKey(name: string, country: string): string {
  return `${name.trim().toLowerCase()}\u0000${country.trim().toLowerCase()}`;
}

function ownershipLabel(organizationName: string, vehicleName: string | null): string {
  if (!vehicleName || vehicleName === organizationName) return organizationName;
  return `${organizationName} · ${vehicleName}`;
}

function desiredCompanyState(company: CompanyImportRow, matchedFundId: string | null) {
  const companyStatus = COMPANY_STATUS_MAP[company.status] as CompanyStatus;
  const targetOwnership = company.investmentFirm
    ? {
        organizationName: company.investmentFirm,
        vehicleName: company.ownershipVehicle || company.investmentFirm,
        fundId: matchedFundId,
        investmentYear: company.investmentYear ?? null,
        isActive: companyStatus !== "REALIZED",
      }
    : null;
  return {
    scalar: {
      sector: COMPANY_SECTOR_MAP[company.sector] as CompanySector,
      subsector: company.subsector || "",
      region: COMPANY_REGION_MAP[company.region] as CompanyRegion,
      countryTags: company.countryTags || [],
      description: company.description || "",
      companyStatus,
      website: company.website || null,
      yearFounded: company.yearFounded ?? null,
      headquarters: company.headquarters || null,
    },
    ownership: {
      active: targetOwnership?.isActive ? [targetOwnership] : [],
      target: targetOwnership,
    },
    primarySource: company.sourceUrl
      ? { url: company.sourceUrl, ...(company.sourceName ? { label: company.sourceName } : {}) }
      : null,
  };
}

type CompanyStateRow = Awaited<ReturnType<typeof loadPortfolioState>>["companies"][number];
type DesiredCompanyState = ReturnType<typeof desiredCompanyState>;

function normalizedOwnership(period: CompanyStateRow["ownershipPeriods"][number]) {
  return {
    organizationName: period.organization?.name ?? "",
    vehicleName: period.vehicleName,
    fundId: period.fundId,
    investmentYear: period.investmentYear,
    isActive: period.isActive,
  };
}

function currentCompanyState(current: CompanyStateRow, desired: DesiredCompanyState) {
  const primary = current.citations[0]?.source;
  const active = current.ownershipPeriods
    .filter((period) => period.isActive)
    .map(normalizedOwnership)
    .sort((left, right) => ownershipLabel(left.organizationName, left.vehicleName).localeCompare(ownershipLabel(right.organizationName, right.vehicleName)));
  const desiredTarget = desired.ownership.target;
  const target = desiredTarget
    ? current.ownershipPeriods.find((period) => (
        period.organization?.name === desiredTarget.organizationName
        && period.vehicleName === desiredTarget.vehicleName
      ))
    : undefined;
  return {
    scalar: {
      sector: current.sector,
      subsector: current.subsector,
      region: current.region,
      countryTags: current.countryTags,
      description: current.description,
      companyStatus: current.companyStatus,
      website: current.website,
      yearFounded: current.yearFounded,
      headquarters: current.headquarters,
    },
    ownership: {
      active,
      target: target ? normalizedOwnership(target) : null,
    },
    primarySource: primary
      ? { url: primary.url, ...(desired.primarySource && "label" in desired.primarySource ? { label: primary.label } : {}) }
      : null,
  };
}

async function loadPortfolioState(
  client: Pick<Prisma.TransactionClient, "company" | "fund">,
  validation: CompanyValidation,
) {
  const vehicleNames = Array.from(new Set(
    Array.from(validation.validByIndex.values())
      .map((company) => company.ownershipVehicle)
      .filter((value): value is string => Boolean(value)),
  ));
  const [companies, funds] = await Promise.all([
    client.company.findMany({
      select: COMPANY_STATE_SELECT,
      orderBy: { id: "asc" },
    }),
    vehicleNames.length > 0
      ? client.fund.findMany({
          where: { fundName: { in: vehicleNames } },
          select: { id: true, fundName: true, updatedAt: true },
          orderBy: [{ fundName: "asc" }, { id: "asc" }],
        })
      : Promise.resolve([]),
  ]);
  return { companies, funds };
}

function makeOwnershipChange({
  company,
  current,
  desired,
}: {
  company: CompanyImportRow;
  current?: CompanyStateRow;
  desired: DesiredCompanyState;
}): OwnershipChange | undefined {
  const from = current
    ? current.ownershipPeriods
        .filter((period) => period.isActive && period.organization?.name)
        .map((period) => ownershipLabel(period.organization!.name, period.vehicleName))
        .sort()
    : [];
  const target = desired.ownership.target;
  if (!current && !target) return undefined;

  if (target) {
    const to = ownershipLabel(target.organizationName, target.vehicleName);
    const action = from.length === 0 ? "create" : "replace";
    return {
      row: company.row,
      name: company.name,
      country: company.country,
      action,
      from,
      to,
      code: action === "create" ? "OWNERSHIP_CREATE" : "OWNERSHIP_REPLACE",
      message: target.isActive
        ? `${action === "create" ? "Create" : "Replace"} active ownership with ${to}.`
        : `Record ${to} as historical ownership with no active owner.`,
    };
  }

  return {
    row: company.row,
    name: company.name,
    country: company.country,
    action: "retire",
    from,
    code: "OWNERSHIP_RETIRE",
    message: "Retire the current active ownership without assigning a replacement.",
  };
}

async function buildCompanyPlan(
  client: Pick<Prisma.TransactionClient, "company" | "fund">,
  validation: CompanyValidation,
): Promise<CompanyPlan> {
  const state = await loadPortfolioState(client, validation);
  const existingByKey = new Map(state.companies.map((company) => [identityKey(company.name, company.country), company]));
  const fundByName = new Map(state.funds.map((fund) => [fund.fundName, fund]));

  const items = validation.normalizedRows.map((normalized, index): CompanyPlanItem => {
    const validationIssue = validation.errorsByIndex.get(index);
    if (validationIssue) return { row: index + 2, normalized, classification: "error", issue: validationIssue };

    const valid = validation.validByIndex.get(index)!;
    const existing = existingByKey.get(identityKey(valid.name, valid.country));
    const matchedFundId = valid.ownershipVehicle ? fundByName.get(valid.ownershipVehicle)?.id ?? null : null;
    if (existing?.retirement) {
      const issue: ImportIssue = {
        row: valid.row,
        name: valid.name,
        country: valid.country,
        existingStatus: existing.status,
        code: "RETIRED_IDENTITY",
        error: "Retired company identity requires reviewed canonical resolution",
      };
      return { row: valid.row, normalized, valid, existingId: existing.id, existingStatus: existing.status, matchedFundId: matchedFundId ?? undefined, classification: "quarantine", issue };
    }

    const identityConflicts = findCompanyIdentityConflicts(valid.name, state.companies, existing?.id);
    if (identityConflicts.length > 0) {
      const issue: ImportIssue = {
        row: valid.row,
        name: valid.name,
        country: valid.country,
        existingStatus: existing?.status,
        code: "CANONICAL_IDENTITY_CONFLICT",
        error: companyIdentityConflictMessage(identityConflicts),
      };
      return { row: valid.row, normalized, valid, existingId: existing?.id, existingStatus: existing?.status, matchedFundId: matchedFundId ?? undefined, classification: "quarantine", issue };
    }
    if (existing?.redirects.length) {
      const issue: ImportIssue = {
        row: valid.row,
        name: valid.name,
        country: valid.country,
        existingStatus: existing.status,
        code: "CANONICAL_SURVIVOR_LOCKED",
        error: "Canonical merge survivor is compatibility locked",
      };
      return { row: valid.row, normalized, valid, existingId: existing.id, existingStatus: existing.status, matchedFundId: matchedFundId ?? undefined, classification: "quarantine", issue };
    }
    if (existing && !["DRAFT", "IN_REVIEW"].includes(existing.status)) {
      const issue: ImportIssue = {
        row: valid.row,
        name: valid.name,
        country: valid.country,
        existingStatus: existing.status,
        code: "EDITORIAL_REVIEW_REQUIRED",
        error: `Existing ${existing.status.toLowerCase()} company requires editorial review`,
      };
      return { row: valid.row, normalized, valid, existingId: existing.id, existingStatus: existing.status, matchedFundId: matchedFundId ?? undefined, classification: "quarantine", issue };
    }

    const desired = desiredCompanyState(valid, matchedFundId);
    if (!existing) {
      return {
        row: valid.row,
        normalized,
        valid,
        matchedFundId: matchedFundId ?? undefined,
        classification: "create",
        scalarChanged: true,
        ownershipChanged: Boolean(desired.ownership.target),
        citationChanged: Boolean(desired.primarySource),
        ownershipChange: makeOwnershipChange({ company: valid, desired }),
      };
    }

    const current = currentCompanyState(existing, desired);
    const scalarChanged = !sameImportValue(current.scalar, desired.scalar);
    const ownershipChanged = !sameImportValue(current.ownership, desired.ownership);
    const citationChanged = !sameImportValue(current.primarySource, desired.primarySource);
    const classification = scalarChanged || ownershipChanged || citationChanged ? "update" : "unchanged";
    return {
      row: valid.row,
      normalized,
      valid,
      existingId: existing.id,
      existingStatus: existing.status,
      matchedFundId: matchedFundId ?? undefined,
      classification,
      scalarChanged,
      ownershipChanged,
      citationChanged,
      ...(ownershipChanged ? { ownershipChange: makeOwnershipChange({ company: valid, current: existing, desired }) } : {}),
    };
  });

  return { state, items };
}

function previewItems(plan: CompanyPlan) {
  return plan.items.map((item) => ({
    ...item.normalized,
    row: item.row,
    classification: item.classification,
    ...(item.issue ? { code: item.issue.code, error: item.issue.error } : {}),
  }));
}

async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>[]> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No file provided in form data");
    return parseCsv(await file.text());
  }
  const body: unknown = await request.json();
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object" && Array.isArray((body as { companies?: unknown }).companies)) {
    return (body as { companies: Record<string, unknown>[] }).companies;
  }
  throw new Error("Request body must contain a 'companies' array or be a JSON array");
}

async function requireImportActor() {
  await requireAdmin();
  const actor = await getSessionIdentity();
  if (!actor || actor.role !== "ADMIN") throw new AuthorizationError();
  return actor;
}

async function applyOwnership(
  tx: Prisma.TransactionClient,
  companyId: string,
  company: CompanyImportRow,
  matchedFundId: string | null,
) {
  await tx.ownershipPeriod.updateMany({
    where: { companyId, isActive: true },
    data: { isActive: false },
  });
  if (!company.investmentFirm) return;

  const organization = await tx.organization.upsert({
    where: { name: company.investmentFirm },
    update: {},
    create: { name: company.investmentFirm, types: ["FUND_MANAGER"] },
  });
  const vehicleName = company.ownershipVehicle || company.investmentFirm;
  const companyStatus = COMPANY_STATUS_MAP[company.status] as CompanyStatus;
  await tx.ownershipPeriod.upsert({
    where: {
      companyId_organizationId_vehicleName: {
        companyId,
        organizationId: organization.id,
        vehicleName,
      },
    },
    update: {
      fundId: matchedFundId,
      investmentYear: company.investmentYear ?? null,
      isActive: companyStatus !== "REALIZED",
    },
    create: {
      companyId,
      organizationId: organization.id,
      fundId: matchedFundId,
      vehicleName,
      investmentYear: company.investmentYear ?? null,
      isActive: companyStatus !== "REALIZED",
    },
  });
}

async function applyPrimaryCitation(
  tx: Prisma.TransactionClient,
  companyId: string,
  company: CompanyImportRow,
) {
  await tx.citation.updateMany({
    where: { companyId, isPrimary: true },
    data: { isPrimary: false },
  });
  if (!company.sourceUrl) return;

  const source = await tx.source.upsert({
    where: { url: company.sourceUrl },
    update: { ...(company.sourceName ? { label: company.sourceName } : {}) },
    create: { url: company.sourceUrl, label: company.sourceName || "", type: "ARTICLE" },
  });
  const citation = await tx.citation.findFirst({
    where: { companyId, sourceId: source.id },
    select: { id: true },
  });
  if (citation) {
    await tx.citation.update({ where: { id: citation.id }, data: { isPrimary: true } });
  } else {
    await tx.citation.create({ data: { sourceId: source.id, companyId, isPrimary: true } });
  }
}

export async function POST(request: NextRequest) {
  const operation = request.nextUrl.searchParams.get("preview") === "1"
    ? SERVER_OPERATIONS.importPreview
    : SERVER_OPERATIONS.importCommit;
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.importPortfolio,
    operation,
    () => processPortfolioImport(request),
  ));
}

async function processPortfolioImport(request: NextRequest) {
  try {
    const actor = await requireImportActor();
    const companies = await parseRequestBody(request);
    if (companies.length === 0) return NextResponse.json({ error: "No companies provided" }, { status: 400 });
    if (companies.length > MAX_IMPORT_ROWS) {
      return NextResponse.json({ error: `Portfolio import is limited to ${MAX_IMPORT_ROWS} rows` }, { status: 413 });
    }

    const validation = validateCompanyRows(companies);
    const rowsHash = hashImportValue(validation.normalizedRows);
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";
    if (isPreview) {
      const plan = await buildCompanyPlan(prisma, validation);
      const stateHash = hashImportValue(plan.state);
      const summary = summarizeImportClassifications(plan.items.map((item) => item.classification));
      const warnings = plan.items.filter((item) => item.classification === "quarantine").flatMap((item) => item.issue ? [item.issue] : []);
      const errors = plan.items.filter((item) => item.classification === "error").flatMap((item) => item.issue ? [item.issue] : []);
      return NextResponse.json({
        previewToken: issueImportPreviewToken({ actorId: actor.id, entityType: "portfolio", rowsHash, stateHash }),
        currentStateHash: stateHash,
        items: previewItems(plan),
        ...summary,
        warnings,
        errors,
        ownershipChanges: plan.items.flatMap((item) => item.ownershipChange ? [item.ownershipChange] : []),
      });
    }

    const token = request.headers.get("x-import-preview-token");
    if (!token) return NextResponse.json({ error: "Preview confirmation is required before import commit" }, { status: 428 });
    const preview = verifyImportPreviewToken({ token, actorId: actor.id, entityType: "portfolio", rowsHash });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_COMPANIES",
      entityType: "Company",
      actorId: actor.id,
      rowCount: companies.length,
      execute: async (tx) => {
        const plan = await buildCompanyPlan(tx, validation);
        assertImportStateHash(preview.stateHash, plan.state);
        const results: Array<Record<string, unknown>> = [];
        let inserted = 0;
        let updated = 0;

        for (const item of plan.items) {
          const company = item.valid;
          if (!company || item.classification === "error" || item.classification === "quarantine") {
            results.push({
              name: item.normalized.name,
              country: item.normalized.country,
              status: item.classification === "quarantine" ? "quarantined" : "error",
              error: item.issue?.error,
              row: item.row,
            });
            continue;
          }
          if (item.classification === "unchanged") {
            results.push({ name: company.name, country: company.country, dbId: item.existingId, status: "unchanged", row: item.row });
            continue;
          }

          const desired = desiredCompanyState(company, item.matchedFundId ?? null);
          let companyId: string;
          if (item.classification === "update" && item.existingId) {
            companyId = item.existingId;
            if (item.scalarChanged) {
              const result = await tx.company.updateMany({
                where: {
                  id: item.existingId,
                  status: { in: ["DRAFT", "IN_REVIEW"] },
                  ...MUTABLE_COMPANY_WHERE,
                },
                data: desired.scalar,
              });
              if (result.count !== 1) throw new StaleImportPreviewError();
            }
            updated += 1;
          } else {
            const created = await tx.company.create({
              data: {
                name: company.name,
                country: company.country,
                ...desired.scalar,
                status: "DRAFT",
              },
              select: { id: true },
            });
            companyId = created.id;
            inserted += 1;
          }

          if (item.ownershipChanged) await applyOwnership(tx, companyId, company, item.matchedFundId ?? null);
          if (item.citationChanged) await applyPrimaryCitation(tx, companyId, company);
          results.push({ name: company.name, country: company.country, dbId: companyId, status: "ok", row: item.row });
        }

        const skipped = plan.items.length - inserted - updated;
        return {
          value: results,
          counts: { inserted, updated, skipped },
          auditChanges: {
            changedFields: ["rows"],
            inserted,
            updated,
            unchanged: plan.items.filter((item) => item.classification === "unchanged").length,
            quarantined: plan.items.filter((item) => item.classification === "quarantine").length,
            errors: plan.items.filter((item) => item.classification === "error").length,
            ownershipChanges: plan.items.filter((item) => item.ownershipChanged).length,
          },
        };
      },
    });

    const results = committed.value;
    if (results.some((result) => result.status === "ok")) revalidateAppData();
    return NextResponse.json({
      imported: results.filter((result) => result.status === "ok").length,
      auditEventId: committed.auditEventId,
      results,
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (error instanceof ImportPreviewTokenError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof StaleImportPreviewError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to process portfolio import" }, { status: 500 });
  }
}
