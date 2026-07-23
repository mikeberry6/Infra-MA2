export const dynamic = "force-dynamic";

import {
  MIN_SEARCH_QUERY_LENGTH,
  SEARCH_PAGE_SIZE,
  coerceSearchScope,
  normalizeSearchQuery,
  searchAll,
  searchResultHref,
  type SearchCounts,
  type SearchResult,
  type SearchScope,
} from "@/modules/search/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { SearchTelemetryForm } from "@/components/search/SearchTelemetryForm";

export const metadata: Metadata = {
  title: "Search",
};

const TYPE_LABEL = { deal: "Deal", company: "Company", fund: "Fund" } as const;
const TYPE_DOT_COLOR: Record<SearchResult["type"], string> = {
  deal: "#3b82f6",
  company: "#10b981",
  fund: "#8b5cf6",
};
const EMPTY_COUNTS: SearchCounts = { deals: 0, companies: 0, funds: 0 };
const EXAMPLE_SEARCHES = ["Brookfield", "fiber", "renewable power"];
const DATABASE_SHORTCUTS = [
  { href: "/tracker", label: "Deal Database", description: "Transactions, buyers, sellers, and assets" },
  { href: "/funds", label: "Fund Database", description: "Managers, vehicles, strategies, and size" },
  { href: "/portfolio", label: "PortCo Database", description: "Portfolio companies and ownership history" },
];
const RESULT_GROUPS: Array<{
  type: SearchResult["type"];
  label: string;
}> = [
  { type: "deal", label: "Deals" },
  { type: "company", label: "PortCos" },
  { type: "fund", label: "Funds" },
];

