"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  ExternalLink,
  FileText,
  Landmark,
  Link2,
  Newspaper,
  Radio,
  Search,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { MobileFilterSheet } from "@/components/shared/MobileFilterSheet";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useUrlFilterSet,
  useUrlQueryParamsWriter,
  useUrlQueryState,
} from "@/hooks/useUrlFilterSet";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { formatDate, formatScheduledDateTime } from "@/lib/format";
import { getNewsCategoryColor, NEWS_CATEGORIES } from "@/lib/news-utils";
import type { FeedOperationsView, NewsCategory, NewsFeedView, NewsItemView, NewsMentionType } from "@/modules/shared/types";
import { track } from "@vercel/analytics";

const DATE_WINDOWS = [
  { label: "Today", days: 0 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "All", days: null },
] as const;

const NEWS_PAGE_SIZE = 25;

type DateWindow = (typeof DATE_WINDOWS)[number]["label"];

function isDateWindow(value: string): value is DateWindow {
  return DATE_WINDOWS.some((option) => option.label === value);
}

export function emptyNewsStateTitle(state: FeedOperationsView["state"]): string {
  if (state === "failed") return "The latest scan failed";
  if (state === "pending") return "A news scan is currently running";
  if (state === "overdue") return "The scheduled news scan is overdue";
  if (state === "never-run") return "No news scan has run yet";
  return "Scan completed with no qualifying signals";
}

const MENTION_COLORS: Record<NewsMentionType, string> = {
  PortCo: "#3b6cf2",
  "Investment Firm": "#7d6cf0",
  Fund: "#1d9d76",
  Deal: "#d98b1c",
};

type NewsCounts = {
  total: number;
  highConfidence: number;
  needsReview: number;
  linkedinLinks: number;
};

function categoryIcon(category: NewsCategory): LucideIcon {
  if (category === "Fundraising Activity") return DollarSign;
  if (category === "Portfolio Company News") return Building2;
  if (category === "Investment Firm News") return Landmark;
  if (category === "Rumored Sales Processes") return Radio;
  if (category === "Low Confidence / Needs Review") return AlertTriangle;
  return Newspaper;
}

function categoryShortLabel(category: NewsCategory): string {
  if (category === "Transaction Activity") return "Transactions";
  if (category === "Fundraising Activity") return "Fundraising";
  if (category === "Portfolio Company News") return "PortCo News";
  if (category === "Investment Firm News") return "Firm News";
  if (category === "Rumored Sales Processes") return "Rumored Sales";
  return "Needs Review";
}

function mentionIcon(type: NewsMentionType): LucideIcon {
  if (type === "PortCo") return Building2;
  if (type === "Investment Firm") return Landmark;
  if (type === "Fund") return FileText;
  return Newspaper;
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function daysAgo(days: number): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime() - days * 24 * 60 * 60 * 1000;
}

