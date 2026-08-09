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
  type ActivityAuditManifest,
  type ActivityRecord,
  type ReviewApproval,
} from "./index";
import { artifactFile, type ArtifactFile } from "./workflow-artifacts";

const PACKET_HASH_DOMAIN = "weekly-briefing-activity-review-packet-v1";
const PACKET_INDEX_HASH_DOMAIN = "weekly-briefing-activity-review-packet-index-v1";

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
  indexFile: ArtifactFile;
}

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
  return deriveSecondReviewReasons(record).length > 0
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

function markdownForPacket(packet: ReviewPacket): string {
  const lines = [
    `# ${packet.packetId} — ${packet.stage === "FIRST" ? "first" : "independent second"} review`,
    "",
    `Cutoff: ${packet.cutoffDate}`,
    `Records: ${packet.recordCount}`,
    `Packet hash: \`${packet.packetSha256}\``,
    "",
    "Open every transaction and ownership source. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. Candidate signals are suggestions only. Edit the matching `.review.json` decision outputs with the verified facts, add record-specific notes, replace the reviewer/timestamp placeholders, set every human-attestation value to `true`, then ingest it with the review command. If one bundled announcement contains multiple legally distinct transactions, add one suffixed output per transaction during first review; otherwise keep exactly one identity-preserving output.",
    "",
    packet.stage === "SECOND"
      ? "The second reviewer must be independent from the first reviewer and must re-open the evidence."
      : "Every included record requires this first human review. Ambiguous structures will be queued separately for second review.",
    "",
    "| ID | Group | Target | Candidate | Disposition | Structure / second-review flags | Evidence |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const item of packet.records) {
    const record = item.record;
    const links = record.sourceEvidence.map((source) =>
      source.url ? `[${source.publisher}](${source.url})` : `\`${source.artifactPath}\``).join("; ");
    const flags = deriveSecondReviewReasons(record);
    lines.push(
      `| ${record.recordId} | ${item.groupKey.replaceAll("|", "\\|")} | ${record.target.replaceAll("|", "\\|")} | ${record.candidateClassification?.candidateScope ?? "—"} | ${record.disposition} | ${record.transactionStructure.forms.join(" / ")}${flags.length ? `; second: ${flags.join(", ")}` : ""} | ${links} |`,
    );
  }
  return `${lines.join("\n")}\n`;
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
      || !reviewed.ambiguityFlags.includes("BUNDLED_ANNOUNCEMENT")) {
      throw new Error("Every split output must retain the bundled-announcement second-review flag");
    }
    if (outputIds.has(reviewed.recordId) || suffixes.has(reviewed.splitSuffix)) {
      throw new Error("Split output record IDs and suffixes must be unique");
    }
    outputIds.add(reviewed.recordId);
    suffixes.add(reviewed.splitSuffix);
  }
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
    sha256: file.sha256 || hashCanonical("weekly-briefing-activity-review-markdown-v1", file.contents),
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
  return { packets, files, indexFile };
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
  secondRequired: number;
  secondCurrent: number;
  unresolved: number;
} {
  return manifest.records.reduce((summary, record) => {
    if (isCurrentRecordApproval(record, record.review.firstReview)) summary.firstCurrent += 1;
    const needsSecond = deriveSecondReviewReasons(record).length > 0;
    if (needsSecond) summary.secondRequired += 1;
    if (needsSecond && isCurrentRecordApproval(record, record.review.secondReview)) summary.secondCurrent += 1;
    if (record.scope === "UNRESOLVED") summary.unresolved += 1;
    return summary;
  }, { firstCurrent: 0, secondRequired: 0, secondCurrent: 0, unresolved: 0 });
}

export type { ReviewApproval };
