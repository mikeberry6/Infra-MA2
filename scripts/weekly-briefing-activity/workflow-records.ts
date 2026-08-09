import { readFileSync } from "node:fs";
import { join } from "node:path";
import { funds } from "../../prisma/seed-data/funds";
import type { ActivityRecord, ActorEntityKind, TransactionForm } from "./schema";
import { RECOVERED_CITATIONS } from "./sources-citation-recovery";
import { expectedRegionForKnownParserGap } from "./reconcile-geography";
import { normalizeSourceUrl, normalizeTarget, sha256Canonical } from "./sources-normalize";
import type { RecoveredCitation, SeedDealRecord } from "./sources-types";

const PRIOR_AUDIT_PATH = "audits/deal-portco-flowthrough-2026-05-05.md";
const PRIOR_AUDIT_INPUT_ID = "prior-flow-through-audit";

const FUND_ALIASES = [
  "ADIA",
  "APG",
  "BCI",
  "CBRE IM",
  "CIP",
  "CPP Investments",
  "DWS",
  "ECP",
  "EQT",
  "GIC",
  "GIP",
  "GSAM",
  "IFM",
  "IMCO",
  "QIC",
  "TPG",
  ...funds.map((fund) => fund.managerName),
] as const;

const NORMALIZED_FUND_NAMES = [...new Set(FUND_ALIASES.map(normalizeTarget))]
  .filter((name) => name.length >= 3)
  .sort((left, right) => right.length - left.length);

const SECONDARY_HOST_PATTERN = /(?:reuters|bloomberg|pehub|inspiratia|ijglobal|datacenterdynamics|wastedive|windtech-international|renewableenergymagazine|pv-magazine|capacitymedia|law360|spglobal|business-standard|theasset|mercomindia|bnamericas|smartmaritimenetwork|offshore-energy|railwaygazette|theloadstar|privatedebtinvestor|inframation|ippjournal)/i;

interface PriorAuditRow {
  reference: string;
  summary: string;
}

export interface DraftRecordBuildOptions {
  repoRoot: string;
  cutoff: string;
  generatedAt: string;
}

function parsePriorAudit(repoRoot: string): Map<string, PriorAuditRow> {
  const markdown = readFileSync(join(repoRoot, PRIOR_AUDIT_PATH), "utf8");
  const rows = new Map<string, PriorAuditRow>();
  for (const line of markdown.split("\n")) {
    if (!/^\| INF-2026-\d+ \|/.test(line)) continue;
    const columns = line
      .split("|")
      .slice(1, -1)
      .map((value) => value.trim());
    if (columns.length < 10) continue;
    rows.set(columns[0], {
      reference: `${PRIOR_AUDIT_PATH}#${columns[0].toLowerCase()}`,
      summary: `${columns[7]} (${columns[8]} confidence): ${columns[9]}`,
    });
  }
  return rows;
}

function isFundName(name: string): boolean {
  const normalized = normalizeTarget(name);
  if (!normalized || /^(?:n a|undisclosed buyer|public market)$/.test(normalized)) return false;
  return NORMALIZED_FUND_NAMES.some((fund) =>
    normalized === fund
    || (fund.length >= 5 && normalized.includes(fund))
    || (normalized.length >= 5 && fund.includes(normalized)));
}

function splitNames(value: string): string[] {
  return value
    .split(/\s+\/\s+/)
    .map((name) => name.trim())
    .filter((name) => name && name !== "N/A" && name !== "—")
    .filter((name, index, values) => values.indexOf(name) === index);
}

function viaEntity(value: string): string | null {
  return value.match(/\((?:via|through)\s+([^)]+)\)/i)?.[1]?.trim() ?? null;
}

function stripVia(value: string): string {
  return value.replace(/\s*\((?:via|through)\s+[^)]+\)\s*/gi, " ").trim();
}

function actorKind(name: string, operating = false): ActorEntityKind {
  if (/undisclosed/i.test(name)) return "UNDISCLOSED";
  if (operating) return "OPERATING_PORTFOLIO_COMPANY";
  return isFundName(name) ? "FUND" : "OTHER";
}

function sourceTier(url: string, recovered: RecoveredCitation | null) {
  if (recovered) return recovered.sourceTier;
  try {
    return SECONDARY_HOST_PATTERN.test(new URL(url).hostname)
      ? "RELIABLE_SECONDARY" as const
      : "PRIMARY" as const;
  } catch {
    return "RELIABLE_SECONDARY" as const;
  }
}

function sourcePublisher(seed: SeedDealRecord, url: string): string {
  if (seed.sourceName.trim()) return seed.sourceName.trim();
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source pending verification";
  }
}

