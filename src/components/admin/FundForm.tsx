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
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import {
  CheckboxOption,
  FormField,
  FormMessage,
  SelectInput,
  TextArea,
} from "@/components/shared/FormControls";
import { invalidateDetailCache } from "@/lib/detail-cache-events";

interface FundFormProps {
  initialData?: Partial<FundView>;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

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
  const [primarySourceUrl, setPrimarySourceUrl] = useState(initialData?.primarySourceUrl ?? "");
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
    formData.set("primarySourceUrl", primarySourceUrl);
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
        invalidateDetailCache("fund", result.id);
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
      aria-busy={isPending}
    >
      {message && <FormMessage tone={message.type}>{message.text}</FormMessage>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="fund-manager-name" label="Manager Name" required>
          <TextInput
            id="fund-manager-name"
            size="md"
            required
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="fund-name" label="Fund Name" required>
          <TextInput
            id="fund-name"
            size="md"
            required
            value={fundName}
            onChange={(e) => setFundName(e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="fund-size" label="Size (display)" required>
          <TextInput
            id="fund-size"
            size="md"
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g. $5.0B"
          />
        </FormField>
        <FormField htmlFor="fund-size-usd" label="Size (USD MM)">
          <TextInput
            id="fund-size-usd"
            size="md"
            type="number"
            step="any"
            value={sizeUsdMm}
            onChange={(e) => setSizeUsdMm(e.target.value)}
            placeholder="e.g. 5000"
          />
        </FormField>
        <FormField htmlFor="fund-vintage" label="Vintage" required>
          <TextInput
            id="fund-vintage"
            size="md"
            required
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="e.g. 2023"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="fund-structure" label="Structure" required>
          <SelectInput
            id="fund-structure"
            required
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
          >
            {FUND_STRUCTURES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="fund-status" label="Status" required>
          <SelectInput
            id="fund-status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {FUND_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="fund-ticker" label="Ticker">
          <TextInput
            id="fund-ticker"
            size="md"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="mb-1.5 type-meta font-medium text-[var(--text-secondary)]">
          Strategies<span aria-hidden className="ml-0.5 text-[var(--accent)]">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FUND_STRATEGIES.map((strategy) => (
            <CheckboxOption
              key={strategy}
              checked={strategies.includes(strategy)}
              onChange={() => toggleItem(strategies, strategy, setStrategies)}
            >
              {strategy}
            </CheckboxOption>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 type-meta font-medium text-[var(--text-secondary)]">
          Sectors
        </legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FUND_SECTORS.map((sector) => (
            <CheckboxOption
              key={sector}
              checked={sectors.includes(sector)}
              onChange={() => toggleItem(sectors, sector, setSectors)}
            >
              {sector}
            </CheckboxOption>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 type-meta font-medium text-[var(--text-secondary)]">
          Regions
        </legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FUND_REGIONS.map((region) => (
            <CheckboxOption
              key={region}
              checked={regions.includes(region)}
              onChange={() => toggleItem(regions, region, setRegions)}
            >
              {region}
            </CheckboxOption>
          ))}
        </div>
      </fieldset>

      <FormField htmlFor="fund-investment-strategy" label="Investment Strategy (description)">
        <TextArea
          id="fund-investment-strategy"
          value={investmentStrategy}
          onChange={(e) => setInvestmentStrategy(e.target.value)}
          rows={4}
        />
      </FormField>

      <div className="surface space-y-4 p-4">
        <FormField
          htmlFor="fund-primary-source-url"
          label="Primary Source URL"
          hint="Designate only after Research review. Supporting and strategy links are not promoted automatically."
        >
          <TextInput
            id="fund-primary-source-url"
            size="md"
            type="url"
            aria-describedby="fund-primary-source-url-hint"
            value={primarySourceUrl}
            onChange={(e) => setPrimarySourceUrl(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="fund-strategy-url" label="Strategy URL">
          <TextInput
            id="fund-strategy-url"
            size="md"
            type="url"
            value={strategyUrl}
            onChange={(e) => setStrategyUrl(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="fund-source-urls" label="Source URLs (one per line)">
          <TextArea
            id="fund-source-urls"
            value={sourceUrls}
            onChange={(e) => setSourceUrls(e.target.value)}
            rows={3}
            placeholder="Enter each URL on a new line"
          />
        </FormField>
      </div>

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          {mode === "create" ? "Create Fund" : "Save Changes"}
        </Button>
        <Link
          href="/admin/funds"
          className="type-meta font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
