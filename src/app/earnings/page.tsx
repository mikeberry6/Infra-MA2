import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { TrackedAnalyticsLink } from "@/components/shared/TrackedAnalyticsLink";

export const metadata: Metadata = {
  title: "Earnings",
};

const earningsCards = [
  {
    manager: "Blackstone",
    ticker: "BX",
    period: "Q4 2025",
    context: "Infrastructure and real assets commentary from public filings.",
    fundraising: "$5B+ infrastructure inflows",
    deployment: "Energy transition and digital infrastructure focus",
    source: "https://www.blackstone.com/investors/",
  },
  {
    manager: "BlackRock",
    ticker: "BLK",
    period: "Q4 2025",
    context: "Private markets and infrastructure platform updates.",
    fundraising: "Infrastructure platform scale-up",
    deployment: "GIP integration and private markets deployment",
    source: "https://ir.blackrock.com/",
  },
  {
    manager: "Brookfield Asset Management",
    ticker: "BAM",
    period: "Q4 2025",
    context: "Infrastructure fundraising, deployment, and realizations.",
    fundraising: "Flagship infrastructure fundraising",
    deployment: "Global contracted infrastructure",
    source: "https://bam.brookfield.com/",
  },
  {
    manager: "KKR",
    ticker: "KKR",
    period: "Q4 2025",
    context: "Infrastructure and climate platform reporting.",
    fundraising: "Infrastructure and transition capital",
    deployment: "Core-plus and opportunistic infrastructure",
    source: "https://ir.kkr.com/",
  },
  {
    manager: "Ares Management",
    ticker: "ARES",
    period: "Q4 2025",
    context: "Infrastructure debt, secondaries, and alternatives activity.",
    fundraising: "Private credit and infrastructure adjacencies",
    deployment: "Infrastructure debt and transition themes",
    source: "https://ir.aresmgmt.com/",
  },
  {
    manager: "TPG",
    ticker: "TPG",
    period: "Q4 2025",
    context: "Climate and infrastructure-adjacent private markets activity.",
    fundraising: "Climate platform capital formation",
    deployment: "Energy transition, transport, and digital infrastructure",
    source: "https://shareholders.tpg.com/",
  },
];

export default function EarningsPage() {
  const uniquePeriods = Array.from(new Set(earningsCards.map((card) => card.period)));

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Public markets"
        title="Earnings Tracker"
        summary="Public asset-manager signals for infrastructure fundraising, deployment, and portfolio activity, kept separate from the core private-market databases."
        metrics={[
          {
            label: "Managers tracked",
            value: earningsCards.length.toLocaleString(),
            detail: "Public alternatives platforms",
            color: "var(--accent)",
          },
          {
            label: "Reporting period",
            value: uniquePeriods[0] ?? "N/A",
            detail: uniquePeriods.length > 1 ? `${uniquePeriods.length} periods shown` : "Current coverage set",
            color: "#3b6cf2",
          },
          {
            label: "Signal types",
            value: "2",
            detail: "Fundraising and deployment",
            color: "#7d6cf0",
          },
          {
            label: "Source quality",
            value: "IR",
            detail: "Investor relations links",
            color: "#f59e0b",
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {earningsCards.map((card) => (
          <article key={card.manager} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="type-row-title font-semibold">
                  {card.manager}
                </h2>
                <p className="type-micro mono mt-0.5">
                  {card.ticker} · {card.period}
                </p>
              </div>
              <TrackedAnalyticsLink
                href={card.source}
                target="_blank"
                rel="noopener noreferrer"
                analyticsEvent={{
                  name: "source_link_clicked",
                  properties: { entity: "earnings", placement: "card" },
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={`${card.manager} investor relations`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </TrackedAnalyticsLink>
            </div>
            <p className="mt-3 type-meta">
              {card.context}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-3">
              <div>
                <dt className="type-label">
                  Fundraising
                </dt>
                <dd className="mt-0.5 type-meta text-[var(--text-primary)]">
                  {card.fundraising}
                </dd>
              </div>
              <div>
                <dt className="type-label">
                  Deployment
                </dt>
                <dd className="mt-0.5 type-meta text-[var(--text-primary)]">
                  {card.deployment}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
