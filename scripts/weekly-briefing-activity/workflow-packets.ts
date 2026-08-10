import { z } from "zod";
import {
  activityAuditManifestSchema,
  activityRecordSchema,
  applyRecordReview,
  computeActivityTotals,
  computeReviewedInputHash,
  deriveSecondReviewReasons,
  finalizeActivityManifest,
  hashCanonical,
  isCurrentRecordApproval,
  reviewerIdentityIssue,
  reviewNoteIssue,
  sha256Text,
  type ActivityAuditManifest,
  type ActivityRecord,
  type ReviewApproval,
} from "./index";
import { artifactFile, type ArtifactFile } from "./workflow-artifacts";

const PACKET_HASH_DOMAIN = "weekly-briefing-activity-review-packet-v2";
const PACKET_INDEX_HASH_DOMAIN = "weekly-briefing-activity-review-packet-index-v2";

export type ReviewStage = "FIRST" | "SECOND";

export interface ReviewPacketRecord {
  recordId: string;
  groupKey: string;
  baseReviewedInputHash: string;
  record: ActivityRecord;
}

export interface ReviewPacket {
  schemaVersion: 1;
  artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_PACKET";
  cutoffDate: string;
  stage: ReviewStage;
  packetId: string;
  baseManifestSha256: string;
  recordCount: number;
  records: ReviewPacketRecord[];
  packetSha256: string;
}

export interface ReviewPacketSet {
  packets: ReviewPacket[];
  files: ArtifactFile[];
  supportFiles: ArtifactFile[];
  indexFile: ArtifactFile;
}

const reviewPacketIndexSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("WEEKLY_BRIEFING_ACTIVITY_REVIEW_PACKET_INDEX"),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.enum(["FIRST", "SECOND"]),
  baseManifestSha256: z.string().regex(/^[a-f0-9]{64}$/),
  packetCount: z.number().int().nonnegative(),
  recordCount: z.number().int().nonnegative(),
  packets: z.array(z.strictObject({
    packetId: z.string().trim().min(1),
    recordCount: z.number().int().nonnegative(),
    packetSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })),
  indexSha256: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ReviewPacketIndex = z.infer<typeof reviewPacketIndexSchema>;

const compactAcceptedDecisionSchema = z.strictObject({
  baseRecordId: z.string().trim().min(1),
  baseReviewedInputHash: z.string().regex(/^[a-f0-9]{64}$/),
  evidenceOpened: z.literal(true),
  decision: z.literal("ACCEPT_RECOMMENDATION"),
  outputs: z.tuple([z.strictObject({
    notes: z.string().trim().min(1),
  })]),
});

const compactEditedDecisionSchema = z.strictObject({
  baseRecordId: z.string().trim().min(1),
  baseReviewedInputHash: z.string().regex(/^[a-f0-9]{64}$/),
  evidenceOpened: z.literal(true),
  decision: z.literal("EDITED_RECORD"),
  outputs: z.array(z.strictObject({
    reviewedRecord: activityRecordSchema,
    notes: z.string().trim().min(1),
  })).min(1),
});

const compactReviewWorksheetSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET"),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.enum(["FIRST", "SECOND"]),
  packetId: z.string().trim().min(1),
  packetSha256: z.string().regex(/^[a-f0-9]{64}$/),
  reviewer: z.string().trim().min(1),
  reviewedAt: z.string().datetime({ offset: true }),
  humanAttestation: z.strictObject({
    performedByHuman: z.literal(true),
    dispositionVerified: z.literal(true),
    classificationVerified: z.literal(true),
  }),
  decisions: z.array(z.discriminatedUnion("decision", [
    compactAcceptedDecisionSchema,
    compactEditedDecisionSchema,
  ])).min(1),
});

export type CompactReviewWorksheet = z.infer<typeof compactReviewWorksheetSchema>;

const reviewDecisionSchema = z.strictObject({
  baseRecordId: z.string().trim().min(1),
  baseReviewedInputHash: z.string().regex(/^[a-f0-9]{64}$/),
  outputs: z.array(z.strictObject({
    reviewedRecord: activityRecordSchema,
    notes: z.string().trim().min(1),
  })).min(1),
});

const reviewDecisionFileSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS"),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.enum(["FIRST", "SECOND"]),
  packetId: z.string().trim().min(1),
  packetSha256: z.string().regex(/^[a-f0-9]{64}$/),
  reviewer: z.string().trim().min(1),
  reviewedAt: z.string().datetime({ offset: true }),
  humanAttestation: z.strictObject({
    performedByHuman: z.literal(true),
    evidenceOpened: z.literal(true),
    dispositionVerified: z.literal(true),
    classificationVerified: z.literal(true),
  }),
  decisions: z.array(reviewDecisionSchema).min(1),
});

export type ReviewDecisionFile = z.infer<typeof reviewDecisionFileSchema>;

function preferredGroupKey(record: ActivityRecord): string {
  if (record.actingEntity) return `Acting entity — ${record.actingEntity.name}`;
  if (record.sponsorLineage[0]) return `Sponsor — ${record.sponsorLineage[0].sponsorName}`;
  const fundActor = [
    ...record.actors.buyers,
    ...record.actors.sellers,
    ...record.actors.jointVentureParticipants,
  ].find((actor) => ["FUND", "ADVISED_VEHICLE", "CO_INVESTMENT_VEHICLE"].includes(actor.entityKind));
  return fundActor ? `Sponsor — ${fundActor.name}` : "Other / unresolved actors";
}

function recordNeedsStage(record: ActivityRecord, stage: ReviewStage): boolean {
  if (stage === "FIRST") return !isCurrentRecordApproval(record, record.review.firstReview);
  return isCurrentRecordApproval(record, record.review.firstReview)
    && deriveSecondReviewReasons(record).length > 0
    && !isCurrentRecordApproval(record, record.review.secondReview);
}

function packetHash(packet: Omit<ReviewPacket, "packetSha256">): string {
  return hashCanonical(PACKET_HASH_DOMAIN, packet);
}

export function verifyReviewPacket(value: unknown): ReviewPacket {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Review packet must be an object");
  }
  const packet = value as ReviewPacket;
  if (!Array.isArray(packet.records) || typeof packet.packetSha256 !== "string") {
    throw new Error("Review packet is malformed");
  }
  const { packetSha256, ...withoutHash } = packet;
  if (packetHash(withoutHash) !== packetSha256) {
    throw new Error("Review packet hash does not match its contents");
  }
  if (packet.recordCount !== packet.records.length) {
    throw new Error("Review packet record count does not match its contents");
  }
  for (const item of packet.records) {
    activityRecordSchema.parse(item.record);
    if (item.recordId !== item.record.recordId
      || item.baseReviewedInputHash !== computeReviewedInputHash(item.record)) {
      throw new Error(`Review packet record binding is stale for ${item.recordId}`);
    }
  }
  return packet;
}

export function verifyReviewPacketIndex(value: unknown): ReviewPacketIndex {
  const index = reviewPacketIndexSchema.parse(value);
  const { indexSha256, ...withoutHash } = index;
  if (hashCanonical(PACKET_INDEX_HASH_DOMAIN, withoutHash) !== indexSha256) {
    throw new Error("Review packet index hash does not match its contents");
  }
  if (index.packetCount !== index.packets.length) {
    throw new Error("Review packet index count does not match its entries");
  }
  if (index.recordCount !== index.packets.reduce((total, packet) => total + packet.recordCount, 0)) {
    throw new Error("Review packet index record count is inconsistent");
  }
  if (new Set(index.packets.map((packet) => packet.packetId)).size !== index.packets.length) {
    throw new Error("Review packet index contains duplicate packet IDs");
  }
  return index;
}

function markdownInline(value: string): string {
  return value.replace(/\s+/g, " ").trim().replaceAll("|", "\\|");
}

