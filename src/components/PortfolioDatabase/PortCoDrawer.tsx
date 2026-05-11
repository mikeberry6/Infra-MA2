"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { X, ExternalLink } from "lucide-react";
import {
  getPortCoSectorColor,
  getPortCoStatusColor,
  getMilestoneCategoryColor,
  getStrategyColor,
} from "@/lib/colors";
import {
  formatSourceType,
  getSourceDisplayLabel,
  getSourceHostname,
  groupSourcesByPurpose,
  inferSourceType,
} from "@/lib/source-utils";
import type { CompanyView, FundView, OwnerView, MilestoneView, SourceView } from "@/modules/shared/types";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useScrolledPast } from "@/hooks/useScrolledPast";

type MilestoneClassification =
  | { kind: "entry"; owner: OwnerView }
  | { kind: "exit"; owner: OwnerView }
  | null;

type DiligenceFact = {
  claim: string;
  label: string;
  value?: ReactNode;
  children?: ReactNode;
};

const MATERIAL_MILESTONE_CATEGORIES = new Set(["Founding", "Financing", "Acquisition", "Divestiture"]);

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
  for (const owner of owners) {
    if (!owner.firm) continue;
    const normalized = normalizeFirm(owner.firm);
    let score = 0;
    if (normalized && normalized.length >= 3 && lowerEvent.includes(normalized)) {
      score = 2;
    } else {
      const firstWord = ownerFirstWord(owner.firm);
      if (firstWord && firstWord.length >= 3 && lowerEvent.includes(firstWord)) {
        score = 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { owner, score };
    }
  }
  return best?.owner ?? null;
}

function classifyMilestone(milestone: MilestoneView, owners: OwnerView[]): MilestoneClassification {
  const matchedOwner = bestOwnerMatch(owners, milestone.event);

  if (matchedOwner?.investmentYear && milestone.date.includes(String(matchedOwner.investmentYear))) {
    return { kind: "entry", owner: matchedOwner };
  }
  for (const owner of owners) {
    if (!owner.investmentYear || !milestone.date.includes(String(owner.investmentYear))) continue;
    if (milestone.category === "Financing" || milestone.category === "Acquisition") {
      return { kind: "entry", owner };
    }
  }

  if (matchedOwner?.exitYear && milestone.date.includes(String(matchedOwner.exitYear))) {
    return { kind: "exit", owner: matchedOwner };
  }
  for (const owner of owners) {
    if (!owner.exitYear || !milestone.date.includes(String(owner.exitYear))) continue;
    if (milestone.category === "Divestiture") {
      return { kind: "exit", owner };
    }
  }
  return null;
}

function formatCompactYearRange(owner: OwnerView): string {
  if (owner.investmentYear && owner.exitYear) return `${owner.investmentYear}-${owner.exitYear}`;
  if (owner.investmentYear && isCurrentOwner(owner)) return `${owner.investmentYear}-Present`;
  if (owner.investmentYear) return String(owner.investmentYear);
  if (owner.exitYear) return `Exited ${owner.exitYear}`;
  return "N/A";
}

function isCurrentOwner(owner: OwnerView): boolean {
  return owner.isActive && !owner.exitYear;
}

function ownerDisplayKey(owner: OwnerView): string {
  return `${normalizeFirm(owner.firm) || owner.firm.trim().toLowerCase()}|${isCurrentOwner(owner) ? "active" : "former"}`;
}

function vehicleScore(owner: OwnerView): number {
  if (!owner.vehicle) return 0;
  let score = 1;
  if (owner.fundName) score += 2;
  if (owner.vehicle.length <= 72) score += 2;
  if (owner.vehicle.length > 140 || /;/.test(owner.vehicle)) score -= 2;
  return score;
}

