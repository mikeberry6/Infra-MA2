// Policy versions are persisted on every capture. Add a version when the approved
// scope changes. Disable a version here to revoke further processing/publication.
export const EDGAR_SOURCE_KEY = "sec-edgar-txnm";
export const FIXTURE_SOURCE_KEY = "fixture-newsletter";
export const EDGAR_CIK = "0001108426";
export const EDGAR_FORMS = ["8-K", "8-K/A"] as const;
export const EDGAR_ACCESSION_PATTERN = /^\d{10}-\d{2}-\d{6}$/;

const sharedLimits = { maxSections: 160, maxCharacters: 90_000, maxSectionCharacters: 4_000 };

const policies = [{
  sourceKey: EDGAR_SOURCE_KEY,
  version: "1",
  enabled: true,
  sourceName: "SEC EDGAR — TXNM Energy",
  permissionUrl: "https://www.sec.gov/about/privacy-information#dissemination",
  permittedContent: "TXNM Energy public 8-K and 8-K/A main HTML filings",
  retainPlainText: true,
  sendToOpenAi: true,
  publishReviewedCopy: true,
  publishSourceName: true,
  publishSourceUrl: true,
  officialDisclosure: true,
  ...sharedLimits,
}, {
  sourceKey: FIXTURE_SOURCE_KEY,
  version: "1",
  enabled: true,
  sourceName: "Synthetic newsletter fixture",
  permissionUrl: null,
  permittedContent: "Synthetic test data",
  retainPlainText: true,
  sendToOpenAi: false,
  publishReviewedCopy: true,
  publishSourceName: false,
  publishSourceUrl: false,
  officialDisclosure: false,
  ...sharedLimits,
}] as const;

type SourcePolicy = (typeof policies)[number];

export function sourcePolicy(sourceKey: string, version?: string): SourcePolicy | undefined {
  return policies.findLast((policy) => policy.sourceKey === sourceKey
    && policy.enabled && (version === undefined || policy.version === version));
}

export function edgarCanonicalUrl(accession: string): string {
  if (!EDGAR_ACCESSION_PATTERN.test(accession)) throw new Error("Invalid EDGAR accession number.");
  return `https://www.sec.gov/Archives/edgar/data/${Number(EDGAR_CIK)}/${accession.replaceAll("-", "")}/${accession}-index.htm`;
}

export function isApprovedEdgarUrl(value: string): boolean {
  const accession = value.match(/\/(\d{10}-\d{2}-\d{6})-index\.htm$/)?.[1];
  return Boolean(accession && edgarCanonicalUrl(accession) === value);
}

export function canPublishVersion(sourceKey: string, policyVersion: string): boolean {
  const fixturePublication = sourceKey !== FIXTURE_SOURCE_KEY || (process.env.VERCEL_ENV !== "production"
    && (process.env.NODE_ENV === "test" || process.env.NEWS_FIXTURE_PUBLICATION === "true"));
  return fixturePublication && sourcePolicy(sourceKey, policyVersion)?.publishReviewedCopy === true;
}

export function publicSourceMetadata(
  sourceKey: string,
  policyVersion: string,
  document: { canonicalUrl: string; sourceName: string },
): { sourceName: string; sourceUrl: string | null } | null {
  const policy = sourcePolicy(sourceKey, policyVersion);
  if (!policy || !canPublishVersion(sourceKey, policyVersion)) return null;
  return {
    sourceName: policy.publishSourceName ? policy.sourceName : "",
    sourceUrl: policy.publishSourceUrl && isApprovedEdgarUrl(document.canonicalUrl) ? document.canonicalUrl : null,
  };
}