function markdownLinkLabel(value: string): string {
  return markdownInline(value).replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function evidenceMarkdown(record: ActivityRecord): string[] {
  return record.sourceEvidence.map((source) => {
    const purposes = source.purposes.join(", ");
    const locator = source.url
      ? `[${markdownLinkLabel(source.publisher)}](${source.url})`
      : `\`${source.artifactPath}\``;
    const fallback = source.fallbackRationale
      ? ` **Fallback rationale:** ${markdownInline(source.fallbackRationale)}`
      : "";
    return `- **${source.tier} · ${purposes}** — ${locator}. ${markdownInline(source.evidenceSummary)}${fallback}`;
  });
}

function reviewerRecordMarkdown(item: ReviewPacketRecord, index: number): string[] {
  const record = item.record;
  const risks = deriveSecondReviewReasons(record);
  const sponsor = record.sponsorLineage.length > 0
    ? record.sponsorLineage.map((lineage) =>
      `${lineage.sponsorName} → ${lineage.entityName} (${lineage.relationship})`).join("; ")
    : "—";
  const actingEntity = record.actingEntity
    ? `${record.actingEntity.name} (${record.actingEntity.entityKind}; ${record.actingEntity.side})`
    : "—";
  return [
    `### ${index + 1}. \`${record.recordId}\` — ${markdownInline(record.target)}`,
    "",
    "| Review field | Evidence-derived value |",
    "| --- | --- |",
    `| **Recommended scope** | **${record.scope}** |`,
    `| Original automation candidate *(research prompt; not approval)* | ${record.candidateClassification?.candidateScope ?? "—"} |`,
    `| Recommended disposition | **${record.disposition}** |`,
    `| Acting entity | ${markdownInline(actingEntity)} |`,
    `| Sponsor lineage | ${markdownInline(sponsor)} |`,
    `| Date / sector / region | ${record.announcementDate} · ${record.sector} · ${record.region}${record.country ? ` · ${markdownInline(record.country)}` : ""} |`,
    `| Transaction structure | ${record.transactionStructure.forms.join(" / ") || "—"} |`,
    `| Independent second-review risks | ${risks.length > 0 ? risks.join(", ") : "None"} |`,
    `| Scope rationale | ${markdownInline(record.scopeRationale)} |`,
    `| Disposition rationale | ${markdownInline(record.dispositionRationale)} |`,
    "",
    "Evidence to open:",
    "",
    ...evidenceMarkdown(record),
    "",
    "Reviewer checklist:",
    "",
    "- [ ] Opened every evidence locator above.",
    "- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.",
    "- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.",
    "- [ ] Added a substantive, record-specific note.",
    "",
  ];
}

function markdownForPacket(packet: ReviewPacket): string {
  const lines = [
    `# ${packet.packetId} — ${packet.stage === "FIRST" ? "first" : "independent second"} review`,
    "",
    `Cutoff: ${packet.cutoffDate}`,
    `Records: ${packet.recordCount}`,
    `Packet hash: \`${packet.packetSha256}\``,
    "",
    "Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.",
    "",
    "Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.",
    "",
    packet.stage === "SECOND"
      ? "The second reviewer must be independent from the first reviewer and must re-open the evidence."
      : "One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.",
    "",
    "## Packet summary",
    "",
    "| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const item of packet.records) {
    const record = item.record;
    const flags = deriveSecondReviewReasons(record);
    lines.push(
      `| ${record.recordId} | ${markdownInline(record.target)} | **${record.scope}** | ${record.candidateClassification?.candidateScope ?? "—"} | ${record.disposition} | ${flags.length > 0 ? flags.join(", ") : "None"} |`,
    );
  }
  lines.push("", "## Record worksheets", "");
  packet.records.forEach((item, index) => lines.push(...reviewerRecordMarkdown(item, index)));
  while (lines.at(-1) === "") lines.pop();
  return `${lines.join("\n")}\n`;
}

function compactReviewWorksheetTemplate(packet: ReviewPacket): unknown {
  return {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET",
    cutoffDate: packet.cutoffDate,
    stage: packet.stage,
    packetId: packet.packetId,
    packetSha256: packet.packetSha256,
    reviewer: "REPLACE_WITH_HUMAN_NAME",
    reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
    humanAttestation: {
      performedByHuman: false,
      dispositionVerified: false,
      classificationVerified: false,
    },
    decisions: packet.records.map((item) => ({
      baseRecordId: item.recordId,
      baseReviewedInputHash: item.baseReviewedInputHash,
      evidenceOpened: false,
      decision: "REPLACE_WITH_ACCEPT_RECOMMENDATION_OR_EDITED_RECORD",
      outputs: [{ notes: "" }],
    })),
  };
}

function reviewTemplate(packet: ReviewPacket): unknown {
  return {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
    cutoffDate: packet.cutoffDate,
    stage: packet.stage,
    packetId: packet.packetId,
    packetSha256: packet.packetSha256,
    reviewer: "REPLACE_WITH_HUMAN_NAME",
    reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
    humanAttestation: {
      performedByHuman: false,
      evidenceOpened: false,
      dispositionVerified: false,
      classificationVerified: false,
    },
    decisions: packet.records.map((item) => ({
      baseRecordId: item.recordId,
      baseReviewedInputHash: item.baseReviewedInputHash,
      outputs: [{
        reviewedRecord: item.record,
        notes: "",
      }],
    })),
  };
}

export function isCompactReviewWorksheet(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && !Array.isArray(value)
    && (value as { artifactType?: unknown }).artifactType
      === "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET");
}

