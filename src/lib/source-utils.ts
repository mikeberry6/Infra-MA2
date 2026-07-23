// ─── PortCo Source Categorization Helpers ─────────────────

export const SOURCE_PURPOSE_ORDER = [
  "COMPANY_PROFILE",
  "OWNERSHIP_INVESTMENT",
  "OPERATIONS_ASSETS",
  "MILESTONE_EVENT",
  "FINANCING_FILINGS",
  "SUPPORTING_CONTEXT",
] as const;

export type SourcePurpose = (typeof SOURCE_PURPOSE_ORDER)[number];

export const SOURCE_FORMATS = [
  "ARTICLE",
  "PRESS_RELEASE",
  "SEC_FILING",
  "PRESENTATION",
  "WEBSITE",
  "OTHER",
] as const;

export type SourceFormat = (typeof SOURCE_FORMATS)[number];

export interface SourceLike {
  label?: string;
  url: string;
  type?: SourceFormat | string | null;
  purpose?: SourcePurpose | string | null;
  evidenceLabel?: string | null;
}

export interface SourceGroup<T extends SourceLike = SourceLike> {
  purpose: SourcePurpose;
  label: string;
  sources: T[];
}

const NON_PUBLIC_SOURCE_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "instance-data",
  "metadata",
]);

const NON_PUBLIC_SOURCE_SUFFIXES = [
  ".localhost",
  ".local",
  ".lan",
  ".home",
  ".internal",
  ".corp",
  ".home.arpa",
  ".test",
  ".example",
  ".invalid",
  ".onion",
];

function isObviouslyPublicIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (
    a === 192
    && [
      "31.196",
      "52.193",
      "88.99",
      "175.48",
    ].includes(`${b}.${octets[2]}`)
  ) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 192 && b === 0 && octets[2] === 2) return false;
  if (a === 198 && b === 51 && octets[2] === 100) return false;
  if (a === 203 && b === 0 && octets[2] === 113) return false;
  return true;
}

function isPotentiallyPublicSourceHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!normalized || NON_PUBLIC_SOURCE_HOSTS.has(normalized)) return false;
  if (NON_PUBLIC_SOURCE_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) return false;
  // Raw IPv6 source literals are unnecessary here and are rejected fail-closed;
  // DNS names may still resolve to vetted public IPv6 addresses at fetch time.
  if (normalized.includes(":")) return false;
  if (/^\d+(?:\.\d+){3}$/.test(normalized)) return isObviouslyPublicIpv4(normalized);
  if (!normalized.includes(".") || normalized.length > 253) return false;
  return normalized.split(".").every(
    (label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
  );
}

/**
 * Public source and website links are rendered into anchors and may also be
 * fetched by link-verification jobs. Accept only absolute HTTP(S) URLs; a
 * generic URL parser also accepts executable or non-web schemes such as
 * javascript:, data:, and ftp:.
 */
export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:")
      && Boolean(url.hostname)
      && !url.username
      && !url.password
      && !url.port
      && isPotentiallyPublicSourceHostname(url.hostname);
  } catch {
    return false;
  }
}

export const SOURCE_PURPOSE_LABELS: Record<SourcePurpose, string> = {
  COMPANY_PROFILE: "Company profile",
  OWNERSHIP_INVESTMENT: "Ownership & investment",
  OPERATIONS_ASSETS: "Operations & asset details",
  MILESTONE_EVENT: "Milestones & transactions",
  FINANCING_FILINGS: "Financing, filings & public docs",
  SUPPORTING_CONTEXT: "Supporting context",
};

export const SOURCE_FORMAT_LABELS: Record<SourceFormat, string> = {
  ARTICLE: "Article",
  PRESS_RELEASE: "Press release",
  SEC_FILING: "SEC filing",
  PRESENTATION: "Presentation",
  WEBSITE: "Website",
  OTHER: "Other",
};

const KNOWN_HOST_LABELS: Record<string, string> = {
  "3i.com": "3i",
  "aimco.ca": "AIMCo",
  "businesswire.com": "Business Wire",
  "globenewswire.com": "GlobeNewswire",
  "prnewswire.com": "PR Newswire",
  "sec.gov": "SEC",
};

function isSourcePurpose(value: string | null | undefined): value is SourcePurpose {
  return !!value && SOURCE_PURPOSE_ORDER.includes(value as SourcePurpose);
}

function isSourceFormat(value: string | null | undefined): value is SourceFormat {
  return !!value && SOURCE_FORMATS.includes(value as SourceFormat);
}

export function getSourceHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getUrlPath(url: string): string {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return "";
  }
}

