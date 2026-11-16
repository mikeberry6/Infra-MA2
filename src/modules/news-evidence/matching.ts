import type { Prisma } from "@/generated/prisma/client";
import { PUBLIC_SPONSOR_WHERE } from "@/lib/sponsor-profile";
import {
  matchingSchema,
  type EntityCandidate,
  type EntityMatch,
  type ExtractedEntity,
  type MatchDecision,
  type SourceSection,
} from "./contracts";
import { containsIdentity, EvidenceValidationError, groundEvidence, normalizeIdentityText, sourceContainsDate } from "./domain";

type CandidateClient = Pick<Prisma.TransactionClient, "company" | "organization" | "fund" | "deal">;

const CANDIDATE_LIMIT = 5;
const GENERIC_TERMS = new Set([
  "and", "group", "company", "infrastructure", "partners", "investment", "investments",
  "merger", "acquisition", "transaction", "capital", "fund",
]);
const PUBLIC = { status: "PUBLISHED" } as const;
const COMPANY_FIELDS = {
  id: true, name: true, aliases: true, country: true, headquarters: true, website: true,
} satisfies Prisma.CompanySelect;
const ORGANIZATION_FIELDS = {
  id: true, name: true, aliases: { select: { alias: true } }, headquarters: true, website: true,
} satisfies Prisma.OrganizationSelect;
const FUND_FIELDS = {
  id: true, fundName: true, legacyId: true, ticker: true, manager: { select: { name: true } },
} satisfies Prisma.FundSelect;
const DEAL_FIELDS = {
  id: true, title: true, target: true, date: true, legacyId: true,
  participants: {
    where: { organization: PUBLIC },
    select: { organization: { select: { name: true } } },
    take: 8,
    orderBy: { id: "asc" },
  },
} satisfies Prisma.DealSelect;

function candidateNames(candidate: EntityCandidate): string[] {
  return [candidate.label, ...candidate.aliases];
}

function exactName(candidate: EntityCandidate, label: string): boolean {
  const key = normalizeIdentityText(label);
  return key.length > 0 && candidateNames(candidate).some((name) => normalizeIdentityText(name) === key);
}

