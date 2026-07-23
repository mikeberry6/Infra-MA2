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
import type {
  CompanyDetail,
  FundStrategyView,
  OwnerView,
  MilestoneView,
  RecordMeta,
  SourceView,
} from "@/modules/shared/types";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDrawerShellTiming } from "@/hooks/useDrawerShellTiming";
import { trackProductEvent } from "@/lib/product-analytics";
import { formatDate } from "@/lib/format";

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

type SponsorFundRow = {
  key: string;
  sponsor: string;
  fund?: string | null;
};

type MilestoneMeta = {
  color: string;
  label: "Investment" | "Exit" | null;
  ownerName: string | null;
  isTransition: boolean;
};

const MATERIAL_MILESTONE_CATEGORIES = new Set(["Founding", "Financing", "Acquisition", "Divestiture"]);

const TEXT_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const EVIDENCE_HOST_LABELS: Record<string, string> = {
  "3i.com": "3i",
  "aimco.ca": "AIMCo",
  "businesswire.com": "Business Wire",
  "globenewswire.com": "GlobeNewswire",
  "prnewswire.com": "PR Newswire",
  "sec.gov": "SEC",
};

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

function eventMentionsOwner(eventText: string, firm: string): boolean {
  const lowerEvent = eventText.toLowerCase();
  const normalized = normalizeFirm(firm);
  if (normalized && normalized.length >= 3 && lowerEvent.includes(normalized)) return true;
  const firstWord = ownerFirstWord(firm);
  return !!firstWord && firstWord.length >= 3 && lowerEvent.includes(firstWord);
}

function looksLikeOwnerEntryEvent(milestone: MilestoneView): boolean {
  if (milestone.category === "Acquisition") return true;
  if (milestone.category !== "Financing") return false;
  return /\b(invest|investment|invested|equity|sponsor|syndication|recapitalization|stake|backed|partnered)\b/i.test(
    milestone.event,
  );
}