function getEntityOptions(items: NewsItemView[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const mention of item.mentions) {
      counts.set(mention.label, (counts.get(mention.label) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 80)
    .map(([name]) => name);
}

function sourceLabel(item: NewsItemView): string {
  if (item.sourceName) return item.sourceName;
  try {
    return new URL(item.sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown Source";
  }
}

function getSourceOptions(items: NewsItemView[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = sourceLabel(item);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 80)
    .map(([source]) => source);
}

function confidenceFilterLabel(item: NewsItemView): string {
  if (item.confidence === "Low" || item.category === "Low Confidence / Needs Review") return "Needs Review";
  if (item.confidence === "High") return "High Confidence";
  return "Medium Confidence";
}

function confidenceColor(label: string): string {
  if (label === "High Confidence") return "#1d9d76";
  if (label === "Medium Confidence") return "#d98b1c";
  return "#71717a";
}

function confidenceDisplay(item: NewsItemView): { label: string; color: string; icon: LucideIcon } {
  const label = confidenceFilterLabel(item);
  return {
    label,
    color: confidenceColor(label),
    icon: label === "High Confidence" ? CheckCircle2 : AlertTriangle,
  };
}

function getMentionColor(label: string, items: NewsItemView[]): string {
  const mention = items.flatMap((item) => item.mentions).find((m) => m.label === label);
  return mention ? MENTION_COLORS[mention.type] : "#a1a1aa";
}

function topMentions(items: NewsItemView[], type: NewsMentionType, limit = 5) {
  const counts = new Map<string, { count: number; href?: string }>();
  for (const item of items) {
    for (const mention of item.mentions) {
      if (mention.type !== type) continue;
      const current = counts.get(mention.label) ?? { count: 0, href: mention.href };
      counts.set(mention.label, { count: current.count + 1, href: current.href || mention.href });
    }
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, ...value }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function IntelligenceHeader({
  counts,
  lastUpdated,
}: {
  counts: NewsCounts;
  lastUpdated: string | null;
}) {
  const metrics = [
    { label: "Review Items", value: counts.total, color: "#111114" },
    { label: "High Confidence", value: counts.highConfidence, color: "#1d9d76" },
    { label: "Needs Review", value: counts.needsReview, color: "#71717a" },
    { label: "LinkedIn Links", value: counts.linkedinLinks, color: "#0a66c2" },
  ];

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(17,17,20,0.03)]">
      <div className="h-[2px] bg-gradient-to-r from-[var(--accent)] via-[#3b6cf2] to-transparent" />
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 type-label">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Daily Monitoring Output
            </div>
            <h1 className="type-page-title">
              Daily Intelligence Feed
            </h1>
            <p className="mt-1.5 type-meta">
              Public news discovered from tracked PortCos, investment firms, fund managers, and funds. Review items here before promoting anything into the deal database.
            </p>
          </div>
          <div className="type-micro">
            Updated <span className="mono tabular-nums">{lastUpdated ? formatDate(lastUpdated) : "Not recorded"}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: metric.color }} />
                <span className="type-micro font-medium text-[var(--text-secondary)]">{metric.label}</span>
              </div>
              <div className="mt-1 mono type-page-title tabular-nums">
                {metric.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperationalStatus({ operations }: { operations: FeedOperationsView }) {
  const isHealthy = operations.state === "healthy";
  const label = isHealthy
    ? "Window current"
    : operations.state === "failed"
      ? "Latest scan failed"
      : operations.state === "overdue"
        ? "Scan overdue"
        : "Scan pending";
  const color = isHealthy ? "#1d9d76" : operations.state === "never-run" ? "#71717a" : "#b45309";

  return (
    <section className="mb-5 flex flex-col gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 md:flex-row md:items-center md:justify-between" aria-label="News pipeline status">
      <div className="min-w-0">
        <div className="flex items-center gap-2 type-meta font-semibold text-[var(--text-primary)]">
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </div>
        <p className="mt-0.5 type-micro">{operations.message}</p>
      </div>
      <dl className="flex min-w-0 flex-wrap gap-x-5 gap-y-1 type-micro md:shrink-0">
        <div>
          <dt className="inline">Last success </dt>
          <dd className="inline mono tabular-nums text-[var(--text-secondary)]">{operations.lastSuccessfulAt ? formatDate(operations.lastSuccessfulAt) : "Not recorded"}</dd>
        </div>
        <div>
          <dt className="inline">Next expected </dt>
          <dd className="inline mono tabular-nums text-[var(--text-secondary)]">{operations.nextExpectedAt ? formatScheduledDateTime(operations.nextExpectedAt, "UTC") : "Pending schedule"}</dd>
        </div>
        <div>
          <dt className="inline">Source coverage </dt>
          <dd className="inline mono tabular-nums text-[var(--text-secondary)]">
            {operations.sourceCoverage
              ? `${operations.sourceCoverage.succeeded.toLocaleString()}/${operations.sourceCoverage.attempted.toLocaleString()} attempts`
              : "Not recorded"}
          </dd>
        </div>
        {operations.scanWindow && (
          <div>
            <dt className="inline">Rotating window </dt>
            <dd className="inline mono tabular-nums text-[var(--text-secondary)]">
              {operations.scanWindow.selectedCount.toLocaleString()}/{operations.scanWindow.fullUniverseCount.toLocaleString()} entities
              {" · "}window {operations.scanWindow.windowIndex + 1}/{operations.scanWindow.windowsPerCycle}
              {" · "}{formatDate(`${operations.scanWindow.selectionDateUtc}T12:00:00.000Z`)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function CategorySpotlight({
  items,
  onSelect,
}: {
  items: NewsItemView[];
  onSelect: (item: NewsItemView) => void;
}) {
  const latestByCategory = NEWS_CATEGORIES.map((category) => ({
    category,
    item: items.find((item) => item.category === category),
  }));

  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="type-section-title text-[var(--text-tertiary)]">
          Latest Signals
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {latestByCategory.map(({ category, item }) => {
          const Icon = categoryIcon(category);
          const color = getNewsCategoryColor(category);

          if (!item) {
            return (
              <div key={category} className="surface min-h-[132px] px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                  <span className="type-micro font-medium text-[var(--text-secondary)]">{categoryShortLabel(category)}</span>
                </div>
                <p className="mt-4 type-micro">No current signal in this category.</p>
              </div>
            );
          }

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(item)}
              className="surface group min-h-[132px] w-full border-l-[3px] px-4 py-3.5 text-left transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              style={{ borderLeftColor: color }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  <span className="truncate type-micro font-medium text-[var(--text-secondary)]">
                    {categoryShortLabel(category)}
                  </span>
                </span>
                <span className="mono shrink-0 type-label normal-case tabular-nums">
                  {formatDate(item.publishedAt)}
                </span>
              </div>
              <h2 className="line-clamp-2 type-row-title font-semibold group-hover:text-[var(--accent)]">
                {item.title}
              </h2>
              <p className="mt-2 line-clamp-2 type-meta">
                {item.summary}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NewsFilterBar({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  activeEntities,
  onToggleEntity,
  entityOptions,
  activeSources,
  onToggleSource,
  sourceOptions,
  activeConfidence,
  onToggleConfidence,
  allItems,
  dateWindow,
  onDateWindowChange,
  onClearAll,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<string>;
  onToggleCategory: (value: string) => void;
  activeEntities: Set<string>;
  onToggleEntity: (value: string) => void;
  entityOptions: string[];
  activeSources: Set<string>;
  onToggleSource: (value: string) => void;
  sourceOptions: string[];
  activeConfidence: Set<string>;
  onToggleConfidence: (value: string) => void;
  allItems: NewsItemView[];
  dateWindow: DateWindow;
  onDateWindowChange: (value: DateWindow) => void;
  onClearAll: () => void;
}) {
  const activeCount = activeCategories.size
    + activeEntities.size
    + activeSources.size
    + activeConfidence.size
    + (dateWindow === "Today" ? 0 : 1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownControls = (
    <>
      <MultiSelectDropdown
        label="Category"
        options={NEWS_CATEGORIES}
        selected={activeCategories}
        onToggle={onToggleCategory}
        getColor={getNewsCategoryColor}
      />
      <MultiSelectDropdown
        label="Entity"
        options={entityOptions}
        selected={activeEntities}
        onToggle={onToggleEntity}
        getColor={(label) => getMentionColor(label, allItems)}
        align="right"
      />
      <MultiSelectDropdown
        label="Source"
        options={sourceOptions}
        selected={activeSources}
        onToggle={onToggleSource}
        getColor={() => "#0a66c2"}
        align="right"
      />
      <MultiSelectDropdown
        label="Confidence"
        options={["High Confidence", "Medium Confidence", "Needs Review"]}
        selected={activeConfidence}
        onToggle={onToggleConfidence}
        getColor={confidenceColor}
        align="right"
      />
    </>
  );
  const dateControls = (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[var(--bg-hover)] p-0.5" role="group" aria-label="Date window">
      {DATE_WINDOWS.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onDateWindowChange(option.label)}
          aria-pressed={dateWindow === option.label}
          className={`h-7 rounded px-2 type-micro font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] ${
            dateWindow === option.label
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mb-3 space-y-3">
      <div className="sticky top-14 z-30 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
        <div className="min-w-0 flex-1 lg:max-w-sm">
          <TextInput
            ref={searchInputRef}
            leadingIcon={<Search />}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search news..."
            aria-label="Search news"
          />
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          {dropdownControls}
          {dateControls}
        </div>
        <MobileFilterSheet
          activeCount={activeCount}
          desktopBreakpoint="lg"
          onClearAll={onClearAll}
        >
          <div className="grid grid-cols-2 gap-3">{dropdownControls}</div>
          <div>
            <p className="mb-2 type-label">Date window</p>
            {dateControls}
          </div>
        </MobileFilterSheet>
      </div>

      <ActiveFiltersStrip
        groups={[
          {
            keyPrefix: "category",
            items: activeCategories,
            getColor: getNewsCategoryColor,
            onRemove: onToggleCategory,
          },
          {
            keyPrefix: "entity",
            items: activeEntities,
            getColor: (label) => getMentionColor(label, allItems),
            onRemove: onToggleEntity,
          },
          {
            keyPrefix: "source",
            items: activeSources,
            getColor: () => "#0a66c2",
            onRemove: onToggleSource,
          },
          {
            keyPrefix: "confidence",
            items: activeConfidence,
            getColor: confidenceColor,
            onRemove: onToggleConfidence,
          },
          {
            keyPrefix: "date",
            items: dateWindow === "Today" ? [] : [dateWindow],
            getColor: () => "#008253",
            onRemove: () => onDateWindowChange("Today"),
          },
        ]}
        onClearAll={onClearAll}
        focusFallbackRef={searchInputRef}
      />
    </div>
  );
}

function MentionPill({
  mention,
  interactive = true,
}: {
  mention: NewsItemView["mentions"][number];
  interactive?: boolean;
}) {
  const Icon = mentionIcon(mention.type);
  const content = (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-2 py-1 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{mention.label}</span>
    </span>
  );

  if (mention.href && interactive) {
    return (
      <Link href={mention.href} className="min-w-0">
        {content}
      </Link>
    );
  }
  return content;
}

function NewsCard({
  item,
  onSelect,
}: {
  item: NewsItemView;
  onSelect: (item: NewsItemView) => void;
}) {
  const Icon = categoryIcon(item.category);
  const categoryColor = getNewsCategoryColor(item.category);
  const confidence = confidenceDisplay(item);
  const ConfidenceIcon = confidence.icon;
  const visibleMentions = item.mentions.slice(0, 5);

  return (
    <article
      className="surface group overflow-hidden border-l-[3px] transition-colors hover:bg-[var(--bg-subtle)]"
      style={{ borderLeftColor: categoryColor }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="block w-full px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
      >
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 type-micro font-medium"
            style={{
              color: "#444444",
              backgroundColor: `${categoryColor}08`,
              borderColor: `${categoryColor}12`,
            }}
          >
            <Icon className="h-3 w-3" style={{ color: categoryColor }} />
            <span>{item.category}</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 type-micro font-medium"
            style={{
              color: "#444444",
              backgroundColor: `${confidence.color}08`,
              borderColor: `${confidence.color}12`,
            }}
          >
            <ConfidenceIcon className="h-3 w-3" style={{ color: confidence.color }} />
            {confidence.label}
          </span>
          {item.isRumor && <Tag variant="solid">Rumor</Tag>}
          <span className="inline-flex items-center gap-1.5 type-micro">
            <CalendarDays className="h-3 w-3" />
            <span className="mono tabular-nums">{formatDate(item.publishedAt)}</span>
          </span>
          {item.sourceName && (
            <span className="type-micro">· {item.sourceName}</span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="type-row-title font-semibold">
              {item.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 type-meta">
              {item.summary}
            </p>
          </div>
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors group-hover:bg-[var(--bg-hover)]">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>

        {visibleMentions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-3">
            {visibleMentions.map((mention) => (
              <MentionPill key={`${mention.type}-${mention.id}`} mention={mention} interactive={false} />
            ))}
            {item.mentions.length > visibleMentions.length && (
              <span className="inline-flex items-center rounded-md border border-[var(--border)] px-2 py-1 type-micro">
                +{item.mentions.length - visibleMentions.length}
              </span>
            )}
          </div>
        )}
      </button>
      {(isHttpUrl(item.sourceUrl) || item.linkedinUrls.length > 0) && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] px-4 py-2">
          {item.linkedinUrls.length > 0 && (
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Link2 className="h-3 w-3" />
              LinkedIn {item.linkedinUrls.length}
            </button>
          )}
          {isHttpUrl(item.sourceUrl) && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("source_link_clicked", { entity: "news", placement: "card" })}
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </a>
          )}
        </div>
      )}
    </article>
  );
}

function InsightRail({ items }: { items: NewsItemView[] }) {
  const firms = topMentions(items, "Investment Firm");
  const portcos = topMentions(items, "PortCo");
  const funds = topMentions(items, "Fund");
  const needsReviewCount = items.filter((item) => confidenceFilterLabel(item) === "Needs Review").length;
  const maxFirmCount = Math.max(...firms.map((firm) => firm.count), 1);
  const maxPortCoCount = Math.max(...portcos.map((company) => company.count), 1);
  const maxFundCount = Math.max(...funds.map((fund) => fund.count), 1);

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      <div className="surface p-4">
        <SectionLabel>Most Mentioned Firms</SectionLabel>
        <div className="space-y-3">
          {firms.map((firm) => (
            <Link
              key={firm.label}
              href={firm.href || "/funds"}
              className="block rounded-md px-2 py-1.5 type-meta transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate text-[var(--text-secondary)]">{firm.label}</span>
                <span className="mono tabular-nums text-[var(--text-tertiary)]">{firm.count}</span>
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                <span
                  className="block h-full rounded-full bg-[#7d6cf0]"
                  style={{ width: `${Math.max(12, (firm.count / maxFirmCount) * 100)}%` }}
                />
              </span>
            </Link>
          ))}
          {firms.length === 0 && <div className="type-meta text-[var(--text-tertiary)]">No firm mentions.</div>}
        </div>
      </div>

      <div className="surface p-4">
        <SectionLabel>PortCos In The News</SectionLabel>
        <div className="space-y-3">
          {portcos.map((company) => (
            <Link
              key={company.label}
              href={company.href || "/portfolio"}
              className="block rounded-md px-2 py-1.5 type-meta transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate text-[var(--text-secondary)]">{company.label}</span>
                <span className="mono tabular-nums text-[var(--text-tertiary)]">{company.count}</span>
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                <span
                  className="block h-full rounded-full bg-[#3b6cf2]"
                  style={{ width: `${Math.max(12, (company.count / maxPortCoCount) * 100)}%` }}
                />
              </span>
            </Link>
          ))}
          {portcos.length === 0 && <div className="type-meta text-[var(--text-tertiary)]">No PortCo mentions.</div>}
        </div>
      </div>

      <div className="surface p-4">
        <SectionLabel>Funds Mentioned</SectionLabel>
        <div className="space-y-3">
          {funds.map((fund) => (
            <Link
              key={fund.label}
              href={fund.href || "/funds"}
              className="block rounded-md px-2 py-1.5 type-meta transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate text-[var(--text-secondary)]">{fund.label}</span>
                <span className="mono tabular-nums text-[var(--text-tertiary)]">{fund.count}</span>
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                <span
                  className="block h-full rounded-full bg-[#1d9d76]"
                  style={{ width: `${Math.max(12, (fund.count / maxFundCount) * 100)}%` }}
                />
              </span>
            </Link>
          ))}
          {funds.length === 0 && <div className="type-meta text-[var(--text-tertiary)]">No fund mentions.</div>}
        </div>
      </div>

      <div className="surface p-4">
        <SectionLabel>Review Queue</SectionLabel>
        <div className="rounded-md border border-[#71717a]/15 bg-[#71717a]/[0.04] px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="type-meta">Needs review items</span>
            <span className="mono type-page-title tabular-nums">{needsReviewCount}</span>
          </div>
          <p className="mt-1.5 type-micro">
            Low-confidence scanner results stay here until an analyst promotes or dismisses them.
          </p>
        </div>
      </div>
    </aside>
  );
}

function NewsDrawer({
  item,
  onClose,
}: {
  item: NewsItemView;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLElement>(null);
  useDialogFocus(drawerRef);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const Icon = categoryIcon(item.category);
  const categoryColor = getNewsCategoryColor(item.category);
  const confidence = confidenceDisplay(item);
  const ConfidenceIcon = confidence.icon;

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        data-dialog-backdrop-owner="news-drawer-dialog"
        className="absolute inset-0 bg-[var(--bg-overlay)]"
        onClick={onClose}
      />
      <aside
        id="news-drawer-dialog"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-drawer-title"
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_12px_48px_rgba(17,17,20,0.14)] sm:max-w-xl"
      >
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-5 py-4 backdrop-blur-md">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 type-micro font-medium"
              style={{
                color: "#444444",
                backgroundColor: `${categoryColor}08`,
                borderColor: `${categoryColor}12`,
              }}
            >
              <Icon className="h-3 w-3" style={{ color: categoryColor }} />
              {item.category}
            </span>
            <span
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 type-micro font-medium"
              style={{
                color: "#444444",
                backgroundColor: `${confidence.color}08`,
                borderColor: `${confidence.color}12`,
              }}
            >
              <ConfidenceIcon className="h-3 w-3" style={{ color: confidence.color }} />
              {confidence.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 id="news-drawer-title" className="type-page-title">
            {item.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 type-micro">
            <span className="mono tabular-nums">{formatDate(item.publishedAt)}</span>
            {item.sourceName && <span>· {item.sourceName}</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section className="mb-6">
            <SectionLabel>Brief</SectionLabel>
            <p className="type-meta">{item.summary}</p>
          </section>

          {item.mentions.length > 0 && (
            <section className="mb-6">
              <SectionLabel count={item.mentions.length}>Tracked Mentions</SectionLabel>
              <div className="grid grid-cols-1 gap-2">
                {item.mentions.map((mention) => {
                  const MentionIcon = mentionIcon(mention.type);
                  const body = (
                    <span className="surface flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-subtle)]">
                      <span className="flex min-w-0 items-center gap-2">
                        <MentionIcon className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                        <span className="min-w-0">
                          <span className="block truncate type-row-title">
                            {mention.label}
                          </span>
                          {mention.reason && (
                            <span className="block truncate type-micro text-[var(--text-tertiary)]">
                              {mention.reason}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-right type-micro">
                        <span className="block">{mention.type}</span>
                        <span className="block text-[var(--text-tertiary)]">{mention.confidence}</span>
                      </span>
                    </span>
                  );
                  return mention.href ? (
                    <Link key={`${mention.type}-${mention.id}`} href={mention.href}>
                      {body}
                    </Link>
                  ) : (
                    <div key={`${mention.type}-${mention.id}`}>{body}</div>
                  );
                })}
              </div>
            </section>
          )}

          {item.linkedinUrls.length > 0 && (
            <section className="mb-6">
              <SectionLabel count={item.linkedinUrls.length}>Discovered LinkedIn Links</SectionLabel>
              <div className="grid grid-cols-1 gap-2">
                {item.linkedinUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="surface flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-subtle)]"
                  >
                    <span className="min-w-0 truncate type-meta text-[var(--text-secondary)]">{url}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionLabel>Source</SectionLabel>
            <div className="surface flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <div className="truncate type-row-title">
                  {item.sourceName || "News source"}
                </div>
                <div className="mt-0.5 truncate type-micro">
                  {isHttpUrl(item.sourceUrl) ? item.sourceUrl : "Internal record"}
                </div>
              </div>
              {isHttpUrl(item.sourceUrl) && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("source_link_clicked", { entity: "news", placement: "drawer" })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 type-meta font-medium transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

export function NewsFeed({ feed }: { feed: NewsFeedView }) {
  const [search, setSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [activeEntities, toggleEntity] = useUrlFilterSet("entity");
  const [activeSources, toggleSource] = useUrlFilterSet("source");
  const [activeConfidence, toggleConfidence] = useUrlFilterSet("confidence");
  const [dateWindowParam, setDateWindowParam] = useUrlQueryState("window", "Today", {
    resetPage: true,
  });
  const [pageParam, setPageParam] = useUrlQueryState("page", "1");
  const dateWindow: DateWindow = isDateWindow(dateWindowParam) ? dateWindowParam : "Today";
  const setDateWindow = useCallback(
    (value: DateWindow) => setDateWindowParam(value),
    [setDateWindowParam],
  );
  const [selectedItem, setSelectedItem] = useState<NewsItemView | null>(null);
  const debouncedSearch = useDebounce(search, 250);
  const openNewsItem = useCallback((item: NewsItemView) => {
    setSelectedItem(item);
    track("drawer_opened", { entity: "news" });
  }, []);

  const writeQueryParams = useUrlQueryParamsWriter();
  const clearAll = useCallback(() => {
    writeQueryParams({
      q: null,
      category: null,
      entity: null,
      source: null,
      confidence: null,
      window: null,
    }, { resetPage: true });
  }, [writeQueryParams]);

  const entityOptions = useMemo(() => getEntityOptions(feed.items), [feed.items]);
  const sourceOptions = useMemo(() => getSourceOptions(feed.items), [feed.items]);

  const filteredItems = useMemo(() => {
    const selectedWindow = DATE_WINDOWS.find((option) => option.label === dateWindow);
    const threshold = selectedWindow?.days != null ? daysAgo(selectedWindow.days) : null;
    const query = debouncedSearch.toLowerCase().trim();

    return feed.items.filter((item) => {
      if (activeCategories.size > 0 && !activeCategories.has(item.category)) return false;
      if (activeEntities.size > 0 && !item.mentions.some((mention) => activeEntities.has(mention.label))) return false;
      if (activeSources.size > 0 && !activeSources.has(sourceLabel(item))) return false;
      if (activeConfidence.size > 0 && !activeConfidence.has(confidenceFilterLabel(item))) return false;
      if (threshold != null && new Date(item.publishedAt).getTime() < threshold) return false;
      if (query) {
        const searchable = [
          item.title,
          item.summary,
          item.sourceName,
          item.sourceUrl,
          item.category,
          item.sector,
          item.region,
          confidenceFilterLabel(item),
          item.linkedinUrls.join(" "),
          item.mentions.map((mention) => mention.label).join(" "),
        ].join(" ").toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [feed.items, activeCategories, activeEntities, activeSources, activeConfidence, dateWindow, debouncedSearch]);

  useEffect(() => {
    if (selectedItem && !filteredItems.some((item) => item.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [filteredItems, selectedItem]);

  const counts = useMemo(() => {
    return {
      total: filteredItems.length,
      highConfidence: filteredItems.filter((item) => confidenceFilterLabel(item) === "High Confidence").length,
      needsReview: filteredItems.filter((item) => confidenceFilterLabel(item) === "Needs Review").length,
      linkedinLinks: filteredItems.reduce((total, item) => total + item.linkedinUrls.length, 0),
    };
  }, [filteredItems]);

  const parsedPage = Number.parseInt(pageParam, 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / NEWS_PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);
  const displayItems = useMemo(
    () => filteredItems.slice(
      (safePage - 1) * NEWS_PAGE_SIZE,
      safePage * NEWS_PAGE_SIZE,
    ),
    [filteredItems, safePage],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <IntelligenceHeader counts={counts} lastUpdated={feed.lastUpdated} />
      <OperationalStatus operations={feed.operations} />

      <CategorySpotlight items={filteredItems} onSelect={openNewsItem} />

      <NewsFilterBar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        activeEntities={activeEntities}
        onToggleEntity={toggleEntity}
        entityOptions={entityOptions}
        activeSources={activeSources}
        onToggleSource={toggleSource}
        sourceOptions={sourceOptions}
        activeConfidence={activeConfidence}
        onToggleConfidence={toggleConfidence}
        allItems={feed.items}
        dateWindow={dateWindow}
        onDateWindowChange={setDateWindow}
        onClearAll={clearAll}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="news-results-heading"
              tabIndex={-1}
              className="scroll-mt-20 type-section-title text-[var(--text-tertiary)] outline-none"
            >
              Signal Tape
            </h2>
            <span className="type-micro mono tabular-nums">
              {filteredItems.length.toLocaleString()} items
            </span>
          </div>
          <div className="space-y-3">
          {displayItems.map((item) => (
            <NewsCard key={item.id} item={item} onSelect={openNewsItem} />
          ))}
          {displayItems.length === 0 && (
            <div className="surface px-4 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
                <Search className="h-4 w-4" />
              </div>
              <h2 className="mt-3 type-row-title">
                {feed.items.length > 0
                  ? "Filters exclude the available signals"
                  : emptyNewsStateTitle(feed.operations.state)}
              </h2>
              <p className="mt-1 type-micro">
                {feed.items.length > 0
                  ? "Broaden the category, entity, search, or date filters to bring items back into view."
                  : feed.operations.message}
              </p>
            </div>
          )}
          </div>
          <PaginationControls
            page={safePage}
            pageSize={NEWS_PAGE_SIZE}
            totalItems={filteredItems.length}
            onPageChange={(nextPage) => setPageParam(String(nextPage))}
            resultHeadingId="news-results-heading"
          />
        </div>
        <InsightRail items={filteredItems} />
      </div>

      {selectedItem && (
        <NewsDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
