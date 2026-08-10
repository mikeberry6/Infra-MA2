#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  activityAuditManifestSchema,
  activityRecordSchema,
  computeActivityTotals,
  finalizeActivityManifest,
  sha256Text,
  validateManifestForPublication,
  type ActivityAuditManifest,
  type ActivityRecord,
  type ActorEntityKind,
} from "./index";
import { artifactFile, atomicWriteArtifact, auditRunDirectory } from "./workflow-artifacts";
import { buildReviewPackets, currentApprovalSummary } from "./workflow-packets";
import { renderManifestActivityEmail } from "./render-charts";

const EDITION = "2026-08-07";
const CURATED_AT = "2026-08-09T22:45:00.000Z";
const RUN_DIRECTORY = auditRunDirectory(EDITION);
const RESEARCH_DIRECTORY = `${RUN_DIRECTORY}/research`;
const BASE_MANIFEST_PATH = `${RUN_DIRECTORY}/inputs/preclassification-manifest.json`;
const MANIFEST_PATH = `${RUN_DIRECTORY}/manifest.json`;
const EXPECTED_BASE_MANIFEST_SHA256 = "d28f74ebf17d6be50daf731262d9530a9bd0ef9417f9f433fd64804e2e13bd6f";

const RESEARCH_INPUTS = {
  universe: {
    path: `${RESEARCH_DIRECTORY}/universe-adjudication.json`,
    sha256: "be3cc1c083a27580c8371f489be02a0b8bcdd9996b90dff37c276cd8a6ddd838",
  },
  direct: {
    path: `${RESEARCH_DIRECTORY}/direct-candidate-research.json`,
    sha256: "ec16a68eea40569026f3f552495b05f6389480934077ddb6162b1a810adfcece",
  },
  portfolio: {
    path: `${RESEARCH_DIRECTORY}/portfolio-candidate-research.json`,
    sha256: "ae6b745a99d0b3cc958121736246ef758958771e456ea1a1732db8386a2e5a30",
  },
  unresolved: {
    path: `${RESEARCH_DIRECTORY}/unresolved-candidate-research.json`,
    sha256: "572ebbbad95cc40082ff3622240ed9f03111c3915f91dc6f3a5f8fa209e3bf3a",
  },
  risks: {
    path: `${RESEARCH_DIRECTORY}/verified-second-review-risks.json`,
    sha256: "8a717dd16b8396e8c87b19476285914f168f79aa137896471836239add9f6da9",
  },
} as const;

const MEDIA_TIER_REVIEW_IDS = new Set([
  "INF-2026-010", "INF-2026-019", "INF-2026-044", "INF-2026-049",
  "INF-2026-055", "INF-2026-061", "INF-2026-069", "INF-2026-100",
  "INF-2026-101", "INF-2026-110", "INF-2026-132", "INF-2026-182",
  "INF-2026-184", "INF-2026-207", "INF-2026-209", "WB-2026-05-02-007",
  "WB-2026-05-16-010", "WB-2026-05-16-013", "WB-2026-06-13-002",
  "WB-2026-06-13-006", "WB-2026-06-13-007", "WB-2026-07-03-016",
  "WB-2026-07-03-024", "WB-2026-07-31-012",
]);

const SOURCE_REPLACEMENTS: Record<string, { url: string; tier: "PRIMARY" | "INSTITUTIONAL"; publisher: string }> = {
  "INF-2026-031": {
    url: "https://inoxclean.com/assets/pdf/Media-Release-Inox-Clean-Energy-Vibrant-Energy-acquisition-%282%29.pdf",
    tier: "PRIMARY",
    publisher: "Inox Clean Energy",
  },
  "INF-2026-089": {
    url: "https://harrisonst.com/harrison-street-asset-management-sells-two-hyperscale-powered-shell-data-center-campuses-in-maryland/",
    tier: "PRIMARY",
    publisher: "Harrison Street",
  },
  "WB-2026-05-16-002": {
    url: "https://www.orrick.com/en/News/2026/05/Copenhagen-Infrastructure-Partners-and-British-International-Investment-Launch-300M-North-Star",
    tier: "INSTITUTIONAL",
    publisher: "Orrick",
  },
};

const RISK_DATE_CORRECTIONS: Record<string, string> = {
  "INF-2026-113": "2026-03-11",
  "INF-2026-123": "2026-03-11",
  "INF-2026-127": "2026-03-12",
  "INF-2026-181": "2026-04-23",
  "WB-2026-06-06-006": "2026-06-03",
  "WB-2026-07-03-008": "2026-06-30",
  "WB-2026-07-03-017": "2026-07-02",
  "WB-2026-07-31-010": "2026-07-30",
  "WB-2026-07-31-011": "2026-07-28",
  "WB-2026-08-07-004": "2026-08-06",
};

const UNRESOLVED_MIXED_OPERATING_ACTORS: Record<string, {
  name: string;
  side: ActingSide;
  sponsorName: string;
  sourceIds: string[];
}> = {
  "INF-2026-169": {
    name: "CleanPeak Energy Holdings",
    side: "BUYER",
    sponsorName: "KKR",
    sourceIds: ["transaction-INF-2026-169", "ownership-KKR-CleanPeak-2025"],
  },
  "WB-2026-07-03-026": {
    name: "Cardinal Midstream Partners",
    side: "SELLER",
    sponsorName: "EnCap Flatrock Midstream",
    sourceIds: ["transaction-WB-2026-07-03-026"],
  },
};

const MIXED_OPERATING_SPONSORS: Record<string, string> = {
  "INF-2026-013": "CPP Investments",
  "INF-2026-077": "InfraVia Capital Partners / Liberty Global / Telefonica",
  "INF-2026-113": "Ara Partners",
  "INF-2026-123": "Stonepeak",
  "INF-2026-181": "Grain Management",
  "WB-2026-06-06-006": "CVC DIF",
  "WB-2026-07-03-008": "La Caisse",
  "WB-2026-07-03-017": "Ardian",
  "WB-2026-07-31-010": "La Caisse / DigitalBridge",
  "WB-2026-08-07-004": "CVC DIF",
};

type JsonObject = Record<string, any>;
type ActingSide = NonNullable<ActivityRecord["actingEntity"]>["side"];

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sourcePublisher(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return hostname.split(".").slice(0, -1).join(".") || hostname;
}

