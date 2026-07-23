"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEAL_SECTORS,
  DEAL_REGIONS,
  DEAL_CATEGORIES,
  DEAL_STATUSES,
} from "@/lib/constants";
import type { DealView } from "@/modules/shared/types";

interface DealFormProps {
  initialData?: Partial<DealView>;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

const inputClass =
  "w-full bg-white border border-black/[0.08] text-[#1a1a1a] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008253]";
const labelClass = "block text-sm text-[#A1A1AA] mb-1";

export default function DealForm({ initialData, action, mode }: DealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [target, setTarget] = useState(initialData?.target ?? "");
  // Buyer/seller are " / "-joined in the View layer; we split for editing
  // so each party is on its own line, then re-join on submit.
  const [buyer, setBuyer] = useState(
    (initialData?.buyer ?? "").split(" / ").filter((s) => s && s !== "N/A").join("\n"),
  );
  const [seller, setSeller] = useState(
    (initialData?.seller ?? "").split(" / ").filter((s) => s && s !== "N/A").join("\n"),
  );
  const [sellerDisclosureStatus, setSellerDisclosureStatus] = useState<string>(
    initialData?.sellerDisclosureStatus ?? "DISCLOSED",
  );
  const [sellerDisclosureReason, setSellerDisclosureReason] = useState(
    initialData?.sellerDisclosureReason ?? "",
  );
  const [sector, setSector] = useState(initialData?.sector ?? DEAL_SECTORS[0]);
  const [region, setRegion] = useState(initialData?.region ?? DEAL_REGIONS[0]);
  const [categories, setCategories] = useState<string[]>(initialData?.category ?? []);
  const [date, setDate] = useState(initialData?.date ? initialData.date.slice(0, 10) : "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [targetDescription, setTargetDescription] = useState(initialData?.targetDescription ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [status, setStatus] = useState(initialData?.status ?? DEAL_STATUSES[0]);
  const [enterpriseValue, setEnterpriseValue] = useState(initialData?.enterpriseValue ?? "");
  const [equityValue, setEquityValue] = useState(initialData?.equityValue ?? "");
  const [stake, setStake] = useState(initialData?.stake ?? "");
  const [closingDate, setClosingDate] = useState(
    initialData?.closingDate ? initialData.closingDate.slice(0, 10) : ""
  );
  const [assetScale, setAssetScale] = useState(initialData?.assetScale ?? "");
  const [valuationMultiple, setValuationMultiple] = useState(initialData?.valuationMultiple ?? "");
  const [fundVehicle, setFundVehicle] = useState(initialData?.fundVehicle ?? "");
  const [keyHighlights, setKeyHighlights] = useState(
    (initialData?.keyHighlights ?? []).join("\n")
  );
  const [sourceName, setSourceName] = useState(initialData?.sourceName ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [subsector, setSubsector] = useState(initialData?.subsector ?? "");

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const cleanLines = (s: string) =>
      s.split("\n").map((l) => l.trim()).filter(Boolean);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("target", target);
    // Re-join buyers/sellers with " / " — the View layer + ranking code
    // expects this separator. Empty list collapses to "N/A".
    const buyers = cleanLines(buyer);
    const sellers = cleanLines(seller);
    formData.set("buyer", buyers.length ? buyers.join(" / ") : "N/A");
    formData.set("seller", sellers.length ? sellers.join(" / ") : "N/A");
    formData.set("sellerDisclosureStatus", sellers.length ? "DISCLOSED" : sellerDisclosureStatus);
    formData.set("sellerDisclosureReason", sellers.length ? "" : sellerDisclosureReason);
    // Also send the split list so the action can create one DealParticipant
    // per party rather than treating the joined string as a single org name.
    for (const b of buyers) formData.append("buyers", b);
    for (const s of sellers) formData.append("sellers", s);
    formData.set("sector", sector);
    formData.set("subsector", subsector);
    formData.set("region", region);
    formData.set("date", date);
    formData.set("description", description);
    formData.set("targetDescription", targetDescription);
    formData.set("country", country);
    formData.set("status", status);
    formData.set("enterpriseValue", enterpriseValue);
    formData.set("equityValue", equityValue);
    formData.set("stake", stake);
    formData.set("closingDate", closingDate);
    formData.set("assetScale", assetScale);
    formData.set("valuationMultiple", valuationMultiple);
    formData.set("fundVehicle", fundVehicle);
    formData.set("sourceName", sourceName);
    formData.set("sourceUrl", sourceUrl);

    // Send each category and highlight as a separate entry so values
    // containing commas (e.g. "Strong cash flow, low risk") survive intact.
    for (const c of categories) formData.append("category", c);
    for (const h of cleanLines(keyHighlights)) formData.append("keyHighlights", h);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        setMessage({ type: "success", text: mode === "create" ? "Deal created" : "Deal updated" });
        if (mode === "create") {
          router.push("/admin/deals");
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

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Seller Disclosure *</label>
          <select
            required
            value={seller.trim() ? "DISCLOSED" : sellerDisclosureStatus}
            onChange={(event) => setSellerDisclosureStatus(event.target.value)}
            disabled={Boolean(seller.trim())}
            className={inputClass}
          >
            <option value="DISCLOSED">Seller named above</option>
            <option value="NOT_DISCLOSED">Seller not publicly disclosed</option>
            <option value="NOT_APPLICABLE">No seller / not applicable</option>
            <option value="LEGACY_UNREVIEWED" disabled>Legacy record — review required</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Seller Disclosure Reason</label>
          <input
            type="text"
            required={!seller.trim()}
            minLength={10}
            value={sellerDisclosureReason}
            onChange={(event) => setSellerDisclosureReason(event.target.value)}
            disabled={Boolean(seller.trim())}
            placeholder="Explain why seller information is absent"
            className={inputClass}
          />
        </div>
      </div>

      {/* Target + Buyer + Seller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Target *</label>
          <input
            type="text"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Buyer (one per line)</label>
          <textarea
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="One firm per line"
          />
        </div>
        <div>
          <label className={labelClass}>Seller (one per line)</label>
          <textarea
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="One firm per line"
          />
        </div>
      </div>

      {/* Sector + Region + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Sector *</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputClass}
          >
            {DEAL_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Region *</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={inputClass}
          >
            {DEAL_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Deal Status *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            {DEAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subsector + Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Subsector</label>
          <input
            type="text"
            value={subsector}
            onChange={(e) => setSubsector(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Date + Closing Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Closing Date</label>
          <input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Categories (multi-select checkboxes) */}
      <div>
        <label className={labelClass}>Categories *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
          {DEAL_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer">
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-[#818CF8]"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Enterprise Value</label>
          <input
            type="text"
            value={enterpriseValue}
            onChange={(e) => setEnterpriseValue(e.target.value)}
            className={inputClass}
            placeholder="e.g. $2.5B"
          />
        </div>
        <div>
          <label className={labelClass}>Equity Value</label>
          <input
            type="text"
            value={equityValue}
            onChange={(e) => setEquityValue(e.target.value)}
            className={inputClass}
            placeholder="e.g. $1.2B"
          />
        </div>
        <div>
          <label className={labelClass}>Stake</label>
          <input
            type="text"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className={inputClass}
            placeholder="e.g. 100%"
          />
        </div>
      </div>

      {/* Additional deal details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Asset Scale</label>
          <input
            type="text"
            value={assetScale}
            onChange={(e) => setAssetScale(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Valuation Multiple</label>
          <input
            type="text"
            value={valuationMultiple}
            onChange={(e) => setValuationMultiple(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fund Vehicle</label>
          <input
            type="text"
            value={fundVehicle}
            onChange={(e) => setFundVehicle(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Target Description */}
      <div>
        <label className={labelClass}>Target Description</label>
        <textarea
          value={targetDescription}
          onChange={(e) => setTargetDescription(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Key Highlights */}
      <div>
        <label className={labelClass}>Key Highlights (one per line)</label>
        <textarea
          value={keyHighlights}
          onChange={(e) => setKeyHighlights(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Enter each highlight on a new line"
        />
      </div>

      {/* Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Primary Source Name</label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Primary Source URL</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-black/[0.08]">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#008253] text-[#1a1a1a] px-6 py-2 rounded hover:bg-[#006d45] disabled:opacity-50 text-sm font-medium"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Deal"
            : "Save Changes"}
        </button>
        <Link href="/admin/deals" className="text-sm text-[#71717A] hover:text-[#1a1a1a]">
          Cancel
        </Link>
      </div>
    </form>
  );
}
