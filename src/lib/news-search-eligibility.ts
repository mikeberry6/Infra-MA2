import { normalizeNewsText } from "@/lib/news-utils";

export type PublicNewsEligibilityInput = {
  entityLabel: string;
  title: string;
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

  const label = normalizeNewsText(input.entityLabel);
  const headline = ` ${normalizeNewsText(`${input.title} ${input.summary}`)} `;
  if (!label || !headline.includes(` ${label} `)) {
    return false;
  }

  if (input.officialSource || input.strongEventSignal) {
    return true;
  }

  const labelTokens = label.split(" ").filter(Boolean);
  if (labelTokens.length > 1) {
    return true;
  }

  return hasDistinctiveOneWordBranding(input.entityLabel);
}

function hasDistinctiveOneWordBranding(label: string): boolean {
  const compact = label.replace(/[^A-Za-z0-9]/g, "");
  if (compact.length >= 12) return true;
  return /[a-z][A-Z]/.test(compact);
}