function explainedFallback(record: ActivityRecord, publisher: string): string {
  if (record.recordId === "INF-2026-095") {
    return "No issuer announcement was available in the frozen research set; Waste Dive's contemporaneous report identifies Macquarie's DTG exit parties and records that Macquarie declined to comment."
  }
  if (record.recordId === "WB-2026-07-31-013") {
    return "No accessible bankruptcy-court filing or bidder announcement was located in the frozen research set; Bloomberg Law's contemporaneous report identifies the bidder, US$75mm stalking-horse bid, and court contingency."
  }
  return `No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; ${publisher}'s contemporaneous report identifies the parties and transaction terms used to classify ${record.target}.`;
}

function normalizeSide(value: string | undefined): ActingSide {
  if (!value) return "OTHER";
  if (value === "JOINT_VENTURE_PARTICIPANT") return "JOINT_VENTURE";
  if (value === "BUYER_OR_OPERATING_INVESTOR" || value === "BUYER_AND_DEVELOPER") return "BUYER";
  if (value === "SELLER_OR_OPERATING_DIVESTOR") return "SELLER";
  if (value === "ACQUIRER_WITH_FUND_ROLLOVER" || value === "NEW_PLATFORM_AND_SEED_ACQUIRER") return "BUYER";
  if (value === "EQUITY_PRINCIPALS_AND_OPERATING_BUYER") return "INVESTOR";
  if (value === "TAX_EQUITY_RECIPIENT_AND_PROJECT_SPONSOR") return "ISSUER";
  if (["BUYER", "SELLER", "JOINT_VENTURE", "ISSUER", "INVESTOR", "OTHER"].includes(value)) {
    return value as ActingSide;
  }
  return "OTHER";
}

function normalizeKind(value: string | undefined, scope: ActivityRecord["scope"]): ActorEntityKind {
  if (scope === "PORTFOLIO_COMPANY") {
    return value === "OPERATING_PLATFORM" ? "OPERATING_PLATFORM" : "OPERATING_PORTFOLIO_COMPANY";
  }
  if (value === "ADVISED_INVESTMENT_VEHICLE") return "ADVISED_VEHICLE";
  if (value === "NEW_PLATFORM_WITH_INSEPARABLE_SEED") return "NON_OPERATING_ACQUISITION_SPV";
  if (value === "MIXED_DIRECT_PORTFOLIO") return "FUND";
  if (["FUND", "ADVISED_VEHICLE", "CO_INVESTMENT_VEHICLE", "NON_OPERATING_ACQUISITION_SPV"].includes(value ?? "")) {
    return value as ActorEntityKind;
  }
  return "FUND";
}

function sourcePurposesForOwnership(
  source: ActivityRecord["sourceEvidence"][number],
): ActivityRecord["sourceEvidence"][number]["purposes"] {
  return [...new Set([...source.purposes, "OWNERSHIP" as const])];
}

function upsertSource(
  record: ActivityRecord,
  input: {
    sourceId: string;
    url: string;
    tier?: ActivityRecord["sourceEvidence"][number]["tier"];
    title?: string;
    publisher?: string;
    evidenceSummary?: string;
    purposes?: ActivityRecord["sourceEvidence"][number]["purposes"];
  },
): string {
  const existingIndex = record.sourceEvidence.findIndex((source) =>
    source.sourceId === input.sourceId || source.url === input.url);
  const existing = existingIndex >= 0 ? record.sourceEvidence[existingIndex] : null;
  const tier = input.tier ?? existing?.tier ?? "PRIMARY";
  const publisher = input.publisher ?? existing?.publisher ?? sourcePublisher(input.url);
  const defaultPurposes: ActivityRecord["sourceEvidence"][number]["purposes"] = [
    "TRANSACTION", "PARTIES", "ANNOUNCEMENT_DATE", "SECTOR", "REGION", "TRANSACTION_STRUCTURE",
  ];
  const purposes = [...new Set([
    ...(existing?.purposes ?? []),
    ...(input.purposes ?? (existing ? [] : defaultPurposes)),
  ])] as ActivityRecord["sourceEvidence"][number]["purposes"];
  const source: ActivityRecord["sourceEvidence"][number] = {
    sourceId: existing?.sourceId ?? input.sourceId,
    tier,
    title: input.title ?? existing?.title ?? record.target,
    publisher,
    url: input.url,
    artifactPath: null,
    publishedAt: existing?.publishedAt ?? record.announcementDate,
    retrievedAt: "2026-08-09",
    purposes,
    evidenceSummary: input.evidenceSummary ?? existing?.evidenceSummary
      ?? `Contemporaneous evidence for ${record.target}.`,
    fallbackRationale: tier === "RELIABLE_SECONDARY"
      ? explainedFallback(record, publisher)
      : null,
    contentSha256: null,
  };
  if (existingIndex >= 0) record.sourceEvidence.splice(existingIndex, 1, source);
  else record.sourceEvidence.push(source);
  return source.sourceId;
}

function firstTransactionSource(record: ActivityRecord): string {
  const source = record.sourceEvidence.find((candidate) =>
    candidate.purposes.includes("TRANSACTION") && candidate.purposes.includes("PARTIES"));
  if (!source) throw new Error(`No transaction-and-party source for ${record.recordId}`);
  return source.sourceId;
}

function qualifiedSourceIds(record: ActivityRecord, requested: readonly string[]): string[] {
  const sourceById = new Map(record.sourceEvidence.map((source) => [source.sourceId, source]));
  const qualified = requested.filter((sourceId) => {
    const source = sourceById.get(sourceId);
    return source?.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES");
  });
  return qualified.length > 0 ? [...new Set(qualified)] : [firstTransactionSource(record)];
}

