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
import type { CompanyView, FundView, OwnerView, MilestoneView } from "@/modules/shared/types";

type MilestoneClassification =
  | { kind: "entry"; owner: OwnerView }
  | { kind: "exit"; owner: OwnerView }
  | null;

function ownerFirstWord(firm: string): string {
  return firm.toLowerCase().split(/\s+/)[0] || "";
}

// Strip generic corporate suffixes so "Brookfield Asset Management" can match
// an event that just says "Brookfield acquires X".
const CORPORATE_SUFFIX_RE =
  /\b(asset management|investment management|capital partners|capital management|capital|management|partners|investors|infrastructure|advisors|llc|lp|inc|ltd|plc|holdings)\b/gi;

function normalizeFirm(firm: string): string {
  return firm
    .toLowerCase()
    .replace(CORPORATE_SUFFIX_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Score how well an owner is mentioned in an event string.
//   2 = full normalized firm name appears in the event text
//   1 = first word of firm appears AND no other owner scored 2
//   0 = no mention
// Returns the highest-scoring owner, or null if no owner is mentioned.
function bestOwnerMatch(owners: OwnerView[], eventText: string): OwnerView | null {
  const lowerEvent = eventText.toLowerCase();
  let best: { owner: OwnerView; score: number } | null = null;
  for (const o of owners) {
    if (!o.firm) continue;
    const normalized = normalizeFirm(o.firm);
    let score = 0;
    if (normalized && normalized.length >= 3 && lowerEvent.includes(normalized)) {
      score = 2;
    } else {
      const firstWord = ownerFirstWord(o.firm);
      if (firstWord && firstWord.length >= 3 && lowerEvent.includes(firstWord)) {
        score = 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { owner: o, score };
    }
  }
  return best?.owner ?? null;
}

// Classify a milestone as an entry or exit transition for one of the owners.
// Entry: the milestone year matches an owner's investmentYear AND
//        (category is Financing/Acquisition OR the event mentions the firm).
// Exit:  the milestone year matches an owner's exitYear AND
//        (category is Divestiture OR the event mentions the firm).
// When multiple owners' first-word matches collide (e.g. two "Brookfield"
// vehicles), the firm whose full normalized name appears in the event wins;
// otherwise we fall back to the year-aligned owner.
function classifyMilestone(m: MilestoneView, owners: OwnerView[]): MilestoneClassification {
  const matchedOwner = bestOwnerMatch(owners, m.event);

  // Entry pass: prefer the explicitly-mentioned owner when the year aligns;
  // otherwise fall back to year-aligned owner with a categorical entry.
  if (matchedOwner?.investmentYear && m.date.includes(String(matchedOwner.investmentYear))) {
    return { kind: "entry", owner: matchedOwner };
  }
  for (const o of owners) {
    if (!o.investmentYear || !m.date.includes(String(o.investmentYear))) continue;
    if (m.category === "Financing" || m.category === "Acquisition") {
      return { kind: "entry", owner: o };
    }
  }

  // Exit pass: same precedence — explicit firm mention beats categorical fallback.
  if (matchedOwner?.exitYear && m.date.includes(String(matchedOwner.exitYear))) {
    return { kind: "exit", owner: matchedOwner };
  }
  for (const o of owners) {
    if (!o.exitYear || !m.date.includes(String(o.exitYear))) continue;
    if (m.category === "Divestiture") {
      return { kind: "exit", owner: o };
    }
  }
  return null;
}

function formatYearRange(o: OwnerView): string {
  if (o.investmentYear && o.exitYear) return `${o.investmentYear}–${o.exitYear}`;
  if (o.investmentYear && o.isActive) return `${o.investmentYear}–Present`;
  if (o.investmentYear) return String(o.investmentYear);
  if (o.exitYear) return `–${o.exitYear}`;
  return "";
}

const ENTRY_COLOR = "#008253";
const EXIT_COLOR = "#9a3412"; // muted rust — distinct from entry green and from category red

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
  // Milestones arrive from queries.ts ordered by sortDate desc (newest first),
  // which matches the "reverse chronological" rendering described in CLAUDE.md.
  // Render that order directly; truncating to 6 keeps the most recent events.
  const milestones = company.milestones || [];
  const sources = company.sources || [];
  const visibleMilestones = showAllMilestones ? milestones : milestones.slice(0, 6);

  const sectorColor = getPortCoSectorColor(company.sector);
  const owners = company.owners || [];
  const hasMultipleOwners = owners.length > 1;
  const cSuiteManagement = (company.management || []).filter(exec =>
    /\bChief\b/i.test(exec.title) ||
    (/\bPresident\b/i.test(exec.title) && !/\bVice\s*President\b/i.test(exec.title))
  );

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

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-sm-dense text-[#6e6e6e]">
                  {company.investmentFirm || "Unknown firm"}
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
                {hasMultipleOwners && (
                  <>
                    <span className="text-[#c4c4c4] text-sm-dense">·</span>
                    <span className="text-sm-dense text-[#6e6e6e]">
                      {owners.length} owners
                    </span>
                  </>
                )}
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
              {hasMultipleOwners && (
                <span className="text-micro text-[#999999] ml-auto">{owners.length} owners</span>
              )}
            </div>

            {/* Ownership cards: one per owner, active first, then prior owners (chronological) */}
            {owners.length > 0 && (
              <div className="divide-y divide-[#e8e8e8]">
                {owners.map((owner, idx) => {
                  const matchedFund = owner.fundName
                    ? funds.find(f => f.fundName === owner.fundName)
                    : funds.find(f => f.fundName === owner.vehicle);
                  const yearRange = formatYearRange(owner);
                  const ownerStatusColor = owner.isActive
                    ? getPortCoStatusColor("Active")
                    : getPortCoStatusColor("Realized");
                  const ownerStatusLabel = owner.isActive ? "Current" : "Former";
                  return (
                    <div key={`${owner.firm}-${idx}`} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: ownerStatusColor }}
                            />
                            <span className="text-sm-dense font-semibold text-[#1a1a1a]">
                              {owner.firm || "—"}
                            </span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0 shrink-0"
                              style={{
                                color: "#444444",
                                backgroundColor: `${ownerStatusColor}10`,
                                border: `1px solid ${ownerStatusColor}20`,
                              }}
                            >
                              {ownerStatusLabel}
                            </span>
                          </div>
                          {owner.vehicle && (
                            <div className="text-micro text-[#6e6e6e] mt-1">
                              {owner.vehicle}
                            </div>
                          )}
                          {matchedFund?.strategies && matchedFund.strategies.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                              {matchedFund.strategies.map((s) => (
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
                          )}
                          {owner.stake && (
                            <div className="text-micro text-[#6e6e6e] mt-1">
                              Stake: {owner.stake}
                            </div>
                          )}
                        </div>
                        {yearRange && (
                          <span className="text-micro text-[#1a1a1a] font-medium tabular-nums shrink-0">
                            {yearRange}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sector / Subsector / Location */}
            <div className="divide-y divide-[#e8e8e8] border-t border-black/[0.06]">
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-micro text-[#999999]">Sector</span>
                <span className="text-micro text-[#1a1a1a] text-right font-medium flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: sectorColor }}
                  />
                  {company.sector}
                </span>
              </div>
              {company.subsector && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-micro text-[#999999]">Subsector</span>
                  <span className="text-micro text-[#1a1a1a] text-right font-medium">
                    {company.subsector}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-micro text-[#999999]">Location</span>
                <span className="text-micro text-[#1a1a1a] text-right font-medium">
                  {locationDisplay}
                </span>
              </div>
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
                      {sources.map((s, i) => {
                        // Source.label values are inconsistent ("domain — company
                        // name", duplicated by another field, sometimes blank).
                        // Derive the hostname from the URL — same approach the
                        // Fund drawer uses — so the list is informative and
                        // distinguishes truly distinct articles even when the
                        // labels are uninformative.
                        let hostname = s.url;
                        try {
                          hostname = new URL(s.url).hostname.replace(/^www\./, "");
                        } catch {}
                        return (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 group"
                            title={s.label || s.url}
                          >
                            <ExternalLink className="h-3 w-3 text-[#c4c4c4] group-hover:text-[#008253] transition-colors shrink-0" />
                            <span className="text-micro text-[#999999] group-hover:text-[#008253] transition-colors truncate">
                              {hostname}
                            </span>
                          </a>
                        );
                      })}
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
                      const classification = classifyMilestone(m, owners);
                      const isTransition = classification !== null;
                      const transitionColor =
                        classification?.kind === "entry"
                          ? ENTRY_COLOR
                          : classification?.kind === "exit"
                          ? EXIT_COLOR
                          : null;
                      const transitionLabel =
                        classification?.kind === "entry"
                          ? "Investment"
                          : classification?.kind === "exit"
                          ? "Exit"
                          : null;
                      const transitionFirm = classification?.owner.firm;
                      return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 relative ${
                          isTransition && transitionColor
                            ? "-mx-4 px-4 py-2 border rounded-[3px]"
                            : ""
                        }`}
                        style={
                          isTransition && transitionColor
                            ? {
                                backgroundColor: `${transitionColor}0F`,
                                borderColor: `${transitionColor}33`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className={`relative z-10 mt-1.5 shrink-0 border-2 ${
                            isTransition
                              ? "h-[13px] w-[13px] rounded-full"
                              : "h-[11px] w-[11px] rounded-full"
                          }`}
                          style={{
                            borderColor: isTransition && transitionColor
                              ? transitionColor
                              : getMilestoneCategoryColor(m.category),
                            backgroundColor: isTransition && transitionColor
                              ? `${transitionColor}33`
                              : `${getMilestoneCategoryColor(m.category)}33`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span
                              className="text-micro font-medium shrink-0 tabular-nums"
                              style={{
                                color: isTransition && transitionColor
                                  ? transitionColor
                                  : "#999999",
                              }}
                            >
                              {m.date}
                            </span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0 shrink-0"
                              style={{
                                color: isTransition && transitionColor ? transitionColor : "#444444",
                                backgroundColor: isTransition && transitionColor
                                  ? `${transitionColor}10`
                                  : `${getMilestoneCategoryColor(m.category)}08`,
                                border: isTransition && transitionColor
                                  ? `1px solid ${transitionColor}20`
                                  : `1px solid ${getMilestoneCategoryColor(m.category)}12`,
                              }}
                            >
                              {transitionLabel ?? m.category}
                            </span>
                            {transitionFirm && (
                              <span className="text-[10px] text-[#6e6e6e] shrink-0">
                                {transitionFirm}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm-dense mt-0.5 leading-relaxed ${
                              isTransition ? "text-[#1a1a1a]" : "text-[#6e6e6e]"
                            }`}
                          >
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
