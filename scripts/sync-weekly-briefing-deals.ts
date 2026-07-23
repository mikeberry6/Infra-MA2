import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  DealCategory,
  DealRegion,
  DealSector,
  DealStatusEnum,
  OrgType,
  ParticipantRole,
} from "../src/generated/prisma/client";
import { resolveOrgName, getOrgType } from "../prisma/entity-resolution";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import { SafeOperationalError } from "../src/lib/safe-error";
import { deals, type Deal } from "../prisma/seed-data/deals";
import { weeklyBriefingDeals } from "../prisma/seed-data/weekly-briefing-deals";
import {
  DEAL_CATEGORY_MAP,
  DEAL_REGION_MAP,
  DEAL_SECTOR_MAP,
  DEAL_STATUS_MAP,
} from "../src/modules/shared/enum-maps";
import { completePipelineRun, failPipelineRun, startPipelineRun } from "../src/modules/operations/pipeline-runs";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import {
  resolveWeeklySeedDeal,
  weeklyDealIdentitiesMatch,
  weeklyLegacyIdCollides,
} from "../src/modules/operations/weekly-deal-identity";
import {
  runWeeklySyncLifecycle,
  type WeeklySyncProgress,
  type WeeklySyncResult,
} from "../src/modules/operations/weekly-sync-lifecycle";
import { weeklyProposalWriteDecision } from "../src/modules/operations/weekly-deal-audit";
import { runSerializableTransaction } from "../src/modules/operations/serializable-transaction";

const applyChanges = process.argv.includes("--apply");
const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient | null = null;

function database(): PrismaClient {
  if (!prisma) throw new SafeOperationalError("database_url_required");
  return prisma;
}

type CoverageRow = {
  legacyId: string;
  target: string;
  date: Date;
  sourceUrls: string[];
};

type ParticipantSeed = {
  name: string;
  role: ParticipantRole;
  displayName?: string;
};

function isCovered(weeklyDeal: Deal, rows: CoverageRow[]): boolean {
  return rows.some((row) => weeklyDealIdentitiesMatch(weeklyDeal, row));
}

function issueId(deal: Deal): string {
  return deal.id.startsWith("WB-") ? deal.id.slice(3, 13) : deal.date.slice(0, 10);
}

function groupByIssue(items: Deal[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, deal) => {
    const issue = issueId(deal);
    counts[issue] = (counts[issue] ?? 0) + 1;
    return counts;
  }, {});
}

function resolveSeedDeal(weeklyDeal: Deal): Deal {
  return resolveWeeklySeedDeal(weeklyDeal, deals);
}

