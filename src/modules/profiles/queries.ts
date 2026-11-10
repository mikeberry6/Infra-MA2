import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isInvestmentFirmCommentaryOnly, managerAliases } from "@/lib/news-utils";
import { PUBLIC_SPONSOR_WHERE } from "@/lib/sponsor-profile";
import { getCompanyByFocusId } from "@/modules/companies/queries";
import { getDealById } from "@/modules/deals/queries";
import { getFundById } from "@/modules/funds/queries";

export const getPublicDealProfile = cache(getDealById);
export const getPublicFundProfile = cache(getFundById);
export const getPublicCompanyProfile = cache(getCompanyByFocusId);

const published = { status: "PUBLISHED" } as const;
const publishedNews = {
  ...published,
  confidence: { not: "LOW" },
  category: { not: "LOW_CONFIDENCE_NEEDS_REVIEW" },
} as const;

export const getPublicSponsorProfile = cache(async (id: string) => {
  const sponsor = await prisma.organization.findFirst({
    where: { id, ...PUBLIC_SPONSOR_WHERE },
    select: {
      id: true, name: true, website: true, description: true, headquarters: true,
      aliases: { select: { alias: true } },
      managedFunds: {
        where: published,
        orderBy: { fundName: "asc" },
        select: { legacyId: true, fundName: true, vintage: true },
      },
      dealParticipations: {
        where: { role: { in: ["BUYER", "SELLER"] }, deal: published },
        orderBy: [{ deal: { date: "desc" } }, { id: "asc" }],
        take: 20,
        select: { id: true, role: true, deal: { select: { legacyId: true, target: true, date: true } } },
      },
      newsMentions: {
        where: { newsItem: publishedNews },
        orderBy: [{ newsItem: { publishedAt: "desc" } }, { id: "asc" }],
        take: 30,
        select: { newsItem: {
          select: { id: true, title: true, summary: true, sourceName: true, sourceUrl: true, publishedAt: true },
        } },
      },
    },
  });
  if (!sponsor) return null;

  const aliases = managerAliases(sponsor.name, sponsor.aliases.map(({ alias }) => alias));
  const items = sponsor.newsMentions.map(({ newsItem }) => newsItem).filter((item) =>
    !isInvestmentFirmCommentaryOnly(`${item.title}. ${item.summary}`, aliases)
  );
  const news = [...new Map(items.map((item) => [item.id, item])).values()].slice(0, 12);
  return { ...sponsor, news };
});

export async function getSponsorHoldings(sponsorId: string) {
  return prisma.ownershipPeriod.findMany({
    where: {
      company: published,
      OR: [{ organizationId: sponsorId }, { fund: { managerId: sponsorId, ...published } }],
    },
    orderBy: [{ isActive: "desc" }, { investmentYear: "desc" }, { id: "asc" }],
    select: {
      id: true, investmentYear: true, exitYear: true, isActive: true, fundAttribution: true, vehicleName: true,
      fund: { select: { legacyId: true, fundName: true, status: true, managerId: true } },
      company: { select: { id: true, name: true, country: true } },
    },
  });
}

export async function getCompanyLinkedDeals(id: string) {
  return prisma.deal.findMany({
    where: { ...published, newsMentions: { some: { newsItem: {
      ...publishedNews, mentions: { some: { companyId: id } },
    } } } },
    orderBy: [{ date: "desc" }, { legacyId: "asc" }],
    take: 12,
    select: { legacyId: true, target: true, date: true },
  });
}
