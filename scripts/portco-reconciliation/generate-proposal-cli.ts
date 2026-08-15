#!/usr/bin/env npx tsx
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  companyImageSha256,
  finalizeProposal,
  verifyProposal,
  verifyDatasetSnapshot,
} from "./artifacts";
import { verifyExecutionTaskSnapshot } from "./execution-control";
import { digestsEqual, sha256Canonical } from "./hash";
import { renderProposalMarkdown } from "./markdown";
import {
  citationImageSchema,
  companyImageSchema,
  ownershipPeriodImageSchema,
  proposalActions,
  relationMergeSchema,
  type CompanyImage,
  type ProductionSnapshot,
  type ReconciliationProposal,
  type ReviewedSeedRetirement,
} from "./schema";
import type { TaskSnapshotContext } from "./task-snapshot";

const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"));
const supportedSourceTypeSchema = z.enum([
  "ARTICLE",
  "PRESS_RELEASE",
  "SEC_FILING",
  "PRESENTATION",
  "WEBSITE",
  "OTHER",
]);
const evidenceSchema = z.strictObject({
  url: httpsUrl,
  purpose: z.string().trim().min(1),
  supports: z.array(z.string().trim().min(1)).min(1),
});
const companyFieldUpdatesSchema = companyImageSchema.pick({
  name: true,
  aliases: true,
  sector: true,
  subsector: true,
  region: true,
  country: true,
  countryTags: true,
  description: true,
  companyStatus: true,
  recordStatus: true,
  website: true,
  yearFounded: true,
  headquarters: true,
  lastVerifiedAt: true,
}).partial();
const ownershipPeriodUpdateSchema = z.strictObject({
  id: z.string().trim().min(1),
  set: z.strictObject({
    managerName: z.string().trim().min(1).optional(),
    organizationName: z.string().trim().min(1).nullable().optional(),
    fundName: z.string().trim().min(1).nullable().optional(),
    vehicleName: z.string().trim().min(1).nullable().optional(),
    stake: z.string().trim().min(1).nullable().optional(),
    investmentYear: z.number().int().min(1800).max(2200).nullable().optional(),
    exitYear: z.number().int().min(1800).max(2200).nullable().optional(),
    isActive: z.boolean().optional(),
    transactionState: z.enum(["CLOSED_ACTIVE", "SIGNED_PENDING_EXIT", "REALIZED"]).optional(),
  }),
});
const ownershipPeriodAdditionSchema = ownershipPeriodImageSchema.refine(
  (period) => period.id === null,
  { message: "New ownership periods must use id: null", path: ["id"] },
);
const milestoneUpdateSchema = z.strictObject({
  id: z.string().trim().min(1),
  set: z.strictObject({
    date: z.string().trim().min(1).optional(),
    event: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    sortDate: z.string().datetime({ offset: true }).nullable().optional(),
    evidenceUrls: z.array(httpsUrl).optional(),
  }),
});
const citationUpdateSchema = z.strictObject({
  id: z.string().trim().min(1),
  set: citationImageSchema.omit({ id: true, sourceType: true }).partial().extend({
    sourceType: supportedSourceTypeSchema.optional(),
    purpose: z.enum([
      "COMPANY_PROFILE",
      "OWNERSHIP_INVESTMENT",
      "OPERATIONS_ASSETS",
      "MILESTONE_EVENT",
      "FINANCING_FILINGS",
      "SUPPORTING_CONTEXT",
    ]).optional(),
  }),
});
const citationAdditionSchema = citationImageSchema.extend({
  sourceType: supportedSourceTypeSchema,
  purpose: z.enum([
    "COMPANY_PROFILE",
    "OWNERSHIP_INVESTMENT",
    "OPERATIONS_ASSETS",
    "MILESTONE_EVENT",
    "FINANCING_FILINGS",
    "SUPPORTING_CONTEXT",
  ]),
}).refine(
  (citation) => citation.id === null,
  { message: "New citations must use id: null", path: ["id"] },
);
const proposalSpecSchema = z.strictObject({
  generatedAt: z.string().datetime({ offset: true }),
  actions: z.array(z.enum(proposalActions)).min(1),
  retiredCompanyIds: z.array(z.string().trim().min(1)).default([]),
  relationMerges: z.array(relationMergeSchema).default([]),
  reviewedSeedRetirementTaskIds: z.array(z.string().trim().min(1)).default([]),
  rationale: z.string().trim().min(1),
  evidence: z.array(evidenceSchema).min(1),
  unresolvedQuestions: z.array(z.string().trim().min(1)).default([]),
  companyFieldUpdates: companyFieldUpdatesSchema.optional(),
  ownershipPeriodUpdates: z.array(ownershipPeriodUpdateSchema).default([]),
  ownershipPeriodAdditions: z.array(ownershipPeriodAdditionSchema).default([]),
  milestoneUpdates: z.array(milestoneUpdateSchema).default([]),
  citationUpdates: z.array(citationUpdateSchema).default([]),
  citationAdditions: z.array(citationAdditionSchema).default([]),
  afterImage: companyImageSchema.optional(),
}).superRefine((spec, context) => {
  if (spec.relationMerges.length > 0 && !spec.actions.includes("MERGE_COMPANIES")) {
    context.addIssue({
      code: "custom",
      path: ["relationMerges"],
      message: "Retired relation mappings are valid only for MERGE_COMPANIES proposals",
    });
  }
  if (
    spec.reviewedSeedRetirementTaskIds.length > 0
    && !spec.actions.includes("MERGE_COMPANIES")
  ) {
    context.addIssue({
      code: "custom",
      path: ["reviewedSeedRetirementTaskIds"],
      message: "Reviewed seed retirements require a MERGE_COMPANIES proposal",
    });
  }
  if (new Set(spec.reviewedSeedRetirementTaskIds).size !== spec.reviewedSeedRetirementTaskIds.length) {
    context.addIssue({
      code: "custom",
      path: ["reviewedSeedRetirementTaskIds"],
      message: "Reviewed seed retirement task ids must be unique",
    });
  }
  if (
    spec.afterImage
    && (
      spec.companyFieldUpdates
      || spec.ownershipPeriodUpdates.length > 0
      || spec.ownershipPeriodAdditions.length > 0
      || spec.milestoneUpdates.length > 0
      || spec.citationUpdates.length > 0
      || spec.citationAdditions.length > 0
    )
  ) {
    context.addIssue({ code: "custom", message: "Use either afterImage or patch updates, not both" });
  }
  if (
    !spec.afterImage
    && !spec.companyFieldUpdates
    && spec.ownershipPeriodUpdates.length === 0
    && spec.ownershipPeriodAdditions.length === 0
    && spec.milestoneUpdates.length === 0
    && spec.citationUpdates.length === 0
    && spec.citationAdditions.length === 0
  ) {
    context.addIssue({ code: "custom", message: "Proposal spec must define an after-image or at least one patch" });
  }
});