function classifyMilestone(milestone: MilestoneView, owners: OwnerView[]): MilestoneClassification {
  const matchedOwner = bestOwnerMatch(owners, milestone.event);

  if (matchedOwner?.investmentYear && milestone.date.includes(String(matchedOwner.investmentYear))) {
    return { kind: "entry", owner: matchedOwner };
  }
  for (const owner of owners) {
    if (!owner.investmentYear || !milestone.date.includes(String(owner.investmentYear))) continue;
    if (looksLikeOwnerEntryEvent(milestone)) {
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

function normalizeTextForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulWords(value: string): string[] {
  return normalizeTextForComparison(value)
    .split(" ")
    .filter((word) => word.length > 2 && !TEXT_STOPWORDS.has(word));
}

function isRedundantText(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const left = normalizeTextForComparison(a);
  const right = normalizeTextForComparison(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;

  const leftWords = new Set(meaningfulWords(left));
  const rightWords = new Set(meaningfulWords(right));
  if (leftWords.size < 2 || rightWords.size < 2) return false;

  let shared = 0;
  rightWords.forEach((word) => {
    if (leftWords.has(word)) shared += 1;
  });
  return shared >= 2 && shared / Math.min(leftWords.size, rightWords.size) >= 0.65;
}

function getIdentityDescriptor(company: CompanyDetail): string {
  return company.subsector?.trim() || company.sector || "Portfolio company";
}

function formatHeaderStatusPeriod(company: CompanyDetail, owner: OwnerView | null): string {
  const investmentYear = owner?.investmentYear ?? company.investmentYear;

  if (owner?.investmentYear && owner.exitYear) return `Held ${owner.investmentYear}-${owner.exitYear}`;
  if (company.status === "Active" && investmentYear) return `Active since ${investmentYear}`;
  if (investmentYear) return `Invested ${investmentYear}`;
  return company.status === "Realized" ? "Realized" : company.status;
}

function shouldRenderLead(lead: string, descriptor: string): boolean {
  return !!lead.trim() && !isRedundantText(lead, descriptor);
}

function formatSponsorList(values: string[], max = 3): string {
  if (values.length === 0) return "Not disclosed";
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max}`;
}

function buildUniqueFacts(facts: DiligenceFact[], reservedClaims: string[] = []): DiligenceFact[] {
  const seen = new Set(reservedClaims);
  return facts.filter((fact) => {
    if (seen.has(fact.claim) || (!fact.value && !fact.children)) return false;
    seen.add(fact.claim);
    return true;
  });
}

function shouldShowOwnerField(value: string | undefined | null, repeatedValues: string[]): boolean {
  if (!value?.trim()) return false;
  const normalized = normalizeFactValue(value);
  if (normalized === "not disclosed" || normalized === "n/a") return false;
  return !repeatedValues.some((repeated) => (
    normalizeFactValue(repeated) === normalized || isRedundantText(value, repeated)
  ));
}

function buildSponsorFundRows(
  owners: OwnerView[],
  fallbackSponsor: string,
  fallbackFund: string,
): SponsorFundRow[] {
  const rows = owners.map((owner, index) => ({
    key: `${owner.firm}-${owner.vehicle || owner.fundName || index}`,
    sponsor: owner.firm || "Unknown sponsor",
    fund: owner.vehicle || owner.fundName || null,
  }));

  if (rows.length > 0) return rows;
  return [{
    key: "fallback-sponsor-fund",
    sponsor: fallbackSponsor || "Not disclosed",
    fund: fallbackFund !== "Not disclosed" ? fallbackFund : null,
  }];
}

function getMatchedFund(owner: OwnerView | null, funds: FundStrategyView[]): FundStrategyView | undefined {
  if (!owner) return undefined;
  if (owner.fundName) {
    const fund = funds.find((f) => f.fundName === owner.fundName);
    if (fund) return fund;
  }
  return owner.vehicle ? funds.find((f) => f.fundName === owner.vehicle) : undefined;
}

function getOwnerStrategies(owner: OwnerView | null, funds: FundStrategyView[]): string[] {
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
    const key = source.url.trim().toLowerCase().replace(/\/$/, "");
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

function formatMilestoneMeta(
  milestone: MilestoneView,
  classification: MilestoneClassification,
): MilestoneMeta {
  const label =
    classification?.kind === "entry"
      ? "Investment"
      : classification?.kind === "exit"
      ? "Exit"
      : null;
  const color =
    classification?.kind === "entry"
      ? getPortCoStatusColor("Active")
      : classification?.kind === "exit"
      ? getMilestoneCategoryColor("Divestiture")
      : getMilestoneCategoryColor(milestone.category);
  const ownerName = classification?.owner.firm || null;

  return {
    color,
    label,
    ownerName: ownerName && !eventMentionsOwner(milestone.event, ownerName) ? ownerName : null,
    isTransition: classification !== null,
  };
}

function titleCaseHostToken(value: string): string {
  return value
    .replace(/\.(com|org|net|ca|co|io|gov|sg|uk)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sourceBrand(source: SourceView): string {
  const host = getSourceHostname(source.url);
  return EVIDENCE_HOST_LABELS[host] || titleCaseHostToken(host.split(".")[0] || host || "Source");
}

function getEvidenceLabel(source: SourceView, groupLabel?: string): string {
  const displayLabel = getSourceDisplayLabel(source);
  const sourceText = `${source.evidenceLabel || ""} ${source.label || ""} ${displayLabel}`.toLowerCase();
  const sourceType = inferSourceType(source);

  let label: string;
  if (sourceText.includes("investment date") || sourceText.includes("initial investment")) {
    label = "Initial investment";
  } else if (sourceText.includes("close date") || sourceText.includes("closing")) {
    label = "Closing confirmation";
  } else if (sourceText.includes("interest confirmation") || sourceText.includes("ownership interest")) {
    label = "Ownership interest";
  } else if (sourceText.includes("ownership history")) {
    label = "Ownership history";
  } else if (sourceType === "SEC_FILING" || sourceText.includes("sec filing")) {
    label = "SEC filing";
  } else if (/\b(financing|debt|bond|filing|annual report|aif)\b/.test(sourceText)) {
    label = "Financing";
  } else if (/\b(operations|asset|project|facility|network|locations)\b/.test(sourceText)) {
    label = "Operations";
  } else if (/\b(company profile|portfolio|about)\b/.test(sourceText)) {
    label = "Company profile";
  } else if (/\b(transaction|milestone|acquisition|acquired|divestiture|sale|announcement)\b/.test(sourceText)) {
    label = "Event detail";
  } else if (source.evidenceLabel?.trim()) {
    label = source.evidenceLabel.trim();
  } else {
    label = sourceBrand(source);
  }

  if (!groupLabel || !isRedundantText(label, groupLabel)) return label;
  if (label === "Company profile") return sourceBrand(source);
  if (label === "Operations") return "Asset detail";
  if (label === "Financing") return sourceType === "SEC_FILING" ? "SEC filing" : "Public filing";
  if (label === "Event detail") return "Transaction detail";
  return sourceBrand(source);
}

function buildOwnershipFacts({
  strategies,
  stakes,
}: {
  strategies: string[];
  stakes: string[];
}): DiligenceFact[] {
  return buildUniqueFacts(
    [
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

function SponsorFundLine({ row }: { row: SponsorFundRow }) {
  const showFund = row.fund && normalizeFactValue(row.fund) !== normalizeFactValue(row.sponsor);

  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="type-row-title font-semibold">
        {row.sponsor}
      </div>
      {showFund && (
        <div className="mt-1 type-meta">
          {row.fund}
        </div>
      )}
    </div>
  );
}

function DetailSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-elevated overflow-hidden ${className}`}>
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <div className="type-section-title">
          {title}
        </div>
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
    </section>
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
    <span className="inline-flex min-w-0 items-center gap-1.5 type-meta">
      {children}
    </span>
  );
}

function FactRow({ label, value, children }: { label: string; value?: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="type-label">
        {label}
      </div>
      {value && (
        <div className="mt-1 type-row-title font-semibold">
          {value}
        </div>
      )}
      {children && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">{children}</div>}
    </div>
  );
}

function OwnerLine({
  owner,
  funds,
  repeatedValues,
  repeatedStrategies,
}: {
  owner: OwnerView;
  funds: FundStrategyView[];
  repeatedValues: string[];
  repeatedStrategies: string[];
}) {
  const strategies = getOwnerStrategies(owner, funds);
  const yearRange = formatCompactYearRange(owner);
  const showVehicle = shouldShowOwnerField(owner.vehicle, repeatedValues);
  const showYear = shouldShowOwnerField(yearRange, repeatedValues);
  const visibleStrategies = strategies.filter((strategy) => (
    !repeatedStrategies.some((repeated) => normalizeFactValue(repeated) === normalizeFactValue(strategy))
  ));

  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="type-row-title font-semibold">
            {owner.firm || "Unknown owner"}
          </div>
          {showVehicle && (
            <div className="mt-1 type-meta">
              {owner.vehicle}
            </div>
          )}
        </div>
        {showYear && (
          <span className="shrink-0 type-meta font-medium tabular-nums text-[var(--text-primary)] mono">
            {yearRange}
          </span>
        )}
      </div>
      {(visibleStrategies.length > 0 || owner.stake) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {visibleStrategies.map((strategy) => (
            <Tag key={strategy} color={getStrategyColor(strategy)}>{strategy}</Tag>
          ))}
          {owner.stake && (
            <span className="type-micro">Stake: {owner.stake}</span>
          )}
        </div>
      )}
    </div>
  );
}

