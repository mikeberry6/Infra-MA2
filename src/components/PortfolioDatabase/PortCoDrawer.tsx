"use client";

import { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  ExternalLink,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import {
  getPortCoSectorColor,
  getPortCoStatusColor,
  getMilestoneCategoryColor,
  getStrategyColor,
} from "@/lib/colors";
import type { CompanyView, FundView } from "@/modules/shared/types";

export function PortCoDrawer({
  company,
  funds,
  onClose,
}: {
  company: CompanyView;
  funds: FundView[];
  onClose: () => void;
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const locationDisplay = company.headquarters || company.country;
  const milestones = company.milestones || [];
  const sources = company.sources || [];
  const reversedMilestones = [...milestones].reverse();
  const visibleMilestones = showAllMilestones ? reversedMilestones : reversedMilestones.slice(0, 6);

  const sectorColor = getPortCoSectorColor(company.sector);
  const matchedFund = funds.find(f => f.fundName === company.ownershipVehicle);
  const cSuiteManagement = (company.management || []).filter(exec =>
    /\bChief\b/i.test(exec.title) ||
    (/\bPresident\b/i.test(exec.title) && !/\bVice\s*President\b/i.test(exec.title))
  );

  const detailRows: { label: string; value: string; dot?: string; badges?: string[] }[] = [
    { label: "Firm", value: company.investmentFirm },
    { label: "Fund", value: company.ownershipVehicle },
    ...(matchedFund?.strategies?.length
      ? [{
          label: "Fund Strategy",
          value: matchedFund.strategies.join(", "),
          badges: matchedFund.strategies,
        }]
      : []),
    ...(company.investmentYear
      ? [{ label: "Investment Date", value: String(company.investmentYear) }]
      : []),
    {
      label: "Sector",
      value: company.sector,
      dot: sectorColor,
    },
    ...(company.subsector
      ? [{ label: "Subsector", value: company.subsector }]
      : []),
    { label: "Location", value: locationDisplay },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-black/[0.08] shadow-2xl bg-[#f3f3f3] overflow-y-auto animate-slide-in-right">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-white relative overflow-hidden">
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${sectorColor} 0%, transparent 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-3 sm:right-5 p-2 text-[#999999] hover:text-[#1a1a1a] hover:bg-[#f0f0ee] transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight tracking-tight">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4c4c4] hover:text-[#008253] transition-colors shrink-0"
                    title="Company website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-sm-dense text-[#6e6e6e]">
                  {company.investmentFirm}
                </span>
                <span className="text-[#c4c4c4] text-sm-dense">·</span>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: getPortCoStatusColor(company.status) }}
                />
                <span
                  className="text-sm-dense font-medium shrink-0"
                  style={{ color: getPortCoStatusColor(company.status) }}
                >
                  {company.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-3 lg:space-y-4">

          {/* §1 — Investment Details */}
          <section className="glass-card rounded-[4px] overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
              <Briefcase className="h-3.5 w-3.5 text-[#008253]" />
              <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                Investment Details
              </span>
            </div>
            <div className="divide-y divide-[#e8e8e8]">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-4 py-2.5"
                >
                  <span className="text-micro text-[#999999]">{row.label}</span>
                  {row.badges ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {row.badges.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-1.5 py-0"
                          style={{
                            color: "#444444",
                            backgroundColor: `${getStrategyColor(s)}08`,
                            border: `1px solid ${getStrategyColor(s)}12`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-micro text-[#1a1a1a] text-right font-medium flex items-center gap-1.5">
                      {row.dot && (
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
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

          {/* §2 — Company Overview / Description */}
          {company.description && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <FileText className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Company Overview
                </span>
              </div>
              <div className="px-4 py-4">
                <p className="text-sm-dense text-[#6e6e6e] leading-relaxed">
                  {company.description}
                </p>

                {/* Sources */}
                {sources.length > 0 && (
                  <div className="mt-4 bg-[#fafaf9] border border-[#e5e5e5] rounded-[3px] px-4 py-3">
                    <span className="text-micro font-medium text-[#999999] uppercase tracking-wider block mb-2">
                      Sources
                    </span>
                    <div className="space-y-1.5">
                      {sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 group"
                        >
                          <ExternalLink className="h-3 w-3 text-[#c4c4c4] group-hover:text-[#008253] transition-colors shrink-0" />
                          <span className="text-micro text-[#999999] group-hover:text-[#008253] transition-colors truncate">
                            {s.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* §3 — Historical Milestones */}
          {milestones.length > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <Clock className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Historical Milestones
                </span>
                <span className="text-micro text-[#999999] ml-auto">{milestones.length}</span>
              </div>
              <div className="px-4 py-4">
                <div className="relative ml-2">
                  <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#d6d6d6]" />
                  <div className="space-y-3">
                    {visibleMilestones.map((m, i) => {
                      const mentionsFirm = m.event.toLowerCase().includes(company.investmentFirm.toLowerCase().split(" ")[0]);
                      const isInvestmentMilestone = company.investmentYear
                        ? m.date.includes(String(company.investmentYear)) &&
                          (m.category === "Financing" || mentionsFirm)
                        : false;
                      return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 relative ${
                          isInvestmentMilestone
                            ? "bg-[#008253]/[0.06] -mx-4 px-4 py-2 border border-[#008253]/20 rounded-[3px]"
                            : ""
                        }`}
                      >
                        <div
                          className={`relative z-10 mt-1.5 shrink-0 border-2 ${
                            isInvestmentMilestone
                              ? "h-[13px] w-[13px] rounded-full"
                              : "h-[11px] w-[11px] rounded-full"
                          }`}
                          style={{
                            borderColor: isInvestmentMilestone ? "#008253" : getMilestoneCategoryColor(m.category),
                            backgroundColor: isInvestmentMilestone ? "#00825333" : `${getMilestoneCategoryColor(m.category)}33`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={`text-micro font-medium shrink-0 tabular-nums ${
                              isInvestmentMilestone ? "text-[#008253]" : "text-[#999999]"
                            }`}>
                              {m.date}
                            </span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0 shrink-0"
                              style={{
                                color: isInvestmentMilestone ? "#008253" : "#444444",
                                backgroundColor: isInvestmentMilestone ? "#00825308" : `${getMilestoneCategoryColor(m.category)}08`,
                                border: isInvestmentMilestone ? "1px solid #00825312" : `1px solid ${getMilestoneCategoryColor(m.category)}12`,
                              }}
                            >
                              {isInvestmentMilestone ? "Investment" : m.category}
                            </span>
                          </div>
                          <p className={`text-sm-dense mt-0.5 leading-relaxed ${
                            isInvestmentMilestone ? "text-[#1a1a1a]" : "text-[#6e6e6e]"
                          }`}>
                            {m.event}
                          </p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
                {milestones.length > 6 && (
                  <button
                    onClick={() => setShowAllMilestones(!showAllMilestones)}
                    className="mt-3 ml-2 text-micro text-[#008253] hover:text-[#a5b4fc] transition-colors"
                  >
                    {showAllMilestones
                      ? "Show less"
                      : `Show all ${milestones.length} milestones`}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* §4 — Key Management (C-Suite + President only) */}
          {cSuiteManagement.length > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <Users className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Key Management
                </span>
              </div>
              <div className="px-4 py-4">
                <div
                  className={`grid gap-2.5 ${
                    cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {cSuiteManagement.map((exec, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#fafaf9] border border-[#e8e8e8] rounded-[3px] px-3 py-2.5">
                      <div
                        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${sectorColor}10`,
                          color: sectorColor,
                          border: `1px solid ${sectorColor}20`,
                        }}
                      >
                        {exec.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm-dense text-[#1a1a1a] font-medium block leading-snug">
                          {exec.name}
                        </span>
                        <span className="text-micro text-[#999999] block mt-0.5">
                          {exec.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
