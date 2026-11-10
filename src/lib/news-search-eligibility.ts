import { normalizeNewsText } from "@/lib/news-utils";

export type PublicNewsEligibilityInput = {
  entityLabel: string;
  title: string;
  subjectTerms?: readonly string[];
  summary: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  officialSource: boolean;
  strongEventSignal: boolean;
};

export function shouldAcceptPublicNewsMatch(input: PublicNewsEligibilityInput): boolean {
  if (input.confidence === "LOW" || input.category === "LOW_CONFIDENCE_NEEDS_REVIEW") {
    return false;
  }

  const headline = ` ${normalizeNewsText(`${input.title} ${input.summary}`)} `;
  const matchedTerms = [input.entityLabel, ...(input.subjectTerms ?? [])]
    .map(normalizeNewsText)
    .filter((term) => term && headline.includes(` ${term} `));
  if (!matchedTerms.length) return false;

  return input.officialSource || input.strongEventSignal
    || matchedTerms.some((term) => term.includes(" "))
    || hasDistinctiveOneWordBranding(input.entityLabel);
}

function hasDistinctiveOneWordBranding(label: string): boolean {
  const compact = label.replace(/[^A-Za-z0-9]/g, "");
  if (compact.length >= 12) return true;
  return /[a-z][A-Z]/.test(compact);
}