interface Arguments {
  context: string;
  spec?: string;
  supersededProposal?: string;
  json: string;
  markdown: string;
  generatedAt?: string;
}

function argumentsFrom(argv: readonly string[]): Arguments {
  const values = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    const separator = argument.indexOf("=");
    values.set(argument.slice(2, separator), argument.slice(separator + 1));
  }
  const required = (name: "context" | "json" | "markdown"): string => {
    const value = values.get(name)?.trim();
    if (!value) throw new Error(`--${name}=... is required`);
    return value;
  };
  for (const key of values.keys()) {
    if (![
      "context",
      "spec",
      "superseded-proposal",
      "json",
      "markdown",
      "generated-at",
    ].includes(key)) {
      throw new Error(`Unknown option --${key}`);
    }
  }
  const spec = values.get("spec")?.trim() || undefined;
  const supersededProposal = values.get("superseded-proposal")?.trim() || undefined;
  if ((spec ? 1 : 0) + (supersededProposal ? 1 : 0) !== 1) {
    throw new Error("Provide exactly one of --spec=... or --superseded-proposal=...");
  }
  return {
    context: required("context"),
    spec,
    supersededProposal,
    json: required("json"),
    markdown: required("markdown"),
    generatedAt: values.get("generated-at")?.trim() || undefined,
  };
}

async function jsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