function EvidenceGroups({ sources, compact = false }: { sources: SourceView[]; compact?: boolean }) {
  const groups = groupSourcesByPurpose(sources);

  return (
    <div className={compact ? "divide-y divide-[var(--border)]" : "divide-y divide-[var(--border)] border-y border-[var(--border)]"}>
      {groups.map((group) => (
        <div key={group.purpose} className={compact ? "py-3" : "py-4"}>
          <div className="mb-2 type-label">
            {group.label}
          </div>
          <div className={compact ? "grid grid-cols-1 gap-y-1.5" : "grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2"}>
            {group.sources.map((source, i) => (
              <a
                key={`${source.url}-${group.purpose}-${i}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackProductEvent("source_link_clicked", { entity: "company" })}
                className="group flex min-w-0 items-start gap-2 rounded-[6px] py-1.5 transition-colors hover:text-[var(--text-primary)]"
                title={source.label || source.url}
              >
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--text-primary)]" />
                <span className="min-w-0">
                  <span className="block truncate type-meta font-medium transition-colors group-hover:text-[var(--text-primary)]">
                    {getEvidenceLabel(source, group.label)}
                  </span>
                  <span className="mt-0.5 block truncate type-micro">
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
  detailStatus = "ready",
  detailMeta,
  onRetry,
}: {
  company: CompanyDetail;
  funds: FundStrategyView[];
  onClose: () => void;
  detailStatus?: "idle" | "loading" | "ready" | "stale" | "error";
  detailMeta?: RecordMeta | null;
  onRetry?: () => void;
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [showFormerOwners, setShowFormerOwners] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);
  useDialogFocus(drawerRef);
  useDrawerShellTiming("company", company.id);

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
  const descriptorOwnsSector = isRedundantText(identityDescriptor, company.sector);
  const activeSponsorNames = uniqueValues(activeOwners.map((owner) => owner.firm));
  const currentSponsorNames = activeSponsorNames.length > 0
    ? activeSponsorNames
    : uniqueValues([primaryOwner?.firm || company.investmentFirm]);
  const currentSponsorLabel = formatSponsorList(currentSponsorNames);
  const vehicleLabel = primaryOwner?.vehicle || company.ownershipVehicle || "Not disclosed";
  const sponsorFundRows = useMemo(
    () => buildSponsorFundRows(activeOwners.length > 0 ? activeOwners : primaryOwner ? [primaryOwner] : [], company.investmentFirm, vehicleLabel),
    [activeOwners, company.investmentFirm, primaryOwner, vehicleLabel],
  );
  const primaryOwnerPeriod = primaryOwner
    ? formatCompactYearRange(primaryOwner)
    : company.investmentYear
    ? String(company.investmentYear)
    : "N/A";
  const headerStatusPeriod = formatHeaderStatusPeriod(company, primaryOwner);
  const disclosedStakes = uniqueValues(activeOwners.map((owner) => owner.stake));
  const ownershipFacts = useMemo(
    () => buildOwnershipFacts({
      strategies: primaryStrategies,
      stakes: disclosedStakes,
    }),
    [disclosedStakes, primaryStrategies],
  );
  const ownerRepeatedValues = uniqueValues([currentSponsorLabel, vehicleLabel, primaryOwnerPeriod, headerStatusPeriod]);
  const description = useMemo(() => splitDescription(company.description || ""), [company.description]);
  const leadAddsMeaning = shouldRenderLead(description.lead, identityDescriptor);
  const overviewBodyText = [leadAddsMeaning ? "" : description.lead, description.body]
    .filter(Boolean)
    .join(" ");
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
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portco-drawer-title"
        aria-busy={detailStatus === "idle" || detailStatus === "loading"}
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-50 w-full bg-[var(--bg-surface)] shadow-overlay overflow-y-auto animate-slide-in-right sm:max-w-[760px] xl:max-w-[860px]"
      >
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
                <h2 id="portco-drawer-title" className="type-drawer-title">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 shrink-0 rounded-full p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                    title="Company website"
                    aria-label={`Open ${company.name} website`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {identityDescriptor && (
                <p className="mt-3 max-w-[54ch] type-narrative">
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
                  <span className="font-medium text-[var(--text-primary)]">{headerStatusPeriod}</span>
                </HeaderMetaItem>
                <HeaderMetaItem>
                  <span>{locationDisplay}</span>
                </HeaderMetaItem>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="shrink-0 rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {(detailStatus === "idle" || detailStatus === "loading") && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mx-6 mt-6 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 type-meta sm:mx-8 lg:mx-10"
          >
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]"
            />
            Loading complete company detail…
          </div>
        )}

        {detailStatus === "error" && (
          <div
            role="alert"
            aria-live="assertive"
            className="mx-6 mt-6 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 sm:mx-8 lg:mx-10"
          >
            <p className="type-meta text-[var(--text-primary)]">
              Complete company detail is temporarily unavailable. The summary below may be incomplete.
            </p>
            {onRetry && (
              <Button type="button" variant="ghost" size="sm" className="mt-2 -ml-2" onClick={onRetry}>
                Retry detail request
              </Button>
            )}
          </div>
        )}

        {detailStatus === "stale" && (
          <div
            role="status"
            aria-live="polite"
            className="mx-6 mt-6 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[#854d0e] sm:mx-8 lg:mx-10"
          >
            <p className="type-meta text-current">
              Latest refresh failed. Showing cached company detail.
            </p>
            {onRetry && (
              <Button type="button" variant="ghost" size="sm" className="mt-2 -ml-2" onClick={onRetry}>
                Retry detail request
              </Button>
            )}
          </div>
        )}

        {detailMeta && (
          <div className="mx-6 mt-4 type-micro sm:mx-8 lg:mx-10">
            Last verified{" "}
            <span className="mono tabular-nums text-[var(--text-secondary)]">
              {detailMeta.lastVerifiedAt ? formatDate(detailMeta.lastVerifiedAt) : "Not recorded"}
            </span>
            {" · "}
            <span className="mono tabular-nums text-[var(--text-secondary)]">{detailMeta.sourceCount}</span>
            {" "}source{detailMeta.sourceCount === 1 ? "" : "s"}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-[minmax(0,1fr)_240px] sm:px-8 lg:grid-cols-[minmax(0,1fr)_250px] lg:px-10 lg:py-10">
          <aside className="order-1 sm:order-2">
            <div className="space-y-4 sm:sticky sm:top-32">
              <DetailSection title="Ownership">
                <div>
                  <div className="type-label">
                    Sponsor / fund
                  </div>
                  <div className="mt-1 divide-y divide-[var(--border)]">
                    {sponsorFundRows.map((row) => (
                      <SponsorFundLine key={row.key} row={row} />
                    ))}
                  </div>
                </div>
                {ownershipFacts.length > 0 && (
                  <div className="mt-1 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    {ownershipFacts.map((fact) => (
                      <FactRow key={fact.claim} label={fact.label} value={fact.value}>
                        {fact.children}
                      </FactRow>
                    ))}
                  </div>
                )}

                {formerOwners.length > 0 && (
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2"
                      onClick={() => setShowFormerOwners(!showFormerOwners)}
                    >
                      {showFormerOwners ? "Hide prior owners" : `Show ${pluralize(formerOwners.length, "prior owner")}`}
                    </Button>
                    {showFormerOwners && (
                      <div className="mt-2 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                        {formerOwners.map((owner, idx) => (
                          <OwnerLine
                            key={`${owner.firm}-${owner.vehicle}-${idx}`}
                            owner={owner}
                            funds={funds}
                            repeatedValues={ownerRepeatedValues}
                            repeatedStrategies={primaryStrategies}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </DetailSection>

              {sources.length > 0 && (
                <DetailSection title="Sources">
                  <EvidenceGroups sources={sources} compact />
                </DetailSection>
              )}
            </div>
          </aside>

          <div className="order-2 min-w-0 space-y-4 sm:order-1">
            {company.description && (
              <DetailSection title="Business overview">
                <div className="max-w-[58ch] space-y-4">
                  {leadAddsMeaning && (
                    <p className="type-narrative font-semibold text-[var(--text-primary)]">
                      {description.lead}
                    </p>
                  )}
                  {overviewBodyText && (
                    <p className="type-narrative">
                      {overviewBodyText}
                    </p>
                  )}
                </div>
              </DetailSection>
            )}

            {milestones.length > 0 && (
              <DetailSection title="Story timeline">
                <div className="relative pl-5">
                  <div aria-hidden className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--border)]" />
                  <div className="space-y-4">
                    {visibleMilestones.map((milestone, i) => {
                      const classification = classifyMilestone(milestone, displayOwners);
                      const meta = formatMilestoneMeta(milestone, classification);
                      return (
                        <div key={`${milestone.date}-${milestone.event}-${i}`} className="relative">
                          <div
                            aria-hidden
                            className={`absolute -left-[18px] rounded-full ring-2 ring-[var(--bg-surface)] ${
                              meta.isTransition ? "top-2 h-2.5 w-2.5" : "top-1.5 h-2 w-2"
                            }`}
                            style={{ backgroundColor: meta.color }}
                          />
                          <div className={meta.isTransition ? "rounded-[8px] bg-[var(--bg-subtle)] px-3 py-2.5 ring-1 ring-[var(--border)]" : ""}>
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="type-micro tabular-nums mono">
                                {milestone.date}
                              </span>
                              {meta.label ? (
                                <Tag color={meta.color}>{meta.label}</Tag>
                              ) : milestone.category !== "Other" && (
                                <span className="type-micro">
                                  {milestone.category}
                                </span>
                              )}
                              {meta.ownerName && (
                                <span className="type-micro text-[var(--text-secondary)]">
                                  {meta.ownerName}
                                </span>
                              )}
                            </div>
                            <p className={`mt-1.5 type-meta ${meta.isTransition ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
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
              </DetailSection>
            )}

            {cSuiteManagement.length > 0 && (
              <section className="border-t border-[var(--border)] pt-7">
                <SectionLabel>Key management</SectionLabel>
                <div className={`grid gap-x-5 gap-y-3 ${cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {cSuiteManagement.map((exec, i) => (
                    <div key={`${exec.name}-${i}`} className="border-b border-[var(--border)] pb-3">
                      <div className="truncate type-row-title font-semibold">
                        {exec.name}
                      </div>
                      <div className="mt-0.5 truncate type-micro">
                        {exec.title}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