function reportSourceRefs(report: JsonObject): JsonObject[] {
  const refs: JsonObject[] = [...(report.sourceRefs ?? [])];
  if (report.transactionEvidence?.url) {
    refs.push({
      sourceId: report.transactionEvidence.sourceId,
      url: report.transactionEvidence.url,
      tier: report.transactionEvidence.sourceTier,
      title: report.target,
      evidenceSummary: report.transactionEvidence.evidence,
      purposes: ["TRANSACTION", "PARTIES", "ANNOUNCEMENT_DATE", "SECTOR", "REGION", "TRANSACTION_STRUCTURE"],
    });
  }
  const ownership = report.ownershipEvidence;
  if (ownership?.url) {
    refs.push({
      sourceId: ownership.sourceId,
      url: ownership.url,
      tier: ownership.sourceTier,
      title: `${report.actingEntity?.name ?? report.target} ownership evidence`,
      evidenceSummary: ownership.evidence,
      purposes: ["OWNERSHIP"],
    });
  }
  for (const ref of ownership?.sourceRefs ?? []) refs.push({ ...ref, purposes: ["OWNERSHIP"] });
  return refs;
}

function dedupeSourceEvidence(record: ActivityRecord): void {
  const seen = new Set<string>();
  record.sourceEvidence = record.sourceEvidence.filter((source) => {
    if (seen.has(source.sourceId)) return false;
    seen.add(source.sourceId);
    return true;
  });
}

function integrateSources(record: ActivityRecord, report: JsonObject): void {
  for (const ref of reportSourceRefs(report)) {
    if (!ref.sourceId || !ref.url) continue;
    upsertSource(record, {
      sourceId: ref.sourceId,
      url: ref.url,
      tier: ref.tier ?? "PRIMARY",
      title: ref.title,
      evidenceSummary: ref.evidenceSummary,
      purposes: ref.purposes,
    });
  }

  const recommendedRepair = report.sourceAssessment?.recommendedRepair;
  const replacement = SOURCE_REPLACEMENTS[record.recordId];
  if (replacement) {
    const source = record.sourceEvidence.find((candidate) => candidate.purposes.includes("TRANSACTION"));
    if (!source) throw new Error(`Cannot replace missing transaction source for ${record.recordId}`);
    upsertSource(record, {
      sourceId: source.sourceId,
      url: replacement.url,
      tier: replacement.tier,
      publisher: replacement.publisher,
      title: source.title,
      evidenceSummary: recommendedRepair?.note ?? source.evidenceSummary,
      purposes: source.purposes,
    });
  }

  if (MEDIA_TIER_REVIEW_IDS.has(record.recordId)) {
    const source = record.sourceEvidence.find((candidate) => candidate.purposes.includes("TRANSACTION"));
    if (source) {
      source.tier = "RELIABLE_SECONDARY";
      source.fallbackRationale = explainedFallback(record, source.publisher);
    }
  }
  for (const source of record.sourceEvidence) {
    if (source.tier === "RELIABLE_SECONDARY") {
      source.fallbackRationale = explainedFallback(record, source.publisher);
    } else {
      source.fallbackRationale = null;
    }
  }
  dedupeSourceEvidence(record);
}

function reportSponsors(report: JsonObject, actingName: string): string[] {
  const explicit = report.sponsorNames
    ?? report.sponsorLineage?.map((item: JsonObject) => item.sponsor)
    ?? (report.sponsorName ? [report.sponsorName] : []);
  const values = explicit.flatMap((value: string) => value.split(/\s+\/\s+|;\s*/))
    .map((value: string) => value.trim())
    .filter(Boolean);
  return [...new Set<string>(values.length > 0 ? values : [actingName])];
}

function addPrincipal(
  actors: ActivityRecord["actors"],
  acting: NonNullable<ActivityRecord["actingEntity"]>,
  sponsorName: string | null,
): void {
  const actor = {
    name: acting.name,
    entityKind: acting.entityKind,
    isPrincipal: true,
    sponsorName,
    sourceIds: acting.sourceIds,
  } satisfies ActivityRecord["actors"]["buyers"][number];
  if (acting.side === "SELLER") actors.sellers.push(actor);
  else if (acting.side === "JOINT_VENTURE") actors.jointVentureParticipants.push(actor);
  else actors.buyers.push(actor);
}

function ownershipSummary(report: JsonObject): string {
  return report.ownershipEvidence?.evidence
    ?? report.ownershipEvidence?.note
    ?? report.ownershipEvidenceProposal?.note
    ?? report.ownershipEvidence?.sourceRefs?.[0]?.evidenceSummary
    ?? `Contemporaneous evidence confirms that the acting operating company was sponsor-owned before the announcement date.`;
}

function ownershipUrls(report: JsonObject): Array<{ sourceId?: string; url: string; tier?: string; title?: string; evidenceSummary?: string }> {
  const refs = reportSourceRefs(report).filter((ref) => ref.purposes?.includes("OWNERSHIP"));
  if (report.ownershipEvidenceProposal?.url) {
    refs.push({
      sourceId: `ownership-${report.recordId}`,
      url: report.ownershipEvidenceProposal.url,
      tier: "PRIMARY",
      title: `${report.actingEntity?.name ?? report.target} ownership evidence`,
      evidenceSummary: report.ownershipEvidenceProposal.note,
    });
  }
  return refs as Array<{ sourceId?: string; url: string; tier?: string; title?: string; evidenceSummary?: string }>;
}