function verifyContext(input: unknown): TaskSnapshotContext {
  if (!input || typeof input !== "object") throw new Error("Task context must be an object");
  const context = input as TaskSnapshotContext;
  const { contextSha256, ...withoutHash } = context;
  sha256.parse(contextSha256);
  if (!digestsEqual(contextSha256, sha256Canonical(withoutHash))) {
    throw new Error("Task context hash mismatch");
  }
  verifyExecutionTaskSnapshot(context.taskSnapshot);
  if (context.taskId !== context.taskSnapshot.taskId || context.taskIndex !== context.taskSnapshot.taskIndex) {
    throw new Error("Task context identity does not match its task snapshot");
  }
  if (context.sourceQueueEntry.taskId !== context.taskId) {
    throw new Error("Task context queue entry does not match the task");
  }
  if (
    sha256Canonical(context.seedRetirementCandidates ?? [])
    !== sha256Canonical(context.taskSnapshot.seedRetirementCandidates ?? [])
  ) {
    throw new Error("Task context seed-retirement candidates do not match the task snapshot");
  }
  if (
    context.sourceQueueEntry.canonicalKey !== null
    && context.resolvedCanonicalKey !== context.sourceQueueEntry.canonicalKey
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_DBA_IDENTITY"
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
  ) {
    throw new Error("Task context resolved canonical key does not match its immutable queue identity");
  }
  if (
    (
      context.targetResolution.method === "REVIEWED_POST_QUEUE_EXACT_IDENTITY"
      || context.targetResolution.method === "REVIEWED_POST_QUEUE_DBA_IDENTITY"
      || context.targetResolution.method === "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
      || context.targetResolution.method === "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
    )
    && !context.resolvedCanonicalKey
  ) {
    throw new Error("Reviewed post-queue task context is missing its resolved canonical identity");
  }
  for (const [values, expected, label] of [
    [context.dependencies.funds, context.taskSnapshot.dependencies.fundsSha256, "funds"],
    [context.dependencies.organizations, context.taskSnapshot.dependencies.organizationsSha256, "organizations"],
    [context.dependencies.redirects, context.taskSnapshot.dependencies.redirectsSha256, "redirects"],
  ] as const) {
    if (!digestsEqual(sha256Canonical(values), expected)) {
      throw new Error(`Task context ${label} do not match the locked dependency hash`);
    }
  }
  return context;
}

export function assertAfterImageDependenciesCaptured(
  context: Pick<TaskSnapshotContext, "dependencies">,
  afterImage: NonNullable<TaskSnapshotContext["targetCompanyImage"]>,
): void {
  const fundByName = new Map<string, TaskSnapshotContext["dependencies"]["funds"]>();
  for (const fund of context.dependencies.funds) {
    const matches = fundByName.get(fund.fundName) ?? [];
    matches.push(fund);
    fundByName.set(fund.fundName, matches);
  }
  const organizationByName = new Map<
    string,
    TaskSnapshotContext["dependencies"]["organizations"]
  >();
  for (const organization of context.dependencies.organizations) {
    const matches = organizationByName.get(organization.name) ?? [];
    matches.push(organization);
    organizationByName.set(organization.name, matches);
  }
  const organizationIds = new Set(context.dependencies.organizations.map((row) => row.id));
  for (const owner of afterImage.ownershipPeriods) {
    if (owner.organizationName) {
      const organizations = organizationByName.get(owner.organizationName) ?? [];
      if (organizations.length !== 1) {
        throw new Error(
          `Approved ownership organization is not captured exactly once: ${owner.organizationName}`,
        );
      }
    }
    if (!owner.fundName) continue;
    const funds = fundByName.get(owner.fundName) ?? [];
    if (funds.length !== 1) {
      throw new Error(`Approved ownership fund is not captured exactly once: ${owner.fundName}`);
    }
    if (!organizationIds.has(funds[0].managerId)) {
      throw new Error(
        `Approved ownership fund manager organization is not captured: ${owner.fundName}`,
      );
    }
  }
}

