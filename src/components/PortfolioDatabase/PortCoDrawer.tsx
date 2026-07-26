"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import {
  getMilestoneCategoryColor,
  getPortCoSectorColor,
  getPortCoStatusColor,
  getStrategyColor,
} from "@/lib/colors";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDrawerShellTiming } from "@/hooks/useDrawerShellTiming";
import type {
  CompanyDetail,
  FundStrategyView,
  MilestoneView,
  RecordMeta,
} from "@/modules/shared/types";

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

type DetailRow = {
  label: string;
  value: string;
  dot?: string;
  badges?: string[];
};

function milestoneSortKey(milestone: MilestoneView): number {
  const fullDate = milestone.date.match(/^(\w+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (fullDate) {
    return Number(fullDate[3]) * 10_000
      + (MONTHS[fullDate[1].toLowerCase()] ?? 1) * 100
      + Number(fullDate[2]);
  }
  const monthYear = milestone.date.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    return Number(monthYear[2]) * 10_000
      + (MONTHS[monthYear[1].toLowerCase()] ?? 1) * 100;
  }
  const quarter = milestone.date.match(/^Q([1-4])\s+(\d{4})$/i);
  if (quarter) {
    return Number(quarter[2]) * 10_000 + (Number(quarter[1]) - 1) * 300 + 100;
  }
  const year = milestone.date.match(/\b((?:18|19|20)\d{2})\b/);
  return year ? Number(year[1]) * 10_000 : 0;
}

function verificationDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
}