function applyProposal(record: ActivityRecord, report: JsonObject): void {
  let scope = report.proposedScope as ActivityRecord["scope"];
  const actingReport = report.actingEntity ?? report.actorPrincipalCorrections?.setActingEntity;
  if (!actingReport?.name) throw new Error(`Research lacks acting entity for ${record.recordId}`);
  const kind = normalizeKind(actingReport.entityKind ?? actingReport.kind, scope);
  const side = normalizeSide(actingReport.side ?? actingReport.role);
  integrateSources(record, report);
  const actingSourceIds = qualifiedSourceIds(record, actingReport.sourceIds
    ?? [actingReport.actingEntitySourceId].filter(Boolean));
  const sponsors = reportSponsors(report, actingReport.sponsorName ?? actingReport.name);

  record.scope = scope;
  record.scopeRationale = report.rationale ?? report.classificationRationale;
  record.actingEntity = {
    name: actingReport.name,
    entityKind: kind,
    side,
    isOperatingCompany: scope === "PORTFOLIO_COMPANY",
    sourceIds: actingSourceIds,
  };
  record.actors = { buyers: [], sellers: [], jointVentureParticipants: [] };
  addPrincipal(record.actors, record.actingEntity, sponsors[0] ?? null);
  record.sponsorLineage = sponsors.map((sponsorName) => ({
    sponsorName,
    entityName: record.actingEntity!.name,
    relationship: scope === "PORTFOLIO_COMPANY" ? "INDIRECT_OWNER" : "ADVISER",
    sourceIds: actingSourceIds,
    rationale: scope === "PORTFOLIO_COMPANY"
      ? `${sponsorName} owned or backed ${record.actingEntity!.name} on the announcement date; the operating entity, not the sponsor, acted as principal.`
      : `${sponsorName} is the sponsor, manager, or adviser of the transaction principal identified by the cited evidence.`,
  }));
  record.classificationFacts = scope === "PORTFOLIO_COMPANY" ? {
    principalActorKind: kind as "OPERATING_PORTFOLIO_COMPANY" | "OPERATING_PLATFORM",
    fundVehicleActsAsPrincipal: false,
    portfolioCompanyActsAsPrincipal: true,
    fundSellsOrInvests: false,
    alreadyOwnedOperatingCompany: true,
  } : {
    principalActorKind: kind as "FUND" | "ADVISED_VEHICLE" | "CO_INVESTMENT_VEHICLE" | "NON_OPERATING_ACQUISITION_SPV",
    fundVehicleActsAsPrincipal: true,
    portfolioCompanyActsAsPrincipal: false,
    fundSellsOrInvests: true,
    alreadyOwnedOperatingCompany: false,
  };
  record.secondReviewRisks = [];
  record.transactionStructure.isMixedDirectPortfolio = false;
  record.transactionStructure.isBundledAnnouncement = false;
  record.transactionStructure.newPlatformWithInseparableSeedAcquisition =
    actingReport.kind === "NEW_PLATFORM_WITH_INSEPARABLE_SEED";
  record.transactionStructure.primaryOnlyPortfolioCompanyIssuance =
    scope === "PORTFOLIO_COMPANY" && side === "ISSUER";
  record.review = { firstReview: null, secondReview: null };

  if (scope === "PORTFOLIO_COMPANY") {
    const ownershipRefs = ownershipUrls(report);
    const ownershipSourceIds: string[] = [];
    for (const ref of ownershipRefs) {
      const sourceId = upsertSource(record, {
        sourceId: ref.sourceId ?? `ownership-${record.recordId}`,
        url: ref.url,
        tier: (ref.tier as ActivityRecord["sourceEvidence"][number]["tier"] | undefined) ?? "PRIMARY",
        title: ref.title,
        evidenceSummary: ref.evidenceSummary,
        purposes: ["OWNERSHIP"],
      });
      ownershipSourceIds.push(sourceId);
    }
    if (ownershipSourceIds.length === 0) {
      const sourceId = actingSourceIds[0];
      const source = record.sourceEvidence.find((candidate) => candidate.sourceId === sourceId)!;
      source.purposes = sourcePurposesForOwnership(source);
      ownershipSourceIds.push(sourceId);
    }
    record.ownershipEvidence = [{
      ownershipEvidenceId: `ownership-${record.recordId}`,
      entityName: record.actingEntity.name,
      sponsorName: sponsors.join(" / "),
      relationship: kind === "OPERATING_PLATFORM" ? "CONTROLLED_PLATFORM" : "INDIRECT_OWNER",
      validFrom: null,
      validThrough: null,
      confirmsOwnershipOnAnnouncementDate: true,
      sourceIds: [...new Set(ownershipSourceIds)],
      rationale: ownershipSummary(report),
    }];
    record.sponsorLineage = record.sponsorLineage.map((lineage) => ({
      ...lineage,
      sourceIds: [...new Set(ownershipSourceIds)],
    }));
  } else {
    record.ownershipEvidence = [];
  }

  const explicitRisks = Array.isArray(report.secondReviewRisks)
    ? report.secondReviewRisks.filter((item: unknown): item is JsonObject =>
      typeof item === "object" && item !== null && "kind" in item)
    : [];
  const unresolvedOperating = UNRESOLVED_MIXED_OPERATING_ACTORS[record.recordId];
  if (explicitRisks.some((risk) => risk.kind === "ACTUAL_MIXED_DIRECT_PORTFOLIO")
    && unresolvedOperating) {
    const ownershipSourceRefs = report.sourceRefs?.filter((ref: JsonObject) =>
      unresolvedOperating.sourceIds.includes(ref.sourceId)
      && (ref.sourceId.includes("ownership") || ref.sourceId.includes("transaction"))) ?? [];
    addMixedOperatingPrincipal(record, {
      operatingPrincipal: {
        ...unresolvedOperating,
        entityKind: "OPERATING_PLATFORM",
      },
      ownershipSourceRefs,
      ownershipRationale: report.rationale,
    });
    record.secondReviewRisks = explicitRisks.map((risk) => ({
      kind: risk.kind,
      detail: risk.detail,
      sourceIds: qualifiedSourceIds(record, risk.sourceIds ?? []),
    }));
  }
}