/**
 * Hydrate compact human decisions from the immutable packet. The returned
 * envelope intentionally uses the existing full decision schema so the
 * established review application remains the only approval path.
 */
export function compileCompactReviewWorksheet(input: {
  packet: ReviewPacket;
  worksheet: unknown;
}): ReviewDecisionFile {
  const packet = verifyReviewPacket(input.packet);
  const worksheet = compactReviewWorksheetSchema.parse(input.worksheet);
  if (worksheet.cutoffDate !== packet.cutoffDate
    || worksheet.stage !== packet.stage
    || worksheet.packetId !== packet.packetId
    || worksheet.packetSha256 !== packet.packetSha256) {
    throw new Error("Compact review worksheet does not match the immutable packet");
  }
  const identityProblem = reviewerIdentityIssue(worksheet.reviewer);
  if (identityProblem) throw new Error(`Invalid compact-review reviewer: ${identityProblem}`);
  if (worksheet.decisions.length !== packet.records.length) {
    throw new Error("Compact review worksheet must cover every packet record exactly once");
  }

  const packetById = new Map(packet.records.map((item) => [item.recordId, item]));
  const seen = new Set<string>();
  const decisions = worksheet.decisions.map((decision) => {
    if (seen.has(decision.baseRecordId)) {
      throw new Error(`Duplicate compact review decision for ${decision.baseRecordId}`);
    }
    seen.add(decision.baseRecordId);
    const packetRecord = packetById.get(decision.baseRecordId);
    if (!packetRecord) {
      throw new Error(`Compact review decision is out of packet: ${decision.baseRecordId}`);
    }
    if (decision.baseReviewedInputHash !== packetRecord.baseReviewedInputHash) {
      throw new Error(`Compact review base is stale for ${decision.baseRecordId}`);
    }
    for (const output of decision.outputs) {
      const notesProblem = reviewNoteIssue(output.notes);
      if (notesProblem) {
        throw new Error(`Invalid compact-review notes for ${decision.baseRecordId}: ${notesProblem}`);
      }
    }
    return {
      baseRecordId: decision.baseRecordId,
      baseReviewedInputHash: decision.baseReviewedInputHash,
      outputs: decision.decision === "ACCEPT_RECOMMENDATION"
        ? [{ reviewedRecord: packetRecord.record, notes: decision.outputs[0].notes }]
        : decision.outputs,
    };
  });

  const missing = packet.records.filter((item) => !seen.has(item.recordId));
  if (missing.length > 0) {
    throw new Error(`Compact review worksheet omits packet records: ${missing.map((item) => item.recordId).join(", ")}`);
  }

  return reviewDecisionFileSchema.parse({
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
    cutoffDate: worksheet.cutoffDate,
    stage: worksheet.stage,
    packetId: worksheet.packetId,
    packetSha256: worksheet.packetSha256,
    reviewer: worksheet.reviewer,
    reviewedAt: worksheet.reviewedAt,
    humanAttestation: {
      ...worksheet.humanAttestation,
      evidenceOpened: true,
    },
    decisions,
  });
}

/**
 * A first reviewer may expand one unsuffixed bundled announcement into the
 * legally distinct transactions it contains. Every later review is one-to-one
 * so an already reviewed identity can never be silently replaced.
 */
