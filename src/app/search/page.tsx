export const dynamic = "force-dynamic";

import { searchAll, type SearchResult } from "@/modules/search/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { TextInput } from "@/components/shared/TextInput";

export const metadata: Metadata = {
  title: "Search",
};

const TYPE_LABEL = { deal: "Deal", company: "Company", fund: "Fund" } as const;
const TYPE_DOT_COLOR: Record<SearchResult["type"], string> = {
  deal: "#3b82f6",
  company: "#10b981",
  fund: "#8b5cf6",
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const results = query ? await searchAll(query) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        Search
      </h1>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
        Across deals, portfolio companies, and funds.
      </p>

      <form method="get" className="mb-6">
        <TextInput
          type="search"
          name="q"
          size="md"
          defaultValue={query}
          leadingIcon={<Search />}
          placeholder="Search deals, companies, and funds..."
          autoFocus
        />
      </form>

      {query && (
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          <span className="mono tabular-nums text-[var(--text-secondary)]">{results.length}</span> result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="space-y-2">
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={resultHref(result)}
            className="block surface px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-[5px] w-[5px] rounded-full"
                  style={{ backgroundColor: TYPE_DOT_COLOR[result.type] }}
                />
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  {TYPE_LABEL[result.type]}
                </span>
              </span>
              {result.sector && (
                <span className="text-[11px] text-[var(--text-tertiary)]">· {result.sector}</span>
              )}
              {result.region && (
                <span className="text-[11px] text-[var(--text-tertiary)]">· {result.region}</span>
              )}
            </div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {result.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{result.subtitle}</p>
          </Link>
        ))}
      </div>

      {query && results.length === 0 && (
        <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
          No results matched your query.
        </div>
      )}
    </div>
  );
}
