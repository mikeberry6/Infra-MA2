import type { MilestoneView } from "@/modules/shared/types";

const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function normalizeMilestoneEvent(event: string): string {
  return event
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|and|or|of|to|from|for|with|by|in|on|as|its|it|was|were|is|are)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function milestoneTokens(event: string): Set<string> {
  return new Set(
    normalizeMilestoneEvent(event)
      .split(/\s+/)
      .filter((token) => token.length >= 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

function milestoneYear(milestone: MilestoneView): number | null {
  const match = `${milestone.date} ${milestone.event}`.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function milestoneDateSpecificity(date: string): number {
  if (/^\w+\s+\d{1,2},\s+\d{4}$/.test(date)) return 4;
  if (/^\w+\s+\d{4}$/.test(date)) return 3;
  if (/^Q[1-4]\s+\d{4}$/.test(date)) return 2;
  if (/^\d{4}$/.test(date)) return 1;
  return 0;
}

function milestoneSortKey(milestone: MilestoneView): number {
  const fullDate = milestone.date.match(/^(\w+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (fullDate) {
    const month = MONTH_INDEX[fullDate[1].toLowerCase()] ?? 1;
    return Number(fullDate[3]) * 10000 + month * 100 + Number(fullDate[2]);
  }

  const monthYear = milestone.date.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTH_INDEX[monthYear[1].toLowerCase()] ?? 1;
    return Number(monthYear[2]) * 10000 + month * 100 + 1;
  }

  const quarter = milestone.date.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarter) {
    const month = (Number(quarter[1]) - 1) * 3 + 1;
    return Number(quarter[2]) * 10000 + month * 100 + 1;
  }

  const year = milestone.date.match(/^(\d{4})$/);
  if (year) return Number(year[1]) * 10000 + 101;
  return 0;
}

function milestoneCategoryPriority(category: string): number {
  switch (category) {
    case "Divestiture":
    case "IPO":
      return 7;
    case "Acquisition":
    case "Financing":
      return 6;
    case "Founding":
      return 5;
    case "Expansion":
      return 4;
    case "Management":
      return 2;
    default:
      return 0;
  }
}

function milestoneDisplayScore(milestone: MilestoneView): number {
  let score = milestoneCategoryPriority(milestone.category) * 10 + milestoneDateSpecificity(milestone.date) * 4;
  if (/\b(completed|closed|completion|closing|commercial operation|began operations|entered service|commissioned)\b/i.test(milestone.event)) {
    score += 6;
  }
  if (/\b(announced|agreement|agreed|planned|expected)\b/i.test(milestone.event)) {
    score -= 4;
  }
  return score;
}

function isDistinctMilestonePair(first: MilestoneView, second: MilestoneView): boolean {
  const text = `${first.event} ${second.event}`.toLowerCase();
  return /\b(follow-on|additional|second|subsequent)\b/.test(text) && /\b(initial|first)\b/.test(text);
}

function shouldCollapseMilestones(first: MilestoneView, second: MilestoneView): boolean {
  const firstNorm = normalizeMilestoneEvent(first.event);
  const secondNorm = normalizeMilestoneEvent(second.event);
  const sameEvent = firstNorm.length >= 18 && firstNorm === secondNorm;
  const nestedEvent =
    Math.min(firstNorm.length, secondNorm.length) >= 45 &&
    (firstNorm.includes(secondNorm) || secondNorm.includes(firstNorm));
  const sameYear = milestoneYear(first) !== null && milestoneYear(first) === milestoneYear(second);
  const strongOverlap =
    sameYear &&
    jaccard(milestoneTokens(first.event), milestoneTokens(second.event)) >= 0.72 &&
    !isDistinctMilestonePair(first, second);
  return sameEvent || nestedEvent || strongOverlap;
}

function betterMilestone(first: MilestoneView, second: MilestoneView): MilestoneView {
  const scoreDiff = milestoneDisplayScore(second) - milestoneDisplayScore(first);
  if (scoreDiff > 0) return second;
  if (scoreDiff < 0) return first;
  return milestoneSortKey(second) > milestoneSortKey(first) ? second : first;
}

/**
 * Applies the public scorecard's material duplicate rules and render order.
 * Verification uses this same projection so it checks what the drawer serves,
 * while the database continues to preserve the complete approved history.
 */
export function dedupeMilestoneViews(milestones: MilestoneView[]): MilestoneView[] {
  const kept: MilestoneView[] = [];
  for (const milestone of milestones) {
    const index = kept.findIndex((existing) => shouldCollapseMilestones(existing, milestone));
    if (index === -1) {
      kept.push(milestone);
    } else {
      kept[index] = betterMilestone(kept[index], milestone);
    }
  }
  return kept.sort((a, b) => milestoneSortKey(b) - milestoneSortKey(a));
}
