"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  DollarSign,
  ExternalLink,
  FileText,
  Landmark,
  Newspaper,
  Radio,
  Search,
  X,
} from "lucide-react";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { useDebounce } from "@/hooks/useDebounce";
import { useClearUrlFilters, useUrlFilterSet } from "@/hooks/useUrlFilterSet";
import { formatDate } from "@/lib/format";
import { getNewsCategoryColor, NEWS_CATEGORIES } from "@/lib/news-utils";
import type { NewsCategory, NewsFeedView, NewsItemView, NewsMentionType } from "@/modules/shared/types";

const DATE_WINDOWS = [
  { label: "All", days: null },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
] as const;

const MENTION_COLORS: Record<NewsMentionType, string> = {
  PortCo: "#3b6cf2",
  "Investment Firm": "#7d6cf0",
  Fund: "#1d9d76",
  Deal: "#d98b1c",
};

type NewsCounts = {
  total: number;
  transactions: number;
  fundraising: number;
  rumors: number;
};

function categoryIcon(category: NewsCategory) {
  if (category === "Infrastructure Fundraising Activity") return DollarSign;
  if (category === "Rumored Infrastructure Sales Processes") return Radio;
  return Newspaper;
}

function categoryShortLabel(category: NewsCategory): string {
  if (category === "Infrastructure Fundraising Activity") return "Fundraising";
  if (category === "Rumored Infrastructure Sales Processes") return "Rumored Sales";
  return "Transactions";
}

