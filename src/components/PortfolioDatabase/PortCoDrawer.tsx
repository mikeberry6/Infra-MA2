"use client";

import { useState, useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import {
  getPortCoSectorColor,
  getPortCoStatusColor,
  getMilestoneCategoryColor,
  getStrategyColor,
} from "@/lib/colors";
import type { CompanyView, FundView, OwnerView, MilestoneView } from "@/modules/shared/types";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";
import { useScrolledPast } from "@/hooks/useScrolledPast";

type MilestoneClassification =
  | { kind: "entry"; owner: OwnerView }
  | { kind: "exit"; owner: OwnerView }
  | null;

function ownerFirstWord(firm: string): string {
  return firm.toLowerCase().split(/\s+/)[0] || "";
}

const CORPORATE_SUFFIX_RE =
  /\b(asset management|investment management|capital partners|capital management|capital|management|partners|investors|infrastructure|advisors|llc|lp|inc|ltd|plc|holdings)\b/gi;

function normalizeFirm(firm: string): string {
  return firm
    .toLowerCase()
    .replace(CORPORATE_SUFFIX_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

function classifyMilestone(m: MilestoneView, owners: OwnerView[]): MilestoneClassification {
  const matchedOwner = bestOwnerMatch(owners, m.event);

  if (matchedOwner?.investmentYear && m.date.includes(String(matchedOwner.investmentYear))) {
    return { kind: "entry", owner: matchedOwner };
  }
  for (const o of owners) {
    if (!o.investmentYear || !m.date.includes(String(o.investmentYear))) continue;
    if (m.category === "Financing" || m.category === "Acquisition") {
      return { kind: "entry", owner: o };
    }
  }

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
  return "N/A";
}

const ENTRY_COLOR = "#008253";
const EXIT_COLOR = "#9a3412"; // muted rust

/** Section heading — uppercase tracking, no icon (per redesign). */
function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {children}
      </span>
      {count != null && (
        <span className="text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{count}</span>
      )}
    </div>
  );
}

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);

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
        className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div ref={drawerRef} className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right shadow-overlay">
        {/* Left edge accent stripe — anchors the drawer in the data color */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{ backgroundColor: sectorColor }}
        />

        {/* ── Header ── */}
        <div
          className={`sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)] px-6 lg:px-8 py-5 lg:py-6 transition-shadow duration-150 ${
            headerScrolled ? "shadow-[0_1px_2px_rgba(17,17,20,0.04)]" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl lg:text-[28px] font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                    title="Company website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <span className="text-sm text-[var(--text-secondary)]">
                  {company.investmentFirm || "Unknown firm"}
                </span>
                <span className="text-[var(--text-tertiary)]">·</span>
                <Tag color={sectorColor}>{company.sector}</Tag>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-[5px] w-[5px] rounded-full shrink-0"
                    style={{ backgroundColor: getPortCoStatusColor(company.status) }}
                  />
                  <span className="text-sm text-[var(--text-primary)] font-medium">{company.status}</span>
                </span>
                {hasMultipleOwners && (
                  <>
                    <span className="text-[var(--text-tertiary)]">·</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {owners.length} owners
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6 lg:px-8 py-6 space-y-7">

          {/* §1 — Investment Details */}
          <section>
            <SectionLabel count={hasMultipleOwners ? owners.length : undefined}>
              Investment details
            </SectionLabel>

            {owners.length > 0 && (
              <div className="space-y-2 mb-5">
                {owners.map((owner, idx) => {
                  const matchedFund = owner.fundName
                    ? funds.find(f => f.fundName === owner.fundName)
                    : funds.find(f => f.fundName === owner.vehicle);
                  const yearRange = formatYearRange(owner);
                  const ownerStatusLabel = owner.isActive ? "Current" : "Former";
                  return (
                    <div key={`${owner.firm}-${idx}`} className="surface px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {owner.firm || "—"}
                            </span>
                            <Tag variant="solid">{ownerStatusLabel}</Tag>
                          </div>
                          {owner.vehicle && (
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              {owner.vehicle}
                            </div>
                          )}
                          {matchedFund?.strategies && matchedFund.strategies.length > 0 && (
                            <div className="flex items-center gap-3 flex-wrap mt-2">
                              {matchedFund.strategies.map((s) => (
                                <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
                              ))}
                            </div>
                          )}
                          {owner.stake && (
                            <div className="text-xs text-[var(--text-secondary)] mt-1.5">
                              Stake: <span className="text-[var(--text-primary)] font-medium">{owner.stake}</span>
                            </div>
                          )}
                        </div>
                        {yearRange && (
                          <span className="text-xs mono text-[var(--text-primary)] font-medium tabular-nums shrink-0">
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
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2.5 text-xs">
              <dt className="text-[var(--text-tertiary)]">Sector</dt>
              <dd><Tag color={sectorColor}>{company.sector}</Tag></dd>
              {company.subsector && (
                <>
                  <dt className="text-[var(--text-tertiary)]">Subsector</dt>
                  <dd className="text-[var(--text-primary)]">{company.subsector}</dd>
                </>
              )}
              <dt className="text-[var(--text-tertiary)]">Location</dt>
              <dd className="text-[var(--text-primary)]">{locationDisplay}</dd>
            </dl>
          </section>

          {/* §2 — Company Overview / Description */}
          {company.description && (
            <section className="border-t border-[var(--border)] pt-6">
              <SectionLabel>Overview</SectionLabel>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {company.description}
              </p>

              {sources.length > 0 && (
                <div className="mt-5 surface px-4 py-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Sources
                  </div>
                  <div className="space-y-1.5">
                    {sources.map((s, i) => {
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
                          className="inline-flex items-center gap-1.5 group mr-3"
                          title={s.label || s.url}
                        >
                          <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
                          <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                            {hostname}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* §3 — Historical Milestones */}
          {milestones.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <SectionLabel count={milestones.length}>Historical milestones</SectionLabel>
              <div className="relative pl-5">
                <div aria-hidden className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--border)]" />
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
                    const dotColor = isTransition && transitionColor
                      ? transitionColor
                      : getMilestoneCategoryColor(m.category);
                    return (
                      <div
                        key={i}
                        className={`relative ${isTransition ? "pl-3 -ml-3 border-l-2" : ""}`}
                        style={isTransition && transitionColor ? { borderLeftColor: transitionColor } : undefined}
                      >
                        {/* Dot */}
                        <div
                          aria-hidden
                          className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full ring-2 ring-[var(--bg-surface)]"
                          style={{ backgroundColor: dotColor }}
                        />
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[11px] mono text-[var(--text-tertiary)] tabular-nums">
                            {m.date}
                          </span>
                          {transitionLabel ? (
                            <Tag variant="solid">{transitionLabel}</Tag>
                          ) : (
                            <Tag color={getMilestoneCategoryColor(m.category)}>{m.category}</Tag>
                          )}
                          {transitionFirm && (
                            <span className="text-[11px] text-[var(--text-secondary)]">
                              {transitionFirm}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 leading-relaxed text-[var(--text-secondary)]">
                          {m.event}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {milestones.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 ml-5"
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                >
                  {showAllMilestones ? "Show less" : `Show all ${milestones.length} milestones`}
                </Button>
              )}
            </section>
          )}

          {/* §4 — Key Management */}
          {cSuiteManagement.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <SectionLabel>Key management</SectionLabel>
              <div className={`grid gap-2 ${cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                {cSuiteManagement.map((exec, i) => (
                  <div key={i} className="flex items-center gap-3 surface px-3 py-2.5">
                    <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)]">
                      {exec.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-[var(--text-primary)] font-medium leading-snug truncate">
                        {exec.name}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                        {exec.title}
                      </div>
                    </div>
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
