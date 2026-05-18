import { companyDedupKeys } from "@/lib/company-key";
import type { NewsCategory, NewsConfidence, NewsMentionView, NewsMentionType } from "@/modules/shared/types";

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Transaction Activity",
  "Fundraising Activity",
  "Portfolio Company News",
  "Investment Firm News",
  "Rumored Sales Processes",
  "Low Confidence / Needs Review",
];

const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  "Transaction Activity": "#3b6cf2",
  "Fundraising Activity": "#1d9d76",
  "Portfolio Company News": "#0ea5e9",
  "Investment Firm News": "#7d6cf0",
  "Rumored Sales Processes": "#d98b1c",
  "Low Confidence / Needs Review": "#71717a",
};

const LOW_SIGNAL_TERMS = new Set([
  "a",
  "an",
  "and",
  "asset",
  "assets",
  "capital",
  "company",
  "energy",
  "fund",
  "global",
  "group",
  "holdings",
  "infrastructure",
  "investments",
  "management",
  "partners",
  "power",
  "renewable",
  "services",
  "the",
  "utilities",
]);

const MANAGER_SUFFIXES = [
  "asset management",
  "capital management",
  "global management",
  "global infrastructure",
  "infrastructure partners",
  "infrastructure",
  "investment management",
  "investments",
  "partners",
  "capital",
  "management",
];

export interface NewsAlias {
  term: string;
  confidence: NewsConfidence;
  reason: string;
}

export interface NewsMatchCandidate {
  id: string;
  label: string;
  type: NewsMentionType;
  href?: string;
  aliases: NewsAlias[];
}

export function getNewsCategoryColor(category: string): string {
  return NEWS_CATEGORY_COLORS[category as NewsCategory] ?? "#a1a1aa";
}

export function normalizeNewsText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isUsefulNewsTerm(value: string): boolean {
  const normalized = normalizeNewsText(value);
  if (!normalized) return false;
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  if (tokens.every((token) => LOW_SIGNAL_TERMS.has(token))) return false;
  if (tokens.length === 1) {
    const token = tokens[0];
    return token.length >= 5 && !LOW_SIGNAL_TERMS.has(token);
  }
  return normalized.length >= 6;
}

export function textContainsNewsTerm(haystack: string, needle: string): boolean {
  const normalizedHaystack = ` ${normalizeNewsText(haystack)} `;
  const normalizedNeedle = normalizeNewsText(needle);
  if (!isUsefulNewsTerm(normalizedNeedle)) return false;
  return normalizedHaystack.includes(` ${normalizedNeedle} `);
}

export function companyAliases(name: string): NewsAlias[] {
  const aliases = new Map<string, NewsAlias>();
  const add = (term: string, confidence: NewsConfidence, reason: string) => {
    const normalized = normalizeNewsText(term);
    if (!isUsefulNewsTerm(normalized)) return;
    if (!aliases.has(normalized)) {
      aliases.set(normalized, { term: normalized, confidence, reason });
    }
  };

  add(name, "High", "Exact PortCo name");
  for (const key of companyDedupKeys(name)) {
    add(key, "High", "Normalized PortCo name");
  }

  return Array.from(aliases.values());
}

export function managerAliases(name: string, explicitAliases: string[] = []): NewsAlias[] {
  const aliases = new Map<string, NewsAlias>();
  const add = (term: string, confidence: NewsConfidence, reason: string) => {
    const normalized = normalizeNewsText(term);
    if (!isUsefulNewsTerm(normalized)) return;
    if (!aliases.has(normalized)) {
      aliases.set(normalized, { term: normalized, confidence, reason });
    }
  };

  add(name, "High", "Exact investment firm name");
  for (const alias of explicitAliases) {
    add(alias, "High", "Known organization alias");
  }

  const normalized = normalizeNewsText(name);
  for (const suffix of MANAGER_SUFFIXES) {
    if (normalized.endsWith(` ${suffix}`)) {
      add(normalized.slice(0, -suffix.length).trim(), "Medium", "Short-form manager name");
    }
  }

  return Array.from(aliases.values());
}

export function fundAliases(name: string): NewsAlias[] {
  const normalized = normalizeNewsText(name);
  return isUsefulNewsTerm(normalized)
    ? [{ term: normalized, confidence: "High", reason: "Exact fund vehicle name" }]
    : [];
}

export function matchNewsCandidates(
  text: string,
  candidates: NewsMatchCandidate[],
  limit = 12,
): NewsMentionView[] {
  const matches = new Map<string, NewsMentionView>();

  for (const candidate of candidates) {
    for (const alias of candidate.aliases) {
      if (!textContainsNewsTerm(text, alias.term)) continue;

      const key = `${candidate.type}:${candidate.id}`;
      const existing = matches.get(key);
      if (!existing || confidenceRank(alias.confidence) > confidenceRank(existing.confidence)) {
        matches.set(key, {
          id: candidate.id,
          label: candidate.label,
          type: candidate.type,
          href: candidate.href,
          confidence: alias.confidence,
          reason: alias.reason,
        });
      }
      break;
    }
  }

  return Array.from(matches.values())
    .sort((a, b) => {
      const typeOrder = typeRank(a.type) - typeRank(b.type);
      if (typeOrder !== 0) return typeOrder;
      const confidenceOrder = confidenceRank(b.confidence) - confidenceRank(a.confidence);
      if (confidenceOrder !== 0) return confidenceOrder;
      return a.label.localeCompare(b.label);
    })
    .slice(0, limit);
}

export function mergeNewsMentions(...groups: NewsMentionView[][]): NewsMentionView[] {
  const merged = new Map<string, NewsMentionView>();
  for (const mention of groups.flat()) {
    const key = `${mention.type}:${mention.id}`;
    const existing = merged.get(key);
    if (!existing || confidenceRank(mention.confidence) > confidenceRank(existing.confidence)) {
      merged.set(key, mention);
    }
  }
  return Array.from(merged.values()).sort((a, b) => {
    const typeOrder = typeRank(a.type) - typeRank(b.type);
    if (typeOrder !== 0) return typeOrder;
    return a.label.localeCompare(b.label);
  });
}

function confidenceRank(confidence: NewsConfidence): number {
  if (confidence === "High") return 3;
  if (confidence === "Medium") return 2;
  return 1;
}

function typeRank(type: NewsMentionType): number {
  if (type === "PortCo") return 0;
  if (type === "Investment Firm") return 1;
  if (type === "Fund") return 2;
  return 3;
}
