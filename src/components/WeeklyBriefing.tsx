"use client";

import {
  getWeeklyDeals,
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
import { MarketInsightHero } from "./MarketPulse";

function TimelineCard({ deal, index }: { deal: Deal; index: number }) {
  const categoryColor = getCategoryColor(deal.category[0]);

  return (
    <div
      className="relative pl-10 lg:pl-12 pb-8 lg:pb-10 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Timeline dot */}
      <div className="absolute left-[15px] top-1 z-10 flex h-[10px] w-[10px] items-center justify-center">
        <div
          className="h-2.5 w-2.5 rounded-full ring-[3px] ring-[#09090B]"
          style={{
            backgroundColor: getSectorColor(deal.sector),
          }}
        />
      </div>

      {/* Card */}
      <div className="surface-card glass-card-interactive rounded-[4px] p-4 sm:p-5 lg:p-6">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#52525B]" />
            <span className="mono text-xs text-[#52525B]">
              {formatTime(deal.date)}
            </span>
          </div>
          <div className="h-3 w-px bg-[#27272A]" />
          <span className="mono text-[11px] text-[#52525B]">{deal.id}</span>
          <div className="h-3 w-px bg-[#27272A]" />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              color: getSectorColor(deal.sector),
              backgroundColor: `${getSectorColor(deal.sector)}1a`,
            }}
          >
            {deal.sector}
          </span>
          <span className="text-[10px] text-[#52525B]">
            {deal.subsector}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-base lg:text-lg font-semibold text-[#EDEDED] mb-2 leading-snug tracking-tight">
          {deal.title}
        </h3>

        {/* Category badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {deal.category.map((cat) => {
            const color = getCategoryColor(cat);
            return (
              <span
                key={cat}
                className="text-[11px] font-medium px-2 py-0.5 rounded-[4px]"
                style={{
                  color: color,
                  backgroundColor: `${color}1a`,
                  border: `1px solid ${color}33`,
                }}
              >
                {cat}
              </span>
            );
          })}
        </div>

        {/* Key Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 mb-3">
          <div className="rounded-[4px] border border-[#27272A] bg-[#18181B] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3 w-3 text-[#818CF8]" />
              <span className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider">Buyer</span>
            </div>
            <span className="text-sm font-medium text-[#EDEDED]">{deal.buyer}</span>
          </div>
          <div className="rounded-[4px] border border-[#27272A] bg-[#18181B] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase className="h-3 w-3 text-violet-500" />
              <span className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider">Seller</span>
            </div>
            <span className="text-sm font-medium text-[#EDEDED]">{deal.seller}</span>
          </div>
        </div>

        <p className="text-sm lg:text-base text-[#A1A1AA] leading-relaxed mb-2">
          {deal.description}
        </p>

        {/* Target */}
        <div className="flex items-start gap-1.5 mb-4">
          <Target className="h-3 w-3 text-[#52525B] mt-0.5 shrink-0" />
          <p className="text-xs text-[#52525B] leading-relaxed">
            <span className="font-medium text-[#A1A1AA]">Target:</span> {deal.targetDescription}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="mono text-xs text-[#52525B]">
            {formatDate(deal.date)}
          </span>
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#818CF8] transition-colors py-1"
          >
            <span>Source: {deal.sourceName}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function WeeklyBriefing() {
  const recentDeals = getWeeklyDeals();

  return (
    <div className="mx-auto max-w-[900px] lg:max-w-[1100px] xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
      <MarketInsightHero deals={recentDeals} />

      {/* Timeline header */}
      <div className="mt-10 lg:mt-14 mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-[#EDEDED] tracking-tight">This Week&#39;s Activity</h2>
        <p className="text-sm lg:text-base text-[#52525B]">Infrastructure M&A transactions announced this week</p>
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
            <div className="h-2 w-2 rounded-full bg-[#3f3f46]" />
          </div>
          <p className="text-xs text-[#52525B] pt-0.5">
            End of weekly briefing &mdash; {recentDeals.length} transactions
          </p>
        </div>
      </div>
    </div>
  );
}
