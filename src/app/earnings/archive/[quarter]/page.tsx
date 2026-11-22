import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { researchMetadata } from "@/lib/public-metadata";
import { earningsArchive } from "@/modules/earnings/archive";

type ArchivePageProps = { params: Promise<{ quarter: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return earningsArchive.map(({ slug }) => ({ quarter: slug }));
}

function getReport(slug: string) {
  return earningsArchive.find((report) => report.slug === slug) ?? notFound();
}

export async function generateMetadata({ params }: ArchivePageProps) {
  const report = getReport((await params).quarter);
  return researchMetadata(
    `/earnings/archive/${report.slug}`,
    `${report.period} Earnings Archive`,
    `Archived infrastructure fundraising and deployment commentary from ${report.cards.length} public asset managers in ${report.period}.`,
    "article",
  );
}

export default async function EarningsArchivePage({ params }: ArchivePageProps) {
  const report = getReport((await params).quarter);
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Public markets"
        title={`${report.period} Earnings Archive`}
        summary={`Archived public asset-manager commentary on infrastructure fundraising and deployment for the quarter ended ${report.periodEndLabel}.`}
        metrics={[{ label: "Managers covered", value: report.cards.length.toLocaleString() }]}
        compact
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {report.cards.map((card) => (
          <article key={card.manager} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="type-row-title font-semibold">
                  {card.manager}
                </h2>
                <p className="type-micro mono mt-0.5">
                  {card.ticker} · {report.period}
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
