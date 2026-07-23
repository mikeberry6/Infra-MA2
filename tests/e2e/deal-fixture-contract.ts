export const E2E_DEAL_FIXTURE_BUYER = "InfraSight E2E Infrastructure Manager";
export const E2E_DEAL_FIXTURE_SOURCE_LABEL = "InfraSight E2E fixture";
export const E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES = [
  "https://example.com/infrasight-e2e-deal-source-",
  "https://example.com/infrasight-e2e-draft-delete-",
] as const;

export const E2E_DEAL_FIXTURES = {
  publishedJourney: {
    targetPrefix: "InfraSight E2E Deal ",
    description: "Isolated end-to-end publication workflow verification record.",
  },
  csvPreview: {
    targetPrefix: "InfraSight E2E CSV Preview ",
    description: "Isolated preview-before-commit browser verification record.",
    legacyIdPrefix: "E2E-IMPORT-",
  },
  draftDelete: {
    targetPrefix: "InfraSight E2E Draft Delete ",
    description: "Isolated draft-only hard-delete policy verification record.",
  },
} as const;

export const E2E_DEAL_FIXTURE_SPECS = Object.values(E2E_DEAL_FIXTURES);

const RUN_ID_PATTERN = /^\d{13}-[a-z0-9]{6}$/;
const SOURCE_URL_PATTERN =
  /^https:\/\/example\.com\/infrasight-e2e-(?:deal-source|draft-delete)-(\d{13}-[a-z0-9]{6})$/;

export interface DealFixtureCandidate {
  legacyId: string;
  target: string;
  title: string;
  description: string;
  buyerNames: string[];
  newsMentionCount: number;
}

export interface DealFixtureValidation {
  valid: boolean;
  reasons: string[];
}

export interface DealFixtureSourceCandidate {
  label: string;
  url: string;
  citations: Array<{
    dealId: string | null;
    companyId: string | null;
  }>;
}

export function validateDealFixtureCandidate(
  candidate: DealFixtureCandidate,
): DealFixtureValidation {
  const reasons: string[] = [];
  const spec = E2E_DEAL_FIXTURE_SPECS.find(({ targetPrefix }) =>
    candidate.target.startsWith(targetPrefix),
  );

  if (!spec) {
    return { valid: false, reasons: ["target does not use an approved E2E prefix"] };
  }

  const runId = candidate.target.slice(spec.targetPrefix.length);
  if (!RUN_ID_PATTERN.test(runId)) {
    reasons.push("target does not end with a generated E2E run ID");
  }
  if (candidate.title !== `${candidate.target} acquisition`) {
    reasons.push("title does not match the generated E2E title");
  }
  if (candidate.description !== spec.description) {
    reasons.push("description does not match the approved E2E fixture");
  }
  if (!candidate.buyerNames.includes(E2E_DEAL_FIXTURE_BUYER)) {
    reasons.push("fixture buyer is missing");
  }
  if (candidate.newsMentionCount !== 0) {
    reasons.push("fixture has dependent news mentions");
  }
  if ("legacyIdPrefix" in spec && candidate.legacyId !== `${spec.legacyIdPrefix}${runId}`) {
    reasons.push("CSV fixture legacy ID does not match its generated run ID");
  }

  return { valid: reasons.length === 0, reasons };
}

export function validateDealFixtureSourceCandidate(
  candidate: DealFixtureSourceCandidate,
  fixtureDealIds: readonly string[],
): DealFixtureValidation {
  const reasons: string[] = [];
  const fixtureDealIdSet = new Set(fixtureDealIds);

  if (candidate.label !== E2E_DEAL_FIXTURE_SOURCE_LABEL) {
    reasons.push("source label does not match the approved E2E fixture");
  }
  if (!SOURCE_URL_PATTERN.test(candidate.url)) {
    reasons.push("source URL does not match an exact generated E2E pattern");
  }

  for (const citation of candidate.citations) {
    if (citation.companyId) {
      reasons.push(`source is linked to company ${citation.companyId}`);
    }
    if (!citation.dealId) {
      reasons.push("source has a citation without an E2E deal");
    } else if (!fixtureDealIdSet.has(citation.dealId)) {
      reasons.push(`source is linked to non-fixture deal ${citation.dealId}`);
    }
  }

  return { valid: reasons.length === 0, reasons: Array.from(new Set(reasons)) };
}
