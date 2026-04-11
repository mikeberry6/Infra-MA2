export const dynamic = "force-dynamic";

import { searchAll } from "@/modules/search/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const results = query ? await searchAll(query) : [];

  const typeLabels = { deal: "Deal", company: "Company", fund: "Fund" };
  const typeColors = {
    deal: "text-blue-400 bg-blue-500/10",
    company: "text-emerald-400 bg-emerald-500/10",
    fund: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search</h1>

        <form method="get" className="mb-8">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search deals, companies, and funds..."
            className="w-full px-4 py-3 bg-[#111113] border border-[#27272A] rounded-lg text-white placeholder-[#52525B] focus:outline-none focus:border-[#818CF8]"
          />
        </form>

        {query && (
          <p className="text-sm text-[#71717A] mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="p-4 border border-[#27272A] rounded-lg bg-[#111113] hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[result.type]}`}>
                  {typeLabels[result.type]}
                </span>
                {result.sector && (
                  <span className="text-[10px] text-[#71717A]">{result.sector}</span>
                )}
                {result.region && (
                  <span className="text-[10px] text-[#71717A]">· {result.region}</span>
                )}
              </div>
              <h3 className="font-medium">{result.title}</h3>
              <p className="text-sm text-[#A1A1AA]">{result.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