export function assertValidReviewedRecordExpansion(input: {
  baseRecord: ActivityRecord;
  stage: ReviewStage;
  reviewedRecords: readonly ActivityRecord[];
}): void {
  const baseRecord = activityRecordSchema.parse(input.baseRecord);
  const reviewedRecords = input.reviewedRecords.map((record) =>
    activityRecordSchema.parse(record));
  if (reviewedRecords.length === 0) {
    throw new Error(`Review decision has no output for ${baseRecord.recordId}`);
  }

  if (reviewedRecords.length === 1) {
    const [reviewed] = reviewedRecords;
    if (reviewed.recordId !== baseRecord.recordId
      || reviewed.legacyId !== baseRecord.legacyId
      || reviewed.splitSuffix !== baseRecord.splitSuffix) {
      throw new Error(`Review must preserve the candidate identity for ${baseRecord.recordId}`);
    }
    return;
  }

  if (input.stage !== "FIRST") {
    throw new Error("Only a first review may split a bundled announcement");
  }
  if (baseRecord.splitSuffix !== null) {
    throw new Error("An already split transaction cannot be expanded again");
  }

  const outputIds = new Set<string>();
  const suffixes = new Set<string>();
  for (const reviewed of reviewedRecords) {
    if (reviewed.legacyId !== baseRecord.legacyId) {
      throw new Error(`Split outputs must retain legacy ID ${baseRecord.legacyId}`);
    }
    if (reviewed.splitSuffix === null) {
      throw new Error("Every split output requires a legal-transaction suffix");
    }
    if (!reviewed.transactionStructure.isBundledAnnouncement
      || !reviewed.secondReviewRisks.some((risk) => risk.kind === "BUNDLED_LEGAL_TRANSACTIONS")) {
      throw new Error("Every split output must retain the bundled-legal-transactions second-review risk");
    }
    if (outputIds.has(reviewed.recordId) || suffixes.has(reviewed.splitSuffix)) {
      throw new Error("Split output record IDs and suffixes must be unique");
    }
    outputIds.add(reviewed.recordId);
    suffixes.add(reviewed.splitSuffix);
  }
}

function canonicalSecondReviewExceptions(manifest: ActivityAuditManifest): ActivityRecord[] {
  return manifest.records
    .filter((record) => deriveSecondReviewReasons(record).length > 0)
    .sort((left, right) => left.recordId.localeCompare(right.recordId));
}

function reviewsIndexMarkdown(input: {
  manifest: ActivityAuditManifest;
  packets: readonly ReviewPacket[];
}): string {
  const approvals = currentApprovalSummary(input.manifest);
  const exceptions = canonicalSecondReviewExceptions(input.manifest);
  const currentById = new Map(input.manifest.records.map((record) => [record.recordId, record]));
  const lines = [
    `# Weekly briefing activity review center — ${input.manifest.cutoffDate}`,
    "",
    `Manifest hash: \`${input.manifest.manifestSha256}\``,
    "",
    "This status view is regenerated from the current manifest after every successful review write. Packet and worksheet files remain immutable.",
    "",
    "## Review status",
    "",
    "| Gate | Current |",
    "| --- | ---: |",
    `| First approvals current | ${approvals.firstCurrent} / ${input.manifest.records.length} |`,
    `| First reviews pending | ${input.manifest.records.length - approvals.firstCurrent} |`,
    `| Canonical records expected to require independent second review | ${exceptions.length} |`,
    `| Second approvals currently required *(after current first review)* | ${approvals.secondRequired} |`,
    `| Second approvals current | ${approvals.secondCurrent} |`,
    "",
    "## First-review packets",
    "",
    "Each `.packet.json` is immutable and hash-bound; its Markdown worksheet is the readable derived view. Read that view, then complete the compact JSON worksheet. The compact file cannot approve a record by itself; `weekly:activity:review` compiles it and routes it through the existing fail-closed review validator.",
    "",
    "| Packet | Records | Current | Pending | Review worksheet | Compact decisions |",
    "| --- | ---: | ---: | ---: | --- | --- |",
  ];
  for (const packet of input.packets) {
    const current = packet.records.filter((item) => {
      const exact = currentById.get(item.recordId);
      if (exact) return isCurrentRecordApproval(exact, exact.review.firstReview);
      if (item.record.splitSuffix !== null) return false;
      const splitOutputs = input.manifest.records.filter((record) =>
        record.legacyId === item.record.legacyId && record.splitSuffix !== null);
      return splitOutputs.length > 0 && splitOutputs.every((record) =>
        isCurrentRecordApproval(record, record.review.firstReview));
    }).length;
    lines.push(
      `| ${packet.packetId} | ${packet.recordCount} | ${current} | ${packet.recordCount - current} | [Open](first/${packet.packetId}.md) | [Fill in](first/${packet.packetId}.worksheet.json) |`,
    );
  }
  lines.push(
    "",
    "## Independent second-review preview",
    "",
    `**NON-APPROVABLE PREVIEW — ${exceptions.length} canonical exception records.** This is planning material only, not a second-review packet or approval. The actual immutable second-review queue remains blocked until every first review is current, at which point it is regenerated from the first-reviewed record hashes and must be completed by a different human reviewer.`,
    "",
    "[Open the canonical exception preview](second-review-exception-preview.md)",
    "",
  );
  return `${lines.join("\n")}\n`;
}

