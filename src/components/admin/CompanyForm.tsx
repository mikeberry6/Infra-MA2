"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PORTCO_SECTORS, PORTCO_REGIONS, PORTCO_STATUSES } from "@/lib/constants";
import type { CompanyView } from "@/modules/shared/types";

interface CompanyFormProps {
  initialData?: Partial<CompanyView>;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

const inputClass =
  "w-full bg-white border border-black/[0.08] text-[#1a1a1a] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008253]";
const labelClass = "block text-sm text-[#A1A1AA] mb-1";

export default function CompanyForm({ initialData, action, mode }: CompanyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [sector, setSector] = useState(initialData?.sector ?? PORTCO_SECTORS[0]);
  const [subsector, setSubsector] = useState(initialData?.subsector ?? "");
  const [region, setRegion] = useState(initialData?.region ?? PORTCO_REGIONS[0]);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState(initialData?.status ?? PORTCO_STATUSES[0]);
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [yearFounded, setYearFounded] = useState<string>(
    initialData?.yearFounded != null ? String(initialData.yearFounded) : ""
  );
  const [investmentYear, setInvestmentYear] = useState<string>(
    initialData?.investmentYear != null ? String(initialData.investmentYear) : ""
  );
  const [headquarters, setHeadquarters] = useState(initialData?.headquarters ?? "");
  const [investmentFirm, setInvestmentFirm] = useState(initialData?.investmentFirm ?? "");
  const [ownershipVehicle, setOwnershipVehicle] = useState(initialData?.ownershipVehicle ?? "");
  const [countryTags, setCountryTags] = useState((initialData?.countryTags ?? []).join(", "));
  const [sourceName, setSourceName] = useState(initialData?.sources?.[0]?.label ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sources?.[0]?.url ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("country", country);
    formData.set("sector", sector);
    formData.set("subsector", subsector);
    formData.set("region", region);
    formData.set("description", description);
    formData.set("status", status);
    formData.set("website", website);
    formData.set("yearFounded", yearFounded);
    formData.set("investmentYear", investmentYear);
    formData.set("headquarters", headquarters);
    formData.set("investmentFirm", investmentFirm);
    formData.set("ownershipVehicle", ownershipVehicle);
    formData.set("countryTags", countryTags);
    formData.set("sourceName", sourceName);
    formData.set("sourceUrl", sourceUrl);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        setMessage({ type: "success", text: mode === "create" ? "Company created" : "Company updated" });
        if (mode === "create") {
          router.push("/admin/companies");
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

      {/* Name */}
      <div>
        <label className={labelClass}>Company Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Investment Firm + Ownership Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Investment Firm</label>
          <input
            type="text"
            value={investmentFirm}
            onChange={(e) => setInvestmentFirm(e.target.value)}
            className={inputClass}
            placeholder="e.g. Brookfield Asset Management"
          />
        </div>
        <div>
          <label className={labelClass}>Ownership Vehicle</label>
          <input
            type="text"
            value={ownershipVehicle}
            onChange={(e) => setOwnershipVehicle(e.target.value)}
            className={inputClass}
            placeholder="Must match a fundName in funds DB"
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
            {PORTCO_SECTORS.map((s) => (
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
            {PORTCO_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
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
            {PORTCO_STATUSES.map((s) => (
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
          <label className={labelClass}>Country *</label>
          <input
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Country tags */}
      <div>
        <label className={labelClass}>Country tags</label>
        <input
          type="text"
          value={countryTags}
          onChange={(e) => setCountryTags(e.target.value)}
          className={inputClass}
          placeholder="Comma-separated, e.g. United States, Canada"
        />
      </div>

      {/* Headquarters + Website */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Headquarters</label>
          <input
            type="text"
            value={headquarters}
            onChange={(e) => setHeadquarters(e.target.value)}
            className={inputClass}
            placeholder="e.g. Houston, TX"
          />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Year Founded + Investment Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Year Founded</label>
          <input
            type="number"
            min="1800"
            max="2100"
            value={yearFounded}
            onChange={(e) => setYearFounded(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Investment Year</label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={investmentYear}
            onChange={(e) => setInvestmentYear(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Primary Source Name</label>
          <input
            type="text"
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Primary Source URL</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
        />
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
            ? "Create Company"
            : "Save Changes"}
        </button>
        <Link href="/admin/companies" className="text-sm text-[#71717A] hover:text-[#1a1a1a]">
          Cancel
        </Link>
      </div>
    </form>
  );
}