function mergeOwnerDisplayRows(owners: OwnerView[]): OwnerView[] {
  const byOwner = new Map<string, OwnerView[]>();

  for (const owner of owners) {
    const key = ownerDisplayKey(owner);
    byOwner.set(key, [...(byOwner.get(key) || []), owner]);
  }

  return Array.from(byOwner.values()).map((group) => {
    const preferred = [...group].sort((a, b) => vehicleScore(b) - vehicleScore(a))[0];
    const investmentYears = group
      .map((owner) => owner.investmentYear)
      .filter((year): year is number => typeof year === "number");
    const exitYears = group
      .map((owner) => owner.exitYear)
      .filter((year): year is number => typeof year === "number");
    const stakes = uniqueValues(group.map((owner) => owner.stake));

    return {
      ...preferred,
      investmentYear: investmentYears.length > 0 ? Math.min(...investmentYears) : preferred.investmentYear,
      exitYear: exitYears.length > 0 ? Math.max(...exitYears) : preferred.exitYear,
      stake: stakes.length > 0 ? compactList(stakes, 2) : preferred.stake,
    };
  });
}

function splitOwners(owners: OwnerView[]): { active: OwnerView[]; former: OwnerView[] } {
  return {
    active: owners.filter((owner) => isCurrentOwner(owner)),
    former: owners.filter((owner) => !isCurrentOwner(owner)),
  };
}

function getPrimaryOwner(owners: OwnerView[]): OwnerView | null {
  const { active } = splitOwners(owners);
  return active[0] ?? owners[0] ?? null;
}

function uniqueValues(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => !!value)));
}

