export const dynamic = "force-dynamic";

import { searchAll, type SearchResult } from "@/modules/search/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
};

const TYPE_LABEL = { deal: "Deal", company: "Company", fund: "Fund" } as const;
const TYPE_BADGE: Record<SearchResult["type"], React.CSSProperties> = {
  deal: { color: "#1d4ed8", backgroundColor: "#3b82f612", border: "1px solid #3b82f624" },
  company: { color: "#047857", backgroundColor: "#10b98112", border: "1px solid #10b98124" },
  fund: { color: "#6d28d9", backgroundColor: "#8b5cf612", border: "1px solid #8b5cf624" },
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
    <div className="min-h-screen bg-[#f3f3f3] p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-2xl font-bold mb-6 text-[#1a1a1a] tracking-tight">Search</h1>

        <form method="get" className="mb-8">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search deals, companies, and funds..."
            className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[#1a1a1a] placeholder-[#999999] focus:outline-none focus:border-[#008253]"
          />
        </form>

        {query && (
          <p className="text-sm text-[#6b6b6b] mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        <div className="space-y-2">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={resultHref(result)}
              className="block p-4 border border-black/[0.08] bg-white hover:bg-[#f7f7f5] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-medium px-1.5 py-0"
                  style={TYPE_BADGE[result.type]}
                >
                  {TYPE_LABEL[result.type]}
                </span>
                {result.sector && (
                  <span className="text-[10px] text-[#999999]">{result.sector}</span>
                )}
                {result.region && (
                  <span className="text-[10px] text-[#999999]">· {result.region}</span>
                )}
              </div>
              <h3 className="text-[#1a1a1a] font-medium">{result.title}</h3>
              <p className="text-sm text-[#6e6e6e]">{result.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
