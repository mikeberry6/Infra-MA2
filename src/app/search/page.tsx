export const dynamic = "force-dynamic";

import { Search } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { TextInput } from "@/components/shared/TextInput";
import { withBasePath } from "@/lib/base-path";
import { publicMetadata } from "@/lib/public-metadata";
import {
  parseSearchRequest,
  searchAll,
  SEARCH_MAX_QUERY_LENGTH,
  SEARCH_PAGE_SIZE,
  SEARCH_TYPES,
  type SearchResult,
  type SearchType,
} from "@/modules/search/queries";

export const metadata = {
  ...publicMetadata("/search"),
  robots: { index: false, follow: true },
};

const TYPE_LABEL = { deal: "Deal", company: "PortCo", fund: "Fund" } as const;
const TYPE_LABEL_PLURAL = { deal: "Deals", company: "PortCos", fund: "Funds" } as const;
const TYPE_DOT_COLOR: Record<SearchType, string> = {
  deal: "#3b82f6",
  company: "#10b981",
  fund: "#8b5cf6",
};
const TYPE_ROUTE = { deal: "/tracker", company: "/portfolio", fund: "/funds" } as const;
const CONTROL_CLASS =
  "inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 type-meta font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

function resultHref(result: SearchResult): string {
  return withBasePath(`${TYPE_ROUTE[result.type]}?focus=${encodeURIComponent(result.id)}`);
}

function searchHref(query: string, type: SearchType | null, page = 1): string {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return withBasePath(`/search?${params}`);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[]; page?: string | string[] }>;
}) {
  const request = parseSearchRequest(await searchParams);
  const { query, type } = request;
  const { results, counts, total, page, pageCount } = await searchAll(request);
  const hasQuery = query.length >= 2;
  const allCount = counts.deal + counts.company + counts.fund;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Cross-database search"
        title="Search InfraSight"
        summary="Find transactions, fund vehicles, and portfolio companies by name, alias, or sponsor."
        metrics={[]}
      />

      <form method="get" action={withBasePath("/search")} role="search" aria-label="Research databases" className="mb-5">
        <label htmlFor="research-query" className="mb-1.5 block type-row-title">
          Search deals, PortCos, and funds
        </label>
        <div className="flex items-end gap-2">
          <TextInput
            id="research-query"
            type="search"
            name="q"
            size="md"
            defaultValue={query}
            leadingIcon={<Search />}
            placeholder="Company, fund, manager, or buyer"
            minLength={2}
            maxLength={SEARCH_MAX_QUERY_LENGTH}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="shrink-0">
            Search
          </Button>
        </div>
      </form>

      {hasQuery && (
        <nav aria-label="Filter search by record type" className="mb-4 flex flex-wrap gap-2">
          {([null, ...SEARCH_TYPES] as const).map((candidate) => {
            const selected = type === candidate;
            const label = candidate ? TYPE_LABEL_PLURAL[candidate] : "All";
            const count = candidate ? counts[candidate] : allCount;
            return (
              <a
                key={candidate ?? "all"}
                href={searchHref(query, candidate)}
                aria-current={selected ? "page" : undefined}
                className={`${CONTROL_CLASS} ${selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"}`}
              >
                {label} <span className="mono tabular-nums">{count.toLocaleString()}</span>
              </a>
            );
          })}
        </nav>
      )}

      {hasQuery && total > 0 && (
        <>
          <p className="mb-3 type-meta">
            Showing {((page - 1) * SEARCH_PAGE_SIZE + 1).toLocaleString()}–{((page - 1) * SEARCH_PAGE_SIZE + results.length).toLocaleString()} of {total.toLocaleString()} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          <ul className="space-y-2" aria-label="Search results">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <a
                  href={resultHref(result)}
                  data-research-event="search_success"
                  className="group block surface px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2 type-meta">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TYPE_DOT_COLOR[result.type] }} />
                      {TYPE_LABEL[result.type]}
                    </span>
                    {result.sector && <span>· {result.sector}</span>}
                    {result.region && <span>· {result.region}</span>}
                  </div>
                  <h2 className="type-row-title transition-colors group-hover:text-[var(--accent)]">{result.title}</h2>
                  <p className="mt-0.5 type-meta">{result.subtitle}</p>
                </a>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav aria-label="Search results pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="type-meta">Page {page.toLocaleString()} of {pageCount.toLocaleString()}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a className={`${CONTROL_CLASS} border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]`} href={searchHref(query, type, page - 1)} rel="prev">
                    Previous
                  </a>
                )}
                {page < pageCount && (
                  <a className={`${CONTROL_CLASS} border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]`} href={searchHref(query, type, page + 1)} rel="next">
                    Next
                  </a>
                )}
              </div>
            </nav>
          )}
        </>
      )}

      {hasQuery && total === 0 && (
        <div className="surface px-4 py-10 text-center" data-research-empty={allCount === 0 ? "search" : undefined}>
          <h2 className="type-row-title">No results for &ldquo;{query}&rdquo;</h2>
          <p className="mt-1 type-meta">
            {type && allCount > 0
              ? "Choose All to include the other record types."
              : "Try a shorter name, an alternate spelling, or the sponsor’s name."}
          </p>
        </div>
      )}
      {!hasQuery && (
        <p className="type-meta">{query ? "Enter at least two characters to search." : "Start with a company, buyer, or fund name."}</p>
      )}
    </div>
  );
}
