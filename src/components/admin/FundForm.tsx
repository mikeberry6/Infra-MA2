"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FUND_STRATEGIES,
  FUND_STATUSES,
  FUND_SECTORS,
  FUND_REGIONS,
  FUND_STRUCTURES,
} from "@/lib/constants";
import type { FundView } from "@/modules/shared/types";

interface FundFormProps {
  initialData?: Partial<FundView>;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

const inputClass =
  "w-full bg-[#111113] border border-[#27272A] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#818CF8]";
const labelClass = "block text-sm text-[#A1A1AA] mb-1";

export default function FundForm({ initialData, action, mode }: FundFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [managerName, setManagerName] = useState(initialData?.managerName ?? "");
  const [fundName, setFundName] = useState(initialData?.fundName ?? "");
  const [investmentStrategy, setInvestmentStrategy] = useState(initialData?.investmentStrategy ?? "");
  const [size, setSize] = useState(initialData?.size ?? "");
  const [sizeUsdMm, setSizeUsdMm] = useState<string>(
    initialData?.sizeUsdMm != null ? String(initialData.sizeUsdMm) : ""
  );
  const [vintage, setVintage] = useState(initialData?.vintage ?? "");
  const [strategies, setStrategies] = useState<string[]>(initialData?.strategies ?? []);
  const [structure, setStructure] = useState(initialData?.structure ?? FUND_STRUCTURES[0]);
  const [status, setStatus] = useState(initialData?.status ?? FUND_STATUSES[0]);
  const [sectors, setSectors] = useState<string[]>(initialData?.sectors ?? []);
  const [regions, setRegions] = useState<string[]>(initialData?.regions ?? []);
  const [sourceUrls, setSourceUrls] = useState(
    (initialData?.sourceUrls ?? []).join("\n")
  );
  const [ticker, setTicker] = useState(initialData?.ticker ?? "");
  const [strategyUrl, setStrategyUrl] = useState(initialData?.strategyUrl ?? "");

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("managerName", managerName);
    formData.set("fundName", fundName);
    formData.set("investmentStrategy", investmentStrategy);
    formData.set("size", size);
    formData.set("sizeUsdMm", sizeUsdMm);
    formData.set("vintage", vintage);
    formData.set("structure", structure);
    formData.set("status", status);
    formData.set("ticker", ticker);
    formData.set("strategyUrl", strategyUrl);

    for (const s of strategies) {
      formData.append("strategies", s);
    }
    for (const s of sectors) {
      formData.append("sectors", s);
    }
    for (const r of regions) {
      formData.append("regions", r);
    }
    const urls = sourceUrls
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const u of urls) {
      formData.append("sourceUrls", u);
    }

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        setMessage({ type: "success", text: mode === "create" ? "Fund created" : "Fund updated" });
        if (mode === "create") {
          router.push("/admin/funds");
        }
      } else {
        setMessage({ type: "error", text: result.error || "Something went wrong" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {message && (
        <div
          className={`text-sm px-4 py-2 rounded ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Manager + Fund Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Manager Name *</label>
          <input
            type="text"
            required
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fund Name *</label>
          <input
            type="text"
            required
            value={fundName}
            onChange={(e) => setFundName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Size + Size USD MM + Vintage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Size (display) *</label>
          <input
            type="text"
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={inputClass}
            placeholder="e.g. $5.0B"
          />
        </div>
        <div>
          <label className={labelClass}>Size (USD MM)</label>
          <input
            type="number"
            step="any"
            value={sizeUsdMm}
            onChange={(e) => setSizeUsdMm(e.target.value)}
            className={inputClass}
            placeholder="e.g. 5000"
          />
        </div>
        <div>
          <label className={labelClass}>Vintage *</label>
          <input
            type="text"
            required
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            className={inputClass}
            placeholder="e.g. 2023"
          />
        </div>
      </div>

      {/* Structure + Status + Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Structure *</label>
          <select
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            className={inputClass}
          >
            {FUND_STRUCTURES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            {FUND_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ticker</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Strategies */}
      <div>
        <label className={labelClass}>Strategies *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
          {FUND_STRATEGIES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer">
              <input
                type="checkbox"
                checked={strategies.includes(s)}
                onChange={() => toggleItem(strategies, s, setStrategies)}
                className="accent-[#818CF8]"
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Sectors */}
      <div>
        <label className={labelClass}>Sectors</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
          {FUND_SECTORS.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer">
              <input
                type="checkbox"
                checked={sectors.includes(s)}
                onChange={() => toggleItem(sectors, s, setSectors)}
                className="accent-[#818CF8]"
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div>
        <label className={labelClass}>Regions</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
          {FUND_REGIONS.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer">
              <input
                type="checkbox"
                checked={regions.includes(r)}
                onChange={() => toggleItem(regions, r, setRegions)}
                className="accent-[#818CF8]"
              />
              {r}
            </label>
          ))}
        </div>
      </div>

      {/* Investment Strategy */}
      <div>
        <label className={labelClass}>Investment Strategy (description)</label>
        <textarea
          value={investmentStrategy}
          onChange={(e) => setInvestmentStrategy(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Strategy URL */}
      <div>
        <label className={labelClass}>Strategy URL</label>
        <input
          type="url"
          value={strategyUrl}
          onChange={(e) => setStrategyUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Source URLs */}
      <div>
        <label className={labelClass}>Source URLs (one per line)</label>
        <textarea
          value={sourceUrls}
          onChange={(e) => setSourceUrls(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Enter each URL on a new line"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#27272A]">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#818CF8] text-white px-6 py-2 rounded hover:bg-[#6366F1] disabled:opacity-50 text-sm font-medium"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Fund"
            : "Save Changes"}
        </button>
        <Link href="/admin/funds" className="text-sm text-[#71717A] hover:text-white">
          Cancel
        </Link>
      </div>
    </form>
  );
}
