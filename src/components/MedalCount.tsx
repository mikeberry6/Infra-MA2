"use client";

import { Trophy } from "lucide-react";

interface MedalEntry {
  rank: string;
  country: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  highlight?: boolean;
}

const medalData: MedalEntry[] = [
  { rank: "1", country: "Norway", gold: 18, silver: 11, bronze: 11, total: 40 },
  { rank: "2", country: "United States", gold: 11, silver: 12, bronze: 9, total: 32 },
  { rank: "3", country: "Netherlands", gold: 10, silver: 7, bronze: 3, total: 20 },
  { rank: "4", country: "Italy", gold: 10, silver: 6, bronze: 14, total: 30, highlight: true },
  { rank: "5", country: "France", gold: 8, silver: 9, bronze: 6, total: 23 },
  { rank: "6", country: "Germany", gold: 7, silver: 9, bronze: 8, total: 24 },
  { rank: "7", country: "Switzerland", gold: 6, silver: 8, bronze: 6, total: 20 },
  { rank: "8", country: "Sweden", gold: 6, silver: 6, bronze: 4, total: 16 },
  { rank: "9", country: "Austria", gold: 5, silver: 8, bronze: 5, total: 18 },
  { rank: "10", country: "Japan", gold: 5, silver: 7, bronze: 12, total: 24 },
  { rank: "11", country: "Canada", gold: 5, silver: 6, bronze: 9, total: 20 },
  { rank: "12", country: "China", gold: 4, silver: 3, bronze: 6, total: 13 },
  { rank: "13", country: "South Korea", gold: 3, silver: 4, bronze: 3, total: 10 },
  { rank: "14", country: "Australia", gold: 3, silver: 2, bronze: 1, total: 6 },
  { rank: "15", country: "Great Britain", gold: 3, silver: 1, bronze: 0, total: 4 },
  { rank: "16", country: "Czech Republic", gold: 2, silver: 2, bronze: 1, total: 5 },
  { rank: "17", country: "Slovenia", gold: 2, silver: 1, bronze: 1, total: 4 },
  { rank: "18", country: "Spain", gold: 1, silver: 0, bronze: 2, total: 3 },
  { rank: "19", country: "Brazil", gold: 1, silver: 0, bronze: 0, total: 1 },
  { rank: "19", country: "Kazakhstan", gold: 1, silver: 0, bronze: 0, total: 1 },
  { rank: "21", country: "Poland", gold: 0, silver: 3, bronze: 1, total: 4 },
  { rank: "22", country: "New Zealand", gold: 0, silver: 2, bronze: 1, total: 3 },
  { rank: "23", country: "Finland", gold: 0, silver: 1, bronze: 5, total: 6 },
  { rank: "24", country: "Latvia", gold: 0, silver: 1, bronze: 1, total: 2 },
  { rank: "25", country: "Denmark", gold: 0, silver: 1, bronze: 0, total: 1 },
  { rank: "25", country: "Estonia", gold: 0, silver: 1, bronze: 0, total: 1 },
  { rank: "25", country: "Georgia", gold: 0, silver: 1, bronze: 0, total: 1 },
  { rank: "\u2013", country: "Individual Neutral Athletes", gold: 0, silver: 1, bronze: 0, total: 1 },
  { rank: "28", country: "Bulgaria", gold: 0, silver: 0, bronze: 2, total: 2 },
  { rank: "29", country: "Belgium", gold: 0, silver: 0, bronze: 1, total: 1 },
];

const totals = medalData.reduce(
  (acc, e) => ({
    gold: acc.gold + e.gold,
    silver: acc.silver + e.silver,
    bronze: acc.bronze + e.bronze,
    total: acc.total + e.total,
  }),
  { gold: 0, silver: 0, bronze: 0, total: 0 }
);

const maxGold = Math.max(...medalData.map((e) => e.gold));

function MedalBar({ gold, silver, bronze, total }: { gold: number; silver: number; bronze: number; total: number }) {
  if (total === 0) return null;
  const maxTotal = medalData[0].total;
  const widthPct = (total / maxTotal) * 100;
  return (
    <div className="hidden lg:flex items-center gap-1.5 flex-1 max-w-[200px]">
      <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800/50" style={{ width: `${widthPct}%`, minWidth: "4px" }}>
        {gold > 0 && <div className="h-full bg-yellow-500" style={{ width: `${(gold / total) * 100}%` }} />}
        {silver > 0 && <div className="h-full bg-zinc-400" style={{ width: `${(silver / total) * 100}%` }} />}
        {bronze > 0 && <div className="h-full bg-amber-700" style={{ width: `${(bronze / total) * 100}%` }} />}
      </div>
    </div>
  );
}