export function proposalCanonicalKey(context: Pick<
  TaskSnapshotContext,
  "resolvedCanonicalKey" | "sourceQueueEntry" | "targetResolution"
>): string {
  const canonicalKey = context.resolvedCanonicalKey?.trim() || null;
  if (!canonicalKey) {
    throw new Error("Proposal generation requires a resolved canonical identity");
  }
  if (
    context.sourceQueueEntry.canonicalKey !== null
    && canonicalKey !== context.sourceQueueEntry.canonicalKey
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_DBA_IDENTITY"
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
  ) {
    throw new Error("Proposal canonical identity differs from the immutable queue identity");
  }
  if (
    context.sourceQueueEntry.canonicalKey === null
    && context.targetResolution.method !== "REVIEWED_POST_QUEUE_EXACT_IDENTITY"
  ) {
    throw new Error("A canonical-null queue task requires reviewed exact-identity resolution before mutation");
  }
  return canonicalKey;
}

export function applySpec(context: TaskSnapshotContext, specInput: unknown) {
  const spec = proposalSpecSchema.parse(specInput);
  const candidates = new Map(
    (context.seedRetirementCandidates ?? []).map((candidate) => [candidate.sourceQueueTaskId, candidate]),
  );
  const reviewedSeedRetirements = spec.reviewedSeedRetirementTaskIds.map((taskId) => {
    const candidate = candidates.get(taskId);
    if (!candidate) throw new Error(`Unknown task-scoped seed retirement ${taskId}`);
    return candidate;
  });
  const beforeImage = context.targetCompanyImage;
  let afterImage = spec.afterImage ?? null;
  if (!afterImage) {
    if (!beforeImage) throw new Error("Patch-based proposals require an existing target company");
    const ownershipUpdates = new Map(spec.ownershipPeriodUpdates.map((update) => [update.id, update.set]));
    const milestoneUpdates = new Map(spec.milestoneUpdates.map((update) => [update.id, update.set]));
    const citationUpdates = new Map(spec.citationUpdates.map((update) => [update.id, update.set]));
    for (const id of ownershipUpdates.keys()) {
      if (!beforeImage.ownershipPeriods.some((period) => period.id === id)) {
        throw new Error(`Ownership update references unknown period ${id}`);
      }
    }
    for (const id of milestoneUpdates.keys()) {
      if (!beforeImage.milestones.some((milestone) => milestone.id === id)) {
        throw new Error(`Milestone update references unknown milestone ${id}`);
      }
    }
    for (const id of citationUpdates.keys()) {
      if (!beforeImage.citations.some((citation) => citation.id === id)) {
        throw new Error(`Citation update references unknown citation ${id}`);
      }
    }
    afterImage = companyImageSchema.parse({
      ...beforeImage,
      ...(spec.companyFieldUpdates ?? {}),
      ownershipPeriods: beforeImage.ownershipPeriods.map((period) => ({
        ...period,
        ...(period.id ? ownershipUpdates.get(period.id) : undefined),
      })).concat(spec.ownershipPeriodAdditions),
      milestones: beforeImage.milestones.map((milestone) => ({
        ...milestone,
        ...(milestone.id ? milestoneUpdates.get(milestone.id) : undefined),
      })),
      citations: beforeImage.citations.map((citation) => ({
        ...citation,
        ...(citation.id ? citationUpdates.get(citation.id) : undefined),
      })).concat(spec.citationAdditions),
    });
  }
  if (spec.unresolvedQuestions.length > 0 && afterImage) {
    throw new Error("A mutating proposal cannot carry unresolved questions");
  }
  return { spec, beforeImage, afterImage, reviewedSeedRetirements };
}

interface BoundProposalContent {
  generatedAt: string;
  actions: ReconciliationProposal["actions"];
  retiredCompanyIds: ReconciliationProposal["retiredCompanyIds"];
  relationMerges?: ReconciliationProposal["relationMerges"];
  reviewedSeedRetirements?: ReconciliationProposal["reviewedSeedRetirements"];
  rationale: ReconciliationProposal["rationale"];
  evidence: ReconciliationProposal["evidence"];
  unresolvedQuestions: ReconciliationProposal["unresolvedQuestions"];
  beforeImage: CompanyImage | null;
  afterImage: CompanyImage | null;
}

function verifyBoundProductionSnapshot(
  context: TaskSnapshotContext,
  input: unknown,
): ProductionSnapshot {
  const production = verifyDatasetSnapshot(input);
  if (production.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Task context must reference a production snapshot");
  }
  if (!digestsEqual(production.snapshotSha256, context.taskSnapshot.productionSnapshotSha256)) {
    throw new Error("Task context production snapshot binding is stale");
  }
  return production;
}

