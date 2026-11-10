import { ExternalLink } from "lucide-react";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { researchMetadata } from "@/lib/public-metadata";

export const metadata = researchMetadata(
  "/earnings/archive/q4-2025",
  "Q4 2025 Earnings Archive",
  "Archived infrastructure fundraising and deployment commentary from six public asset managers in Q4 2025.",
  "article",
);

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

export default function EarningsArchivePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Public markets"
        title="Q4 2025 Earnings Archive"
        summary="Archived public asset-manager commentary on infrastructure fundraising and deployment for the quarter ended December 31, 2025."
        metrics={[{ label: "Managers covered", value: earningsCards.length.toLocaleString() }]}
        compact
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
              <a
                href={card.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={`${card.manager} investor relations`}
              >
                <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              </a>
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