function prettifyToken(value: string): string {
  return value
    .replace(/\.(com|org|net|ca|co|io|gov|sg|uk)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function publisherFromSource(source: SourceLike): string {
  const host = getSourceHostname(source.url);
  const known = KNOWN_HOST_LABELS[host];
  if (known) return known;

  const firstLabelPart = splitLabel(source.label || "")[0];
  if (firstLabelPart && !/source/i.test(firstLabelPart)) {
    return prettifyToken(firstLabelPart);
  }

  return prettifyToken(host.split(".")[0] || host || "Source");
}

function splitLabel(label: string): string[] {
  return label
    .split(/\s*(?:\u2014|-)\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSourceType(type?: string | null): string {
  return isSourceFormat(type) ? SOURCE_FORMAT_LABELS[type] : SOURCE_FORMAT_LABELS.OTHER;
}

export function inferSourceType(source: SourceLike): SourceFormat {
  if (isSourceFormat(source.type) && source.type !== "ARTICLE") return source.type;

  const label = (source.label || "").toLowerCase();
  const host = getSourceHostname(source.url).toLowerCase();
  const path = getUrlPath(source.url);

  if (host.includes("sec.gov") || label.includes("sec ")) return "SEC_FILING";
  if (path.endsWith(".pdf") || /\b(presentation|deck|factsheet|fact sheet|aif|annual report)\b/i.test(label)) {
    return "PRESENTATION";
  }
  if (
    host.includes("prnewswire") ||
    host.includes("businesswire") ||
    host.includes("globenewswire") ||
    /\b(press release|news release|announcement|newsroom)\b/i.test(label + " " + path)
  ) {
    return "PRESS_RELEASE";
  }
  if (
    path === "" ||
    path === "/" ||
    /\b(about|portfolio|our-portfolio|operations|projects|investments)\b/i.test(path)
  ) {
    return "WEBSITE";
  }

  return isSourceFormat(source.type) ? source.type : "ARTICLE";
}

export function inferCitationPurpose(source: SourceLike): SourcePurpose {
  if (
    isSourcePurpose(source.purpose) &&
    (source.purpose !== "SUPPORTING_CONTEXT" || !!source.evidenceLabel?.trim())
  ) {
    return source.purpose;
  }

  const label = (source.label || "").toLowerCase();
  const host = getSourceHostname(source.url).toLowerCase();
  const path = getUrlPath(source.url);
  const text = `${label} ${host} ${path}`;

  if (
    /\b(sec|filing|aif|annual report|cfius|clearance|bond|financing|debt|notes|tax equity|project finance|refinancing)\b/i.test(text)
  ) {
    return "FINANCING_FILINGS";
  }
  if (
    /\b(investment date|close date|announcement date|ownership history|current ownership|interest confirmation|portfolio source)\b/i.test(text)
  ) {
    return "OWNERSHIP_INVESTMENT";
  }
  if (
    /\b(acquires|acquired|acquisition|divestiture|sale|launch|launched|rebrand|milestone|joint venture)\b/i.test(text)
  ) {
    return "MILESTONE_EVENT";
  }
  if (
    /\b(operations|our-operations|projects|project|portfolio|assets|network|facilities|locations|factsheet|fact-sheet)\b/i.test(path)
  ) {
    return "OPERATIONS_ASSETS";
  }
  if (inferSourceType(source) === "WEBSITE") {
    return "COMPANY_PROFILE";
  }

  return "SUPPORTING_CONTEXT";
}

export function getSourceDisplayLabel(source: SourceLike): string {
  if (source.evidenceLabel?.trim()) return source.evidenceLabel.trim();

  const label = (source.label || "").trim();
  const labelParts = splitLabel(label);
  const lead = labelParts[0] || "";
  const sponsor = labelParts[1] || publisherFromSource(source);
  const publisher = publisherFromSource(source);
  const purpose = inferCitationPurpose(source);

  if (/investment date source/i.test(lead)) return `${sponsor} initial investment / ownership`;
  if (/close date source/i.test(lead)) return `${sponsor} closing confirmation`;
  if (/announcement date source/i.test(lead)) return `${sponsor} transaction announcement`;
  if (/ownership history source/i.test(lead)) return `${sponsor} ownership history`;
  if (/interest confirmation source/i.test(lead)) return `${sponsor} ownership interest confirmation`;
  if (/cfius clearance source/i.test(lead)) return `${sponsor} regulatory clearance`;
  if (/follow-on commitment source/i.test(lead)) return `${sponsor} follow-on commitment`;

  if (/sec/i.test(lead) || inferSourceType(source) === "SEC_FILING") return "SEC filing";
  if (!label) return getSourceHostname(source.url);

  if (purpose === "COMPANY_PROFILE") return `${publisher} company profile`;
  if (purpose === "OPERATIONS_ASSETS") return `${publisher} operations / asset details`;
  if (purpose === "MILESTONE_EVENT") return `${publisher} transaction or milestone detail`;
  if (purpose === "FINANCING_FILINGS") return `${publisher} financing or public filing`;

  return label;
}

export function groupSourcesByPurpose<T extends SourceLike>(sources: T[]): SourceGroup<T>[] {
  const buckets = new Map<SourcePurpose, T[]>();

  for (const source of sources) {
    const purpose = inferCitationPurpose(source);
    const current = buckets.get(purpose) ?? [];
    current.push(source);
    buckets.set(purpose, current);
  }

  return SOURCE_PURPOSE_ORDER.flatMap((purpose) => {
    const groupSources = buckets.get(purpose) ?? [];
    return groupSources.length
      ? [{ purpose, label: SOURCE_PURPOSE_LABELS[purpose], sources: groupSources }]
      : [];
  });
}

export function dedupeExactPortCoSources<T extends SourceLike>(sources: T[]): {
  kept: T[];
  removed: Array<{ source: T; reason: string }>;
} {
  const seen = new Set<string>();
  const kept: T[] = [];
  const removed: Array<{ source: T; reason: string }> = [];

  for (const source of sources) {
    const key = `${source.url.trim()}|${(source.label || "").trim().toLowerCase()}`;
    if (seen.has(key)) {
      removed.push({ source, reason: "Exact duplicate label and URL for the same portfolio company." });
      continue;
    }
    seen.add(key);
    kept.push(source);
  }

  return { kept, removed };
}
