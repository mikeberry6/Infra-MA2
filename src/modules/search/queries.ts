import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";

export interface SearchResult {
  type: "deal" | "company" | "fund";
  id: string; // company → cuid, deal/fund → legacyId
  legacyId?: string; // deal/fund only — used for stable links
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
}

export function matchScore(title: string, body: string, query: string): number {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  if (body.toLowerCase().includes(normalizedQuery)) return 3;
  return 4;
}

export async function searchAll(query: string, limit = 20): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // Budget the limit across the three result types so funds aren't truncated
  // when deals + companies happen to fill the cap. Each type still gets a fair
  // share; the merged list is then trimmed back to `limit`.
  const perTypeLimit = Math.max(5, Math.ceil(limit / 3));

  const [deals, companies, funds] = await Promise.all([
    prisma.deal.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { target: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: perTypeLimit,
      select: { legacyId: true, title: true, target: true, description: true, sector: true, region: true },
    }),
    prisma.company.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { subsector: { contains: query, mode: "insensitive" } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, name: true, description: true, subsector: true, sector: true, region: true, country: true },
    }),
    prisma.fund.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { fundName: { contains: query, mode: "insensitive" } },
          { investmentStrategy: { contains: query, mode: "insensitive" } },
          // Match by manager name too — without this, "Brookfield" finds zero
          // funds even though Brookfield is a major fund manager.
          { manager: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: perTypeLimit,
      select: {
        legacyId: true,
        fundName: true,
        investmentStrategy: true,
        manager: { select: { name: true } },
      },
    }),
  ]);

  const rankedResults: Array<SearchResult & { score: number }> = [
    ...deals.map((d): SearchResult & { score: number } => ({
      type: "deal",
      id: d.legacyId,
      legacyId: d.legacyId,
      title: d.target,
      subtitle: d.title,
      sector: DEAL_SECTOR_DISPLAY[d.sector],
      region: DEAL_REGION_DISPLAY[d.region],
      score: matchScore(d.target, `${d.title} ${d.description}`, query),
    })),
    ...companies.map((c): SearchResult & { score: number } => ({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: c.country,
      sector: COMPANY_SECTOR_DISPLAY[c.sector],
      region: COMPANY_REGION_DISPLAY[c.region],
      score: matchScore(c.name, `${c.subsector} ${c.description}`, query),
    })),
    ...funds.map((f): SearchResult & { score: number } => ({
      type: "fund",
      id: f.legacyId,
      legacyId: f.legacyId,
      title: f.fundName,
      subtitle: f.manager.name,
      score: matchScore(f.fundName, `${f.manager.name} ${f.investmentStrategy}`, query),
    })),
  ];

  return rankedResults
    .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score: _score, ...result }) => result);
}
