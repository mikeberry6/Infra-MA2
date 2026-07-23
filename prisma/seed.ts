import "dotenv/config";
import { assertNonProductionSeedTarget } from "../src/lib/database-target";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { deals } from "./seed-data/deals";
import { funds } from "./seed-data/funds";
import { companies as portcos } from "./seed-data/companies";
import { resolveOrgName, getOrgType, NON_INFRA_FUND_ENTITIES, ORG_CANONICAL } from "./entity-resolution";
import {
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
  FUND_STATUS_MAP,
  FUND_SECTOR_MAP,
  FUND_REGION_MAP,
  COMPANY_SECTOR_MAP,
  COMPANY_REGION_MAP,
  COMPANY_STATUS_MAP,
  DEAL_SECTOR_MAP,
  DEAL_REGION_MAP,
  DEAL_CATEGORY_MAP,
  DEAL_STATUS_MAP,
  MILESTONE_CATEGORY_MAP,
} from "../src/modules/shared/enum-maps";
import {
  dedupeExactPortCoSources,
  inferCitationPurpose,
  inferSourceType,
  getSourceDisplayLabel,
} from "../src/lib/source-utils";
import type {
  OrgType,
  FundStrategy,
  FundStructure,
  FundStatusEnum,
  FundSectorEnum,
  FundRegionEnum,
  CompanySector,
  CompanyRegion,
  CompanyStatus,
  DealSector,
  DealRegion,
  DealCategory,
  DealStatusEnum,
  MilestoneCategory,
  ParticipantRole,
  CitationPurpose,
  SourceType,
} from "../src/generated/prisma/client";

assertNonProductionSeedTarget();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Helpers ─────────────────────────────────────────────────

function safeEnum<T>(map: Record<string, T>, value: string, fallback: T): T {
  return map[value] ?? fallback;
}

function parseDateSafe(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// Parse milestone date strings like "Feb 2025", "2010", "Q1 2024"
function parseMilestoneDateForSort(dateStr: string): Date | null {
  // Try direct ISO parse
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) return direct;

  // Try "Month Year" format
  const monthYear = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Try plain year
  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) return new Date(`${yearOnly[1]}-01-01`);

  // Try "Q# Year"
  const quarter = dateStr.match(/^Q(\d)\s+(\d{4})$/);
  if (quarter) {
    const month = (parseInt(quarter[1]) - 1) * 3 + 1;
    return new Date(`${quarter[2]}-${String(month).padStart(2, "0")}-01`);
  }

  return null;
}

// Split multi-buyer/seller strings like "A / B / C" or "A & B"
function splitParticipants(name: string): string[] {
  if (!name || name === "N/A" || name === "—" || name === "n/a") return [];
  // Split on " / " but not on " / " that's inside parentheses
  return name.split(/\s+\/\s+/).map((s) => s.trim()).filter(Boolean);
}

