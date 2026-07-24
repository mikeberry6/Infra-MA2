import {
  PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION,
  PRIMARY_CITATION_APPROVAL_SCOPE,
  parseReviewedPrimaryCitationApproval,
  sha256Hex,
  type PrimaryCitationApprovalTemplate,
  type PrimaryCitationCandidate,
  type PrimaryCitationEntityType,
  type ReviewedPrimaryCitationApproval,
} from "@/modules/operations/primary-citation-remediation";
import { compareUnicodeCodePoints } from "@/lib/deterministic-string-order";
import { parseStrictJson } from "@/lib/strict-json";

export const PRIMARY_CITATION_REVIEW_WORKSHEET_SCHEMA_VERSION = 1 as const;
export const PRIMARY_CITATION_REVIEW_WORKSHEET_SCOPE =
  "PRIMARY_CITATION_SEMANTIC_REVIEW_WORKSHEET" as const;

export interface PrimaryCitationSemanticGroup {
  groupKey: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
  purpose: string;
  evidenceLabel: string | null;
  currentlyPrimary: false;
  memberCitationIds: string[];
}

export interface PrimaryCitationReviewWorksheetItem {
  entityType: PrimaryCitationEntityType;
  entityId: string;
  entityLabel: string;
  entityStatus: "PUBLISHED";
  entityUpdatedAt: string;
  groups: PrimaryCitationSemanticGroup[];
  selectedGroupKey: string | null;
}

export interface PrimaryCitationReviewUrlReference {
  groupKey: string;
  entityType: PrimaryCitationEntityType;
  entityId: string;
  entityLabel: string;
  sourceId: string;
  sourceLabel: string;
  sourceType: string;
  purpose: string;
  evidenceLabel: string | null;
  memberCitationIds: string[];
}

export interface PrimaryCitationReviewUrlIndexEntry {
  sourceUrl: string;
  hostname: string | null;
  diagnostic: "INVALID_OR_NON_HTTP_URL" | null;
  references: PrimaryCitationReviewUrlReference[];
}

export interface PrimaryCitationReviewWorksheet {
  schemaVersion: typeof PRIMARY_CITATION_REVIEW_WORKSHEET_SCHEMA_VERSION;
  scope: typeof PRIMARY_CITATION_REVIEW_WORKSHEET_SCOPE;
  sourceTemplateSchemaVersion: typeof PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION;
  sourceTemplateScope: typeof PRIMARY_CITATION_APPROVAL_SCOPE;
  sourceTemplateSha256: string;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: PrimaryCitationReviewWorksheetItem[];
  exactUrlIndex?: PrimaryCitationReviewUrlIndexEntry[];
}

export interface ReviewedPrimaryCitationReviewWorksheet
  extends PrimaryCitationReviewWorksheet {
  reviewedBy: string;
  reviewedAt: string;
  items: Array<
    PrimaryCitationReviewWorksheetItem & { selectedGroupKey: string }
  >;
}

type ExactTemplateBytes = string | Uint8Array;

type SemanticCandidate = Omit<PrimaryCitationCandidate, "citationId">;

const WORKSHEET_INSTRUCTIONS = [
  "Review every item independently. Semantic-group order uses an opaque key and is not a recommendation or quality ranking.",
  "A group combines only citations whose source and evidence fields are exactly equal; repeated URLs with different purposes or evidence labels remain separate groups.",
  "Set reviewedBy and reviewedAt, then set selectedGroupKey only after a human reviewer chooses one listed semantic group for every item.",
  "No group is preselected. If an item has no group, add accepted evidence through the editorial workflow and regenerate the neutral template and worksheet.",
  "When present, exactUrlIndex groups only identical URL strings; hostname and invalid/non-HTTP diagnostics are local navigation aids, not evidence-quality judgments.",
  "The compiler retains the complete original candidate arrays and maps a reviewed group to its lexicographically smallest equivalent opaque citation ID. Review and hash the exact compiled approval before protected apply.",
] as const;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new Error("Primary-citation review data must be JSON-serializable");
    }
    return serialized;
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function exactJsonText(value: ExactTemplateBytes): string {
  if (typeof value === "string") return value;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(value);
  } catch {
    throw new Error("Exact primary-citation review bytes must be valid UTF-8");
  }
}

