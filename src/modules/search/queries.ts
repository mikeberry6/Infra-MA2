import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";

export interface SearchResult {
  type: "deal" | "company" | "fund";
  id: string; // company → cuid, deal/fund → legacyId
  legacyId?: string; // deal/fund only — used for stable links
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
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
      select: { legacyId: true, title: true, target: true, sector: true, region: true },
    }),
    prisma.company.findMany({
      where: {
        status: "PUBLISHED",
        ...ACTIVE_COMPANY_WHERE,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { subsector: { contains: query, mode: "insensitive" } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, name: true, sector: true, region: true, country: true },
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
      include: { manager: { select: { name: true } } },
    }),
  ]);

  const results: SearchResult[] = [
    ...deals.map((d): SearchResult => ({
      type: "deal",
      id: d.legacyId,
      legacyId: d.legacyId,
      title: d.target,
      subtitle: d.title,
      sector: DEAL_SECTOR_DISPLAY[d.sector],
      region: DEAL_REGION_DISPLAY[d.region],
    })),
    ...companies.map((c): SearchResult => ({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: c.country,
      sector: COMPANY_SECTOR_DISPLAY[c.sector],
      region: COMPANY_REGION_DISPLAY[c.region],
    })),
    ...funds.map((f): SearchResult => ({
      type: "fund",
      id: f.legacyId,
      legacyId: f.legacyId,
      title: f.fundName,
      subtitle: f.manager.name,
    })),
  ];

  return results.slice(0, limit);
}
