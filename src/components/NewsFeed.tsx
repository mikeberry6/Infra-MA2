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

function categoryIcon(category: NewsCategory) {
  if (category === "Infrastructure Fundraising Activity") return DollarSign;
  if (category === "Rumored Infrastructure Sales Processes") return Radio;
  return Newspaper;
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

function SignalTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="surface px-3.5 py-3">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
      </div>
      <div className="mt-2 mono text-xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value.toLocaleString()}
      </div>
    </div>
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
              className={`h-7 rounded px-2 text-[11px] font-medium transition-colors ${
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
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
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
    <article className="surface overflow-hidden transition-colors hover:bg-[var(--bg-subtle)]">
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="block w-full px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
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
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
            <CalendarDays className="h-3 w-3" />
            <span className="mono tabular-nums">{formatDate(item.publishedAt)}</span>
          </span>
          {item.sourceName && (
            <span className="text-[11px] text-[var(--text-tertiary)]">· {item.sourceName}</span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug tracking-tight text-[var(--text-primary)] sm:text-[15px]">
              {item.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
              {item.summary}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
        </div>

        {visibleMentions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleMentions.map((mention) => (
              <MentionPill key={`${mention.type}-${mention.id}`} mention={mention} interactive={false} />
            ))}
            {item.mentions.length > visibleMentions.length && (
              <span className="inline-flex items-center rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-tertiary)]">
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
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      <div className="surface p-4">
        <SectionLabel>Most Mentioned Firms</SectionLabel>
        <div className="space-y-2.5">
          {firms.map((firm) => (
            <Link
              key={firm.label}
              href={firm.href || "/funds"}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="truncate text-[var(--text-secondary)]">{firm.label}</span>
              <span className="mono tabular-nums text-[var(--text-tertiary)]">{firm.count}</span>
            </Link>
          ))}
          {firms.length === 0 && <div className="text-xs text-[var(--text-tertiary)]">No firm mentions.</div>}
        </div>
      </div>

      <div className="surface p-4">
        <SectionLabel>PortCo Watch</SectionLabel>
        <div className="space-y-2.5">
          {portcos.map((company) => (
            <Link
              key={company.label}
              href={company.href || "/portfolio"}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="truncate text-[var(--text-secondary)]">{company.label}</span>
              <span className="mono tabular-nums text-[var(--text-tertiary)]">{company.count}</span>
            </Link>
          ))}
          {portcos.length === 0 && <div className="text-xs text-[var(--text-tertiary)]">No PortCo mentions.</div>}
        </div>
      </div>

      <div className="surface p-4">
        <SectionLabel>Rumor Watch</SectionLabel>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Active sale-process signals</span>
          <span className="mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">{rumorCount}</span>
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
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
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
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            {item.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="mono tabular-nums">{formatDate(item.publishedAt)}</span>
            {item.sourceName && <span>· {item.sourceName}</span>}
            <span>· {item.confidence} confidence</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section className="mb-6">
            <SectionLabel>Brief</SectionLabel>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{item.summary}</p>
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
                        <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {mention.label}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">{mention.type}</span>
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
                <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {item.sourceName || "News source"}
                </div>
                <div className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                  {isHttpUrl(item.sourceUrl) ? item.sourceUrl : "Internal record"}
                </div>
              </div>
              {isHttpUrl(item.sourceUrl) && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            News Feed
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
            <span className="mono font-medium tabular-nums text-[var(--text-primary)]">
              {filteredItems.length.toLocaleString()}
            </span>{" "}
            tracked infrastructure signals across transactions, fundraising, and rumored sales
          </p>
        </div>
        <div className="text-[11px] text-[var(--text-tertiary)]">
          Updated <span className="mono tabular-nums">{formatDate(feed.lastUpdated)}</span>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SignalTile label="Signals" value={counts.total} color="#111114" />
        <SignalTile label="Transactions" value={counts.transactions} color={getNewsCategoryColor("Infrastructure Transaction Activity")} />
        <SignalTile label="Fundraising" value={counts.fundraising} color={getNewsCategoryColor("Infrastructure Fundraising Activity")} />
        <SignalTile label="Rumored Sales" value={counts.rumors} color={getNewsCategoryColor("Rumored Infrastructure Sales Processes")} />
      </div>

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
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <NewsCard key={item.id} item={item} onSelect={setSelectedItem} />
          ))}
          {filteredItems.length === 0 && (
            <div className="surface py-12 text-center text-sm text-[var(--text-tertiary)]">
              No news matched the current filters.
            </div>
          )}
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