function finalizeBoundProposal(
  context: TaskSnapshotContext,
  production: ProductionSnapshot,
  content: BoundProposalContent,
): ReconciliationProposal {
  const canonicalKey = proposalCanonicalKey(context);
  const beforeImageSha256 = content.beforeImage ? companyImageSha256(content.beforeImage) : null;
  if (beforeImageSha256 !== context.taskSnapshot.targetCompanySnapshotSha256) {
    throw new Error("Task context before-image does not match the locked target snapshot");
  }
  if (content.afterImage) assertAfterImageDependenciesCaptured(context, content.afterImage);
  return finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: context.runId,
    taskId: context.taskId,
    taskIndex: context.taskIndex,
    asOfDate: production.asOfDate,
    generatedAt: content.generatedAt,
    canonicalKey,
    companyName: context.companyName,
    actions: content.actions,
    sourceHoldingIds: context.sourceQueueEntry.sourceHoldingIds,
    retiredCompanyIds: content.retiredCompanyIds,
    ...(content.relationMerges === undefined ? {} : { relationMerges: content.relationMerges }),
    ...(content.reviewedSeedRetirements === undefined
      ? {}
      : { reviewedSeedRetirements: content.reviewedSeedRetirements }),
    rationale: content.rationale,
    evidence: content.evidence,
    unresolvedQuestions: content.unresolvedQuestions,
    ledgerSha256: context.taskSnapshot.sourceLedgerSha256,
    productionSnapshotSha256: production.snapshotSha256,
    currentCompanySnapshotSha256: context.taskSnapshot.targetCompanySnapshotSha256,
    executionLock: {
      taskSnapshotSha256: context.taskSnapshot.taskSnapshotSha256,
      taskStateSha256: context.taskSnapshot.stateSha256,
      taskDependencySha256: context.taskSnapshot.dependencySha256,
      seedEntrySha256: context.taskSnapshot.seedEntrySha256,
      dependencies: context.taskSnapshot.dependencies,
      funds: context.dependencies.funds,
      organizations: context.dependencies.organizations,
      redirects: context.dependencies.redirects,
    },
    beforeImage: content.beforeImage,
    beforeImageSha256,
    afterImage: content.afterImage,
    afterImageSha256: content.afterImage ? companyImageSha256(content.afterImage) : null,
  });
}

function remapReviewedSeedRetirements(
  context: TaskSnapshotContext,
  supersededProposal: ReconciliationProposal,
): ReviewedSeedRetirement[] | undefined {
  const supersededRetirements = supersededProposal.reviewedSeedRetirements;
  if (supersededRetirements === undefined) return undefined;
  const freshCandidates = new Map(
    (context.seedRetirementCandidates ?? []).map((candidate) => [candidate.sourceQueueTaskId, candidate]),
  );
  const identityFields = ["sourceQueueEntrySha256", "name", "country"] as const;
  const hashFields = ["rawSeedEntrySha256", "evaluatedSeedEntrySha256"] as const;
  return supersededRetirements.map((retirement) => {
    const fresh = freshCandidates.get(retirement.sourceQueueTaskId);
    if (!fresh) {
      throw new Error(
        `Superseded proposal seed retirement ${retirement.sourceQueueTaskId} is absent from the fresh task context`,
      );
    }
    for (const field of identityFields) {
      if (fresh[field] !== retirement[field]) {
        throw new Error(
          `Superseded proposal seed retirement ${retirement.sourceQueueTaskId} changed identity field ${field}`,
        );
      }
    }
    for (const field of hashFields) {
      if (!digestsEqual(fresh[field], retirement[field])) {
        throw new Error(
          `Superseded proposal seed retirement ${retirement.sourceQueueTaskId} changed ${field}`,
        );
      }
    }
    return fresh;
  });
}

