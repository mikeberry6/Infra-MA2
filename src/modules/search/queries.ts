import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";

export interface SearchResult {
  type: "deal" | "company" | "fund";
  id: string;
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
}

export async function searchAll(query: string, limit = 20): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const searchPattern = `%${query}%`;
  const results: SearchResult[] = [];

  // Search deals
  const deals = await prisma.deal.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { target: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    select: {
      legacyId: true,
      title: true,
      target: true,
      sector: true,
      region: true,
    },
  });

  for (const d of deals) {
    results.push({
      type: "deal",
      id: d.legacyId,
      title: d.target,
      subtitle: d.title,
      sector: DEAL_SECTOR_DISPLAY[d.sector],
      region: DEAL_REGION_DISPLAY[d.region],
    });
  }

  // Search companies
  const companies = await prisma.company.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { subsector: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      sector: true,
      region: true,
      country: true,
    },
  });

  for (const c of companies) {
    results.push({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: c.country,
      sector: COMPANY_SECTOR_DISPLAY[c.sector],
      region: COMPANY_REGION_DISPLAY[c.region],
    });
  }

  // Search funds
  const funds = await prisma.fund.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { fundName: { contains: query, mode: "insensitive" } },
        { investmentStrategy: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    include: {
      manager: { select: { name: true } },
    },
  });

  for (const f of funds) {
    results.push({
      type: "fund",
      id: f.legacyId,
      title: f.fundName,
      subtitle: f.manager.name,
    });
  }

  return results.slice(0, limit);
}
