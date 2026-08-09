import type { DealRegion, SeedDealRecord } from "./sources-types";
import type { GeographyCorrectionCandidate } from "./reconcile-types";

const COUNTRY_REGION_RULES: readonly {
  pattern: RegExp;
  countryLabel: string;
  region: DealRegion;
}[] = [
  { pattern: /\bmexico\b/i, countryLabel: "Mexico", region: "North America" },
  { pattern: /\b(?:türkiye|turkey)\b/i, countryLabel: "Türkiye", region: "Europe" },
  { pattern: /\biceland\b/i, countryLabel: "Iceland", region: "Europe" },
  { pattern: /\bkuwait\b/i, countryLabel: "Kuwait", region: "Middle East & Africa" },
  { pattern: /\bestonia\b/i, countryLabel: "Estonia", region: "Europe" },
  { pattern: /\bindonesia\b/i, countryLabel: "Indonesia", region: "Asia-Pacific" },
];

export function expectedRegionForKnownParserGap(country: string): {
  countryLabel: string;
  region: DealRegion;
} | null {
  const match = COUNTRY_REGION_RULES.find((rule) => rule.pattern.test(country));
  return match ? { countryLabel: match.countryLabel, region: match.region } : null;
}

export function detectGeographyCorrectionCandidates(seed: SeedDealRecord[]): GeographyCorrectionCandidate[] {
  return seed.flatMap((record) => {
    const expected = expectedRegionForKnownParserGap(record.country);
    if (!expected || expected.region === record.region) return [];
    return [{
      legacyId: record.legacyId,
      target: record.target,
      country: record.country,
      currentRegion: record.region,
      expectedRegion: expected.region,
      rationale: `${expected.countryLabel} is deterministically mapped to ${expected.region}; the current value is a known archive-parser fallback.`,
    }];
  });
}

export function applyKnownGeographyCorrections(seed: SeedDealRecord[]): SeedDealRecord[] {
  return seed.map((record) => {
    const expected = expectedRegionForKnownParserGap(record.country);
    return expected && expected.region !== record.region ? { ...record, region: expected.region } : record;
  });
}