const SCOPE_OPTIONS: Array<{
  value: SearchScope;
  label: string;
  count: (counts: SearchCounts) => number;
}> = [
  { value: "all", label: "All", count: (counts) => counts.deals + counts.companies + counts.funds },
  { value: "deals", label: "Deals", count: (counts) => counts.deals },
  { value: "companies", label: "PortCos", count: (counts) => counts.companies },
  { value: "funds", label: "Funds", count: (counts) => counts.funds },
];

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function positivePage(value: string): number {
  if (!/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function searchHref(query: string, scope: SearchScope, page = 1): string {
  const params = new URLSearchParams({ q: query });
  if (scope !== "all") params.set("scope", scope);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function scopeLabel(scope: SearchScope): string {
  return SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? "All";
}

function SearchGuidance({ title, message }: { title: string; message: string }) {
  return (
    <div className="surface px-5 py-6 sm:px-6">
      <h2 className="type-row-title">{title}</h2>
      <p className="mt-1 max-w-2xl type-meta leading-relaxed">{message}</p>

      <div className="mt-5">
        <h3 className="type-table-header">Example searches</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_SEARCHES.map((example) => (
            <Link
              key={example}
              href={searchHref(example, "all")}
              className="inline-flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              {example}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DATABASE_SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-app)] px-3.5 py-3 transition-colors hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          >
            <span className="block type-row-title">{shortcut.label}</span>
            <span className="mt-0.5 block type-micro leading-relaxed">{shortcut.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, grouped = false }: { result: SearchResult; grouped?: boolean }) {
  const title = (
    <span className="type-row-title transition-colors group-hover:text-[var(--accent)]">
      {result.title}
    </span>
  );

  return (
    <Link
      href={searchResultHref(result)}
      className="group block surface px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-[5px] w-[5px] rounded-full"
            style={{ backgroundColor: TYPE_DOT_COLOR[result.type] }}
          />
          <span className="type-micro font-medium text-[var(--text-secondary)]">
            {TYPE_LABEL[result.type]}
          </span>
        </span>
        {result.sector && <span className="type-micro">· {result.sector}</span>}
        {result.region && <span className="type-micro">· {result.region}</span>}
      </div>
      {grouped ? <h3>{title}</h3> : <h2>{title}</h2>}
      <p className="mt-0.5 type-meta">{result.subtitle}</p>
    </Link>
  );
}

function SearchResults({ results, scope }: { results: SearchResult[]; scope: SearchScope }) {
  if (scope !== "all") {
    return (
      <div className="space-y-2">
        {results.map((result) => (
          <ResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {RESULT_GROUPS.map((group) => {
        const groupResults = results.filter((result) => result.type === group.type);
        if (groupResults.length === 0) return null;
        return (
          <section key={group.type} aria-labelledby={`search-group-${group.type}`}>
            <div className="mb-2 flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <span
                aria-hidden
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: TYPE_DOT_COLOR[group.type] }}
              />
              <h2 id={`search-group-${group.type}`} className="type-table-header">
                {group.label}
              </h2>
              <span className="mono type-micro tabular-nums" aria-label={`${groupResults.length} on this page`}>
                {groupResults.length}
              </span>
            </div>
            <div className="space-y-2">
              {groupResults.map((result) => (
                <ResultCard key={`${result.type}-${result.id}`} result={result} grouped />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; scope?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = normalizeSearchQuery(firstParam(params.q));
  const scope = coerceSearchScope(firstParam(params.scope));
  const requestedPage = positivePage(firstParam(params.page));
  const hasQuery = query.length > 0;
  const queryIsValid = query.length >= MIN_SEARCH_QUERY_LENGTH;
  const response = queryIsValid
    ? await searchAll(query, { scope, page: requestedPage })
    : {
        query,
        scope,
        results: [],
        counts: EMPTY_COUNTS,
        total: 0,
        scopedTotal: 0,
        page: 1,
        pageSize: SEARCH_PAGE_SIZE,
        totalPages: 0,
      };
  const firstResult = response.scopedTotal > 0
    ? (response.page - 1) * response.pageSize + 1
    : 0;
  const lastResult = response.scopedTotal > 0
    ? Math.min(response.page * response.pageSize, response.scopedTotal)
    : 0;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Cross-database search"
        title="Search InfraSight"
        summary="Search published transactions, fund vehicles, managers, buyers, and portfolio companies, then open the owning database record."
        metrics={[
          {
            label: "Results",
            value: queryIsValid ? response.total.toLocaleString() : "Ready",
            detail: queryIsValid ? `across all databases for “${query}”` : "Enter at least two characters",
            color: "var(--accent)",
          },
          {
            label: "Deals",
            value: response.counts.deals.toLocaleString(),
            detail: "Transaction records",
            color: TYPE_DOT_COLOR.deal,
          },
          {
            label: "PortCos",
            value: response.counts.companies.toLocaleString(),
            detail: "Portfolio companies",
            color: TYPE_DOT_COLOR.company,
          },
          {
            label: "Funds",
            value: response.counts.funds.toLocaleString(),
            detail: "Fund vehicles",
            color: TYPE_DOT_COLOR.fund,
          },
        ]}
      />

      <SearchTelemetryForm className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="site-search" className="sr-only">Search InfraSight databases</label>
        <TextInput
          id="site-search"
          type="search"
          name="q"
          size="md"
          minLength={MIN_SEARCH_QUERY_LENGTH}
          defaultValue={query}
          leadingIcon={<Search />}
          placeholder="Search deals, companies, funds, or buyers..."
          autoFocus={!hasQuery}
        />
        {scope !== "all" && <input type="hidden" name="scope" value={scope} />}
        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">Search</Button>
      </SearchTelemetryForm>

      {!hasQuery && (
        <SearchGuidance
          title="Search the full research universe"
          message="Use a company, asset, fund, manager, buyer, subsector, or descriptive term. Results include published research records only."
        />
      )}

      {hasQuery && !queryIsValid && (
        <SearchGuidance
          title="Keep typing"
          message="Enter at least two characters so InfraSight can rank meaningful matches across the three databases."
        />
      )}

      {queryIsValid && (
        <>
          <nav aria-label="Search result scope" className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
            {SCOPE_OPTIONS.map((option) => {
              const active = response.scope === option.value;
              const count = option.count(response.counts);
              return (
                <Link
                  key={option.value}
                  href={searchHref(query, option.value)}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${option.label}, ${count.toLocaleString()} result${count === 1 ? "" : "s"}`}
                  className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 type-meta font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] ${
                    active
                      ? "border-[var(--accent)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {option.label}
                  <span className="mono tabular-nums text-[var(--text-tertiary)]">{count.toLocaleString()}</span>
                </Link>
              );
            })}
          </nav>

          {response.scopedTotal > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="type-micro">
                Showing <span className="mono tabular-nums text-[var(--text-secondary)]">{firstResult.toLocaleString()}–{lastResult.toLocaleString()}</span>
                {" "}of <span className="mono tabular-nums text-[var(--text-secondary)]">{response.scopedTotal.toLocaleString()}</span>
                {" "}{scopeLabel(response.scope).toLowerCase()} result{response.scopedTotal === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
              </p>
              {response.scope === "all" && (
                <p className="type-micro">Ranked by exact name, name prefix, then descriptive match.</p>
              )}
            </div>
          )}

          {response.results.length > 0 && (
            <SearchResults results={response.results} scope={response.scope} />
          )}

          {response.total === 0 && (
            <SearchGuidance
              title="No results matched"
              message="Try a shorter organization name, a broader infrastructure term, or open a database directly to browse its filters."
            />
          )}

          {response.total > 0 && response.scopedTotal === 0 && (
            <div className="surface px-5 py-8 text-center sm:px-6">
              <h2 className="type-row-title">No {scopeLabel(response.scope).toLowerCase()} matched</h2>
              <p className="mt-1 type-meta">
                This query has {response.total.toLocaleString()} result{response.total === 1 ? "" : "s"} in other databases.
              </p>
              <Link
                href={searchHref(query, "all")}
                className="mt-4 inline-flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                View all results
              </Link>
            </div>
          )}

          {response.totalPages > 1 && (
            <nav aria-label="Search result pages" className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
              {response.page > 1 ? (
                <Link
                  href={searchHref(query, response.scope, response.page - 1)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous
                </Link>
              ) : <span />}
              <span className="type-micro">
                Page <span className="mono tabular-nums text-[var(--text-secondary)]">{response.page}</span>
                {" "}of <span className="mono tabular-nums text-[var(--text-secondary)]">{response.totalPages}</span>
              </span>
              {response.page < response.totalPages ? (
                <Link
                  href={searchHref(query, response.scope, response.page + 1)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