function splitParticipants(value: string): string[] {
  if (!value || value === "N/A" || value === "—" || value.toLowerCase() === "n/a") return [];
  return value
    .split(/\s+\/\s+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function participantSeeds(deal: Deal): ParticipantSeed[] {
  const seeds: ParticipantSeed[] = [];

  for (const name of splitParticipants(deal.buyer)) {
    seeds.push({ name, role: "BUYER", displayName: deal.buyer });
  }
  for (const name of splitParticipants(deal.seller)) {
    seeds.push({ name, role: "SELLER", displayName: deal.seller });
  }
  for (const name of deal.financialAdvisorBuyer ?? []) {
    seeds.push({ name, role: "FINANCIAL_ADVISOR_BUYER" });
  }
  for (const name of deal.financialAdvisorSeller ?? []) {
    seeds.push({ name, role: "FINANCIAL_ADVISOR_SELLER" });
  }
  for (const name of deal.legalAdvisorBuyer ?? []) {
    seeds.push({ name, role: "LEGAL_ADVISOR_BUYER" });
  }
  for (const name of deal.legalAdvisorSeller ?? []) {
    seeds.push({ name, role: "LEGAL_ADVISOR_SELLER" });
  }

  return seeds.filter(({ name }) => name && name !== "N/A" && name !== "—");
}

function organizationType(seed: ParticipantSeed): OrgType {
  if (seed.role.startsWith("FINANCIAL_ADVISOR")) return "ADVISOR_FINANCIAL";
  if (seed.role.startsWith("LEGAL_ADVISOR")) return "ADVISOR_LEGAL";
  return getOrgType(seed.name);
}

function participantAuditRows(deal: Deal) {
  const seen = new Set<string>();
  return participantSeeds(deal).flatMap((participant) => {
    const organizationName = resolveOrgName(participant.name);
    const key = `${organizationName}|${participant.role}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      organizationName,
      role: participant.role,
      displayName: participant.displayName ?? null,
    }];
  });
}

function dealPayload(deal: Deal) {
  const date = new Date(deal.date);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date for ${deal.id}: ${deal.date}`);

  const closingDate = deal.closingDate ? new Date(deal.closingDate) : null;
  if (closingDate && Number.isNaN(closingDate.getTime())) {
    throw new Error(`Invalid closing date for ${deal.id}: ${deal.closingDate}`);
  }

  return {
    title: deal.title,
    target: deal.target,
    sector: DEAL_SECTOR_MAP[deal.sector] as DealSector,
    subsector: deal.subsector || "",
    region: DEAL_REGION_MAP[deal.region] as DealRegion,
    categories: deal.category.map((category) => DEAL_CATEGORY_MAP[category]).filter(Boolean) as DealCategory[],
    date,
    description: deal.description || "",
    targetDescription: deal.targetDescription || "",
    country: deal.country || "",
    enterpriseValue: deal.enterpriseValue ?? null,
    equityValue: deal.equityValue ?? null,
    stake: deal.stake ?? null,
    dealStatus: DEAL_STATUS_MAP[deal.status] as DealStatusEnum,
    closingDate,
    assetScale: deal.assetScale ?? null,
    valuationMultiple: deal.valuationMultiple ?? null,
    fundVehicle: deal.fundVehicle ?? null,
    keyHighlights: deal.keyHighlights || [],
    status: "DRAFT" as const,
  };
}

async function syncDeal(deal: Deal): Promise<WeeklySyncResult> {
  return runSerializableTransaction(
    database(),
    async (tx) => {
      const existing = await tx.deal.findUnique({
        where: { legacyId: deal.id },
        select: {
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
          participants: {
            select: {
              role: true,
              displayName: true,
              organization: { select: { name: true } },
            },
          },
          citations: {
            select: {
              isPrimary: true,
              source: { select: { url: true } },
            },
          },
        },
      });
      if (existing && weeklyLegacyIdCollides(deal, {
        legacyId: deal.id,
        target: existing.target,
        date: existing.date,
        sourceUrls: existing.citations.map((citation) => citation.source.url),
      })) {
        throw new Error(
          `Refusing to reuse weekly legacy ID ${deal.id}: it belongs to ${existing.target}, not ${deal.target}`,
        );
      }
      if (existing && existing.status !== "DRAFT") {
        throw new Error(
          `${deal.id} is ${existing.status}; automation cannot modify a record that has entered review or publication`,
        );
      }
      const payload = dealPayload(deal);
      const proposedParticipants = participantAuditRows(deal);
      const proposedCitations = deal.sourceUrl
        ? [{ sourceUrl: deal.sourceUrl, isPrimary: true }]
        : [];
      const decision = weeklyProposalWriteDecision(
        existing
          ? {
              record: {
                legacyId: existing.legacyId,
                title: existing.title,
                target: existing.target,
                sector: existing.sector,
                subsector: existing.subsector,
                region: existing.region,
                categories: existing.categories,
                date: existing.date,
                description: existing.description,
                targetDescription: existing.targetDescription,
                country: existing.country,
                enterpriseValue: existing.enterpriseValue,
                equityValue: existing.equityValue,
                stake: existing.stake,
                dealStatus: existing.dealStatus,
                closingDate: existing.closingDate,
                assetScale: existing.assetScale,
                valuationMultiple: existing.valuationMultiple,
                fundVehicle: existing.fundVehicle,
                keyHighlights: existing.keyHighlights,
                status: existing.status,
              },
              participants: existing.participants.map((participant) => ({
                organizationName: participant.organization.name,
                role: participant.role,
                displayName: participant.displayName,
              })),
              citations: existing.citations.map((citation) => ({
                sourceUrl: citation.source.url,
                isPrimary: citation.isPrimary,
              })),
            }
          : null,
        {
          record: { legacyId: deal.id, ...payload },
          participants: proposedParticipants,
          citations: proposedCitations,
        },
      );
      if (decision.result === "skipped") return decision.result;

      const dbDeal = existing
        ? await tx.deal.update({ where: { id: existing.id }, data: payload })
        : await tx.deal.create({ data: { legacyId: deal.id, ...payload } });

      if (existing) {
        await tx.dealParticipant.deleteMany({ where: { dealId: dbDeal.id } });
        await tx.citation.deleteMany({ where: { dealId: dbDeal.id } });
      }

      const seenParticipants = new Set<string>();
      for (const participant of participantSeeds(deal)) {
        const canonicalName = resolveOrgName(participant.name);
        const organization = await tx.organization.upsert({
          where: { name: canonicalName },
          update: {},
          create: {
            name: canonicalName,
            types: [organizationType(participant)],
            status: "PUBLISHED",
          },
        });

        if (participant.name !== canonicalName) {
          await tx.alias.upsert({
            where: { alias: participant.name },
            update: {},
            create: { alias: participant.name, organizationId: organization.id },
          });
        }

        const participantKey = `${organization.id}|${participant.role}`;
        if (seenParticipants.has(participantKey)) continue;
        seenParticipants.add(participantKey);

        const existingParticipant = await tx.dealParticipant.findFirst({
          where: {
            dealId: dbDeal.id,
            organizationId: organization.id,
            role: participant.role,
          },
          select: { id: true },
        });
        if (!existingParticipant) {
          await tx.dealParticipant.create({
            data: {
              dealId: dbDeal.id,
              organizationId: organization.id,
              role: participant.role,
              displayName: participant.displayName ?? null,
            },
          });
        }
      }

      if (deal.sourceUrl) {
        const source = await tx.source.upsert({
          where: { url: deal.sourceUrl },
          update: {},
          create: {
            label: deal.sourceName || "Source",
            url: deal.sourceUrl,
            type: "ARTICLE",
          },
        });
        const existingCitation = await tx.citation.findFirst({
          where: { dealId: dbDeal.id, sourceId: source.id },
          select: { id: true },
        });
        await tx.citation.updateMany({
          where: { dealId: dbDeal.id, isPrimary: true },
          data: { isPrimary: false },
        });
        if (existingCitation) {
          await tx.citation.update({
            where: { id: existingCitation.id },
            data: { isPrimary: true },
          });
        } else {
          await tx.citation.create({
            data: { dealId: dbDeal.id, sourceId: source.id, isPrimary: true },
          });
        }
      }

      await tx.auditEvent.create({
        data: {
          entityType: "Deal",
          entityId: dbDeal.id,
          action: existing ? "WEEKLY_PROPOSAL_UPDATE" : "WEEKLY_PROPOSAL_CREATE",
          changes: {
            changedFields: decision.changedFields,
            resultingStatus: "DRAFT",
          },
          metadata: { pipeline: "WEEKLY_DEAL_SYNC", legacyId: deal.id },
        },
      });

      return decision.result;
    },
    { maxAttempts: 3, maxWait: 10_000, timeout: 30_000 },
  );
}

async function publishedCoverageRows(): Promise<CoverageRow[]> {
  const rows = await database().deal.findMany({
    where: { status: "PUBLISHED" },
    select: {
      legacyId: true,
      target: true,
      date: true,
      citations: { select: { source: { select: { url: true } } } },
    },
  });
  return rows.map((row) => ({
    legacyId: row.legacyId,
    target: row.target,
    date: row.date,
    sourceUrls: row.citations.map((citation) => citation.source.url),
  }));
}

async function persistedIdentityRows(): Promise<CoverageRow[]> {
  const rows = await database().deal.findMany({
    select: {
      legacyId: true,
      target: true,
      date: true,
      citations: { select: { source: { select: { url: true } } } },
    },
  });
  return rows.map((row) => ({
    legacyId: row.legacyId,
    target: row.target,
    date: row.date,
    sourceUrls: row.citations.map((citation) => citation.source.url),
  }));
}

async function executeSync(progress: WeeklySyncProgress | null) {
  const [beforeRows, persistedRows] = await Promise.all([
    publishedCoverageRows(),
    persistedIdentityRows(),
  ]);
  const missingWeeklyDeals = weeklyBriefingDeals.filter((deal) => !isCovered(deal, beforeRows));
  const legacyIdCollisions = missingWeeklyDeals.flatMap((weeklyDeal) =>
    persistedRows
      .filter((persistedDeal) => weeklyLegacyIdCollides(weeklyDeal, persistedDeal))
      .map((persistedDeal) => ({ weeklyDeal, persistedDeal })));
  const syncCandidates = Array.from(
    new Map(missingWeeklyDeals.map((weeklyDeal) => {
      const seedDeal = resolveSeedDeal(weeklyDeal);
      return [seedDeal.id, seedDeal] as const;
    })).values(),
  );

  console.log(`Weekly briefing cards: ${weeklyBriefingDeals.length}`);
  console.log(`Published deals before sync: ${beforeRows.length}`);
  console.log(`Missing weekly briefing cards: ${missingWeeklyDeals.length}`);
  console.log(`Deal records to sync: ${syncCandidates.length}`);
  console.log(`Missing by issue: ${JSON.stringify(groupByIssue(missingWeeklyDeals))}`);
  console.log(`Ordinal legacy-ID collisions: ${legacyIdCollisions.length}`);

  if (!applyChanges) {
    for (const collision of legacyIdCollisions) {
      console.log(
        `  ${collision.weeklyDeal.id}: ${collision.weeklyDeal.target} conflicts with ${collision.persistedDeal.target}`,
      );
    }
    console.log("Dry run only. Re-run with --apply to write the missing deals.");
    return;
  }
  if (!progress) throw new Error("Weekly sync progress is required in apply mode.");
  progress.setPlan(
    syncCandidates.length,
    weeklyBriefingDeals.length - missingWeeklyDeals.length,
  );
  if (legacyIdCollisions.length > 0) {
    throw new Error(
      "Weekly sync found ordinal legacy-ID collisions; assign stable, non-conflicting identities before applying any proposals",
    );
  }

  progress.beginSync();
  for (const [index, deal] of syncCandidates.entries()) {
    const result = await syncDeal(deal);
    progress.record(result);

    if ((index + 1) % 25 === 0 || index === syncCandidates.length - 1) {
      console.log(`Synced ${index + 1}/${syncCandidates.length} deal records...`);
    }
  }

  progress.beginVerification();
  const afterRows = await publishedCoverageRows();
  const stillMissing = weeklyBriefingDeals.filter((deal) => !isCovered(deal, afterRows));
  const latestDeal = afterRows.reduce<Date | null>(
    (latest, row) => (!latest || row.date > latest ? row.date : latest),
    null,
  );
  const counts = progress.counts();

  console.log(`Created: ${counts.inserted}`);
  console.log(`Updated draft proposals: ${counts.updated}`);
  console.log(`Published deals after sync: ${afterRows.length}`);
  console.log(`Latest published deal: ${latestDeal?.toISOString() ?? "none"}`);
  console.log(`Awaiting individual editorial review/publication: ${stillMissing.length}`);
  console.log(`Pending review by issue: ${JSON.stringify(groupByIssue(stillMissing))}`);
}

async function main() {
  if (!connectionString) throw new SafeOperationalError("database_url_missing");
  if (applyChanges) assertMutationDatabaseTargetFromEnv();
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  if (!applyChanges) {
    await executeSync(null);
    return;
  }

  const pipelineRunId = await startPipelineRun(database(), "WEEKLY_DEAL_SYNC");
  await runWeeklySyncLifecycle({
    weeklyCardCount: weeklyBriefingDeals.length,
    execute: executeSync,
    complete: (counts, metadata) => completePipelineRun(
      database(),
      pipelineRunId,
      counts,
      metadata,
    ),
    fail: (error, counts, metadata) => failPipelineRun(
      database(),
      pipelineRunId,
      error,
      counts,
      metadata,
    ),
  });
}

async function runTask() {
  await runWithPreservedCleanup({
    run: main,
    cleanup: async () => {
      await prisma?.$disconnect();
    },
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "weekly_briefing_cleanup",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask({ task: "weekly_briefing_deals", operation: "sync_weekly_deals" }, runTask)
  .catch(() => {
    process.exitCode = 1;
  });
