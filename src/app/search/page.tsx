export const dynamic = "force-dynamic";

import {
  groupSearchPageResults,
  normalizeSearchPage,
  normalizeSearchQuery,
  normalizeSearchScope,
  SEARCH_PAGE_SIZE,
  searchAllWithMeta,
  type SearchResult,
  type SearchScope,
} from "@/modules/search/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { TrackedSearchForm } from "@/components/search/TrackedSearchForm";
import { withBasePath } from "@/lib/base-path";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Search",
};

const TYPE_LABEL = { deal: "Deal", company: "Company", fund: "Fund" } as const;
const TYPE_PLURAL_LABEL = { deal: "Deals", company: "Companies", fund: "Funds" } as const;
const TYPE_DOT_COLOR: Record<SearchResult["type"], string> = {
  deal: "#3b82f6",
  company: "#10b981",
  fund: "#8b5cf6",
};
const SCOPE_LABEL: Record<SearchScope, string> = {
  all: "All",
  deal: "Deals",
  company: "PortCos",
  fund: "Funds",
};

// Map a result to the database page that owns it. The database client reads
// the `focus` query param on mount and opens the matching drawer.
function resultHref(r: SearchResult): string {
  const focusKey = r.legacyId ?? r.id;
  switch (r.type) {
    case "deal":
      return `/tracker?focus=${encodeURIComponent(focusKey)}`;
    case "company":
      return `/portfolio?focus=${encodeURIComponent(focusKey)}`;
    case "fund":
      return `/funds?focus=${encodeURIComponent(focusKey)}`;
  }
}