// ── Main Seed ───────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Step 1: Collect all unique organization names ──────────

  console.log("Step 1: Collecting organization names...");
  const orgNamesRaw = new Set<string>();

  // From funds
  for (const fund of funds) {
    orgNamesRaw.add(fund.managerName);
  }

  // From portcos
  for (const pc of portcos) {
    orgNamesRaw.add(pc.investmentFirm);
    for (const owner of pc.owners || []) {
      orgNamesRaw.add(owner.investmentFirm);
    }
  }

  // From deals
  for (const deal of deals) {
    for (const name of splitParticipants(deal.buyer)) {
      orgNamesRaw.add(name);
    }
    for (const name of splitParticipants(deal.seller)) {
      orgNamesRaw.add(name);
    }
    for (const arr of [
      deal.financialAdvisorBuyer,
      deal.financialAdvisorSeller,
      deal.legalAdvisorBuyer,
      deal.legalAdvisorSeller,
    ]) {
      if (arr) {
        for (const name of arr) {
          if (name && name !== "N/A" && name !== "—") orgNamesRaw.add(name);
        }
      }
    }
  }

  // Resolve to canonical names
  const canonicalToVariants = new Map<string, Set<string>>();
  for (const raw of orgNamesRaw) {
    const canonical = resolveOrgName(raw);
    if (!canonicalToVariants.has(canonical)) {
      canonicalToVariants.set(canonical, new Set());
    }
    if (raw !== canonical) {
      canonicalToVariants.get(canonical)!.add(raw);
    }
  }

  console.log(`  Found ${orgNamesRaw.size} raw names -> ${canonicalToVariants.size} canonical organizations`);

  // ── Step 2: Create Organizations + Aliases ────────────────

  console.log("Step 2: Creating organizations...");
  const orgIdMap = new Map<string, string>(); // canonical name -> DB id

  for (const [canonical, variants] of canonicalToVariants) {
    const orgType = getOrgType(canonical);
    const types: OrgType[] = orgType === "CORPORATE" ? ["CORPORATE"] : ["FUND_MANAGER"];

    const org = await prisma.organization.upsert({
      where: { name: canonical },
      update: {},
      create: {
        name: canonical,
        types,
        status: "PUBLISHED",
      },
    });
    orgIdMap.set(canonical, org.id);

    // Create aliases for all variant names
    for (const variant of variants) {
      await prisma.alias.upsert({
        where: { alias: variant },
        update: {},
        create: {
          alias: variant,
          organizationId: org.id,
        },
      });
    }
  }

  console.log(`  Created ${orgIdMap.size} organizations with aliases`);

  // Helper to resolve a name to its org DB id
  function getOrgId(name: string): string | null {
    const canonical = resolveOrgName(name);
    return orgIdMap.get(canonical) ?? null;
  }

  // ── Step 3: Create Funds ──────────────────────────────────

  console.log("Step 3: Creating funds...");
  const fundIdMap = new Map<string, string>(); // fundName -> DB id
  let fundCount = 0;

  for (const fund of funds) {
    const managerId = getOrgId(fund.managerName);
    if (!managerId) {
      console.warn(`  ⚠ No org found for fund manager: ${fund.managerName}`);
      continue;
    }

    const strategies = fund.strategies
      .map((s) => FUND_STRATEGY_MAP[s])
      .filter(Boolean) as FundStrategy[];

    const structure = safeEnum(FUND_STRUCTURE_MAP, fund.structure, "CLOSED_END" as FundStructure);
    const fundStatus = safeEnum(FUND_STATUS_MAP, fund.status, "FINANCIAL_CLOSE" as FundStatusEnum);

    const sectors = fund.sectors
      .map((s) => FUND_SECTOR_MAP[s])
      .filter(Boolean) as FundSectorEnum[];

    const regions = fund.regions
      .map((r) => FUND_REGION_MAP[r])
      .filter(Boolean) as FundRegionEnum[];

    const fundPayload = {
      managerId,
      fundName: fund.fundName,
      ticker: fund.ticker,
      investmentStrategy: fund.investmentStrategy,
      size: fund.size,
      sizeUsdMm: fund.sizeUsdMm,
      vintage: fund.vintage,
      strategies,
      structure,
      fundStatus,
      sectors,
      regions,
      sourceUrls: fund.sourceUrls,
      strategyUrl: fund.strategyUrl,
      status: "PUBLISHED" as const,
    };

    const dbFund = await prisma.fund.upsert({
      where: { legacyId: fund.id },
      update: fundPayload,
      create: {
        legacyId: fund.id,
        ...fundPayload,
      },
    });

    fundIdMap.set(fund.fundName, dbFund.id);
    fundCount++;
  }

  console.log(`  Created ${fundCount} funds`);

  // ── Step 4: Create Companies (deduplicated) ────────────────

  console.log("Step 4: Creating companies...");
  const companyIdMap = new Map<string, string>(); // "name|country" -> DB id
  let companyCount = 0;

  for (const pc of portcos) {
    const sector = safeEnum(COMPANY_SECTOR_MAP, pc.sector, "UTILITIES" as CompanySector);
    const region = safeEnum(COMPANY_REGION_MAP, pc.region, "NORTH_AMERICA" as CompanyRegion);
    const companyStatus = safeEnum(COMPANY_STATUS_MAP, pc.status, "ACTIVE" as CompanyStatus);

    const companyKey = `${pc.name}|${pc.country}`;

    // Only create the Company record once per (name, country)
    if (companyIdMap.has(companyKey)) continue;

    try {
      const company = await prisma.company.create({
        data: {
          name: pc.name,
          sector,
          subsector: pc.subsector || "",
          region,
          country: pc.country,
          countryTags: pc.countryTags || [],
          description: pc.description || "",
          companyStatus,
          website: pc.website,
          yearFounded: pc.yearFounded,
          headquarters: pc.headquarters,
          status: "PUBLISHED",
        },
      });

      companyIdMap.set(companyKey, company.id);
      companyCount++;
    } catch (err: any) {
      if (err.code === "P2002") {
        const existing = await prisma.company.findFirst({
          where: { name: pc.name, country: pc.country },
        });
        if (existing) companyIdMap.set(companyKey, existing.id);
      } else {
        logServerFailure({ task: "database_seed", operation: "create_company" }, err);
      }
    }
  }

  console.log(`  Created ${companyCount} companies`);

  // ── Step 5: Create OwnershipPeriods ───────────────────────
  // Uses investmentFirm → Organization as the primary link.
  // Falls back to ownershipVehicle → Fund when available.

  console.log("Step 5: Creating ownership periods...");
  let ownershipCount = 0;
  const ownershipSeen = new Set<string>(); // track companyId|orgId|vehicle to avoid dupes

  async function createOwnership(
    companyId: string,
    investmentFirm: string,
    ownershipVehicle: string,
    investmentYear: number | undefined,
    isActive: boolean,
    stake?: string,
    exitYear?: number,
  ) {
    const orgId = getOrgId(investmentFirm);
    if (!orgId) return;

    const vehicleName = ownershipVehicle || investmentFirm;
    const dedupeKey = `${companyId}|${orgId}|${vehicleName}`;
    if (ownershipSeen.has(dedupeKey)) return;
    ownershipSeen.add(dedupeKey);

    // Try to match fund by ownershipVehicle
    const fundId = fundIdMap.get(ownershipVehicle) || null;

    try {
      await prisma.ownershipPeriod.create({
        data: {
          companyId,
          organizationId: orgId,
          fundId,
          vehicleName,
          stake: stake || null,
          investmentYear: investmentYear || null,
          exitYear: exitYear || null,
          isActive,
        },
      });
      ownershipCount++;
    } catch (err: any) {
      if (err.code !== "P2002") {
        logServerFailure({ task: "database_seed", operation: "create_ownership" }, err);
      }
    }
  }

  for (const pc of portcos) {
    const companyKey = `${pc.name}|${pc.country}`;
    const companyId = companyIdMap.get(companyKey);
    if (!companyId) continue;

    // If the company has an owners array (consolidated multi-owner), process each owner
    if (pc.owners && pc.owners.length > 0) {
      for (const owner of pc.owners) {
        await createOwnership(
          companyId,
          owner.investmentFirm,
          owner.ownershipVehicle,
          owner.investmentYear,
          owner.status === "Active",
          owner.stake,
          owner.exitYear,
        );
      }
    } else {
      // Single-owner company: use the top-level fields
      await createOwnership(
        companyId,
        pc.investmentFirm,
        pc.ownershipVehicle,
        pc.investmentYear,
        pc.status === "Active",
      );
    }
  }

  console.log(`  Created ${ownershipCount} ownership periods`);

  // ── Step 6: Create Milestones ─────────────────────────────

  console.log("Step 6: Creating milestones...");
  let milestoneCount = 0;

  for (const pc of portcos) {
    const companyKey = `${pc.name}|${pc.country}`;
    const companyId = companyIdMap.get(companyKey);
    if (!companyId) continue;

    await prisma.milestone.deleteMany({
      where: { companyId },
    });

    if (!pc.milestones || pc.milestones.length === 0) continue;

    for (const ms of pc.milestones) {
      const category = safeEnum(MILESTONE_CATEGORY_MAP, ms.category, "OTHER" as MilestoneCategory);
      const sortDate = parseMilestoneDateForSort(ms.date);

      await prisma.milestone.create({
        data: {
          companyId,
          date: ms.date,
          event: ms.event,
          category,
          sortDate,
        },
      });
      milestoneCount++;
    }
  }

  console.log(`  Created ${milestoneCount} milestones`);

  // ── Step 7: Create Persons + ManagementRoles ──────────────

  console.log("Step 7: Creating persons and management roles...");
  const personIdMap = new Map<string, string>(); // name -> DB id
  let roleCount = 0;

  for (const pc of portcos) {
    if (!pc.management || pc.management.length === 0) continue;

    const companyKey = `${pc.name}|${pc.country}`;
    const companyId = companyIdMap.get(companyKey);
    if (!companyId) continue;

    for (const exec of pc.management) {
      // Dedup persons by name
      let personId = personIdMap.get(exec.name);
      if (!personId) {
        const person = await prisma.person.create({
          data: { name: exec.name },
        });
        personId = person.id;
        personIdMap.set(exec.name, personId);
      }

      await prisma.managementRole.create({
        data: {
          personId,
          companyId,
          title: exec.title,
        },
      });
      roleCount++;
    }
  }

  console.log(`  Created ${personIdMap.size} persons, ${roleCount} management roles`);

  // ── Step 8: Create Deals ──────────────────────────────────

  console.log("Step 8: Creating deals...");
  const dealIdMap = new Map<string, string>(); // legacyId -> DB id
  let dealCount = 0;

  for (const deal of deals) {
    const sector = safeEnum(DEAL_SECTOR_MAP, deal.sector, "DIGITAL" as DealSector);
    const region = safeEnum(DEAL_REGION_MAP, deal.region, "NORTH_AMERICA" as DealRegion);
    const dealStatus = safeEnum(DEAL_STATUS_MAP, deal.status, "ANNOUNCED" as DealStatusEnum);
    const categories = deal.category
      .map((c) => DEAL_CATEGORY_MAP[c])
      .filter(Boolean) as DealCategory[];

    const date = parseDateSafe(deal.date);
    if (!date) {
      console.warn(`  ⚠ Invalid date for deal ${deal.id}: ${deal.date}`);
      continue;
    }

    const closingDate = parseDateSafe(deal.closingDate);

    const dbDeal = await prisma.deal.upsert({
      where: { legacyId: deal.id },
      update: {},
      create: {
        legacyId: deal.id,
        title: deal.title,
        target: deal.target,
        sector,
        subsector: deal.subsector || "",
        region,
        categories,
        date,
        description: deal.description || "",
        targetDescription: deal.targetDescription || "",
        country: deal.country || "",
        enterpriseValue: deal.enterpriseValue,
        equityValue: deal.equityValue,
        stake: deal.stake,
        dealStatus,
        closingDate,
        assetScale: deal.assetScale,
        valuationMultiple: deal.valuationMultiple,
        fundVehicle: deal.fundVehicle,
        keyHighlights: deal.keyHighlights || [],
        sellerDisclosureStatus: splitParticipants(deal.seller).length > 0
          ? "DISCLOSED"
          : "LEGACY_UNREVIEWED",
        // Publication requires a traceable source. Source-less seed records
        // remain reviewable in admin but never enter the public database.
        status: deal.sourceUrl ? "PUBLISHED" : "DRAFT",
      },
    });

    dealIdMap.set(deal.id, dbDeal.id);
    dealCount++;
  }

  console.log(`  Created ${dealCount} deals`);

  // ── Step 9: Create DealParticipants ───────────────────────

  console.log("Step 9: Creating deal participants...");
  let participantCount = 0;

  for (const deal of deals) {
    const dealId = dealIdMap.get(deal.id);
    if (!dealId) continue;
    const persistedDealId = dealId;

    // Helper to create participants
    async function addParticipant(name: string, role: ParticipantRole, displayName?: string) {
      const orgId = getOrgId(name);
      if (!orgId) {
        // Create org on the fly if we missed it
        const canonical = resolveOrgName(name);
        const org = await prisma.organization.upsert({
          where: { name: canonical },
          update: {},
          create: {
            name: canonical,
            types: ["OTHER"],
            status: "PUBLISHED",
          },
        });
        orgIdMap.set(canonical, org.id);

        try {
          await prisma.dealParticipant.create({
            data: {
              dealId: persistedDealId,
              organizationId: org.id,
              role,
              displayName: displayName || null,
            },
          });
          participantCount++;
        } catch (err: any) {
          if (err.code !== "P2002") {
            logServerFailure({ task: "database_seed", operation: "create_deal_participant" }, err);
          }
        }
        return;
      }

      try {
        await prisma.dealParticipant.create({
          data: {
            dealId: persistedDealId,
            organizationId: orgId,
            role,
            displayName: displayName || null,
          },
        });
        participantCount++;
      } catch (err: any) {
        if (err.code !== "P2002") {
          logServerFailure({ task: "database_seed", operation: "create_deal_participant" }, err);
        }
      }
    }

    // Buyers
    for (const name of splitParticipants(deal.buyer)) {
      await addParticipant(name, "BUYER", deal.buyer);
    }

    // Sellers
    for (const name of splitParticipants(deal.seller)) {
      await addParticipant(name, "SELLER", deal.seller);
    }

    // Financial advisors
    if (deal.financialAdvisorBuyer) {
      for (const name of deal.financialAdvisorBuyer) {
        if (name && name !== "N/A" && name !== "—") {
          await addParticipant(name, "FINANCIAL_ADVISOR_BUYER");
        }
      }
    }
    if (deal.financialAdvisorSeller) {
      for (const name of deal.financialAdvisorSeller) {
        if (name && name !== "N/A" && name !== "—") {
          await addParticipant(name, "FINANCIAL_ADVISOR_SELLER");
        }
      }
    }

    // Legal advisors
    if (deal.legalAdvisorBuyer) {
      for (const name of deal.legalAdvisorBuyer) {
        if (name && name !== "N/A" && name !== "—") {
          await addParticipant(name, "LEGAL_ADVISOR_BUYER");
        }
      }
    }
    if (deal.legalAdvisorSeller) {
      for (const name of deal.legalAdvisorSeller) {
        if (name && name !== "N/A" && name !== "—") {
          await addParticipant(name, "LEGAL_ADVISOR_SELLER");
        }
      }
    }
  }

  console.log(`  Created ${participantCount} deal participants`);

  // ── Step 10: Create Sources + Citations ───────────────────

  console.log("Step 10: Creating sources and citations...");
  const sourceIdMap = new Map<string, string>(); // URL -> DB id
  const sourceTypeMap = new Map<string, SourceType>();
  let sourceCount = 0;
  let citationCount = 0;

  const sourceTypeRank: Record<SourceType, number> = {
    OTHER: 0,
    ARTICLE: 1,
    WEBSITE: 2,
    PRESS_RELEASE: 3,
    PRESENTATION: 4,
    SEC_FILING: 5,
  };

  // Helper to get or create a source by URL
  async function getOrCreateSource(url: string, label: string, type: SourceType = "ARTICLE"): Promise<string> {
    if (sourceIdMap.has(url)) {
      const id = sourceIdMap.get(url)!;
      const currentType = sourceTypeMap.get(url) ?? "ARTICLE";
      if (sourceTypeRank[type] > sourceTypeRank[currentType]) {
        await prisma.source.update({ where: { id }, data: { type } });
        sourceTypeMap.set(url, type);
      }
      return id;
    }

    const source = await prisma.source.upsert({
      where: { url },
      update: { type },
      create: { label, url, type },
    });
    sourceIdMap.set(url, source.id);
    sourceTypeMap.set(url, type);
    sourceCount++;
    return source.id;
  }

  // Deal sources
  for (const deal of deals) {
    const dealId = dealIdMap.get(deal.id);
    if (!dealId || !deal.sourceUrl) continue;

    const sourceId = await getOrCreateSource(deal.sourceUrl, deal.sourceName || "", "ARTICLE");
    try {
      await prisma.citation.create({
        data: { sourceId, dealId, isPrimary: true },
      });
      citationCount++;
    } catch {
      // Skip duplicates
    }
  }

  // PortCo sources
  for (const pc of portcos) {
    if (!pc.sources || pc.sources.length === 0) continue;
    const companyKey = `${pc.name}|${pc.country}`;
    const companyId = companyIdMap.get(companyKey);
    if (!companyId) continue;

    const { kept: keptSources } = dedupeExactPortCoSources(pc.sources);

    for (const [sourceIndex, src] of keptSources.entries()) {
      if (!src.url) continue;
      const sourceType = inferSourceType(src) as SourceType;
      const purpose = inferCitationPurpose(src) as CitationPurpose;
      const evidenceLabel = src.evidenceLabel || getSourceDisplayLabel({ ...src, purpose, type: sourceType });
      const sourceId = await getOrCreateSource(src.url, src.label, sourceType);
      try {
        await prisma.citation.create({
          data: { sourceId, companyId, purpose, evidenceLabel, isPrimary: sourceIndex === 0 },
        });
        citationCount++;
      } catch {
        // Skip duplicates
      }
    }
  }

  // Fund sources
  for (const fund of funds) {
    if (!fund.sourceUrls || fund.sourceUrls.length === 0) continue;
    for (const url of fund.sourceUrls) {
      if (!url) continue;
      await getOrCreateSource(url, fund.fundName, inferSourceType({ label: fund.fundName, url }) as SourceType);
    }
  }

  console.log(`  Created ${sourceCount} sources, ${citationCount} citations`);

  // ── Summary ───────────────────────────────────────────────

  console.log("\n✅ Seed complete!");
  console.log(`  Organizations: ${orgIdMap.size}`);
  console.log(`  Funds: ${fundCount}`);
  console.log(`  Companies: ${companyCount}`);
  console.log(`  Ownership Periods: ${ownershipCount}`);
  console.log(`  Milestones: ${milestoneCount}`);
  console.log(`  Persons: ${personIdMap.size}`);
  console.log(`  Management Roles: ${roleCount}`);
  console.log(`  Deals: ${dealCount}`);
  console.log(`  Deal Participants: ${participantCount}`);
  console.log(`  Sources: ${sourceCount}`);
  console.log(`  Citations: ${citationCount}`);
}

withServerTask({ task: "database_seed", operation: "seed_database" }, main)
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
