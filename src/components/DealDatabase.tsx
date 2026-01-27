"use client";

import { useState, useMemo } from "react";
import {
  deals,
  formatValue,
  formatDate,
  getSectorColor,
  getStatusClass,
  getDealStats,
} from "@/data/deals";
import type { Deal, DealSector, DealStatus } from "@/data/deals";
import {
  Search,
  TrendingUp,
  Hash,
  BarChart3,
  Crown,
  ExternalLink,
  X,
  ChevronRight,
  ArrowUpDown,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Landmark,
  Briefcase,
} from "lucide-react";

// ─── KPI Cards ──────────────────────────────────────────────
function KPICards() {
  const stats = getDealStats();

  const cards = [
    {
      label: "Total Volume",
      value: formatValue(stats.totalVolume),
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
    {
      label: "Deal Count",
      value: stats.totalCount.toString(),
      icon: Hash,
      iconColor: "text-blue-500",
    },
    {
      label: "Active Deals",
      value: stats.activeCount.toString(),
      icon: BarChart3,
      iconColor: "text-violet-500",
    },
    {
      label: "Top Sector",
      value: stats.topSector,
      icon: Crown,
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card-elevated rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {card.label}
            </span>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </div>
          <span className="mono text-2xl font-semibold text-zinc-50">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Filters ────────────────────────────────────────────────
const SECTORS: DealSector[] = ["Energy", "Digital", "Transport", "Water", "Social"];
const STATUSES: DealStatus[] = ["Active", "Closed", "Rumored", "Terminated"];

function FilterBar({
  search,
  onSearchChange,
  activeSectors,
  onToggleSector,
  activeStatuses,
  onToggleStatus,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeSectors: Set<DealSector>;
  onToggleSector: (s: DealSector) => void;
  activeStatuses: Set<DealStatus>;
  onToggleStatus: (s: DealStatus) => void;
}) {
  return (
    <div className="mb-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search deals by title, buyer, seller, or ID..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mr-1">
          Sector
        </span>
        {SECTORS.map((sector) => (
          <button
            key={sector}
            onClick={() => onToggleSector(sector)}
            className={
              activeSectors.has(sector) ? "filter-pill-active" : "filter-pill"
            }
            style={
              activeSectors.has(sector)
                ? {
                    color: getSectorColor(sector),
                    borderColor: `${getSectorColor(sector)}66`,
                    backgroundColor: `${getSectorColor(sector)}15`,
                  }
                : undefined
            }
          >
            {sector}
          </button>
        ))}

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mr-1">
          Status
        </span>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onToggleStatus(status)}
            className={
              activeStatuses.has(status) ? "filter-pill-active" : "filter-pill"
            }
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Deal Table ─────────────────────────────────────────────
function DealTable({
  filteredDeals,
  onSelectDeal,
}: {
  filteredDeals: Deal[];
  onSelectDeal: (deal: Deal) => void;
}) {
  const [sortField, setSortField] = useState<"date" | "value">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      if (sortField === "date") {
        return (
          mul *
          (new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      }
      return mul * (a.value - b.value);
    });
  }, [filteredDeals, sortField, sortDir]);

  function toggleSort(field: "date" | "value") {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/40">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[100px]">
                ID
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Deal
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Buyer
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Sector
              </th>
              <th
                onClick={() => toggleSort("value")}
                className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
              >
                <span className="inline-flex items-center gap-1">
                  Value
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th
                onClick={() => toggleSort("date")}
                className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
              >
                <span className="inline-flex items-center gap-1">
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Verification
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal) => (
              <tr
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className="border-b border-zinc-800/60 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <span className="mono text-xs text-zinc-600">
                    {deal.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate max-w-[280px]">
                      {deal.title}
                    </span>
                    <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400 truncate max-w-[180px]">
                  {deal.buyer}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      color: getSectorColor(deal.sector),
                      backgroundColor: `${getSectorColor(deal.sector)}15`,
                    }}
                  >
                    {deal.sector}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="mono text-sm font-semibold text-zinc-200">
                    {formatValue(deal.value)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusClass(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="mono text-xs text-zinc-500">
                    {formatDate(deal.date)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <a
                    href={deal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                    title={`Source: ${deal.sourceName}`}
                  >
                    <span className="font-medium">{deal.sourceName}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
          No deals match your current filters.
        </div>
      )}

      <div className="border-t border-zinc-800 px-4 py-2.5 bg-zinc-900/30">
        <span className="text-xs text-zinc-600">
          Showing{" "}
          <span className="mono text-zinc-400">{sorted.length}</span> of{" "}
          <span className="mono text-zinc-400">{deals.length}</span> deals
        </span>
      </div>
    </div>
  );
}

// ─── Side Drawer ────────────────────────────────────────────
function DealDrawer({
  deal,
  onClose,
}: {
  deal: Deal;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg border-l border-zinc-800 bg-zinc-950 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-6 py-4">
          <div>
            <span className="mono text-xs text-zinc-600">{deal.id}</span>
            <h2 className="text-lg font-semibold text-zinc-50 mt-0.5 leading-tight">
              {deal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Value bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusClass(deal.status)}`}
            >
              {deal.status}
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded"
              style={{
                color: getSectorColor(deal.sector),
                backgroundColor: `${getSectorColor(deal.sector)}15`,
              }}
            >
              {deal.sector}
            </span>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="mono text-lg font-bold text-emerald-400">
              {formatValue(deal.value)}
            </span>
          </div>

          {/* Key parties */}
          <div className="grid grid-cols-1 gap-3">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Buyer
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {deal.buyer}
              </span>
            </div>
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Seller
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {deal.seller}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Description
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {deal.description}
            </p>
          </div>

          {/* Deal Details Grid */}
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Deal Details
            </span>
            <div className="grid grid-cols-1 gap-2">
              {deal.banker && (
                <div className="glass-card rounded-lg px-4 py-3 flex items-start gap-3">
                  <Landmark className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-zinc-600 block">
                      Advisor / Banker
                    </span>
                    <span className="text-sm text-zinc-300">
                      {deal.banker}
                    </span>
                  </div>
                </div>
              )}
              {deal.debtPackage && (
                <div className="glass-card rounded-lg px-4 py-3 flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-zinc-600 block">
                      Debt Package
                    </span>
                    <span className="text-sm text-zinc-300">
                      {deal.debtPackage}
                    </span>
                  </div>
                </div>
              )}
              {deal.timeline && (
                <div className="glass-card rounded-lg px-4 py-3 flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-zinc-600 block">
                      Timeline
                    </span>
                    <span className="text-sm text-zinc-300">
                      {deal.timeline}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="mono text-xs text-zinc-600">
                {formatDate(deal.date)}
              </span>
              <a
                href={deal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                View on {deal.sourceName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase() {
  const [search, setSearch] = useState("");
  const [activeSectors, setActiveSectors] = useState<Set<DealSector>>(
    new Set(),
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<DealStatus>>(
    new Set(),
  );
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  function toggleSector(sector: DealSector) {
    setActiveSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  }

  function toggleStatus(status: DealStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const match =
          deal.title.toLowerCase().includes(q) ||
          deal.buyer.toLowerCase().includes(q) ||
          deal.seller.toLowerCase().includes(q) ||
          deal.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Sector filter
      if (activeSectors.size > 0 && !activeSectors.has(deal.sector)) {
        return false;
      }

      // Status filter
      if (activeStatuses.size > 0 && !activeStatuses.has(deal.status)) {
        return false;
      }

      return true;
    });
  }, [search, activeSectors, activeStatuses]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Deal Database
        </h1>
        <p className="text-sm text-zinc-400">
          Comprehensive North American infrastructure M&A tracker — all deals,
          historical and active.
        </p>
      </div>

      <KPICards />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
      />
      <DealTable filteredDeals={filteredDeals} onSelectDeal={setSelectedDeal} />

      {selectedDeal && (
        <DealDrawer
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
