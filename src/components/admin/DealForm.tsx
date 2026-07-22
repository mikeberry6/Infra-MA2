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

interface DealFormProps {
  initialData?: Partial<DealView>;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

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
        invalidateDetailCache("deal", result.id);
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
      aria-busy={isPending}
    >
      {message && <FormMessage tone={message.type}>{message.text}</FormMessage>}

      <FormField htmlFor="deal-title" label="Title" required>
        <TextInput
          id="deal-title"
          size="md"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="deal-target" label="Target" required>
          <TextInput
            id="deal-target"
            size="md"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-buyers" label="Buyer (one per line)">
          <TextArea
            id="deal-buyers"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            rows={2}
            placeholder="One firm per line"
          />
        </FormField>
        <FormField htmlFor="deal-sellers" label="Seller (one per line)">
          <TextArea
            id="deal-sellers"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            rows={2}
            placeholder="One firm per line"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="deal-seller-disclosure" label="Seller disclosure" required>
          <SelectInput
            id="deal-seller-disclosure"
            required
            value={seller.trim() ? "DISCLOSED" : sellerDisclosureStatus}
            onChange={(event) => setSellerDisclosureStatus(event.target.value)}
            disabled={Boolean(seller.trim())}
          >
            <option value="DISCLOSED">Seller named above</option>
            <option value="NOT_DISCLOSED">Seller not publicly disclosed</option>
            <option value="NOT_APPLICABLE">No seller / not applicable</option>
            <option value="LEGACY_UNREVIEWED" disabled>Legacy record — review required</option>
          </SelectInput>
        </FormField>
        <FormField
          htmlFor="deal-seller-disclosure-reason"
          label="Seller disclosure reason"
          hint={seller.trim() ? "Not required when a seller is named." : "Required when no seller is named (10+ characters)."}
        >
          <TextInput
            id="deal-seller-disclosure-reason"
            size="md"
            required={!seller.trim()}
            minLength={10}
            value={sellerDisclosureReason}
            onChange={(event) => setSellerDisclosureReason(event.target.value)}
            disabled={Boolean(seller.trim())}
            placeholder="Explain why seller information is absent"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="deal-sector" label="Sector" required>
          <SelectInput
            id="deal-sector"
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            {DEAL_SECTORS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="deal-region" label="Region" required>
          <SelectInput
            id="deal-region"
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {DEAL_REGIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="deal-status" label="Deal Status" required>
          <SelectInput
            id="deal-status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {DEAL_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="deal-subsector" label="Subsector">
          <TextInput
            id="deal-subsector"
            size="md"
            value={subsector}
            onChange={(e) => setSubsector(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-country" label="Country">
          <TextInput
            id="deal-country"
            size="md"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="deal-date" label="Date" required>
          <TextInput
            id="deal-date"
            size="md"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-closing-date" label="Closing Date">
          <TextInput
            id="deal-closing-date"
            size="md"
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="mb-1.5 type-meta font-medium text-[var(--text-secondary)]">
          Categories<span aria-hidden className="ml-0.5 text-[var(--accent)]">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {DEAL_CATEGORIES.map((category) => (
            <CheckboxOption
              key={category}
              checked={categories.includes(category)}
              onChange={() => toggleCategory(category)}
            >
              {category}
            </CheckboxOption>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="deal-enterprise-value" label="Enterprise Value">
          <TextInput
            id="deal-enterprise-value"
            size="md"
            value={enterpriseValue}
            onChange={(e) => setEnterpriseValue(e.target.value)}
            placeholder="e.g. $2.5B"
          />
        </FormField>
        <FormField htmlFor="deal-equity-value" label="Equity Value">
          <TextInput
            id="deal-equity-value"
            size="md"
            value={equityValue}
            onChange={(e) => setEquityValue(e.target.value)}
            placeholder="e.g. $1.2B"
          />
        </FormField>
        <FormField htmlFor="deal-stake" label="Stake">
          <TextInput
            id="deal-stake"
            size="md"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            placeholder="e.g. 100%"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="deal-asset-scale" label="Asset Scale">
          <TextInput
            id="deal-asset-scale"
            size="md"
            value={assetScale}
            onChange={(e) => setAssetScale(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-valuation-multiple" label="Valuation Multiple">
          <TextInput
            id="deal-valuation-multiple"
            size="md"
            value={valuationMultiple}
            onChange={(e) => setValuationMultiple(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-fund-vehicle" label="Fund Vehicle">
          <TextInput
            id="deal-fund-vehicle"
            size="md"
            value={fundVehicle}
            onChange={(e) => setFundVehicle(e.target.value)}
          />
        </FormField>
      </div>

      <FormField htmlFor="deal-description" label="Description">
        <TextArea
          id="deal-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </FormField>

      <FormField htmlFor="deal-target-description" label="Target Description">
        <TextArea
          id="deal-target-description"
          value={targetDescription}
          onChange={(e) => setTargetDescription(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField htmlFor="deal-key-highlights" label="Key Highlights (one per line)">
        <TextArea
          id="deal-key-highlights"
          value={keyHighlights}
          onChange={(e) => setKeyHighlights(e.target.value)}
          rows={4}
          placeholder="Enter each highlight on a new line"
        />
      </FormField>

      <div className="surface grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <FormField htmlFor="deal-source-name" label="Primary Source Name">
          <TextInput
            id="deal-source-name"
            size="md"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="deal-source-url" label="Primary Source URL">
          <TextInput
            id="deal-source-url"
            size="md"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          {mode === "create" ? "Create Deal" : "Save Changes"}
        </Button>
        <Link
          href="/admin/deals"
          className="type-meta font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