function transactionForms(seed: SeedDealRecord): TransactionForm[] {
  const values = `${seed.categories.join(" ")} ${seed.title} ${seed.description}`.toLowerCase();
  const forms: TransactionForm[] = [];
  if (/acquisition|buyout|minority stake|majority stake/.test(values)) forms.push("ACQUISITION");
  if (/sale|divest|exit/.test(values)) forms.push("SALE");
  if (/secondary/.test(values)) forms.push("SECONDARY_SALE");
  if (/follow-on|follow on/.test(values)) forms.push("FOLLOW_ON_EQUITY");
  if (/joint venture|\bjv\b/.test(values)) forms.push("JOINT_VENTURE");
  if (/platform launch|launches? .*platform|formation/.test(values)) forms.push("PLATFORM_FORMATION");
  if (/\bipo\b|initial public offering/.test(values)) forms.push("IPO");
  if (/capital raise|primary capital|growth equity|preferred equity|financing/.test(values)) forms.push("CAPITAL_RAISE");
  if (/recapital/.test(values)) forms.push("RECAPITALIZATION");
  if (/bolt-on|bolt on|portfolio company acquisition/.test(values)) forms.push("BOLT_ON");
  if (/asset sale|portfolio company divestiture/.test(values)) forms.push("ASSET_SALE");
  return [...new Set(forms.length > 0 ? forms : ["OTHER"] as TransactionForm[])];
}

function candidateScopeFor(seed: SeedDealRecord, buyerVia: string | null, sellerVia: string | null) {
  const categoryText = seed.categories.join(" ").toLowerCase();
  const fundParticipant = splitNames(`${stripVia(seed.buyer)} / ${stripVia(seed.seller)}`).some(isFundName);
  if (buyerVia || sellerVia || /bolt-on|portfolio company/.test(`${categoryText} ${seed.title}`.toLowerCase())) {
    return "PORTFOLIO_COMPANY" as const;
  }
  if (fundParticipant || /platform launch/.test(categoryText)) return "DIRECT_FUND" as const;
  return "UNRESOLVED" as const;
}

function candidateSignals(
  seed: SeedDealRecord,
  sourceId: string,
  priorAudit: PriorAuditRow | null,
  buyerVia: string | null,
  sellerVia: string | null,
) {
  const signals: NonNullable<ActivityRecord["candidateClassification"]>["signals"] = [];
  const text = `${seed.categories.join(" ")} ${seed.title}`.toLowerCase();
  if (/portfolio company/.test(text)) {
    signals.push({ kind: "EXPLICIT_PORTFOLIO_COMPANY_METADATA", detail: "Seed metadata explicitly identifies portfolio-company activity.", sourceIds: [sourceId] });
  }
  if (buyerVia || sellerVia) {
    signals.push({ kind: "VIA_LANGUAGE", detail: `Seed party data identifies an acting entity via ${buyerVia ?? sellerVia}.`, sourceIds: [sourceId] });
  }
  if (/bolt-on|bolt on/.test(text)) {
    signals.push({ kind: "BOLT_ON_LANGUAGE", detail: "Transaction metadata contains a bolt-on signal.", sourceIds: [sourceId] });
  }
  if (/bundled announcement|separate transactions|two transactions|multiple transactions/.test(
    `${seed.target} ${seed.title} ${seed.description}`.toLowerCase(),
  )) {
    signals.push({
      kind: "OTHER",
      detail: "Announcement language may describe multiple transactions; first review must verify whether they are legally distinct.",
      sourceIds: [sourceId],
    });
  }
  const matchingParties = splitNames(`${stripVia(seed.buyer)} / ${stripVia(seed.seller)}`).filter(isFundName);
  if (matchingParties.length > 0) {
    signals.push({ kind: "PARTICIPANT_NAME_MATCH", detail: `Fund-manager candidate match: ${matchingParties.join(" / ")}.`, sourceIds: [sourceId] });
  }
  if (priorAudit) {
    signals.push({ kind: "PRIOR_FLOW_THROUGH_AUDIT", detail: priorAudit.summary, sourceIds: [] });
  }
  return signals;
}

function actorAttributions(value: string, sourceId: string) {
  const via = viaEntity(value);
  const sponsors = splitNames(stripVia(value)).map((name) => ({
    name,
    entityKind: actorKind(name),
    isPrincipal: via === null,
    sponsorName: isFundName(name) ? name : null,
    sourceIds: [sourceId],
  }));
  if (!via) return sponsors;
  return [
    ...sponsors.map((actor) => ({ ...actor, isPrincipal: false })),
    {
      name: via,
      entityKind: actorKind(via, true),
      isPrincipal: true,
      sponsorName: sponsors.find((actor) => actor.sponsorName)?.name ?? null,
      sourceIds: [sourceId],
    },
  ];
}