export function MedalCount() {
  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              2026 Winter Olympics Medal Count
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Milano Cortina 2026
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Countries", value: medalData.filter((e) => e.rank !== "\u2013").length.toString(), color: "text-blue-400" },
            { label: "Gold", value: totals.gold.toString(), color: "text-yellow-500" },
            { label: "Silver", value: totals.silver.toString(), color: "text-zinc-400" },
            { label: "Bronze", value: totals.bronze.toString(), color: "text-amber-700" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                {card.label}
              </p>
              <p className={`text-lg sm:text-xl font-bold mono ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] sm:grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem] lg:grid-cols-[3rem_1fr_200px_3.5rem_3.5rem_3.5rem_3.5rem] gap-x-2 sm:gap-x-3 items-center px-3 sm:px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">
          <span className="text-center">#</span>
          <span>Country</span>
          <span className="hidden lg:block" />
          <span className="text-center">
            <span className="inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-yellow-500" title="Gold" />
          </span>
          <span className="text-center">
            <span className="inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-zinc-400" title="Silver" />
          </span>
          <span className="text-center">
            <span className="inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-amber-700" title="Bronze" />
          </span>
          <span className="text-center font-semibold text-zinc-400">Tot</span>
        </div>

        {/* Rows */}
        {medalData.map((entry, idx) => (
          <div
            key={`${entry.rank}-${entry.country}`}
            className={`grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] sm:grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem] lg:grid-cols-[3rem_1fr_200px_3.5rem_3.5rem_3.5rem_3.5rem] gap-x-2 sm:gap-x-3 items-center px-3 sm:px-4 py-2 sm:py-2.5 border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/50 ${
              idx === 0 ? "bg-yellow-500/[0.03]" : ""
            } ${entry.highlight ? "bg-blue-500/[0.04]" : ""}`}
          >
            <span className="text-center text-xs sm:text-sm mono text-zinc-500 font-medium">
              {entry.rank}
            </span>
            <span className="text-sm sm:text-base font-medium text-zinc-200 truncate">
              {entry.country}
              {entry.highlight && <span className="text-blue-400 ml-0.5">*</span>}
            </span>
            <MedalBar gold={entry.gold} silver={entry.silver} bronze={entry.bronze} total={entry.total} />
            <span className={`text-center text-sm sm:text-base mono font-semibold ${entry.gold > 0 ? "text-yellow-500" : "text-zinc-700"}`}>
              {entry.gold}
            </span>
            <span className={`text-center text-sm sm:text-base mono font-semibold ${entry.silver > 0 ? "text-zinc-400" : "text-zinc-700"}`}>
              {entry.silver}
            </span>
            <span className={`text-center text-sm sm:text-base mono font-semibold ${entry.bronze > 0 ? "text-amber-700" : "text-zinc-700"}`}>
              {entry.bronze}
            </span>
            <span className="text-center text-sm sm:text-base mono font-bold text-zinc-300">
              {entry.total}
            </span>
          </div>
        ))}

        {/* Totals row */}
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] sm:grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem] lg:grid-cols-[3rem_1fr_200px_3.5rem_3.5rem_3.5rem_3.5rem] gap-x-2 sm:gap-x-3 items-center px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-900/80 border-t border-zinc-700">
          <span />
          <span className="text-sm sm:text-base font-semibold text-zinc-400">Total</span>
          <span className="hidden lg:block" />
          <span className="text-center text-sm sm:text-base mono font-bold text-yellow-500">{totals.gold}</span>
          <span className="text-center text-sm sm:text-base mono font-bold text-zinc-400">{totals.silver}</span>
          <span className="text-center text-sm sm:text-base mono font-bold text-amber-700">{totals.bronze}</span>
          <span className="text-center text-sm sm:text-base mono font-bold text-zinc-200">{totals.total}</span>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-xs text-zinc-600">
        * Host nation
      </p>
    </div>
  );
}
