"use client";

import {
  assetManagerCards,
  getCompanyById,
  getSectorTypeColor,
  formatFullDate,
} from "@/data/earnings";
import type { AssetManagerCard, CardMetric } from "@/data/earnings";

// ─── Metric Cell ────────────────────────────────────────────

function MetricCell({
  title,
  metric,
  color,
}: {
  title: string;
  metric: CardMetric;
  color: string;
}) {
  const isNotDisclosed =
    metric.value === "Not Disclosed" || metric.value === "Not Isolated";

  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-[#52525B] mb-1">
        {title}
        {metric.label && (
          <span className="normal-case tracking-normal text-[#52525B]">
            {" "}
            ({metric.label})
          </span>
        )}
      </p>

      {/* Primary value */}
      <p
        className="font-mono tabular-nums text-sm font-semibold mb-1"
        style={{ color: isNotDisclosed ? "#71717a" : color }}
      >
        {metric.value}
      </p>

      {/* Segment note for non-isolated metrics */}
      {metric.isIsolated === false && metric.segmentNote && (
        <p className="text-[9px] text-[#52525B] italic mb-1">
          {metric.segmentNote}
        </p>
      )}

      {/* Additional lines (e.g., Ares secondaries) */}
      {metric.additionalLines &&
        metric.additionalLines.map((line, idx) => (
          <p key={idx} className="text-micro text-[#A1A1AA] font-mono tabular-nums">
            + {line.value}{" "}
            <span className="text-[#52525B] text-[9px]">({line.label})</span>
          </p>
        ))}

      {/* Comparisons */}
      {metric.comparisons.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {metric.comparisons.map((comp) => (
            <span key={comp.label} className="text-[9px] font-mono tabular-nums text-[#52525B]">
              <span className="text-[#52525B]">{comp.label}:</span>{" "}
              <span
                className={
                  comp.value === "Not Disclosed"
                    ? "text-[#52525B]"
                    : "text-[#A1A1AA]"
                }
              >
                {comp.value}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Asset Manager Card ─────────────────────────────────────

function AssetManagerCardComponent({ card }: { card: AssetManagerCard }) {
  const company = getCompanyById(card.companyId);
  if (!company) return null;
  const sectorColor = getSectorTypeColor(company.sector);

  return (
    <div className="glass-card rounded-[4px] overflow-hidden">
      <div className="p-4 lg:p-5">
        {/* Header: Company name & ticker */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm lg:text-base font-semibold text-[#EDEDED] tracking-tight">
                {company.name}
              </h3>
              <span className="font-mono tabular-nums text-micro text-[#52525B] shrink-0">
                {card.ticker}:{company.exchange}
              </span>
            </div>

            {/* Reporting Context */}
            <p className="text-micro text-[#52525B] mb-1">
              <span className="text-[#52525B]">Reporting Context:</span>{" "}
              {card.reportingContext}
            </p>

            {/* Period & report date */}
            <div className="flex items-center gap-3 text-micro text-[#52525B]">
              <span className="font-mono tabular-nums font-medium text-[#A1A1AA]">
                {card.period}
              </span>
              {card.periodNote && (
                <>
                  <span className="text-[#3f3f46]">|</span>
                  <span className="text-[#52525B]">{card.periodNote}</span>
                </>
              )}
              <span className="text-[#3f3f46]">|</span>
              <span>Reported {formatFullDate(card.reportDate)}</span>
            </div>
          </div>

          {/* Sector badge */}
          <span
            className="text-[10px] font-medium px-1.5 py-0 shrink-0"
            style={{
              color: "#444444",
              backgroundColor: `${sectorColor}08`,
              border: `1px solid ${sectorColor}12`,
            }}
          >
            {company.sector}
          </span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#27272A]">
          <MetricCell
            title="Fundraising"
            metric={card.fundraising}
            color="#818CF8"
          />
          <MetricCell
            title="Deployment"
            metric={card.deployment}
            color="#f59e0b"
          />
          <MetricCell
            title="Realizations"
            metric={card.realizations}
            color="#10b981"
          />
        </div>

        {/* Notes */}
        {card.notes && card.notes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#27272A]/50">
            <p className="text-[9px] font-medium uppercase tracking-wider text-[#52525B] mb-1">
              Note
            </p>
            <ul className="space-y-0.5">
              {card.notes.map((note, idx) => (
                <li
                  key={idx}
                  className="text-micro text-[#52525B] leading-relaxed pl-2.5 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-[#3f3f46]"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Earnings Commentary */}
        {card.commentary && card.commentary.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#27272A]/50">
            <p className="text-[9px] font-medium uppercase tracking-wider text-[#52525B] mb-2">
              Earnings Commentary
            </p>
            <div className="space-y-2">
              {card.commentary.map((quote, idx) => (
                <blockquote
                  key={idx}
                  className="text-micro text-[#A1A1AA] leading-relaxed pl-2.5 border-l border-[#3f3f46] italic"
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#EDEDED] tracking-tight mb-2">
          Public Asset Managers
        </h1>
        <p className="text-sm text-[#52525B] leading-relaxed max-w-3xl">
          Infrastructure-specific fundraising, deployment, and realizations
          from nine public asset managers. Verified from Q4 2025 / H2 2025
          earnings releases. Each card reflects the reporting segment and
          native currency disclosed by the company.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-[4px] p-4 mb-6 border-[#3f3f46]/50">
        <p className="text-micro text-[#52525B] leading-relaxed">
          <span className="text-[#A1A1AA] font-medium">Disclosure:</span>{" "}
          Metrics below are sourced directly from each company&apos;s most
          recent earnings release. Because firms report through different
          segments (standalone infrastructure, broader real assets, credit
          platforms), figures are not directly comparable across managers.
          Native currencies are used where applicable. &quot;Not
          Isolated&quot; indicates the firm does not break out pure
          infrastructure within its reported segment.
        </p>
      </div>

      {/* Asset Manager Cards */}
      <div className="space-y-4">
        {assetManagerCards.map((card) => (
          <AssetManagerCardComponent key={card.companyId} card={card} />
        ))}
      </div>
    </div>
  );
}