function assertIsoTimestamp(value: unknown, label: string): asserts value is string {
  if (
    typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    || Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  const canonical = value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  if (new Date(value).toISOString() !== canonical) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
}

function assertCandidate(
  value: unknown,
  label: string,
): asserts value is PrimaryCitationCandidate {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const candidate = value as Record<string, unknown>;
  for (const [field, fieldValue] of [
    ["citationId", candidate.citationId],
    ["sourceId", candidate.sourceId],
    ["sourceUrl", candidate.sourceUrl],
    ["sourceType", candidate.sourceType],
    ["purpose", candidate.purpose],
  ] as const) {
    if (
      typeof fieldValue !== "string"
      || !fieldValue.trim()
      || fieldValue !== fieldValue.trim()
    ) {
      throw new Error(
        `${label}.${field} must be a non-empty string without surrounding whitespace`,
      );
    }
  }
  if (typeof candidate.sourceLabel !== "string") {
    throw new Error(`${label}.sourceLabel must be a string`);
  }
  if (
    candidate.evidenceLabel !== null
    && typeof candidate.evidenceLabel !== "string"
  ) {
    throw new Error(`${label}.evidenceLabel must be a string or null`);
  }
  if (candidate.currentlyPrimary !== false) {
    throw new Error(`${label}.currentlyPrimary must remain false`);
  }
}

function assertNeutralTemplate(
  template: PrimaryCitationApprovalTemplate,
): void {
  if (template.schemaVersion !== PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION) {
    throw new Error(
      `Neutral primary-citation template schemaVersion must be ${PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION}`,
    );
  }
  if (template.scope !== PRIMARY_CITATION_APPROVAL_SCOPE) {
    throw new Error(
      `Neutral primary-citation template scope must be ${PRIMARY_CITATION_APPROVAL_SCOPE}`,
    );
  }
  if (template.reviewedBy !== null || template.reviewedAt !== null) {
    throw new Error("Primary-citation worksheet requires an unreviewed neutral template");
  }
  assertIsoTimestamp(template.generatedAt, "Neutral template generatedAt");
  if (
    !Array.isArray(template.instructions)
    || template.instructions.some((instruction) => typeof instruction !== "string")
  ) {
    throw new Error("Neutral primary-citation template instructions must be strings");
  }
  if (!Array.isArray(template.items)) {
    throw new Error("Neutral primary-citation template items must be an array");
  }

  const entityKeys = new Set<string>();
  for (const [itemIndex, item] of template.items.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Neutral template items[${itemIndex}] must be an object`);
    }
    if (item.entityType !== "Deal" && item.entityType !== "Company") {
      throw new Error(`Neutral template items[${itemIndex}].entityType is invalid`);
    }
    if (typeof item.entityId !== "string" || !item.entityId.trim()) {
      throw new Error(`Neutral template items[${itemIndex}].entityId must be a non-empty string`);
    }
    if (typeof item.entityLabel !== "string" || !item.entityLabel.trim()) {
      throw new Error(`Neutral template items[${itemIndex}].entityLabel must be a non-empty string`);
    }
    const entityKey = `${item.entityType}:${item.entityId}`;
    if (entityKeys.has(entityKey)) {
      throw new Error(`Neutral template contains invalid or duplicate item ${entityKey}`);
    }
    entityKeys.add(entityKey);
    if (item.entityStatus !== "PUBLISHED") {
      throw new Error(`${entityKey} must retain entityStatus=PUBLISHED`);
    }
    assertIsoTimestamp(item.entityUpdatedAt, `${entityKey}.entityUpdatedAt`);
    if (item.selectedCitationId !== null) {
      throw new Error(`${entityKey}.selectedCitationId must remain null`);
    }
    if (!Array.isArray(item.candidates)) {
      throw new Error(`${entityKey}.candidates must be an array`);
    }
    const citationIds = new Set<string>();
    for (const [candidateIndex, candidate] of item.candidates.entries()) {
      assertCandidate(candidate, `${entityKey}.candidates[${candidateIndex}]`);
      if (citationIds.has(candidate.citationId)) {
        throw new Error(`${entityKey} contains duplicate candidate citation IDs`);
      }
      citationIds.add(candidate.citationId);
    }
  }
}

function assertTemplateMatchesExactBytes(
  template: PrimaryCitationApprovalTemplate,
  exactTemplateBytes: ExactTemplateBytes,
): string {
  const text = exactJsonText(exactTemplateBytes);
  let parsed: unknown;
  try {
    parsed = parseStrictJson(text);
  } catch {
    throw new Error(
      "Exact primary-citation template bytes must be valid JSON without duplicate object keys",
    );
  }
  if (canonicalJson(parsed) !== canonicalJson(template)) {
    throw new Error(
      "Exact primary-citation template bytes do not match the supplied neutral template",
    );
  }
  return sha256Hex(exactTemplateBytes);
}

function semanticCandidate(
  candidate: PrimaryCitationCandidate,
): SemanticCandidate {
  return {
    sourceId: candidate.sourceId,
    sourceLabel: candidate.sourceLabel,
    sourceUrl: candidate.sourceUrl,
    sourceType: candidate.sourceType,
    purpose: candidate.purpose,
    evidenceLabel: candidate.evidenceLabel,
    currentlyPrimary: false,
  };
}

function semanticKey(candidate: PrimaryCitationCandidate): string {
  return canonicalJson(semanticCandidate(candidate));
}

function opaqueGroupKey(input: {
  entityType: PrimaryCitationEntityType;
  entityId: string;
  semantic: SemanticCandidate;
}): string {
  return sha256Hex(canonicalJson({
    namespace: "primary-citation-semantic-group-v1",
    entityType: input.entityType,
    entityId: input.entityId,
    semantic: input.semantic,
  }));
}

function buildGroups(
  item: PrimaryCitationApprovalTemplate["items"][number],
): PrimaryCitationSemanticGroup[] {
  const grouped = new Map<
    string,
    { semantic: SemanticCandidate; memberCitationIds: string[] }
  >();
  for (const candidate of item.candidates) {
    const key = semanticKey(candidate);
    const existing = grouped.get(key);
    if (existing) {
      existing.memberCitationIds.push(candidate.citationId);
    } else {
      grouped.set(key, {
        semantic: semanticCandidate(candidate),
        memberCitationIds: [candidate.citationId],
      });
    }
  }

  const groupKeys = new Set<string>();
  return [...grouped.values()]
    .map(({ semantic, memberCitationIds }) => {
      const groupKey = opaqueGroupKey({
        entityType: item.entityType,
        entityId: item.entityId,
        semantic,
      });
      if (groupKeys.has(groupKey)) {
        throw new Error(
          `${item.entityType}:${item.entityId} produced a semantic group-key collision`,
        );
      }
      groupKeys.add(groupKey);
      return {
        groupKey,
        ...semantic,
        memberCitationIds: [...memberCitationIds].sort(compareUnicodeCodePoints),
      };
    })
    .sort((left, right) =>
      compareUnicodeCodePoints(left.groupKey, right.groupKey));
}

function compareWorksheetItems(
  left: PrimaryCitationReviewWorksheetItem,
  right: PrimaryCitationReviewWorksheetItem,
): number {
  return compareUnicodeCodePoints(left.entityType, right.entityType)
    || compareUnicodeCodePoints(left.entityLabel, right.entityLabel)
    || compareUnicodeCodePoints(left.entityId, right.entityId);
}

function buildExactUrlIndex(
  items: readonly PrimaryCitationReviewWorksheetItem[],
): PrimaryCitationReviewUrlIndexEntry[] {
  const byUrl = new Map<string, PrimaryCitationReviewUrlReference[]>();
  for (const item of items) {
    for (const group of item.groups) {
      const references = byUrl.get(group.sourceUrl) ?? [];
      references.push({
        groupKey: group.groupKey,
        entityType: item.entityType,
        entityId: item.entityId,
        entityLabel: item.entityLabel,
        sourceId: group.sourceId,
        sourceLabel: group.sourceLabel,
        sourceType: group.sourceType,
        purpose: group.purpose,
        evidenceLabel: group.evidenceLabel,
        memberCitationIds: [...group.memberCitationIds],
      });
      byUrl.set(group.sourceUrl, references);
    }
  }
  return [...byUrl.entries()]
    .map(([sourceUrl, references]) => {
      let hostname: string | null = null;
      let diagnostic: PrimaryCitationReviewUrlIndexEntry["diagnostic"] = null;
      try {
        const parsed = new URL(sourceUrl);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          hostname = parsed.hostname.toLowerCase();
        } else {
          diagnostic = "INVALID_OR_NON_HTTP_URL";
        }
      } catch {
        diagnostic = "INVALID_OR_NON_HTTP_URL";
      }
      return {
        sourceUrl,
        hostname,
        diagnostic,
        references: references.sort((left, right) =>
          compareUnicodeCodePoints(left.groupKey, right.groupKey)),
      };
    })
    .sort((left, right) =>
      compareUnicodeCodePoints(left.sourceUrl, right.sourceUrl));
}

export function buildPrimaryCitationReviewWorksheet(input: {
  neutralTemplate: PrimaryCitationApprovalTemplate;
  exactTemplateBytes: ExactTemplateBytes;
  includeExactUrlIndex?: boolean;
}): PrimaryCitationReviewWorksheet {
  assertNeutralTemplate(input.neutralTemplate);
  const sourceTemplateSha256 = assertTemplateMatchesExactBytes(
    input.neutralTemplate,
    input.exactTemplateBytes,
  );
  const items = input.neutralTemplate.items
    .map((item): PrimaryCitationReviewWorksheetItem => ({
      entityType: item.entityType,
      entityId: item.entityId,
      entityLabel: item.entityLabel,
      entityStatus: "PUBLISHED",
      entityUpdatedAt: item.entityUpdatedAt,
      groups: buildGroups(item),
      selectedGroupKey: null,
    }))
    .sort(compareWorksheetItems);

  return {
    schemaVersion: PRIMARY_CITATION_REVIEW_WORKSHEET_SCHEMA_VERSION,
    scope: PRIMARY_CITATION_REVIEW_WORKSHEET_SCOPE,
    sourceTemplateSchemaVersion: input.neutralTemplate.schemaVersion,
    sourceTemplateScope: input.neutralTemplate.scope,
    sourceTemplateSha256,
    generatedAt: input.neutralTemplate.generatedAt,
    reviewedBy: null,
    reviewedAt: null,
    instructions: [...WORKSHEET_INSTRUCTIONS],
    items,
    ...(input.includeExactUrlIndex
      ? { exactUrlIndex: buildExactUrlIndex(items) }
      : {}),
  };
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function neutralizeReviewedWorksheet(value: unknown): {
  neutralized: Record<string, unknown>;
  reviewedBy: unknown;
  reviewedAt: unknown;
  reviewedItems: Record<string, unknown>[];
} {
  const worksheet = objectValue(value, "Reviewed primary-citation worksheet");
  if (!Array.isArray(worksheet.items)) {
    throw new Error("Reviewed primary-citation worksheet items must be an array");
  }
  const reviewedItems = worksheet.items.map((item, index) =>
    objectValue(item, `Reviewed primary-citation worksheet items[${index}]`));
  return {
    neutralized: {
      ...worksheet,
      reviewedBy: null,
      reviewedAt: null,
      items: reviewedItems.map((item) => ({
        ...item,
        selectedGroupKey: null,
      })),
    },
    reviewedBy: worksheet.reviewedBy,
    reviewedAt: worksheet.reviewedAt,
    reviewedItems,
  };
}

function reviewedString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

export function compilePrimaryCitationReviewWorksheet(input: {
  freshNeutralTemplate: PrimaryCitationApprovalTemplate;
  exactTemplateBytes: ExactTemplateBytes;
  reviewedWorksheetBytes: ExactTemplateBytes;
  includeExactUrlIndex?: boolean;
  now?: Date;
}): ReviewedPrimaryCitationApproval {
  let reviewedWorksheet: unknown;
  try {
    reviewedWorksheet = parseStrictJson(exactJsonText(input.reviewedWorksheetBytes));
  } catch {
    throw new Error(
      "Reviewed primary-citation worksheet bytes must be valid JSON without duplicate object keys",
    );
  }
  const {
    neutralized,
    reviewedBy: rawReviewedBy,
    reviewedAt: rawReviewedAt,
    reviewedItems,
  } = neutralizeReviewedWorksheet(reviewedWorksheet);
  const expectedWorksheet = buildPrimaryCitationReviewWorksheet({
    neutralTemplate: input.freshNeutralTemplate,
    exactTemplateBytes: input.exactTemplateBytes,
    includeExactUrlIndex: input.includeExactUrlIndex === true,
  });
  if (canonicalJson(neutralized) !== canonicalJson(expectedWorksheet)) {
    throw new Error(
      "Reviewed primary-citation worksheet does not match the freshly derived, hash-bound neutral worksheet",
    );
  }

  const reviewedBy = reviewedString(rawReviewedBy, "reviewedBy");
  const reviewedAt = reviewedString(rawReviewedAt, "reviewedAt");
  const selectedGroupByEntity = new Map<string, string>();
  const worksheetItemByEntity = new Map(
    expectedWorksheet.items.map((item) => [
      `${item.entityType}:${item.entityId}`,
      item,
    ]),
  );
  for (const [index, expectedItem] of expectedWorksheet.items.entries()) {
    const entityKey = `${expectedItem.entityType}:${expectedItem.entityId}`;
    if (expectedItem.groups.length === 0) {
      throw new Error(
        `${entityKey} has no semantic citation group; add accepted evidence and regenerate before compiling an approval`,
      );
    }
    const selectedGroupKey = reviewedString(
      reviewedItems[index]?.selectedGroupKey,
      `${entityKey}.selectedGroupKey`,
    );
    if (!expectedItem.groups.some((group) => group.groupKey === selectedGroupKey)) {
      throw new Error(`${entityKey}.selectedGroupKey must reference one listed semantic group`);
    }
    selectedGroupByEntity.set(entityKey, selectedGroupKey);
  }

  const compiled = {
    ...input.freshNeutralTemplate,
    reviewedBy,
    reviewedAt,
    items: input.freshNeutralTemplate.items.map((item) => {
      const entityKey = `${item.entityType}:${item.entityId}`;
      const selectedGroupKey = selectedGroupByEntity.get(entityKey);
      const worksheetItem = worksheetItemByEntity.get(entityKey);
      const selectedGroup = worksheetItem?.groups.find(
        (group) => group.groupKey === selectedGroupKey,
      );
      const selectedCitationId = selectedGroup?.memberCitationIds[0];
      if (!selectedCitationId) {
        throw new Error(`${entityKey} could not resolve its reviewed semantic group`);
      }
      return {
        ...item,
        selectedCitationId,
      };
    }),
  };

  return parseReviewedPrimaryCitationApproval(
    compiled,
    input.now ?? new Date(),
  );
}