function mentionIcon(type: NewsMentionType) {
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

function getBalancedNewsItems(items: NewsItemView[]): NewsItemView[] {
  const buckets = NEWS_CATEGORIES.map((category) =>
    items.filter((item) => item.category === category),
  );
  const result: NewsItemView[] = [];
  const seen = new Set<string>();
  const longest = Math.max(...buckets.map((bucket) => bucket.length), 0);

  for (let index = 0; index < longest; index++) {
    for (const bucket of buckets) {
      const item = bucket[index];
      if (!item || seen.has(item.id)) continue;
      result.push(item);
      seen.add(item.id);
    }
  }

  return result;
}

function IntelligenceHeader({
  counts,
  lastUpdated,
}: {
  counts: NewsCounts;
  lastUpdated: string;
}) {
  const metrics = [
    { label: "Signals", value: counts.total, color: "#111114" },
    { label: "Transactions", value: counts.transactions, color: getNewsCategoryColor("Infrastructure Transaction Activity") },
    { label: "Fundraising", value: counts.fundraising, color: getNewsCategoryColor("Infrastructure Fundraising Activity") },
    { label: "Rumored Sales", value: counts.rumors, color: getNewsCategoryColor("Rumored Infrastructure Sales Processes") },
  ];

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(17,17,20,0.03)]">
      <div className="h-[2px] bg-gradient-to-r from-[var(--accent)] via-[#3b6cf2] to-transparent" />
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 type-label">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Market Intelligence
            </div>
            <h1 className="type-page-title">
              News Feed
            </h1>
            <p className="mt-1.5 type-meta">
              Infrastructure market signals across transaction activity, fundraising momentum, and rumored sale processes.
            </p>
          </div>
          <div className="type-micro">
            Updated <span className="mono tabular-nums">{formatDate(lastUpdated)}</span>
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
  allItems: NewsItemView[];
  dateWindow: (typeof DATE_WINDOWS)[number]["label"];
  onDateWindowChange: (value: (typeof DATE_WINDOWS)[number]["label"]) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mb-3 space-y-3">
      <div className="sticky top-14 z-30 flex items-center gap-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
        <div className="min-w-[210px] flex-1 sm:max-w-sm">
          <TextInput
            leadingIcon={<Search />}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search news..."
            aria-label="Search news"
          />
        </div>
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
        <div className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[var(--bg-hover)] p-0.5">
          {DATE_WINDOWS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onDateWindowChange(option.label)}
              className={`h-7 rounded px-2 type-micro font-medium transition-colors ${
                dateWindow === option.label
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
        ]}
        onClearAll={onClearAll}
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
      {isHttpUrl(item.sourceUrl) && (
        <div className="flex justify-end border-t border-[var(--border)] px-4 py-2">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </a>
        </div>
      )}
    </article>
  );
}

function InsightRail({ items }: { items: NewsItemView[] }) {
  const firms = topMentions(items, "Investment Firm");
  const portcos = topMentions(items, "PortCo");
  const rumorCount = items.filter((item) => item.category === "Rumored Infrastructure Sales Processes").length;
  const maxFirmCount = Math.max(...firms.map((firm) => firm.count), 1);
  const maxPortCoCount = Math.max(...portcos.map((company) => company.count), 1);

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
        <SectionLabel>Rumor Watch</SectionLabel>
        <div className="rounded-md border border-[#d98b1c]/15 bg-[#d98b1c]/[0.04] px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="type-meta">Active sale-process signals</span>
            <span className="mono type-page-title tabular-nums">{rumorCount}</span>
          </div>
          <p className="mt-1.5 type-micro">
            Sourced from tracked PortCo milestones and curated rumor records.
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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const Icon = categoryIcon(item.category);
  const categoryColor = getNewsCategoryColor(item.category);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close news detail"
        className="absolute inset-0 bg-[var(--bg-overlay)]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_12px_48px_rgba(17,17,20,0.14)] sm:max-w-xl">
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-5 py-4 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 type-micro font-medium"
              style={{
                color: "#444444",
                backgroundColor: `${categoryColor}08`,
                borderColor: `${categoryColor}12`,
              }}
            >
              <Icon className="h-3 w-3" style={{ color: categoryColor }} />
              {item.category}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="type-page-title">
            {item.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 type-micro">
            <span className="mono tabular-nums">{formatDate(item.publishedAt)}</span>
            {item.sourceName && <span>· {item.sourceName}</span>}
            <span>· {item.confidence} confidence</span>
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
                        <span className="truncate type-row-title">
                          {mention.label}
                        </span>
                      </span>
                      <span className="shrink-0 type-micro">{mention.type}</span>
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
  const [search, setSearch] = useState("");
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [activeEntities, toggleEntity] = useUrlFilterSet("entity");
  const [dateWindow, setDateWindow] = useState<(typeof DATE_WINDOWS)[number]["label"]>("All");
  const [selectedItem, setSelectedItem] = useState<NewsItemView | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const clearUrlFilters = useClearUrlFilters(["category", "entity"]);
  const clearAll = useCallback(() => {
    clearUrlFilters();
    setSearch("");
    setDateWindow("All");
  }, [clearUrlFilters]);

  const entityOptions = useMemo(() => getEntityOptions(feed.items), [feed.items]);

  const filteredItems = useMemo(() => {
    const selectedWindow = DATE_WINDOWS.find((option) => option.label === dateWindow);
    const threshold = selectedWindow?.days ? daysAgo(selectedWindow.days) : null;
    const query = debouncedSearch.toLowerCase().trim();

    return feed.items.filter((item) => {
      if (activeCategories.size > 0 && !activeCategories.has(item.category)) return false;
      if (activeEntities.size > 0 && !item.mentions.some((mention) => activeEntities.has(mention.label))) return false;
      if (threshold != null && new Date(item.publishedAt).getTime() < threshold) return false;
      if (query) {
        const searchable = [
          item.title,
          item.summary,
          item.sourceName,
          item.category,
          item.sector,
          item.region,
          item.mentions.map((mention) => mention.label).join(" "),
        ].join(" ").toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [feed.items, activeCategories, activeEntities, dateWindow, debouncedSearch]);

  useEffect(() => {
    if (selectedItem && !filteredItems.some((item) => item.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [filteredItems, selectedItem]);

  const counts = useMemo(() => {
    return {
      total: filteredItems.length,
      transactions: filteredItems.filter((item) => item.category === "Infrastructure Transaction Activity").length,
      fundraising: filteredItems.filter((item) => item.category === "Infrastructure Fundraising Activity").length,
      rumors: filteredItems.filter((item) => item.category === "Rumored Infrastructure Sales Processes").length,
    };
  }, [filteredItems]);

  const displayItems = useMemo(() => {
    const isUnfilteredView =
      activeCategories.size === 0 &&
      activeEntities.size === 0 &&
      debouncedSearch.trim() === "" &&
      dateWindow === "All";

    return isUnfilteredView ? getBalancedNewsItems(filteredItems) : filteredItems;
  }, [filteredItems, activeCategories, activeEntities, debouncedSearch, dateWindow]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <IntelligenceHeader counts={counts} lastUpdated={feed.lastUpdated} />

      <CategorySpotlight items={filteredItems} onSelect={setSelectedItem} />

      <NewsFilterBar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        activeEntities={activeEntities}
        onToggleEntity={toggleEntity}
        entityOptions={entityOptions}
        allItems={feed.items}
        dateWindow={dateWindow}
        onDateWindowChange={setDateWindow}
        onClearAll={clearAll}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="type-section-title text-[var(--text-tertiary)]">
              Signal Tape
            </span>
            <span className="type-micro mono tabular-nums">
              {displayItems.length.toLocaleString()} items
            </span>
          </div>
          <div className="space-y-3">
          {displayItems.map((item) => (
            <NewsCard key={item.id} item={item} onSelect={setSelectedItem} />
          ))}
          {displayItems.length === 0 && (
            <div className="surface px-4 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
                <Search className="h-4 w-4" />
              </div>
              <h2 className="mt-3 type-row-title">No signals matched</h2>
              <p className="mt-1 type-micro">
                Broaden the category, entity, or date filters to bring more items back into view.
              </p>
            </div>
          )}
          </div>
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
