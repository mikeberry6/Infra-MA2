"use client";

import {
  getTodayDeals,
  formatValue,
  formatDate,
  formatTime,
  getSectorColor,
  getStatusClass,
  getDealStats,
} from "@/data/deals";
import type { Deal } from "@/data/deals";
import {
  ExternalLink,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowUpRight,
} from "lucide-react";

function BriefingHeader() {
  const stats = getDealStats();

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <Zap className="h-5 w-5 text-blue-500" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Daily Briefing
        </h1>
      </div>
      <p className="text-sm text-zinc-400 mb-6">
        North American Infrastructure M&A activity feed — real-time market
        intelligence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Today&apos;s Volume
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="mono text-xl font-semibold text-zinc-50">
            {formatValue(stats.totalVolume)}
          </span>
        </div>

        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Active Deals
            </span>
            <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="mono text-xl font-semibold text-zinc-50">
            {stats.activeCount}
          </span>
        </div>

        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Top Sector
            </span>
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: getSectorColor(stats.topSector),
              }}
            />
          </div>
          <span className="text-xl font-semibold text-zinc-50">
            {stats.topSector}
          </span>
          <span className="text-xs text-zinc-500 ml-2">
            ({stats.topSectorCount} deals)
          </span>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ deal, index }: { deal: Deal; index: number }) {
  return (
    <div
      className="relative pl-10 pb-8 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Timeline dot */}
      <div className="absolute left-[15px] top-1 z-10 flex h-[10px] w-[10px] items-center justify-center">
        <div
          className="h-2.5 w-2.5 rounded-full ring-[3px] ring-zinc-950"
          style={{
            backgroundColor: getSectorColor(deal.sector),
          }}
        />
      </div>

      {/* Card */}
      <div className="glass-card rounded-lg p-5 transition-colors hover:border-zinc-700">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-zinc-500" />
            <span className="mono text-xs text-zinc-500">
              {formatTime(deal.date)}
            </span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <span className="mono text-[11px] text-zinc-600">{deal.id}</span>
          <div className="h-3 w-px bg-zinc-800" />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              color: getSectorColor(deal.sector),
              backgroundColor: `${getSectorColor(deal.sector)}15`,
            }}
          >
            {deal.sector}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusClass(deal.status)}`}
          >
            {deal.status}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-base font-semibold text-zinc-100 mb-2 leading-snug">
          {deal.title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div>
            <span className="text-zinc-500">Buyer </span>
            <span className="text-zinc-300 font-medium">{deal.buyer}</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div>
            <span className="text-zinc-500">Value </span>
            <span className="mono text-emerald-400 font-semibold">
              {formatValue(deal.value)}
            </span>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-4">
          {deal.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="mono text-xs text-zinc-600">
            {formatDate(deal.date)}
          </span>
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors"
          >
            <span>Source: {deal.sourceName}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function DailyBriefing() {
  const todayDeals = getTodayDeals();

  return (
    <div className="mx-auto max-w-[800px] px-6 py-8">
      <BriefingHeader />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="timeline-line" />

        {todayDeals.map((deal, i) => (
          <TimelineCard key={deal.id} deal={deal} index={i} />
        ))}

        {/* Terminal dot */}
        <div className="relative pl-10 pb-4">
          <div className="absolute left-[15px] top-1 flex h-[10px] w-[10px] items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
          </div>
          <p className="text-xs text-zinc-600 pt-0.5">
            End of briefing — {todayDeals.length} items
          </p>
        </div>
      </div>
    </div>
  );
}