function secondReviewExceptionPreviewMarkdown(manifest: ActivityAuditManifest): string {
  const exceptions = canonicalSecondReviewExceptions(manifest);
  const lines = [
    `# NON-APPROVABLE second-review exception preview — ${manifest.cutoffDate}`,
    "",
    `**PLANNING ONLY — NOT A REVIEW PACKET, SIGNATURE, OR APPROVAL. Canonical record count: ${exceptions.length}.**`,
    "",
    `Manifest hash: \`${manifest.manifestSha256}\``,
    "",
    "The actual independent second-review packet cannot be generated until every first review is current. It will be bound to the first-reviewed input hashes and must be completed by a different named human who reopens the evidence. This preview cannot be ingested by the review command.",
    "",
  ];
  exceptions.forEach((record, index) => {
    const risks = deriveSecondReviewReasons(record);
    const firstStatus = isCurrentRecordApproval(record, record.review.firstReview) ? "CURRENT" : "PENDING";
    lines.push(
      `## ${index + 1}. \`${record.recordId}\` — ${markdownInline(record.target)}`,
      "",
      `- **Recommended scope:** ${record.scope}`,
      `- **Acting entity:** ${record.actingEntity ? markdownInline(`${record.actingEntity.name} (${record.actingEntity.entityKind}; ${record.actingEntity.side})`) : "—"}`,
      `- **Risk tags:** ${risks.join(", ")}`,
      `- **First-review status:** ${firstStatus}`,
      `- **Exception rationale:** ${markdownInline(record.secondReviewRisks.map((risk) => `${risk.kind}: ${risk.detail}`).join(" | "))}`,
      "",
      "Evidence to reopen independently:",
      "",
      ...evidenceMarkdown(record),
      "",
    );
  });
  return `${lines.join("\n")}\n`;
}

export function buildReviewOverviewFiles(input: {
  manifest: ActivityAuditManifest;
  firstReviewPackets: readonly ReviewPacket[];
  runDirectory: string;
}): ArtifactFile[] {
  const manifest = activityAuditManifestSchema.parse(input.manifest);
  const packets = input.firstReviewPackets.map((packet) => verifyReviewPacket(packet));
  return [
    {
      relativePath: `${input.runDirectory}/reviews/index.md`,
      contents: reviewsIndexMarkdown({ manifest, packets }),
      sha256: "",
    },
    {
      relativePath: `${input.runDirectory}/reviews/second-review-exception-preview.md`,
      contents: secondReviewExceptionPreviewMarkdown(manifest),
      sha256: "",
    },
  ].map((file) => ({ ...file, sha256: sha256Text(file.contents) }));
}