function DarkSurfaceTag({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="shrink-0 rounded-[4px] px-1.5 py-0 text-[10px] font-medium leading-4 text-[#EDEDED]"
      style={{
        // The sitewide #444 tag text is designed for light surfaces. This
        // scorecard is intentionally dark, so retain the canonical sizing and
        // color cue while using AA-safe neutral text.
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

function StrategyBadge({ strategy }: { strategy: string }) {
  return <DarkSurfaceTag label={strategy} color={getStrategyColor(strategy)} />;
}

function DetailStateNotice({
  state,
  onRetry,
}: {
  state: "idle" | "loading" | "ready" | "error";
  onRetry?: () => void;
}) {
  if (state === "ready" || state === "idle") return null;
  if (state === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-4 mt-4 flex items-center gap-3 rounded-[4px] border border-[#27272A] bg-[#111113] px-4 py-3 text-sm-dense text-[#A1A1AA] sm:mx-6 lg:mx-8"
      >
        <span
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#3F3F46] border-t-[#818CF8]"
        />
        Loading the latest verified detail…
      </div>
    );
  }
  return (
    <div
      role="alert"
      className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-[4px] border border-[#7F1D1D] bg-[#450A0A]/40 px-4 py-3 text-sm-dense text-[#FECACA] sm:mx-6 lg:mx-8"
    >
      <span>Latest detail could not be loaded. Showing the list record.</span>
      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="!text-[#FECACA] hover:!bg-white/10 hover:!text-white"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export function PortCoDrawer({
  company,
  funds,
  onClose,
  detailState = "ready",
  onRetry,
  detailMeta,
}: {
  company: CompanyDetail;
  funds: FundStrategyView[];
  onClose: () => void;
  detailState?: "idle" | "loading" | "ready" | "error";
  onRetry?: () => void;
  detailMeta?: RecordMeta | null;
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(drawerRef);
  useDrawerShellTiming("company", company.id);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setShowAllMilestones(false);
  }, [company.id]);

  const sectorColor = getPortCoSectorColor(company.sector);
  const statusColor = getPortCoStatusColor(company.status);
  const locationDisplay = company.headquarters || company.country || "Not disclosed";
  const matchedFund = funds.find((fund) => fund.fundName === company.ownershipVehicle);
  const milestones = useMemo(() => (
    [...(company.milestones || [])]
      .map((milestone, index) => ({ milestone, index }))
      .sort((left, right) => (
        milestoneSortKey(right.milestone) - milestoneSortKey(left.milestone)
        || left.index - right.index
      ))
      .map(({ milestone }) => milestone)
  ), [company.milestones]);
  const visibleMilestones = showAllMilestones ? milestones : milestones.slice(0, 6);
  const sources = company.sources || [];
  const cSuiteManagement = (company.management || []).filter((executive) => (
    /\bChief\b/i.test(executive.title)
    || (/\bPresident\b/i.test(executive.title) && !/\bVice\s*President\b/i.test(executive.title))
  ));

  const detailRows: DetailRow[] = [
    { label: "Firm", value: company.investmentFirm || "Not disclosed" },
    { label: "Fund", value: company.ownershipVehicle || "Not disclosed" },
    ...(matchedFund?.strategies.length
      ? [{
        label: "Fund Strategy",
        value: matchedFund.strategies.join(", "),
        badges: matchedFund.strategies,
      }]
      : []),
    ...(company.investmentYear
      ? [{ label: "Investment Date", value: String(company.investmentYear) }]
      : []),
    { label: "Sector", value: company.sector, dot: sectorColor },
    ...(company.subsector
      ? [{ label: "Subsector", value: company.subsector }]
      : []),
    { label: "Location", value: locationDisplay },
  ];

  return (
    <>
      <div
        aria-hidden="true"
        data-dialog-backdrop-owner="portco-drawer-dialog"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        id="portco-drawer-dialog"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portco-drawer-title"
        aria-busy={detailState === "loading"}
        tabIndex={-1}
        className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-lg overflow-y-auto border-l border-[#27272A] bg-[#09090B] shadow-overlay animate-slide-in-right lg:max-w-xl xl:max-w-2xl"
      >
        <header className="sticky top-0 z-10 overflow-hidden border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${sectorColor} 0%, transparent 100%)` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full animate-pulse-slow"
            style={{ backgroundColor: sectorColor, opacity: 0.10, filter: "blur(80px)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 right-0 h-48 w-48 rounded-full animate-pulse-slower"
            style={{ backgroundColor: "#818CF8", opacity: 0.07, filter: "blur(80px)" }}
          />

          <div className="relative px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="absolute right-3 top-4 rounded-[4px] p-2 text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-[#EDEDED] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8] sm:right-5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2.5">
                <h2
                  id="portco-drawer-title"
                  className="text-2xl font-bold leading-tight tracking-tight text-[#EDEDED] lg:text-3xl"
                >
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${company.name} website`}
                    className="shrink-0 text-[#A1A1AA] transition-colors hover:text-[#818CF8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm-dense">
                <span className="text-[#A1A1AA]">{company.investmentFirm || "Sponsor not disclosed"}</span>
                <span className="text-[#A1A1AA]">·</span>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="shrink-0 font-medium" style={{ color: statusColor }}>
                  {company.status}
                </span>
              </div>
            </div>
          </div>
        </header>

        <DetailStateNotice
          state={detailState}
          onRetry={onRetry
            ? () => {
                drawerRef.current?.focus();
                onRetry();
              }
            : undefined}
        />
        {detailMeta && (
          <div className="mx-4 mt-3 text-micro text-[#A1A1AA] sm:mx-6 lg:mx-8">
            Last verified{" "}
            <span className="mono tabular-nums text-[#EDEDED]">
              {detailMeta.lastVerifiedAt
                ? verificationDate(detailMeta.lastVerifiedAt)
                : "Not recorded"}
            </span>
            {" · "}
            <span className="mono tabular-nums text-[#EDEDED]">
              {detailMeta.sourceCount}
            </span>
            {" "}source{detailMeta.sourceCount === 1 ? "" : "s"}
          </div>
        )}

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          <section aria-labelledby="investment-details-heading">
            <div className="mb-3 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-[#818CF8]" />
              <h3
                id="investment-details-heading"
                className="text-micro font-medium uppercase tracking-wider text-[#A1A1AA]"
              >
                Investment Details
              </h3>
            </div>
            <div className="glass-card divide-y divide-[#27272A] rounded-[4px] border border-[#27272A] bg-[#111113]">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="text-micro text-[#A1A1AA]">{row.label}</span>
                  {row.badges ? (
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {row.badges.map((strategy) => (
                        <StrategyBadge key={strategy} strategy={strategy} />
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-right text-micro font-medium text-[#EDEDED]">
                      {row.dot && (
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: row.dot }}
                        />
                      )}
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {(company.description || sources.length > 0) && (
            <section aria-labelledby="company-overview-heading" className="border-t border-[#27272A] pt-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[#818CF8]" />
                <h3
                  id="company-overview-heading"
                  className="text-micro font-medium uppercase tracking-wider text-[#A1A1AA]"
                >
                  Company Overview
                </h3>
              </div>
              {company.description && (
                <p className="text-sm-dense leading-relaxed text-[#A1A1AA]">
                  {company.description}
                </p>
              )}
              {sources.length > 0 && (
                <div className="mt-4 rounded-[4px] border border-[#1F1F23] bg-[#111113] px-4 py-3">
                  <span className="mb-2 block text-micro font-medium uppercase tracking-wider text-[#A1A1AA]">
                    Sources
                  </span>
                  <div className="space-y-1.5">
                    {sources.map((source, index) => (
                      <a
                        key={`${source.url}-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("source_link_clicked", {
                          entity: "company",
                          placement: "drawer",
                        })}
                        className="group flex min-h-6 items-center gap-2 rounded-sm py-1 text-[#A1A1AA] transition-colors hover:text-[#818CF8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 transition-colors" />
                        <span className="truncate text-micro font-medium">
                          {source.label || source.url}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {milestones.length > 0 && (
            <section aria-labelledby="historical-milestones-heading" className="border-t border-[#27272A] pt-6">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#818CF8]" />
                <h3
                  id="historical-milestones-heading"
                  className="text-micro font-medium uppercase tracking-wider text-[#A1A1AA]"
                >
                  Historical Milestones
                </h3>
              </div>
              <div className="relative ml-2">
                <div aria-hidden className="absolute bottom-1 left-[5px] top-1 w-px bg-[#27272A]" />
                <div className="space-y-3">
                  {visibleMilestones.map((milestone, index) => {
                    const firstFirmWord = company.investmentFirm.trim().toLowerCase().split(/\s+/)[0];
                    const mentionsFirm = firstFirmWord.length > 0
                      && milestone.event.toLowerCase().includes(firstFirmWord);
                    const isInvestmentMilestone = company.investmentYear
                      ? milestone.date.includes(String(company.investmentYear))
                        && (milestone.category === "Financing" || mentionsFirm)
                      : false;
                    const categoryColor = isInvestmentMilestone
                      ? "#818CF8"
                      : getMilestoneCategoryColor(milestone.category);
                    return (
                      <div
                        key={`${milestone.date}-${milestone.event}-${index}`}
                        data-investment-milestone={isInvestmentMilestone ? "true" : undefined}
                        className={`relative flex items-start gap-3 ${
                          isInvestmentMilestone
                            ? "-mx-2 rounded-[6px] border border-[#818CF8]/20 bg-[#818CF8]/[0.06] px-2 py-2"
                            : ""
                        }`}
                      >
                        <div
                          aria-hidden
                          className={`relative z-[1] mt-1.5 shrink-0 rounded-full border-2 ${
                            isInvestmentMilestone ? "h-[13px] w-[13px]" : "h-[11px] w-[11px]"
                          }`}
                          style={{
                            borderColor: categoryColor,
                            backgroundColor: `${categoryColor}33`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span
                              className="shrink-0 text-micro font-medium tabular-nums"
                              style={{ color: isInvestmentMilestone ? "#818CF8" : "#A1A1AA" }}
                            >
                              {milestone.date}
                            </span>
                            <DarkSurfaceTag
                              label={isInvestmentMilestone ? "Investment" : milestone.category}
                              color={categoryColor}
                            />
                          </div>
                          <p className={`mt-0.5 text-sm-dense leading-relaxed ${
                            isInvestmentMilestone ? "text-[#EDEDED]" : "text-[#A1A1AA]"
                          }`}
                          >
                            {milestone.event}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {milestones.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllMilestones((current) => !current)}
                  className="ml-2 mt-3 rounded-sm text-micro font-medium text-[#818CF8] transition-colors hover:text-[#A5B4FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]"
                >
                  {showAllMilestones ? "Show less" : `Show all ${milestones.length} milestones`}
                </button>
              )}
            </section>
          )}

          {cSuiteManagement.length > 0 && (
            <section aria-labelledby="key-management-heading" className="border-t border-[#27272A] pt-6">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-[#818CF8]" />
                <h3
                  id="key-management-heading"
                  className="text-micro font-medium uppercase tracking-wider text-[#A1A1AA]"
                >
                  Key Management
                </h3>
              </div>
              <div className={`grid gap-2 ${cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {cSuiteManagement.map((executive, index) => (
                  <div
                    key={`${executive.name}-${index}`}
                    className="glass-card rounded-[4px] border border-[#27272A] bg-[#111113] px-4 py-3"
                  >
                    <span className="block text-sm-dense font-medium leading-snug text-[#EDEDED]">
                      {executive.name}
                    </span>
                    <span className="mt-0.5 block text-micro text-[#A1A1AA]">
                      {executive.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
