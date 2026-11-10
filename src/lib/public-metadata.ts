import type { Metadata } from "next";
import { withBasePath } from "@/lib/base-path";

const SITE_ORIGIN = new URL(process.env.SITE_URL || "https://infra-ma-2.vercel.app").origin;

const PUBLIC_PAGES = {
  "/tracker": {
    title: "Infrastructure Deal Tracker",
    description: "Browse global infrastructure M&A by sponsor, sector, region, and transaction type. Explore source-linked deal records and weekly briefings.",
  },
  "/portfolio": {
    title: "Infrastructure Portfolio Companies",
    description: "Explore infrastructure portfolio companies, fund ownership, investment milestones, and primary research sources.",
  },
  "/funds": {
    title: "Infrastructure Fund Database",
    description: "Research infrastructure funds by manager, strategy, vintage, geography, and reported size. See the portfolio companies behind each fund.",
  },
  "/dashboard": {
    title: "Infrastructure M&A Conditions",
    description: "Track financing, energy, public investment, and regulatory signals relevant to infrastructure M&A, with source and observation dates.",
  },
  "/news": {
    title: "Infrastructure Intelligence Feed",
    description: "Follow infrastructure transactions, fundraises, portfolio company news, and emerging deal reports with links to original sources.",
  },
  "/search": {
    title: "Search InfraSight",
    description: "Find infrastructure transactions, portfolio companies, and funds by name, alias, buyer, or sponsor.",
  },
} satisfies Record<string, { title: string; description: string }>;

export const INDEXABLE_PUBLIC_PAGES = [
  "/tracker",
  "/portfolio",
  "/funds",
  "/dashboard",
  "/news",
  "/methodology",
  "/earnings/archive/q4-2025",
] as const;

export function publicUrl(path: string): string {
  return new URL(withBasePath(path), SITE_ORIGIN).href;
}

export function researchMetadata(
  path: string,
  title: string,
  description: string,
  type: "website" | "article" = "website",
): Metadata {
  const url = publicUrl(path);
  const image = publicUrl("/social-preview");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: "InfraSight",
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: "InfraSight infrastructure investment research" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function publicMetadata(path: keyof typeof PUBLIC_PAGES): Metadata {
  const { title, description } = PUBLIC_PAGES[path];
  return researchMetadata(path, title, description);
}