export function buildReviewPackets(input: {
  manifest: ActivityAuditManifest;
  stage: ReviewStage;
  runDirectory: string;
  packetSize?: number;
}): ReviewPacketSet {
  const manifest = activityAuditManifestSchema.parse(input.manifest);
  const packetSize = input.packetSize ?? 24;
  if (!Number.isInteger(packetSize) || packetSize < 20 || packetSize > 25) {
    throw new Error("Review packet size must be between 20 and 25");
  }
  const queued = manifest.records
    .filter((record) => recordNeedsStage(record, input.stage))
    .map((record) => ({ record, groupKey: preferredGroupKey(record) }))
    .sort((left, right) =>
      left.groupKey.localeCompare(right.groupKey)
      || left.record.announcementDate.localeCompare(right.record.announcementDate)
      || left.record.recordId.localeCompare(right.record.recordId));

  const packets: ReviewPacket[] = [];
  const packetCount = queued.length === 0 ? 0 : Math.ceil(queued.length / packetSize);
  const balancedBaseSize = packetCount === 0 ? 0 : Math.floor(queued.length / packetCount);
  const largerPacketCount = packetCount === 0 ? 0 : queued.length % packetCount;
  let offset = 0;
  for (let packetIndex = 0; packetIndex < packetCount; packetIndex += 1) {
    const balancedSize = balancedBaseSize + (packetIndex < largerPacketCount ? 1 : 0);
    const slice = queued.slice(offset, offset + balancedSize);
    offset += balancedSize;
    const packetId = `${input.stage.toLowerCase()}-${String(packets.length + 1).padStart(3, "0")}`;
    const withoutHash = {
      schemaVersion: 1 as const,
      artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_PACKET" as const,
      cutoffDate: manifest.cutoffDate,
      stage: input.stage,
      packetId,
      baseManifestSha256: manifest.manifestSha256,
      recordCount: slice.length,
      records: slice.map(({ record, groupKey }) => ({
        recordId: record.recordId,
        groupKey,
        baseReviewedInputHash: computeReviewedInputHash(record),
        record,
      })),
    };
    packets.push({ ...withoutHash, packetSha256: packetHash(withoutHash) });
  }

  const directory = `${input.runDirectory}/reviews/${input.stage.toLowerCase()}`;
  const files = packets.flatMap((packet) => [
    artifactFile(`${directory}/${packet.packetId}.packet.json`, packet),
    {
      relativePath: `${directory}/${packet.packetId}.md`,
      contents: markdownForPacket(packet),
      sha256: "",
    },
    artifactFile(`${directory}/${packet.packetId}.review.json`, reviewTemplate(packet)),
  ]).map((file) => ({
    ...file,
    sha256: file.sha256 || sha256Text(file.contents),
  }));
  const supportFiles = [
    ...packets.map((packet) =>
      artifactFile(`${directory}/${packet.packetId}.worksheet.json`, compactReviewWorksheetTemplate(packet))),
    ...(input.stage === "FIRST" ? buildReviewOverviewFiles({
      manifest,
      firstReviewPackets: packets,
      runDirectory: input.runDirectory,
    }) : []),
  ].map((file) => ({
    ...file,
    sha256: file.sha256 || sha256Text(file.contents),
  }));
  const indexWithoutHash = {
    schemaVersion: 1 as const,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_PACKET_INDEX" as const,
    cutoffDate: manifest.cutoffDate,
    stage: input.stage,
    baseManifestSha256: manifest.manifestSha256,
    packetCount: packets.length,
    recordCount: queued.length,
    packets: packets.map((packet) => ({
      packetId: packet.packetId,
      recordCount: packet.recordCount,
      packetSha256: packet.packetSha256,
    })),
  };
  const indexFile = artifactFile(`${directory}/index.json`, {
    ...indexWithoutHash,
    indexSha256: hashCanonical(PACKET_INDEX_HASH_DOMAIN, indexWithoutHash),
  });
  return { packets, files, supportFiles, indexFile };
}

