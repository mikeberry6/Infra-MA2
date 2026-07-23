import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { deals, type Deal } from "../prisma/seed-data/deals";
import { weeklyBriefingDeals } from "../prisma/seed-data/weekly-briefing-deals";

const EMAIL_DIR = join(process.cwd(), "public", "email-format");
const WEEKLY_ISSUE_PATTERN = /^2026-\d{2}-\d{2}\.html$/;
const MAX_DATE_DRIFT_MS = 14 * 24 * 60 * 60 * 1000;

function normalizeSourceUrl(value: string): string {
  const raw = value.trim();
  if (!raw || raw === "#") return "";

  try {
    const url = new URL(raw);
    url.hash = "";
    return decodeURI(url.toString()).replace(/\/$/, "").toLowerCase();
  } catch {
    return raw.replace(/\/$/, "").toLowerCase();
  }
}

function normalizeTarget(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function targetsMatch(left: string, right: string): boolean {
  const a = normalizeTarget(left);
  const b = normalizeTarget(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.length >= 4 && longer.includes(shorter);
}

function datesAreNear(left: string, right: string): boolean {
  return Math.abs(new Date(left).getTime() - new Date(right).getTime()) <= MAX_DATE_DRIFT_MS;
}

function isWeeklyDealCovered(weeklyDeal: Deal, sourceUrls: Set<string>): boolean {
  const sourceUrl = normalizeSourceUrl(weeklyDeal.sourceUrl);
  if (sourceUrl && sourceUrls.has(sourceUrl)) return true;

  return deals.some((deal) => targetsMatch(deal.target, weeklyDeal.target) && datesAreNear(deal.date, weeklyDeal.date));
}

describe("weekly briefing deal coverage", () => {
  it("parses at least one deal from every dated weekly briefing issue", () => {
    const weeklyIssueIds = readdirSync(EMAIL_DIR)
      .filter((fileName) => WEEKLY_ISSUE_PATTERN.test(fileName))
      .map((fileName) => fileName.replace(".html", ""));
    const parsedIssueIds = new Set(weeklyBriefingDeals.map((deal) => deal.id.slice(3, 13)));

    expect(weeklyIssueIds.filter((issueId) => !parsedIssueIds.has(issueId))).toEqual([]);
  });

  it("keeps every weekly briefing deal represented in the deal database", () => {
    const sourceUrls = new Set(deals.map((deal) => normalizeSourceUrl(deal.sourceUrl)).filter(Boolean));
    const missing = weeklyBriefingDeals
      .filter((deal) => !isWeeklyDealCovered(deal, sourceUrls))
      .map((deal) => `${deal.id}: ${deal.target}`);

    expect(missing).toEqual([]);
  });
});