function addMixedOperatingPrincipal(record: ActivityRecord, risk: JsonObject): void {
  const operating = risk.operatingPrincipal ?? risk.operatingActor;
  if (!operating?.name) throw new Error(`Mixed risk lacks operating principal for ${record.recordId}`);
  for (const ref of risk.sourceRefs ?? []) {
    upsertSource(record, {
      sourceId: ref.sourceId,
      url: ref.url,
      tier: ref.tier ?? "PRIMARY",
      title: ref.title,
      evidenceSummary: ref.evidenceSummary,
      purposes: ref.purposes ?? ["TRANSACTION", "PARTIES", "OWNERSHIP", "TRANSACTION_STRUCTURE"],
    });
  }
  const operatingSources = qualifiedSourceIds(record, operating.sourceIds ?? []);
  const opEntity = {
    name: operating.name,
    entityKind: normalizeKind(operating.entityKind ?? operating.kind, "PORTFOLIO_COMPANY"),
    side: normalizeSide(operating.side),
    isOperatingCompany: true,
    sourceIds: operatingSources,
  } satisfies NonNullable<ActivityRecord["actingEntity"]>;
  addPrincipal(record.actors, opEntity, operating.sponsorName ?? null);
  const ownershipIds: string[] = [];
  for (const ref of risk.ownershipSourceRefs ?? []) {
    ownershipIds.push(upsertSource(record, {
      sourceId: ref.sourceId,
      url: ref.url,
      tier: ref.tier ?? "PRIMARY",
      title: ref.title,
      evidenceSummary: ref.evidenceSummary,
      purposes: ["OWNERSHIP"],
    }));
  }
  if (ownershipIds.length === 0) {
    const source = record.sourceEvidence.find((candidate) => operatingSources.includes(candidate.sourceId))!;
    source.purposes = sourcePurposesForOwnership(source);
    ownershipIds.push(source.sourceId);
  }
  record.ownershipEvidence.push({
    ownershipEvidenceId: `mixed-ownership-${record.recordId}`,
    entityName: opEntity.name,
    sponsorName: operating.sponsorName ?? "Documented sponsor lineage",
    relationship: opEntity.entityKind === "OPERATING_PLATFORM" ? "CONTROLLED_PLATFORM" : "INDIRECT_OWNER",
    validFrom: null,
    validThrough: null,
    confirmsOwnershipOnAnnouncementDate: true,
    sourceIds: [...new Set(ownershipIds)],
    rationale: risk.ownershipRationale ?? `The cited ownership evidence establishes that ${opEntity.name} was an already-owned operating company on ${record.announcementDate}.`,
  });
  record.transactionStructure.isMixedDirectPortfolio = true;
  record.classificationFacts = {
    principalActorKind: record.actingEntity!.entityKind as "FUND" | "ADVISED_VEHICLE" | "CO_INVESTMENT_VEHICLE" | "NON_OPERATING_ACQUISITION_SPV",
    fundVehicleActsAsPrincipal: true,
    portfolioCompanyActsAsPrincipal: true,
    fundSellsOrInvests: true,
    alreadyOwnedOperatingCompany: true,
  };
}

function riskActorIsDirect(actor: JsonObject): boolean {
  return /FUND|ADVISED|COINVESTMENT/.test(actor.entityKind ?? "");
}

function riskActorIsOperatingPortfolio(actor: JsonObject): boolean {
  return /OPERATING_PORTFOLIO_COMPANY|OPERATING_PLATFORM/.test(actor.entityKind ?? "");
}

function riskActorKind(actor: JsonObject, scope: ActivityRecord["scope"]): ActorEntityKind {
  if (scope === "PORTFOLIO_COMPANY") {
    return actor.entityKind === "OPERATING_PLATFORM"
      ? "OPERATING_PLATFORM"
      : "OPERATING_PORTFOLIO_COMPANY";
  }
  if (/COINVESTMENT/.test(actor.entityKind ?? "")) return "CO_INVESTMENT_VEHICLE";
  if (/ADVISED|MANAGER/.test(actor.entityKind ?? "")) return "ADVISED_VEHICLE";
  return "FUND";
}

function riskActorSide(actor: JsonObject): ActingSide {
  const role = String(actor.role ?? "").toLowerCase();
  if (/seller|divest/.test(role)) return "SELLER";
  if (/issuer|recipient|project sponsor/.test(role)) return "ISSUER";
  if (/invest|equity principal|shareholder/.test(role)) return "INVESTOR";
  if (/merger|combination|participant/.test(role)) return "JOINT_VENTURE";
  if (/buyer|acquir/.test(role)) return "BUYER";
  return "OTHER";
}

function integrateRiskEvidence(record: ActivityRecord, risk: JsonObject): {
  transactionSourceIds: string[];
  ownershipSourceIds: string[];
} {
  const transactionSourceIds: string[] = (risk.transactionEvidence ?? []).map((source: JsonObject, index: number) =>
    upsertSource(record, {
      sourceId: source.sourceId ?? `risk-transaction-${record.legacyId}-${index + 1}`,
      url: source.url,
      tier: "PRIMARY",
      title: `${record.target} transaction evidence`,
      evidenceSummary: source.finding,
      purposes: ["TRANSACTION", "PARTIES", "ANNOUNCEMENT_DATE", "SECTOR", "REGION", "TRANSACTION_STRUCTURE"],
    }));
  const ownershipSourceIds: string[] = (risk.ownershipEvidence ?? []).map((source: JsonObject, index: number) =>
    upsertSource(record, {
      sourceId: source.sourceId ?? `risk-ownership-${record.legacyId}-${index + 1}`,
      url: source.url,
      tier: "PRIMARY",
      title: `${record.target} ownership evidence`,
      evidenceSummary: source.finding,
      purposes: ["OWNERSHIP"],
    }));
  return {
    transactionSourceIds: [...new Set(transactionSourceIds.length > 0
      ? transactionSourceIds
      : [firstTransactionSource(record)])],
    ownershipSourceIds: [...new Set(ownershipSourceIds)],
  };
}