function compactList(values: string[], max = 2): string {
  if (values.length === 0) return "Not disclosed";
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max}`;
}

function normalizeFactValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getIdentityDescriptor(company: CompanyView): string {
  return company.subsector?.trim() || company.sector || "Portfolio company";
}

function buildUniqueFacts(facts: DiligenceFact[], reservedClaims: string[] = []): DiligenceFact[] {
  const seen = new Set(reservedClaims);
  return facts.filter((fact) => {
    if (seen.has(fact.claim) || (!fact.value && !fact.children)) return false;
    seen.add(fact.claim);
    return true;
  });
}

function shouldShowOwnershipLedger(
  activeOwners: OwnerView[],
  formerOwners: OwnerView[],
  vehicleLabel: string,
): boolean {
  if (activeOwners.length > 1 || formerOwners.length > 0) return true;

  return activeOwners.some((owner) => {
    const hasDistinctVehicle =
      owner.vehicle &&
      vehicleLabel !== "Not disclosed" &&
      normalizeFactValue(owner.vehicle) !== normalizeFactValue(vehicleLabel);
    return !!owner.stake || !!hasDistinctVehicle;
  });
}

function getMatchedFund(owner: OwnerView | null, funds: FundView[]): FundView | undefined {
  if (!owner) return undefined;
  if (owner.fundName) {
    const fund = funds.find((f) => f.fundName === owner.fundName);
    if (fund) return fund;
  }
  return owner.vehicle ? funds.find((f) => f.fundName === owner.vehicle) : undefined;
}

function getOwnerStrategies(owner: OwnerView | null, funds: FundView[]): string[] {
  return getMatchedFund(owner, funds)?.strategies ?? [];
}

function splitDescription(description: string): { lead: string; body: string } {
  const trimmed = description.trim();
  if (!trimmed) return { lead: "", body: "" };

  const match = trimmed.match(/^(.{80,260}?[.!?])\s+([\s\S]+)$/);
  if (!match) return { lead: trimmed, body: "" };
  return { lead: match[1], body: match[2].trim() };
}

function dedupeMilestones(milestones: MilestoneView[]): MilestoneView[] {
  const seen = new Set<string>();
  return milestones.filter((milestone) => {
    const key = `${milestone.date.trim().toLowerCase()}|${milestone.event.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeSources(sources: SourceView[]): SourceView[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = [
      source.url.trim().toLowerCase(),
      getSourceDisplayLabel(source).trim().toLowerCase(),
      source.purpose ?? "",
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMaterialMilestones(milestones: MilestoneView[], owners: OwnerView[], limit = 5): MilestoneView[] {
  if (milestones.length <= limit) return milestones;

  const selected = milestones
    .map((milestone, index) => {
      const classification = classifyMilestone(milestone, owners);
      const isMaterialCategory = MATERIAL_MILESTONE_CATEGORIES.has(milestone.category);
      const recencyScore = Math.max(0, limit + 2 - index);
      const score =
        (classification ? 100 : 0) +
        (isMaterialCategory ? 40 : 0) +
        (milestone.category !== "Other" ? 10 : 0) +
        recencyScore;

      return { milestone, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index);

  return selected.map(({ milestone }) => milestone);
}

function buildOwnershipFacts({
  sponsorLabel,
  activeSponsorCount,
  vehicleLabel,
  strategies,
  stakes,
}: {
  sponsorLabel: string;
  activeSponsorCount: number;
  vehicleLabel: string;
  strategies: string[];
  stakes: string[];
}): DiligenceFact[] {
  return buildUniqueFacts(
    [
      {
        claim: "sponsor",
        label: "Sponsor",
        value: sponsorLabel !== "Not disclosed" ? sponsorLabel : undefined,
        children: activeSponsorCount > 1 ? (
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {pluralize(activeSponsorCount, "current sponsor")}
          </span>
        ) : undefined,
      },
      {
        claim: "vehicle",
        label: "Vehicle",
        value: vehicleLabel !== "Not disclosed" ? vehicleLabel : undefined,
      },
      {
        claim: "strategy",
        label: "Strategy",
        children: strategies.length > 0 ? (
          <>
            {strategies.map((strategy) => (
              <Tag key={strategy} color={getStrategyColor(strategy)}>{strategy}</Tag>
            ))}
          </>
        ) : undefined,
      },
      {
        claim: "stake",
        label: "Stake",
        value: stakes.length > 0 ? compactList(stakes, 2) : undefined,
      },
    ],
    ["status", "geography", "holdPeriod", "evidence"],
  );
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="h-[5px] w-[5px] shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function HeaderMetaItem({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

function FactRow({ label, value, children }: { label: string; value?: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </div>
      {value && (
        <div className="mt-1 text-sm font-semibold leading-snug text-[var(--text-primary)]">
          {value}
        </div>
      )}
      {children && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">{children}</div>}
    </div>
  );
}

function OwnerLine({ owner, funds }: { owner: OwnerView; funds: FundView[] }) {
  const strategies = getOwnerStrategies(owner, funds);

  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-snug text-[var(--text-primary)]">
            {owner.firm || "Unknown owner"}
          </div>
          <div className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">
            {owner.vehicle || "Vehicle not disclosed"}
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--text-primary)] mono">
          {formatCompactYearRange(owner)}
        </span>
      </div>
      {(strategies.length > 0 || owner.stake) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {strategies.map((strategy) => (
            <Tag key={strategy} color={getStrategyColor(strategy)}>{strategy}</Tag>
          ))}
          {owner.stake && (
            <span className="text-[11px] text-[var(--text-tertiary)]">Stake: {owner.stake}</span>
          )}
        </div>
      )}
    </div>
  );
}

function EvidenceGroups({ sources }: { sources: SourceView[] }) {
  const groups = groupSourcesByPurpose(sources);

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {groups.map((group) => (
        <div key={group.purpose} className="py-4">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            {group.label}
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
            {group.sources.map((source, i) => (
              <a
                key={`${source.url}-${group.purpose}-${i}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 items-start gap-2 rounded-[6px] py-1.5 transition-colors hover:text-[var(--text-primary)]"
                title={source.label || source.url}
              >
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--text-primary)]" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)]">
                    {getSourceDisplayLabel(source)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-[var(--text-tertiary)]">
                    {getSourceHostname(source.url)} / {formatSourceType(inferSourceType(source))}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
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
  const [showFormerOwners, setShowFormerOwners] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setShowAllMilestones(false);
    setShowFormerOwners(false);
  }, [company.id]);

  const sectorColor = getPortCoSectorColor(company.sector);
  const statusColor = getPortCoStatusColor(company.status);
  const locationDisplay = company.headquarters || company.country || "Not disclosed";
  const owners = company.owners;
  const displayOwners = useMemo(() => mergeOwnerDisplayRows(owners), [owners]);
  const { active: activeOwners, former: formerOwners } = useMemo(() => splitOwners(displayOwners), [displayOwners]);
  const primaryOwner = useMemo(() => getPrimaryOwner(displayOwners), [displayOwners]);
  const primaryStrategies = useMemo(() => getOwnerStrategies(primaryOwner, funds), [primaryOwner, funds]);
  const identityDescriptor = useMemo(() => getIdentityDescriptor(company), [company]);
  const descriptorOwnsSector = normalizeFactValue(identityDescriptor) === normalizeFactValue(company.sector);
  const activeSponsorNames = uniqueValues(activeOwners.map((owner) => owner.firm));
  const currentSponsorNames = activeSponsorNames.length > 0
    ? activeSponsorNames
    : uniqueValues([primaryOwner?.firm || company.investmentFirm]);
  const currentSponsorLabel = compactList(currentSponsorNames);
  const vehicleLabel = primaryOwner?.vehicle || company.ownershipVehicle || "Not disclosed";
  const holdPeriodLabel = primaryOwner ? formatCompactYearRange(primaryOwner) : company.investmentYear ? String(company.investmentYear) : "N/A";
  const disclosedStakes = uniqueValues(activeOwners.map((owner) => owner.stake));
  const ownershipFacts = useMemo(
    () => buildOwnershipFacts({
      sponsorLabel: currentSponsorLabel,
      activeSponsorCount: activeSponsorNames.length,
      vehicleLabel,
      strategies: primaryStrategies,
      stakes: disclosedStakes,
    }),
    [activeSponsorNames.length, currentSponsorLabel, disclosedStakes, primaryStrategies, vehicleLabel],
  );
  const showOwnershipLedger = shouldShowOwnershipLedger(activeOwners, formerOwners, vehicleLabel);
  const description = useMemo(() => splitDescription(company.description || ""), [company.description]);
  const milestones = useMemo(() => dedupeMilestones(company.milestones || []), [company.milestones]);
  const sources = useMemo(() => dedupeSources(company.sources || []), [company.sources]);
  const visibleMilestones = showAllMilestones ? milestones : getMaterialMilestones(milestones, displayOwners, 5);
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
      <div ref={drawerRef} className="fixed top-0 right-0 bottom-0 z-50 w-full bg-[var(--bg-surface)] shadow-overlay overflow-y-auto animate-slide-in-right sm:max-w-[760px] xl:max-w-[860px]">
        <header
          className={`sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-6 py-6 backdrop-blur-md transition-shadow duration-150 sm:px-8 lg:px-10 ${
            headerScrolled ? "shadow-[0_1px_2px_rgba(17,17,20,0.04)]" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div
                aria-hidden
                className="mb-5 h-[3px] w-14 rounded-full"
                style={{ backgroundColor: sectorColor }}
              />
              <div className="flex items-start gap-3">
                <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] lg:text-[40px]">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 shrink-0 rounded-full p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                    title="Company website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {identityDescriptor && (
                <p className="mt-3 max-w-[54ch] text-[15px] leading-6 text-[var(--text-secondary)]">
                  {identityDescriptor}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {!descriptorOwnsSector && (
                  <HeaderMetaItem>
                    <Dot color={sectorColor} />
                    <span>{company.sector}</span>
                  </HeaderMetaItem>
                )}
                <HeaderMetaItem>
                  <Dot color={statusColor} />
                  <span className="font-medium text-[var(--text-primary)]">{company.status}</span>
                </HeaderMetaItem>
                <HeaderMetaItem>
                  <span>{locationDisplay}</span>
                </HeaderMetaItem>
                <HeaderMetaItem>
                  <span className="tabular-nums mono">{holdPeriodLabel}</span>
                </HeaderMetaItem>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="shrink-0 rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-[minmax(0,1fr)_240px] sm:px-8 lg:grid-cols-[minmax(0,1fr)_250px] lg:px-10 lg:py-10">
          <aside className="order-1 sm:order-2">
            <div className="surface-elevated sm:sticky sm:top-32">
              <div className="px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Ownership
                </div>
                <div className="mt-3 divide-y divide-[var(--border)]">
                  {ownershipFacts.map((fact) => (
                    <FactRow key={fact.claim} label={fact.label} value={fact.value}>
                      {fact.children}
                    </FactRow>
                  ))}
                </div>
              </div>

              {showOwnershipLedger && (
                <div className="border-t border-[var(--border)] px-4 py-4">
                  {activeOwners.length > 0 && (
                    <>
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                        Current ownership
                      </div>
                      <div className="divide-y divide-[var(--border)]">
                        {activeOwners.map((owner, idx) => (
                          <OwnerLine key={`${owner.firm}-${owner.vehicle}-${idx}`} owner={owner} funds={funds} />
                        ))}
                      </div>
                    </>
                  )}
                  {formerOwners.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={activeOwners.length > 0 ? "mt-2 -ml-2" : "-ml-2"}
                      onClick={() => setShowFormerOwners(!showFormerOwners)}
                    >
                      {showFormerOwners ? "Hide prior owners" : `Show ${pluralize(formerOwners.length, "prior owner")}`}
                    </Button>
                  )}
                  {showFormerOwners && (
                    <div className="mt-2 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {formerOwners.map((owner, idx) => (
                        <OwnerLine key={`${owner.firm}-${owner.vehicle}-${idx}`} owner={owner} funds={funds} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div className="order-2 min-w-0 space-y-9 sm:order-1">
            {company.description && (
              <section>
                <SectionLabel>Business overview</SectionLabel>
                <div className="max-w-[58ch] space-y-4">
                  <p className="text-lg font-semibold leading-relaxed tracking-tight text-[var(--text-primary)]">
                    {description.lead}
                  </p>
                  {description.body && (
                    <p className="text-[15px] leading-7 text-[var(--text-secondary)]">
                      {description.body}
                    </p>
                  )}
                </div>
              </section>
            )}

            {milestones.length > 0 && (
              <section className="border-t border-[var(--border)] pt-7">
                <SectionLabel count={milestones.length}>Story timeline</SectionLabel>
                <div className="relative pl-5">
                  <div aria-hidden className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--border)]" />
                  <div className="space-y-4">
                    {visibleMilestones.map((milestone, i) => {
                      const classification = classifyMilestone(milestone, displayOwners);
                      const isTransition = classification !== null;
                      const transitionColor =
                        classification?.kind === "entry"
                          ? getPortCoStatusColor("Active")
                          : classification?.kind === "exit"
                          ? getMilestoneCategoryColor("Divestiture")
                          : null;
                      const transitionLabel =
                        classification?.kind === "entry"
                          ? "Investment"
                          : classification?.kind === "exit"
                          ? "Exit"
                          : null;
                      const dotColor = transitionColor ?? getMilestoneCategoryColor(milestone.category);
                      return (
                        <div key={`${milestone.date}-${milestone.event}-${i}`} className="relative">
                          <div
                            aria-hidden
                            className={`absolute -left-[18px] rounded-full ring-2 ring-[var(--bg-surface)] ${
                              isTransition ? "top-2 h-2.5 w-2.5" : "top-1.5 h-2 w-2"
                            }`}
                            style={{ backgroundColor: dotColor }}
                          />
                          <div className={isTransition ? "rounded-[8px] bg-[var(--bg-subtle)] px-3 py-2.5 ring-1 ring-[var(--border)]" : ""}>
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-[11px] tabular-nums text-[var(--text-tertiary)] mono">
                                {milestone.date}
                              </span>
                              {transitionLabel ? (
                                <Tag color={dotColor}>{transitionLabel}</Tag>
                              ) : (
                                <Tag color={getMilestoneCategoryColor(milestone.category)}>{milestone.category}</Tag>
                              )}
                              {classification?.owner.firm && (
                                <span className="text-[11px] text-[var(--text-secondary)]">
                                  {classification.owner.firm}
                                </span>
                              )}
                            </div>
                            <p className={`mt-1.5 text-sm leading-relaxed ${isTransition ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                              {milestone.event}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {milestones.length > 5 && (
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

            {cSuiteManagement.length > 0 && (
              <section className="border-t border-[var(--border)] pt-7">
                <SectionLabel>Key management</SectionLabel>
                <div className={`grid gap-x-5 gap-y-3 ${cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {cSuiteManagement.map((exec, i) => (
                    <div key={`${exec.name}-${i}`} className="border-b border-[var(--border)] pb-3">
                      <div className="truncate text-sm font-semibold leading-snug text-[var(--text-primary)]">
                        {exec.name}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                        {exec.title}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sources.length > 0 && (
              <section className="border-t border-[var(--border)] pt-7">
                <SectionLabel count={sources.length}>Evidence</SectionLabel>
                <EvidenceGroups sources={sources} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