export function rebindSupersededProposal(input: {
  context: TaskSnapshotContext;
  production: ProductionSnapshot;
  supersededProposal: unknown;
  generatedAt?: string;
}): ReconciliationProposal {
  const { context } = input;
  const production = verifyBoundProductionSnapshot(context, input.production);
  const superseded = verifyProposal(input.supersededProposal);
  const canonicalKey = proposalCanonicalKey(context);
  const identityChecks = [
    ["run", superseded.runId, context.runId],
    ["task", superseded.taskId, context.taskId],
    ["task index", superseded.taskIndex, context.taskIndex],
    ["company", superseded.companyName, context.companyName],
    ["canonical", superseded.canonicalKey, canonicalKey],
  ] as const;
  for (const [label, supersededValue, freshValue] of identityChecks) {
    if (supersededValue !== freshValue) {
      throw new Error(`Superseded proposal ${label} identity does not match the fresh task context`);
    }
  }
  if (superseded.unresolvedQuestions.length > 0) {
    throw new Error("A superseded proposal with unresolved questions cannot be rebound");
  }
  if (!superseded.afterImage) {
    throw new Error("A superseded proposal without a resolved after-image cannot be rebound");
  }
  if (!digestsEqual(superseded.ledgerSha256, context.taskSnapshot.sourceLedgerSha256)) {
    throw new Error("Superseded proposal source ledger does not match the fresh task context");
  }
  if (
    sha256Canonical(superseded.sourceHoldingIds)
    !== sha256Canonical(context.sourceQueueEntry.sourceHoldingIds)
  ) {
    throw new Error("Superseded proposal source holdings do not match the fresh task context");
  }
  const freshBeforeImageSha256 = context.targetCompanyImage
    ? companyImageSha256(context.targetCompanyImage)
    : null;
  if (
    superseded.beforeImageSha256 !== freshBeforeImageSha256
    || superseded.currentCompanySnapshotSha256 !== freshBeforeImageSha256
  ) {
    throw new Error("Superseded proposal target company image changed; fresh research is required");
  }
  const reviewedSeedRetirements = remapReviewedSeedRetirements(context, superseded);
  return finalizeBoundProposal(context, production, {
    generatedAt: input.generatedAt ?? superseded.generatedAt,
    actions: superseded.actions,
    retiredCompanyIds: superseded.retiredCompanyIds,
    relationMerges: superseded.relationMerges,
    reviewedSeedRetirements,
    rationale: superseded.rationale,
    evidence: superseded.evidence,
    unresolvedQuestions: superseded.unresolvedQuestions,
    beforeImage: context.targetCompanyImage,
    afterImage: superseded.afterImage,
  });
}

export async function executeGenerateProposalCli(argv: readonly string[]): Promise<void> {
  const args = argumentsFrom(argv);
  const context = verifyContext(await jsonFile(args.context));
  const production = verifyBoundProductionSnapshot(
    context,
    await jsonFile(context.productionSnapshotLocation),
  );
  let proposal: ReconciliationProposal;
  if (args.spec) {
    const {
      spec,
      beforeImage,
      afterImage,
      reviewedSeedRetirements,
    } = applySpec(context, await jsonFile(args.spec));
    proposal = finalizeBoundProposal(context, production, {
      generatedAt: args.generatedAt ?? spec.generatedAt,
      actions: spec.actions,
      retiredCompanyIds: spec.retiredCompanyIds,
      relationMerges: spec.relationMerges,
      ...(reviewedSeedRetirements.length === 0 ? {} : { reviewedSeedRetirements }),
      rationale: spec.rationale,
      evidence: spec.evidence,
      unresolvedQuestions: spec.unresolvedQuestions,
      beforeImage,
      afterImage,
    });
  } else {
    proposal = rebindSupersededProposal({
      context,
      production,
      supersededProposal: await jsonFile(args.supersededProposal!),
      generatedAt: args.generatedAt,
    });
  }
  const jsonOutput = resolve(args.json);
  const markdownOutput = resolve(args.markdown);
  await mkdir(dirname(jsonOutput), { recursive: true });
  await mkdir(dirname(markdownOutput), { recursive: true });
  await writeFile(jsonOutput, `${JSON.stringify(proposal, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  await writeFile(markdownOutput, renderProposalMarkdown(proposal), { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({
    companyName: proposal.companyName,
    proposalSha256: proposal.proposalSha256,
    beforeImageSha256: proposal.beforeImageSha256,
    afterImageSha256: proposal.afterImageSha256,
    json: args.json,
    markdown: args.markdown,
  }, null, 2));
}

async function main(): Promise<void> {
  try {
    await executeGenerateProposalCli(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) void main();