function searchHref(query: string, scope: SearchScope, page = 1): string {
  const params = new URLSearchParams({ q: query });
  if (scope !== "all") params.set("scope", scope);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function ResultLink({
  result,
  rank,
  grouped = false,
}: {
  result: SearchResult;
  rank?: number;
  grouped?: boolean;
}) {
  const Heading = grouped ? "h4" : "h3";
  return (
    <Link
      href={resultHref(result)}
      className="block surface px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: TYPE_DOT_COLOR[result.type] }} />
        <span className="type-micro font-medium text-[var(--text-secondary)]">{TYPE_LABEL[result.type]}</span>
        {rank !== undefined && <span className="type-micro mono tabular-nums">· Relevance #{rank}</span>}
        {result.sector && <span className="type-micro">· {result.sector}</span>}
        {result.region && <span className="type-micro">· {result.region}</span>}
      </div>
      <Heading className="type-row-title group-hover:text-[var(--accent)] transition-colors">{result.title}</Heading>
      <p className="type-meta mt-0.5">{result.subtitle}</p>
    </Link>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    scope?: string | string[];
    page?: string | string[];
  }>;
}) {
  const { q, scope: rawScope, page: rawPage } = await searchParams;
  const query = normalizeSearchQuery(q);
  const scope = normalizeSearchScope(rawScope);
  const page = normalizeSearchPage(rawPage);
  const requestId = await currentServerRequestId();
  const search = query
    ? await withServerTask(
        { route: "/search", operation: "search_all", requestId },
        () => searchAllWithMeta(query, { scope, page }),
      )
    : {
        results: [],
        total: 0,
        scopeTotal: 0,
        counts: { deal: 0, company: 0, fund: 0 },
        scope,
        page: 1,
        pageSize: SEARCH_PAGE_SIZE,
        totalPages: 1,
      };
  const { results } = search;
  const resultStart = search.scopeTotal === 0 ? 0 : (search.page - 1) * search.pageSize + 1;
  const resultEnd = Math.min(search.page * search.pageSize, search.scopeTotal);
  const activeType = search.scope === "all" ? null : search.scope;
  const sectionLabel = activeType ? TYPE_PLURAL_LABEL[activeType] : "All results";
  const scopeNoun = search.scope === "all"
    ? "result"
    : search.scope === "company"
      ? "portfolio company"
      : search.scope;
  const scopeNounPlural = search.scope === "company" ? "portfolio companies" : `${scopeNoun}s`;
  const scopeCounts: Record<SearchScope, number> = {
    all: search.total,
    deal: search.counts.deal,
    company: search.counts.company,
    fund: search.counts.fund,
  };
  const groupedResults = groupSearchPageResults(results, resultStart);

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-8 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Cross-database search"
        title="Search InfraSight"
        summary="Search across transactions, fund vehicles, and portfolio companies, then jump directly into the owning database record."
        metrics={[
          {
            label: "Results",
            value: query ? search.total.toLocaleString() : "Ready",
            detail: query ? `for "${query}"` : "Enter a company, fund, or buyer",
            color: "var(--accent)",
          },
          {
            label: "Deals",
            value: search.counts.deal.toLocaleString(),
            detail: "Transaction records",
            color: TYPE_DOT_COLOR.deal,
          },
          {
            label: "PortCos",
            value: search.counts.company.toLocaleString(),
            detail: "Portfolio companies",
            color: TYPE_DOT_COLOR.company,
          },
          {
            label: "Funds",
            value: search.counts.fund.toLocaleString(),
            detail: "Fund vehicles",
            color: TYPE_DOT_COLOR.fund,
          },
        ]}
      />

      <TrackedSearchForm query={query} scope={search.scope} />

      {query && (
        <>
          <nav aria-label="Search result scopes" className="mb-4 flex flex-wrap gap-2">
            {(["all", "deal", "company", "fund"] as const).map((item) => {
              const isActive = search.scope === item;
              return (
                // Use a document navigation for scope changes. A client Link
                // transition can be aborted when this page has just been
                // restored through browser history from a deep-linked drawer.
                <a
                  key={item}
                  href={withBasePath(searchHref(query, item))}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 type-meta font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {SCOPE_LABEL[item]}
                  <span className="mono tabular-nums text-[10px] opacity-75">
                    {scopeCounts[item].toLocaleString()}
                  </span>
                </a>
              );
            })}
          </nav>
          <p className="type-micro mb-3">
            Showing <span className="mono tabular-nums text-[var(--text-secondary)]">{resultStart}-{resultEnd}</span>
            {" "}of <span className="mono tabular-nums text-[var(--text-secondary)]">{search.scopeTotal.toLocaleString()}</span>
            {" "}{search.scopeTotal === 1 ? scopeNoun : scopeNounPlural} for &ldquo;{query}&rdquo;
          </p>
        </>
      )}

      {query && results.length > 0 && (
        <div className="space-y-7">
          <section aria-labelledby="search-results-heading">
            <div className="mb-2 flex items-center gap-2">
              <h2 id="search-results-heading" className="type-section-title text-[var(--text-primary)]">
                {sectionLabel}
              </h2>
              <span className="type-micro mono tabular-nums">
                {resultStart}-{resultEnd} of {search.scopeTotal.toLocaleString()}
              </span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            {search.scope === "all" ? (
              <div className="space-y-6">
                {groupedResults.map((group) => (
                  <section key={group.type} aria-labelledby={`search-group-${group.type}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 id={`search-group-${group.type}`} className="type-label text-[var(--text-secondary)]">
                        {TYPE_PLURAL_LABEL[group.type]}
                      </h3>
                      <span className="type-micro mono tabular-nums">{group.results.length} on this page</span>
                    </div>
                    <div className="space-y-2">
                      {group.results.map(({ result, rank }) => (
                        <ResultLink
                          key={`${result.type}-${result.id}`}
                          result={result}
                          rank={rank}
                          grouped
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <ResultLink key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            )}
          </section>

          {search.totalPages > 1 && (
            <nav aria-label="Search result pages" className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4 type-meta">
              {search.page > 1
                ? <a href={withBasePath(searchHref(query, search.scope, search.page - 1))}>← Previous</a>
                : <span aria-hidden />}
              <span className="mono tabular-nums text-[var(--text-tertiary)]">
                Page {search.page} of {search.totalPages}
              </span>
              {search.page < search.totalPages
                ? <a href={withBasePath(searchHref(query, search.scope, search.page + 1))}>Next →</a>
                : <span aria-hidden />}
            </nav>
          )}
        </div>
      )}

      {!query && (
        <section className="surface p-5 sm:p-6">
          <h2 className="type-section-title">Search the research universe</h2>
          <p className="mt-1 type-meta">Try a manager, target, fund vehicle, subsector, or transaction phrase.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Brookfield", "data centers", "renewable energy", "Macquarie"].map((example) => (
              <Link key={example} href={`/search?q=${encodeURIComponent(example)}`} className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 type-meta font-medium hover:bg-[var(--bg-hover)]">
                {example}
              </Link>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link href="/tracker" className="surface px-3 py-3 type-meta font-medium hover:bg-[var(--bg-hover)]">Browse deals →</Link>
            <Link href="/funds" className="surface px-3 py-3 type-meta font-medium hover:bg-[var(--bg-hover)]">Browse funds →</Link>
            <Link href="/portfolio" className="surface px-3 py-3 type-meta font-medium hover:bg-[var(--bg-hover)]">Browse PortCos →</Link>
          </div>
        </section>
      )}

      {query && search.scopeTotal === 0 && (
        <div className="py-12 text-center type-meta text-[var(--text-tertiary)]">
          No {scopeNounPlural} matched your query.
        </div>
      )}
    </div>
  );
}