export function applyReviewDecisionFile(input: {
  manifest: ActivityAuditManifest;
  decisionFile: unknown;
  packet: ReviewPacket;
}): ActivityAuditManifest {
  const manifest = activityAuditManifestSchema.parse(input.manifest);
  const decisions = reviewDecisionFileSchema.parse(input.decisionFile);
  if (decisions.cutoffDate !== manifest.cutoffDate || decisions.packetId !== input.packet.packetId
    || decisions.stage !== input.packet.stage || decisions.packetSha256 !== input.packet.packetSha256) {
    throw new Error("Review decision envelope does not match the immutable packet");
  }
  const packetById = new Map(input.packet.records.map((item) => [item.recordId, item]));
  if (decisions.decisions.length !== input.packet.records.length) {
    throw new Error("Review decision file must cover every packet record exactly once");
  }
  const seen = new Set<string>();
  const seenNotes = new Set<string>();
  const replacementById = new Map<string, ActivityRecord[]>();
  const currentById = new Map(manifest.records.map((record) => [record.recordId, record]));
  for (const decision of decisions.decisions) {
    const baseRecordId = decision.baseRecordId;
    if (seen.has(baseRecordId)) throw new Error(`Duplicate review decision for ${baseRecordId}`);
    seen.add(baseRecordId);
    const packetRecord = packetById.get(baseRecordId);
    const current = currentById.get(baseRecordId);
    if (!packetRecord || !current) {
      throw new Error(`Review decision contains out-of-packet base record ${baseRecordId}`);
    }
    if (decision.baseReviewedInputHash !== packetRecord.baseReviewedInputHash
      || computeReviewedInputHash(current) !== packetRecord.baseReviewedInputHash) {
      throw new Error(`Review base is stale for ${baseRecordId}`);
    }
    const outputRecords = decision.outputs.map((output) => output.reviewedRecord);
    for (const output of decision.outputs) {
      const normalizedNotes = output.notes.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
      if (seenNotes.has(normalizedNotes)) {
        throw new Error("Every batch output requires distinct record-specific review notes");
      }
      seenNotes.add(normalizedNotes);
    }
    assertValidReviewedRecordExpansion({
      baseRecord: current,
      stage: decisions.stage,
      reviewedRecords: outputRecords,
    });
    const isExpansion = outputRecords.length > 1;
    const reviewed = decision.outputs.map((output) => {
      const edited = activityRecordSchema.parse({
        ...output.reviewedRecord,
        review: isExpansion
          ? { firstReview: null, secondReview: null }
          : current.review,
      });
      return applyRecordReview(edited, {
        stage: decisions.stage,
        reviewer: decisions.reviewer,
        reviewedAt: decisions.reviewedAt,
        notes: output.notes,
        humanAttestation: decisions.humanAttestation,
      });
    });
    replacementById.set(baseRecordId, reviewed);
  }

  const missingBaseRecords = input.packet.records
    .map((item) => item.recordId)
    .filter((recordId) => !seen.has(recordId));
  if (missingBaseRecords.length > 0) {
    throw new Error(`Review decision file omits packet records: ${missingBaseRecords.join(", ")}`);
  }

  const records = manifest.records.flatMap((record) =>
    replacementById.get(record.recordId) ?? [record]);
  return finalizeActivityManifest({
    ...manifest,
    status: "IN_REVIEW",
    updatedAt: decisions.reviewedAt,
    controls: { ...manifest.controls, finalApprovedTotal: null },
    records,
    totals: computeActivityTotals(records),
    publicationApproval: null,
  });
}

export function currentApprovalSummary(manifest: ActivityAuditManifest): {
  firstCurrent: number;
  secondReviewAssessmentPending: number;
  secondRequired: number;
  secondCurrent: number;
  unresolved: number;
} {
  return manifest.records.reduce((summary, record) => {
    const firstIsCurrent = isCurrentRecordApproval(record, record.review.firstReview);
    if (firstIsCurrent) summary.firstCurrent += 1;
    else summary.secondReviewAssessmentPending += 1;
    const needsSecond = deriveSecondReviewReasons(record).length > 0;
    if (firstIsCurrent && needsSecond) summary.secondRequired += 1;
    if (firstIsCurrent && needsSecond
      && isCurrentRecordApproval(record, record.review.secondReview)) summary.secondCurrent += 1;
    if (record.scope === "UNRESOLVED") summary.unresolved += 1;
    return summary;
  }, {
    firstCurrent: 0,
    secondReviewAssessmentPending: 0,
    secondRequired: 0,
    secondCurrent: 0,
    unresolved: 0,
  });
}

export type { ReviewApproval };