function applyRiskAdjudication(record: ActivityRecord, risk: JsonObject): void {
  const scope = risk.finalScope as ActivityRecord["scope"];
  const required = risk.secondReview?.required === true;
  const riskKinds = (risk.secondReview?.riskKinds ?? []) as Array<
    ActivityRecord["secondReviewRisks"][number]["kind"]
  >;
  const principals = risk.principalActors ?? [];
  const directActor = principals.find(riskActorIsDirect);
  const operatingActors = principals.filter(riskActorIsOperatingPortfolio);
  const evidence = integrateRiskEvidence(record, risk);
  record.announcementDate = RISK_DATE_CORRECTIONS[record.recordId] ?? record.announcementDate;

  if (scope === "PORTFOLIO_COMPANY") {
    if (operatingActors.length === 0) {
      throw new Error(`Final portfolio decision lacks an operating principal for ${record.recordId}`);
    }
    const actingName = operatingActors.map((actor: JsonObject) => actor.name).join(" / ");
    const kind = operatingActors.some((actor: JsonObject) => actor.entityKind === "OPERATING_PLATFORM")
      ? "OPERATING_PLATFORM" as const
      : "OPERATING_PORTFOLIO_COMPANY" as const;
    const side = riskActorSide(operatingActors[0]);
    const sourceIds = evidence.transactionSourceIds;
    record.scope = scope;
    record.scopeRationale = risk.secondReview?.reason
      ?? risk.recommendedCorrections?.join(" ")
      ?? `The cited evidence identifies ${actingName} as the operating transaction principal.`;
    record.actingEntity = { name: actingName, entityKind: kind, side, isOperatingCompany: true, sourceIds };
    record.actors = { buyers: [], sellers: [], jointVentureParticipants: [] };
    addPrincipal(record.actors, record.actingEntity, record.sponsorLineage[0]?.sponsorName ?? null);
    record.classificationFacts = {
      principalActorKind: kind,
      fundVehicleActsAsPrincipal: false,
      portfolioCompanyActsAsPrincipal: true,
      fundSellsOrInvests: false,
      alreadyOwnedOperatingCompany: true,
    };
    const ownershipSourceIds = evidence.ownershipSourceIds.length > 0
      ? evidence.ownershipSourceIds
      : evidence.transactionSourceIds;
    for (const sourceId of ownershipSourceIds) {
      const source = record.sourceEvidence.find((candidate) => candidate.sourceId === sourceId)!;
      source.purposes = sourcePurposesForOwnership(source);
    }
    const sponsorName = record.recordId === "WB-2026-07-31-011"
      ? "3SIIF / Amber Infrastructure"
      : record.sponsorLineage.map((lineage) => lineage.sponsorName).join(" / ") || "Documented infrastructure sponsors";
    record.ownershipEvidence = [{
      ownershipEvidenceId: `ownership-${record.recordId}`,
      entityName: actingName,
      sponsorName,
      relationship: kind === "OPERATING_PLATFORM" ? "CONTROLLED_PLATFORM" : "INDIRECT_OWNER",
      validFrom: null,
      validThrough: null,
      confirmsOwnershipOnAnnouncementDate: true,
      sourceIds: ownershipSourceIds,
      rationale: risk.ownershipEvidence?.map((item: JsonObject) => item.finding).join(" ")
        ?? `The cited evidence confirms sponsor ownership on ${record.announcementDate}.`,
    }];
    record.sponsorLineage = [{
      sponsorName,
      entityName: actingName,
      relationship: "INDIRECT_OWNER",
      sourceIds: ownershipSourceIds,
      rationale: `The cited ownership evidence establishes date-valid sponsor lineage for ${actingName}.`,
    }];
    record.transactionStructure.primaryOnlyPortfolioCompanyIssuance = record.recordId === "WB-2026-07-31-011"
      || side === "ISSUER";
    record.transactionStructure.isMixedDirectPortfolio = false;
  } else if (scope === "DIRECT_FUND" && required) {
    if (!directActor) throw new Error(`Final Direct risk lacks a fund principal for ${record.recordId}`);
    const directKind = riskActorKind(directActor, scope);
    const directEntity = {
      name: directActor.name,
      entityKind: directKind,
      side: riskActorSide(directActor),
      isOperatingCompany: false,
      sourceIds: evidence.transactionSourceIds,
    } satisfies NonNullable<ActivityRecord["actingEntity"]>;
    record.scope = scope;
    record.scopeRationale = risk.secondReview.reason;
    record.actingEntity = directEntity;
    record.actors = { buyers: [], sellers: [], jointVentureParticipants: [] };
    addPrincipal(record.actors, directEntity, directActor.name);
    record.sponsorLineage = [{
      sponsorName: directActor.name,
      entityName: directActor.name,
      relationship: "ADVISER",
      sourceIds: evidence.transactionSourceIds,
      rationale: `${directActor.name} is the direct fund, fund manager, or advised vehicle acting in the transaction.`,
    }];
    const mixed = riskKinds.includes("ACTUAL_MIXED_DIRECT_PORTFOLIO");
    if (mixed) {
      const operating = operatingActors[0];
      if (!operating) throw new Error(`Mixed risk lacks an operating principal for ${record.recordId}`);
      const opKind = riskActorKind(operating, "PORTFOLIO_COMPANY");
      const opEntity = {
        name: operating.name,
        entityKind: opKind,
        side: riskActorSide(operating),
        isOperatingCompany: true,
        sourceIds: evidence.transactionSourceIds,
      } satisfies NonNullable<ActivityRecord["actingEntity"]>;
      addPrincipal(record.actors, opEntity, MIXED_OPERATING_SPONSORS[record.recordId] ?? directActor.name);
      const ownershipSourceIds = evidence.ownershipSourceIds.length > 0
        ? evidence.ownershipSourceIds
        : evidence.transactionSourceIds;
      for (const sourceId of ownershipSourceIds) {
        const source = record.sourceEvidence.find((candidate) => candidate.sourceId === sourceId)!;
        source.purposes = sourcePurposesForOwnership(source);
      }
      record.ownershipEvidence = [{
        ownershipEvidenceId: `mixed-ownership-${record.recordId}`,
        entityName: opEntity.name,
        sponsorName: MIXED_OPERATING_SPONSORS[record.recordId] ?? directActor.name,
        relationship: opKind === "OPERATING_PLATFORM" ? "CONTROLLED_PLATFORM" : "INDIRECT_OWNER",
        validFrom: null,
        validThrough: null,
        confirmsOwnershipOnAnnouncementDate: true,
        sourceIds: ownershipSourceIds,
        rationale: risk.ownershipEvidence?.map((item: JsonObject) => item.finding).join(" ")
          ?? `The primary source establishes that ${opEntity.name} was sponsor-owned on the announcement date.`,
      }];
    }
    record.transactionStructure.isMixedDirectPortfolio = mixed;
    record.classificationFacts = {
      principalActorKind: directKind as "FUND" | "ADVISED_VEHICLE" | "CO_INVESTMENT_VEHICLE" | "NON_OPERATING_ACQUISITION_SPV",
      fundVehicleActsAsPrincipal: true,
      portfolioCompanyActsAsPrincipal: mixed,
      fundSellsOrInvests: true,
      alreadyOwnedOperatingCompany: mixed,
    };
  }

  record.transactionStructure.isBundledAnnouncement = riskKinds.includes("BUNDLED_LEGAL_TRANSACTIONS");
  record.secondReviewRisks = required ? riskKinds.map((kind) => ({
    kind,
    detail: risk.secondReview.reason,
    sourceIds: evidence.transactionSourceIds,
  })) : [];
}