export function buildDraftActivityRecords(
  seedRecords: readonly SeedDealRecord[],
  options: DraftRecordBuildOptions,
): ActivityRecord[] {
  const priorAuditRows = parsePriorAudit(options.repoRoot);
  const recoveredById = new Map(RECOVERED_CITATIONS.map((citation) => [citation.legacyId, citation]));
  const retrievedAt = options.generatedAt.slice(0, 10);

  return seedRecords.map((seed) => {
    const recovered = recoveredById.get(seed.legacyId) ?? null;
    const url = normalizeSourceUrl(seed.sourceUrl) ?? recovered?.url ?? null;
    if (!url) throw new Error(`No transaction citation is available for ${seed.legacyId}`);
    const sourceId = `transaction-${seed.legacyId}`;
    const priorAudit = priorAuditRows.get(seed.legacyId) ?? null;
    const buyerVia = viaEntity(seed.buyer);
    const sellerVia = viaEntity(seed.seller);
    const forms = transactionForms(seed);
    const geography = expectedRegionForKnownParserGap(seed.country);
    const requiresGeographyReclassification = Boolean(geography && geography.region !== seed.region);
    const region = requiresGeographyReclassification ? geography!.region : seed.region;
    const buyers = actorAttributions(seed.buyer, sourceId);
    const sellers = actorAttributions(seed.seller, sourceId);
    const actingName = buyerVia ?? sellerVia;
    const sponsor = [...buyers, ...sellers].find((actor) => actor.sponsorName)?.name ?? null;
    const suggestedScope = candidateScopeFor(seed, buyerVia, sellerVia);
    const signals = candidateSignals(seed, sourceId, priorAudit, buyerVia, sellerVia);
    const sourceTierValue = sourceTier(url, recovered);

    return {
      recordId: seed.legacyId,
      legacyId: seed.legacyId,
      splitSuffix: null,
      transactionIdentityKey: sha256Canonical({
        target: normalizeTarget(seed.target),
        sourceUrl: normalizeSourceUrl(url),
      }),
      target: seed.target,
      disposition: requiresGeographyReclassification ? "RECLASSIFY" : "KEEP",
      duplicateOfRecordId: null,
      dispositionRationale: requiresGeographyReclassification
        ? `Candidate requires deterministic region correction from ${seed.region} to ${region}; human universe review remains required.`
        : "Candidate is provisionally kept pending required human universe verification.",
      scope: "UNRESOLVED",
      scopeRationale: "Scope is intentionally unresolved until a human opens the evidence and verifies the acting principal.",
      candidateClassification: {
        candidateScope: suggestedScope,
        signals,
        rationale: suggestedScope === "UNRESOLVED"
          ? "No decisive automated signal is present; automation does not default the transaction to direct."
          : `Automation suggests ${suggestedScope}; this is a review candidate, not an approval.`,
        generatedBy: "weekly-briefing-activity-candidate-v2",
        generatedAt: options.generatedAt,
        priorAuditEvidenceRefs: priorAudit ? [priorAudit.reference] : [],
      },
      actors: {
        buyers,
        sellers,
        jointVentureParticipants: forms.includes("JOINT_VENTURE") ? [...buyers, ...sellers] : [],
      },
      actingEntity: actingName ? {
        name: actingName,
        entityKind: "OPERATING_PORTFOLIO_COMPANY",
        side: buyerVia ? "BUYER" : "SELLER",
        isOperatingCompany: true,
        sourceIds: [sourceId],
      } : null,
      sponsorLineage: actingName && sponsor ? [{
        sponsorName: sponsor,
        entityName: actingName,
        relationship: "INDIRECT_OWNER",
        sourceIds: [sourceId],
        rationale: "Candidate lineage inferred from explicit via-language and must be date-validated during human review.",
      }] : [],
      sector: seed.sector,
      region,
      country: seed.country,
      announcementDate: seed.announcementDate.slice(0, 10),
      transactionStructure: {
        forms,
        details: seed.categories.join(" / ") || seed.title,
        // Sale language is only a research signal. A reviewer must establish
        // whether a fund or operating company is actually exiting an asset.
        isExit: false,
        isBundledAnnouncement: false,
        isMixedDirectPortfolio: false,
        newPlatformWithInseparableSeedAcquisition: false,
        primaryOnlyPortfolioCompanyIssuance: false,
      },
      // These facts determine the authoritative scope. They deliberately stay
      // unknown/false until a reviewer verifies transaction and ownership evidence.
      classificationFacts: {
        principalActorKind: "UNKNOWN",
        fundVehicleActsAsPrincipal: false,
        portfolioCompanyActsAsPrincipal: false,
        fundSellsOrInvests: false,
        alreadyOwnedOperatingCompany: false,
      },
      secondReviewRisks: [],
      sourceEvidence: [{
        sourceId,
        tier: sourceTierValue,
        title: seed.title,
        publisher: sourcePublisher(seed, url),
        url,
        artifactPath: null,
        publishedAt: seed.announcementDate.slice(0, 10),
        retrievedAt,
        purposes: ["TRANSACTION", "PARTIES", "ANNOUNCEMENT_DATE", "SECTOR", "REGION", "TRANSACTION_STRUCTURE"],
        evidenceSummary: recovered?.rationale ?? seed.description,
        fallbackRationale: sourceTierValue === "RELIABLE_SECONDARY"
          ? "Candidate-stage fallback: reviewer must document primary-source unavailability before approval."
          : null,
        contentSha256: null,
      }],
      ownershipEvidence: [],
      priorAuditEvidence: priorAudit ? [{
        inputArtifactId: PRIOR_AUDIT_INPUT_ID,
        reference: priorAudit.reference,
        summary: priorAudit.summary,
      }] : [],
      review: { firstReview: null, secondReview: null },
    } satisfies ActivityRecord;
  });
}

export const PRIOR_FLOW_THROUGH_AUDIT_INPUT_ID = PRIOR_AUDIT_INPUT_ID;
