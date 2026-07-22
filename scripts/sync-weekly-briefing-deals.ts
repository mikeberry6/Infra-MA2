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
import { deals, type Deal } from "../prisma/seed-data/deals";
import { weeklyBriefingDeals } from "../prisma/seed-data/weekly-briefing-deals";
import {
  DEAL_CATEGORY_MAP,
  DEAL_REGION_MAP,
  DEAL_SECTOR_MAP,
  DEAL_STATUS_MAP,
} from "../src/modules/shared/enum-maps";
import { completePipelineRun, failPipelineRun, startPipelineRun } from "../src/modules/operations/pipeline-runs";

const MAX_DATE_DRIFT_MS = 14 * 24 * 60 * 60 * 1000;
const applyChanges = process.argv.includes("--apply");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type CoverageRow = {
  legacyId: string;
  target: string;
  date: Date;
};

type ParticipantSeed = {
  name: string;
  role: ParticipantRole;
  displayName?: string;
};

function normalizeTarget(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function targetsMatch(left: string, right: string): boolean {
  const a = normalizeTarget(left);
  const b = normalizeTarget(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.length >= 4 && longer.includes(shorter);
}

function datesAreNear(left: Date | string, right: Date | string): boolean {
  return Math.abs(new Date(left).getTime() - new Date(right).getTime()) <= MAX_DATE_DRIFT_MS;
}

function isCovered(weeklyDeal: Deal, rows: CoverageRow[]): boolean {
  return rows.some(
    (row) =>
      row.legacyId === weeklyDeal.id ||
      (targetsMatch(row.target, weeklyDeal.target) && datesAreNear(row.date, weeklyDeal.date)),
  );
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
  const exactId = deals.find((deal) => deal.id === weeklyDeal.id);
  if (exactId) return exactId;

  const targetAndDateMatches = deals.filter(
    (deal) => targetsMatch(deal.target, weeklyDeal.target) && datesAreNear(deal.date, weeklyDeal.date),
  );
  if (targetAndDateMatches.length === 1) return targetAndDateMatches[0];

  const sourceAndTargetMatch = targetAndDateMatches.find(
    (deal) => deal.sourceUrl === weeklyDeal.sourceUrl,
  );
  if (sourceAndTargetMatch) return sourceAndTargetMatch;

  throw new Error(`Could not resolve ${weeklyDeal.id}: ${weeklyDeal.target} to a seed deal.`);
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
    enterpriseValue: deal.enterpriseValue,
    equityValue: deal.equityValue,
    stake: deal.stake,
    dealStatus: DEAL_STATUS_MAP[deal.status] as DealStatusEnum,
    closingDate,
    assetScale: deal.assetScale,
    valuationMultiple: deal.valuationMultiple,
    fundVehicle: deal.fundVehicle,
    keyHighlights: deal.keyHighlights || [],
    status: "DRAFT" as const,
  };
}

async function syncDeal(deal: Deal): Promise<"created" | "updated"> {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.deal.findUnique({
        where: { legacyId: deal.id },
        select: { id: true, status: true },
      });
      if (existing && existing.status !== "DRAFT") {
        throw new Error(
          `${deal.id} is ${existing.status}; automation cannot modify a record that has entered review or publication`,
        );
      }
      const payload = dealPayload(deal);
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
            changedFields: ["record", "participants", "citations"],
            resultingStatus: "DRAFT",
          },
          metadata: { pipeline: "WEEKLY_DEAL_SYNC", legacyId: deal.id },
        },
      });

      return existing ? "updated" : "created";
    },
    { maxWait: 10_000, timeout: 30_000 },
  );
}

async function publishedCoverageRows(): Promise<CoverageRow[]> {
  return prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    select: { legacyId: true, target: true, date: true },
  });
}

async function main() {
  const pipelineRunId = applyChanges ? await startPipelineRun(prisma, "WEEKLY_DEAL_SYNC") : null;
  try {
  const beforeRows = await publishedCoverageRows();
  const missingWeeklyDeals = weeklyBriefingDeals.filter((deal) => !isCovered(deal, beforeRows));
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

  if (!applyChanges) {
    console.log("Dry run only. Re-run with --apply to write the missing deals.");
    return;
  }

  let created = 0;
  let updated = 0;
  for (const [index, deal] of syncCandidates.entries()) {
    const result = await syncDeal(deal);
    if (result === "created") created += 1;
    else updated += 1;

    if ((index + 1) % 25 === 0 || index === syncCandidates.length - 1) {
      console.log(`Synced ${index + 1}/${syncCandidates.length} deal records...`);
    }
  }

  const afterRows = await publishedCoverageRows();
  const stillMissing = weeklyBriefingDeals.filter((deal) => !isCovered(deal, afterRows));
  const latestDeal = afterRows.reduce<Date | null>(
    (latest, row) => (!latest || row.date > latest ? row.date : latest),
    null,
  );

  console.log(`Created: ${created}`);
  console.log(`Updated draft proposals: ${updated}`);
  console.log(`Published deals after sync: ${afterRows.length}`);
  console.log(`Latest published deal: ${latestDeal?.toISOString() ?? "none"}`);
  console.log(`Awaiting individual editorial review/publication: ${stillMissing.length}`);
  console.log(`Pending review by issue: ${JSON.stringify(groupByIssue(stillMissing))}`);
  if (pipelineRunId) {
    await completePipelineRun(prisma, pipelineRunId, {
      inserted: created,
      updated,
      skipped: weeklyBriefingDeals.length - missingWeeklyDeals.length,
    });
  }
  } catch (error) {
    if (pipelineRunId) await failPipelineRun(prisma, pipelineRunId, error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Weekly briefing deal sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