function hostname(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function nonEmpty(values: readonly (string | null)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function organizationWhere(entity: ExtractedEntity): Prisma.OrganizationWhereInput {
  if (entity.kind === "FUND_MANAGER") return PUBLIC_SPONSOR_WHERE;
  const types: ("ADVISOR_FINANCIAL" | "ADVISOR_LEGAL")[] = entity.role.startsWith("FINANCIAL_ADVISER")
    ? ["ADVISOR_FINANCIAL"]
    : entity.role.startsWith("LEGAL_ADVISER") ? ["ADVISOR_LEGAL"] : ["ADVISOR_FINANCIAL", "ADVISOR_LEGAL"];
  return { ...PUBLIC, types: { hasSome: types } };
}

function queryTerms(label: string): string[] {
  const normalized = normalizeIdentityText(label);
  const tokens = normalized.split(" ").filter((token) => token.length >= 3 && !GENERIC_TERMS.has(token));
  return nonEmpty([normalized, ...tokens.slice(0, 2)]);
}

function stringFilters(terms: string[], exact: boolean): Prisma.StringFilter[] {
  return terms.map((term) => ({
    mode: "insensitive",
    ...(exact ? { equals: term } : { contains: term }),
  }));
}

async function queryCandidates(
  client: CandidateClient,
  entity: ExtractedEntity,
  mode: "exact" | "broad" | "refresh",
  candidateId?: string,
): Promise<EntityCandidate[]> {
  const terms = queryTerms(entity.label);
  const original = entity.label.trim();
  const labelVariants = nonEmpty([original, original.toLowerCase(), original.toUpperCase()]);
  const filters = stringFilters(mode === "exact" ? labelVariants.slice(0, 1) : terms, mode === "exact");
  const identity = candidateId ? { id: candidateId } : {};
  const take = mode === "refresh" ? 1 : CANDIDATE_LIMIT + 1;
  if (entity.kind === "COMPANY") {
    const rows = await client.company.findMany({
      where: {
        ...PUBLIC, ...identity,
        ...(mode === "refresh" ? {} : {
          OR: [
            ...filters.map((name) => ({ name })),
            { aliases: { hasSome: labelVariants } },
          ],
        }),
      },
      select: COMPANY_FIELDS,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take,
    });
    return rows.map((row) => ({
      id: row.id, kind: entity.kind, label: row.name, aliases: row.aliases,
      identityHints: nonEmpty([row.country, row.headquarters, hostname(row.website)]),
    }));
  }
  if (entity.kind === "FUND_MANAGER" || entity.kind === "ADVISER") {
    const rows = await client.organization.findMany({
      where: {
        AND: [
          organizationWhere(entity),
          identity,
          ...(mode === "refresh" ? [] : [{
            OR: filters.flatMap((filter) => [
              { name: filter },
              { aliases: { some: { alias: filter } } },
            ]),
          }]),
        ],
      },
      select: ORGANIZATION_FIELDS,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take,
    });
    return rows.map((row) => ({
      id: row.id, kind: entity.kind, label: row.name, aliases: row.aliases.map(({ alias }) => alias),
      identityHints: nonEmpty([row.headquarters, hostname(row.website)]),
    }));
  }
  if (entity.kind === "FUND") {
    const rows = await client.fund.findMany({
      where: {
        ...PUBLIC, ...identity,
        ...(mode === "refresh" ? {} : {
          OR: filters.flatMap((filter) => [{ fundName: filter }, { legacyId: filter }, { ticker: filter }]),
        }),
      },
      select: FUND_FIELDS,
      orderBy: [{ fundName: "asc" }, { id: "asc" }],
      take,
    });
    return rows.map((row) => ({
      id: row.id, kind: entity.kind, label: row.fundName,
      aliases: nonEmpty([row.ticker, row.legacyId]), identityHints: nonEmpty([row.manager.name]),
    }));
  }
  const rows = await client.deal.findMany({
    where: {
      ...PUBLIC, ...identity,
      ...(mode === "refresh" ? {} : {
        OR: filters.flatMap((filter) => [{ title: filter }, { target: filter }, { legacyId: filter }]),
      }),
    },
    select: DEAL_FIELDS,
    orderBy: [{ date: "desc" }, { id: "asc" }],
    take,
  });
  return rows.map((row) => ({
    id: row.id, kind: entity.kind, label: row.title,
    aliases: nonEmpty([row.target, row.legacyId]),
    identityHints: nonEmpty([
      row.date.toISOString().slice(0, 10),
      ...row.participants.map(({ organization }) => organization.name),
    ]),
  }));
}

export async function retrieveCandidates(
  client: CandidateClient,
  entity: ExtractedEntity,
): Promise<EntityCandidate[]> {
  if (!normalizeIdentityText(entity.label)) return [];
  const [exact, broad] = await Promise.all([
    queryCandidates(client, entity, "exact"),
    queryCandidates(client, entity, "broad"),
  ]);
  // Omitting exact collisions would make a broad label look uniquely supported.
  if (exact.length > CANDIDATE_LIMIT) return [];
  const byId = new Map([...exact, ...broad].map((candidate) => [candidate.id, candidate]));
  return Array.from(byId.values()).slice(0, CANDIDATE_LIMIT);
}

function supportsIdentity(candidate: EntityCandidate, label: string, quote: string): boolean {
  if (!containsIdentity(quote, label)) return false;
  if (exactName(candidate, label)) return true;
  const normalizedQuote = normalizeIdentityText(quote);
  const normalizedLabel = normalizeIdentityText(label);
  return candidateNames(candidate).some((name) => {
    const normalizedName = normalizeIdentityText(name);
    const withNoLegalSuffix = (value: string) =>
      value.replace(/ (?:inc|incorporated|l p|lp|l l c|llc|plc|limited|ltd|corporation|corp)$/, "");
    if (withNoLegalSuffix(normalizedName) === withNoLegalSuffix(normalizedLabel)) return true;
    if (!containsIdentity(quote, name)) return false;
    const aliases = ["also known as", "formerly", "doing business as", "trading as"];
    if (aliases.some((cue) =>
      normalizedQuote.includes(`${normalizedName} ${cue} ${normalizedLabel}`)
        || normalizedQuote.includes(`${normalizedLabel} ${cue} ${normalizedName}`),
    )) return true;
    // Example: “Blackstone Infrastructure Partners L.P. (BIP)”.
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parenthetical = new RegExp(`\\([“"']?${escaped}[”"']?\\)`, "i");
    const precedingText = quote.split(parenthetical)[0];
    return parenthetical.test(quote) && normalizeIdentityText(precedingText).endsWith(normalizedName);
  });
}

function supportsHint(quote: string, hint: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(hint) ? sourceContainsDate(quote, hint) : containsIdentity(quote, hint);
}

function hasDistinguishingHint(candidate: EntityCandidate, alternatives: EntityCandidate[], quote: string): boolean {
  return candidate.identityHints.some((hint) =>
    supportsHint(quote, hint) && alternatives.every((alternative) =>
      !alternative.identityHints.some((otherHint) => normalizeIdentityText(hint) === normalizeIdentityText(otherHint)),
    ),
  );
}

function supportsSelection(
  entity: ExtractedEntity,
  candidate: EntityCandidate,
  candidates: readonly EntityCandidate[],
  quote: string,
): boolean {
  if (!supportsIdentity(candidate, entity.label, quote)) return false;
  const alternatives = candidates.filter((other) =>
    other.id !== candidate.id && (
      exactName(other, entity.label)
      || candidateNames(other).some((name) => normalizeIdentityText(name) === normalizeIdentityText(candidate.label))
    ),
  );

  if (alternatives.length > 0 && (
    !hasDistinguishingHint(candidate, alternatives, quote)
      || alternatives.some((other) => hasDistinguishingHint(other, [candidate], quote))
  )) return false;
  if (entity.kind === "DEAL") {
    // A target can be involved in several transactions in the same country.
    return containsIdentity(quote, candidate.label)
      || candidate.identityHints.some((hint) => supportsHint(quote, hint));
  }
  return true;
}

export function exactCandidate(
  entity: ExtractedEntity,
  candidates: readonly EntityCandidate[],
): EntityCandidate | null {
  const exact = candidates.filter((candidate) => exactName(candidate, entity.label));
  if (exact.length !== 1) return null;
  if (candidates.length > 1 && !normalizeIdentityText(entity.label).includes(" ")) return null;
  const [candidate] = exact;
  return supportsSelection(entity, candidate, candidates, entity.evidence.quote) ? candidate : null;
}

export function unresolvedMatch(
  entity: ExtractedEntity,
  reason: string,
  candidates: EntityCandidate[] = [],
): EntityMatch {
  return {
    entityKey: entity.key,
    kind: entity.kind,
    role: entity.role,
    label: entity.label,
    status: "UNRESOLVED",
    candidateId: null,
    candidates,
    evidence: null,
    reason,
  };
}

export async function resolveEntityMatch({
  client, entity, candidates, sections, sourceVersionId, decision,
}: {
  client: CandidateClient;
  entity: ExtractedEntity;
  candidates: EntityCandidate[];
  sections: readonly SourceSection[];
  sourceVersionId: string;
  decision: MatchDecision;
}): Promise<EntityMatch> {
  const parsed = matchingSchema.safeParse(decision);
  if (!parsed.success) {
    return unresolvedMatch(entity, "The model did not return a valid match decision.", candidates);
  }
  if (parsed.data.candidateId === null && parsed.data.evidence === null) {
    return unresolvedMatch(entity, parsed.data.reason, candidates);
  }
  if (!parsed.data.candidateId || !parsed.data.evidence) {
    return unresolvedMatch(entity, "The match decision did not contain both a database record and identity evidence.", candidates);
  }
  const selected = candidates.find(({ id, kind }) => id === parsed.data.candidateId && kind === entity.kind);
  if (!selected) return unresolvedMatch(entity, "The selected record was outside the candidate set.", candidates);

  let evidence;
  try {
    evidence = groundEvidence(parsed.data.evidence, sections, sourceVersionId);
  } catch (error) {
    if (!(error instanceof EvidenceValidationError)) throw error;
    return unresolvedMatch(entity, "Identity evidence could not be located in the source version.", candidates);
  }
  const [current] = await queryCandidates(client, entity, "refresh", selected.id);
  if (!current || !supportsSelection(entity, current, candidates, evidence.quote)) {
    return unresolvedMatch(entity, "The evidence did not establish this candidate's current database identity.", candidates);
  }
  return {
    ...unresolvedMatch(entity, parsed.data.reason, candidates),
    status: "MATCHED",
    candidateId: current.id,
    evidence,
  };
}