function splitRiskOutputs(record: ActivityRecord, risk: JsonObject): ActivityRecord[] {
  if (risk.splitDisposition?.required !== true) return [record];
  if (record.recordId !== "INF-2026-077" || risk.splitDisposition.outputs?.length !== 2) {
    throw new Error(`Unsupported required split research for ${record.recordId}`);
  }
  const [acquisitionSpec, retailSpec] = risk.splitDisposition.outputs;
  const acquisition = structuredClone(record);
  acquisition.recordId = acquisitionSpec.recordId;
  acquisition.splitSuffix = acquisitionSpec.splitSuffix;
  acquisition.target = acquisitionSpec.target;
  acquisition.disposition = "RECLASSIFY";
  acquisition.dispositionRationale = risk.splitDisposition.reason;
  acquisition.transactionIdentityKey = sha256Text(`${record.transactionIdentityKey}|${acquisition.splitSuffix}`);

  const retail = structuredClone(record);
  retail.recordId = retailSpec.recordId;
  retail.splitSuffix = retailSpec.splitSuffix;
  retail.target = retailSpec.target;
  retail.disposition = "RECLASSIFY";
  retail.dispositionRationale = risk.splitDisposition.reason;
  retail.transactionIdentityKey = sha256Text(`${record.transactionIdentityKey}|${retail.splitSuffix}`);
  retail.scope = "PORTFOLIO_COMPANY";
  retail.scopeRationale = "nexfibre is the operating seller of the retail business to Virgin Media O2; no infrastructure fund vehicle is a legal seller or investor in this separate sale.";
  const transactionSourceIds = retail.sourceEvidence
    .filter((source) => source.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES"))
    .map((source) => source.sourceId);
  const ownershipSourceIds = retail.sourceEvidence
    .filter((source) => source.purposes.includes("OWNERSHIP"))
    .map((source) => source.sourceId);
  retail.actingEntity = {
    name: "nexfibre",
    entityKind: "OPERATING_PORTFOLIO_COMPANY",
    side: "SELLER",
    isOperatingCompany: true,
    sourceIds: transactionSourceIds,
  };
  retail.actors = { buyers: [], sellers: [], jointVentureParticipants: [] };
  addPrincipal(retail.actors, retail.actingEntity, "InfraVia Capital Partners / Liberty Global / Telefonica");
  retail.sponsorLineage = [{
    sponsorName: "InfraVia Capital Partners / Liberty Global / Telefonica",
    entityName: "nexfibre",
    relationship: "CO_SPONSOR",
    sourceIds: ownershipSourceIds,
    rationale: "The primary release identifies nexfibre as the parties' pre-existing joint venture before its onward sale of YouFibre and Brsk.",
  }];
  retail.ownershipEvidence = [{
    ownershipEvidenceId: `ownership-${retail.recordId}`,
    entityName: "nexfibre",
    sponsorName: "InfraVia Capital Partners / Liberty Global / Telefonica",
    relationship: "INDIRECT_OWNER",
    validFrom: null,
    validThrough: null,
    confirmsOwnershipOnAnnouncementDate: true,
    sourceIds: ownershipSourceIds,
    rationale: "The primary announcement identifies nexfibre as the parties' existing operating joint venture on the announcement date.",
  }];
  retail.classificationFacts = {
    principalActorKind: "OPERATING_PORTFOLIO_COMPANY",
    fundVehicleActsAsPrincipal: false,
    portfolioCompanyActsAsPrincipal: true,
    fundSellsOrInvests: false,
    alreadyOwnedOperatingCompany: true,
  };
  retail.transactionStructure.isMixedDirectPortfolio = false;
  retail.transactionStructure.isBundledAnnouncement = true;
  retail.secondReviewRisks = [{
    kind: "BUNDLED_LEGAL_TRANSACTIONS",
    detail: risk.splitDisposition.reason,
    sourceIds: transactionSourceIds,
  }];
  return [activityRecordSchema.parse(acquisition), activityRecordSchema.parse(retail)];
}

function reportRecordMap(...groups: any[]): Map<string, JsonObject> {
  const map = new Map<string, JsonObject>();
  for (const group of groups) {
    const records = Array.isArray(group) ? group : group.records;
    for (const record of records) {
      if (map.has(record.recordId)) throw new Error(`Duplicate research proposal: ${record.recordId}`);
      map.set(record.recordId, record);
    }
  }
  return map;
}

function sha256File(repoRoot: string, relativePath: string): string {
  return sha256Text(readFileSync(join(repoRoot, relativePath), "utf8"));
}

function researchIndex(repoRoot: string): any {
  const artifacts = Object.entries(RESEARCH_INPUTS).map(([id, input]) => {
    const actual = sha256File(repoRoot, input.path);
    if (actual !== input.sha256) {
      throw new Error(`Research hash mismatch for ${input.path}: expected ${input.sha256}, received ${actual}`);
    }
    return { inputArtifactId: `research-${id}`, path: input.path, sha256: actual };
  });
  return {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_RESEARCH_INDEX",
    edition: EDITION,
    generatedAt: CURATED_AT,
    artifacts,
  };
}

function buildCuratedManifest(repoRoot: string): ActivityAuditManifest {
  const baseRaw = readFileSync(join(repoRoot, BASE_MANIFEST_PATH), "utf8");
  if (sha256Text(baseRaw) !== EXPECTED_BASE_MANIFEST_SHA256) {
    throw new Error("Preclassification manifest does not match the frozen Stage 1 artifact");
  }
  const manifest = activityAuditManifestSchema.parse(JSON.parse(baseRaw));
  const index = researchIndex(repoRoot);
  const universe = readJson(join(repoRoot, RESEARCH_INPUTS.universe.path));
  const reports = reportRecordMap(
    readJson(join(repoRoot, RESEARCH_INPUTS.direct.path)),
    readJson(join(repoRoot, RESEARCH_INPUTS.portfolio.path)),
    readJson(join(repoRoot, RESEARCH_INPUTS.unresolved.path)),
  );
  const risks = readJson(join(repoRoot, RESEARCH_INPUTS.risks.path));
  const riskById = new Map((risks.records ?? risks).map((item: JsonObject) => [item.recordId, item]));
  const universeById = new Map<string, JsonObject>(
    universe.records.map((item: JsonObject) => [item.recordId, item]),
  );

  if (reports.size !== 403 || universeById.size !== 403) {
    throw new Error(`Expected 403 research decisions; received ${reports.size} classifications and ${universeById.size} universe rows`);
  }
  const records = manifest.records.flatMap((baseRecord) => {
    const record = structuredClone(baseRecord);
    const universeDecision = universeById.get(record.recordId);
    const report = reports.get(record.recordId);
    if (!universeDecision || !report) throw new Error(`Missing research for ${record.recordId}`);
    record.target = universeDecision.proposed.target;
    record.disposition = universeDecision.disposition;
    record.duplicateOfRecordId = universeDecision.disposition === "MERGE_DUPLICATE"
      ? universeDecision.canonicalRecordId
      : null;
    record.dispositionRationale = universeDecision.dispositionRationale;
    record.sector = universeDecision.proposed.sector;
    record.region = universeDecision.proposed.region;
    record.country = universeDecision.proposed.country;
    record.announcementDate = universeDecision.proposed.announcementDate;
    applyProposal(record, report);
    const risk = riskById.get(record.recordId);
    if (risk) applyRiskAdjudication(record, risk);
    return splitRiskOutputs(activityRecordSchema.parse(record), risk ?? {});
  });

  const byId = new Map(records.map((record) => [record.recordId, record]));
  for (const record of records.filter((candidate) => candidate.disposition === "MERGE_DUPLICATE")) {
    record.transactionIdentityKey = byId.get(record.duplicateOfRecordId!)!.transactionIdentityKey;
  }

  const researchFrozenInputs = index.artifacts.map((input: JsonObject) => ({
    inputArtifactId: input.inputArtifactId,
    kind: "OTHER" as const,
    path: input.path,
    sha256: input.sha256,
    recordCount: input.inputArtifactId === "research-universe" ? 403
      : input.inputArtifactId === "research-risks" ? riskById.size
        : input.inputArtifactId === "research-direct" ? 240
          : input.inputArtifactId === "research-portfolio" ? 90 : 73,
    capturedAt: CURATED_AT,
    gitCommit: null,
    notes: `Evidence-backed ${basename(input.path)} research artifact; recommendations do not constitute human review approval.`,
  }));
  const preclassificationInput = {
    inputArtifactId: "preclassification-manifest",
    kind: "OTHER" as const,
    path: BASE_MANIFEST_PATH,
    sha256: EXPECTED_BASE_MANIFEST_SHA256,
    recordCount: 403,
    capturedAt: CURATED_AT,
    gitCommit: null,
    notes: "Frozen Stage 1 manifest used as the deterministic base for evidence-backed YTD classification.",
  };

  return finalizeActivityManifest({
    ...manifest,
    updatedAt: CURATED_AT,
    status: "IN_REVIEW",
    controls: { ...manifest.controls, finalApprovedTotal: null },
    frozenInputs: [
      ...manifest.frozenInputs.filter((input) =>
        input.inputArtifactId !== preclassificationInput.inputArtifactId
        && !input.inputArtifactId.startsWith("research-")),
      preclassificationInput,
      ...researchFrozenInputs,
    ],
    records,
    totals: computeActivityTotals(records),
    publicationApproval: null,
  });
}

function main(): void {
  const repoRoot = process.cwd();
  const write = process.argv.includes("--write");
  if (!existsSync(join(repoRoot, BASE_MANIFEST_PATH))) {
    throw new Error(`Missing frozen base manifest: ${BASE_MANIFEST_PATH}`);
  }
  const manifest = buildCuratedManifest(repoRoot);
  const validation = validateManifestForPublication(manifest, {
    repositoryRoot: repoRoot,
    verifyFrozenInputFiles: true,
  });
  const dataIssues = validation.issues.filter((item) =>
    ![
      "MISSING_FIRST_REVIEW",
      "MISSING_SECOND_REVIEW",
      "MANIFEST_NOT_APPROVED",
      "MISSING_PUBLICATION_APPROVAL",
      "FINAL_CONTROL_MISMATCH",
    ]
      .includes(item.code));
  const codeCounts = validation.issues.reduce<Record<string, number>>((counts, item) => {
    counts[item.code] = (counts[item.code] ?? 0) + 1;
    return counts;
  }, {});
  const output = {
    command: "curate-august-7",
    mode: write ? "WRITE" : "DRY_RUN",
    manifestSha256: manifest.manifestSha256,
    totals: manifest.totals,
    approvalSummary: currentApprovalSummary(manifest),
    validation: { ok: validation.ok, issueCount: validation.issues.length, codeCounts, dataIssueCount: dataIssues.length },
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (dataIssues.length > 0) {
    process.stderr.write(`${JSON.stringify(dataIssues, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }
  if (!write) return;
  atomicWriteArtifact(repoRoot, artifactFile(MANIFEST_PATH, manifest));
  const sourceEmailPath = `public/email-format/${EDITION}.html`;
  const sourceEmail = readFileSync(join(repoRoot, sourceEmailPath), "utf8");
  const protectedNonChart = manifest.frozenInputs.find((input) =>
    input.inputArtifactId === "protected-non-chart-email");
  if (!protectedNonChart) throw new Error("Manifest lacks the protected non-chart input");
  const preview = renderManifestActivityEmail({
    sourceHtml: sourceEmail,
    manifest,
    expectedNonChartSha256: protectedNonChart.sha256,
  });
  atomicWriteArtifact(repoRoot, {
    relativePath: `${RUN_DIRECTORY}/preview/${EDITION}.html`,
    contents: preview.html,
    sha256: sha256Text(preview.html),
  });
  const packetSet = buildReviewPackets({ manifest, stage: "FIRST", runDirectory: RUN_DIRECTORY });
  for (const file of [...packetSet.files, ...packetSet.supportFiles, packetSet.indexFile]) {
    atomicWriteArtifact(repoRoot, file);
  }
  const report = {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_VALIDATION_REPORT",
    edition: EDITION,
    validatedAt: CURATED_AT,
    manifestSha256: manifest.manifestSha256,
    ok: validation.ok,
    issueCount: validation.issues.length,
    codeCounts,
    approvalSummary: currentApprovalSummary(manifest),
    derivedTotals: validation.derivedTotals,
    issues: validation.issues,
  };
  atomicWriteArtifact(repoRoot, artifactFile(`${RUN_DIRECTORY}/validation-report.json`, report));
}

main();
