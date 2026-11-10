import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { INDEXABLE_PUBLIC_PAGES, publicUrl } from "@/lib/public-metadata";
import { PUBLIC_SPONSOR_WHERE } from "@/lib/sponsor-profile";
import { listPublishedBriefingEditions } from "@/modules/briefings/publication";

export const dynamic = "force-dynamic";

const publishedRecords = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const [deals, companies, funds, sponsors] = await Promise.all([
      prisma.deal.findMany({
        where: { status: "PUBLISHED" },
        select: { legacyId: true, updatedAt: true },
        orderBy: { legacyId: "asc" },
      }),
      prisma.company.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, updatedAt: true },
        orderBy: { id: "asc" },
      }),
      prisma.fund.findMany({
        where: { status: "PUBLISHED" },
        select: { legacyId: true, updatedAt: true },
        orderBy: { legacyId: "asc" },
      }),
      prisma.organization.findMany({
        where: PUBLIC_SPONSOR_WHERE,
        select: { id: true, updatedAt: true },
        orderBy: { id: "asc" },
      }),
    ]);

    return [
      ...deals.map(({ legacyId, updatedAt }) => ({ url: publicUrl(`/deals/${encodeURIComponent(legacyId)}`), lastModified: updatedAt })),
      ...companies.map(({ id, updatedAt }) => ({ url: publicUrl(`/portfolio/${encodeURIComponent(id)}`), lastModified: updatedAt })),
      ...funds.map(({ legacyId, updatedAt }) => ({ url: publicUrl(`/funds/${encodeURIComponent(legacyId)}`), lastModified: updatedAt })),
      ...sponsors.map(({ id, updatedAt }) => ({ url: publicUrl(`/sponsors/${encodeURIComponent(id)}`), lastModified: updatedAt })),
    ];
  },
  ["public-sitemap-records-v1"],
  { tags: [CACHE_TAGS.deals, CACHE_TAGS.companies, CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [records, editions] = await Promise.all([publishedRecords(), listPublishedBriefingEditions()]);
  return [
    ...INDEXABLE_PUBLIC_PAGES.map((page) => ({ url: publicUrl(page) })),
    ...editions.map((edition) => ({ url: publicUrl(`/weekly-briefing?edition=${edition}`), lastModified: edition })),
    ...records,
  ];
}
