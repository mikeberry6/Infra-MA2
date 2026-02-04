"use client";

import {
  getRecentDeals,
  formatDate,
  formatTime,
  getSectorColor,
  getCategoryColor,
} from "@/data/deals";
import type { Deal } from "@/data/deals";
import {
  ExternalLink,
  Clock,
  Building2,
  Briefcase,
  Target,
} from "lucide-react";
import { DealGlobe } from "./MarketPulse";

function TimelineCard({ deal, index }: { deal: Deal; index: number }) {
  const categoryColor = getCategoryColor(deal.category);

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
      <div className="glass-card rounded-lg p-4 sm:p-5 transition-colors hover:border-zinc-700">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
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
          <span className="text-[10px] text-zinc-500">
            {deal.subsector}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-base font-semibold text-zinc-100 mb-2 leading-snug">
          {deal.title}
        </h3>

        {/* Category badge */}
        <div className="mb-3">
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: categoryColor,
              backgroundColor: `${categoryColor}15`,
              border: `1px solid ${categoryColor}30`,
            }}
          >
            {deal.category}
          </span>
        </div>

        {/* Key Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Buyer</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">{deal.buyer}</span>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase className="h-3 w-3 text-violet-500" />
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Seller</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">{deal.seller}</span>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-2">
          {deal.description}
        </p>

        {/* Target */}
        <div className="flex items-start gap-1.5 mb-4">
          <Target className="h-3 w-3 text-zinc-500 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="font-medium text-zinc-400">Target:</span> {deal.targetDescription}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="mono text-xs text-zinc-600">
            {formatDate(deal.date)}
          </span>
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors py-1"
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
  const recentDeals = getRecentDeals();

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-8">
      <DealGlobe />

      {/* Timeline header */}
      <div className="mt-10 mb-6">
        <h2 className="text-lg font-semibold text-zinc-100">Recent Activity</h2>
        <p className="text-sm text-zinc-500">Latest infrastructure M&A deals</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="timeline-line" />

        {recentDeals.map((deal, i) => (
          <TimelineCard key={deal.id} deal={deal} index={i} />
        ))}

        {/* Terminal dot */}
        <div className="relative pl-10 pb-4">
          <div className="absolute left-[15px] top-1 flex h-[10px] w-[10px] items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
          </div>
          <p className="text-xs text-zinc-600 pt-0.5">
            End of briefing &mdash; {recentDeals.length} items
          </p>
        </div>
      </div>
    </div>
  );
}
