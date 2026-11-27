import archivedDealFacts from "./archived-deal-facts.json";

type DealOverview = { key: string; description: string; scaleNote: string | null };
const archive = new Map(Object.entries(archivedDealFacts));

export function selectDealEmphasis(card: DealOverview, authored?: string): string {
  // Honor the authored markup first. Only emphasize words present in this version of the overview.
  for (const candidate of [authored, archive.get(card.key), card.scaleNote]) {
    const fact = candidate?.trim();
    if (fact && card.description.includes(fact)) return fact;
  }
  // An unmarked new issue still has an editable lead fact. Keep the complete opening clause
  // and avoid splitting at initials such as U.S. or at decimal points.
  return card.description.split(/;\s+|(?<=[a-z0-9][.!?])\s+(?=[A-Z])/, 1)[0].trim();
}
