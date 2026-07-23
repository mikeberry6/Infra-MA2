"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PORTCO_SECTORS, PORTCO_REGIONS, PORTCO_STATUSES } from "@/lib/constants";
import type { CompanyView } from "@/modules/shared/types";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import {
  FormField,
  FormMessage,
  SelectInput,
  TextArea,
} from "@/components/shared/FormControls";
import { invalidateDetailCache } from "@/lib/detail-cache-events";

type CompanyFormData = Partial<CompanyView> & {
  sourceName?: string;
  sourceUrl?: string;
};

interface CompanyFormProps {
  initialData?: CompanyFormData;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  mode: "create" | "edit";
}

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
  const [sourceName, setSourceName] = useState(
    initialData?.sourceName ?? initialData?.sources?.[0]?.label ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(
    initialData?.sourceUrl ?? initialData?.sources?.[0]?.url ?? "",
  );

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
        invalidateDetailCache("company", result.id);
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
      aria-busy={isPending}
    >
      {message && <FormMessage tone={message.type}>{message.text}</FormMessage>}

      <FormField htmlFor="company-name" label="Company Name" required>
        <TextInput
          id="company-name"
          size="md"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="company-investment-firm" label="Investment Firm">
          <TextInput
            id="company-investment-firm"
            size="md"
            value={investmentFirm}
            onChange={(e) => setInvestmentFirm(e.target.value)}
            placeholder="e.g. Brookfield Asset Management"
          />
        </FormField>
        <FormField
          htmlFor="company-ownership-vehicle"
          label="Ownership Vehicle"
          hint="Must exactly match a fund name in the fund database."
        >
          <TextInput
            id="company-ownership-vehicle"
            size="md"
            value={ownershipVehicle}
            onChange={(e) => setOwnershipVehicle(e.target.value)}
            aria-describedby="company-ownership-vehicle-hint"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="company-sector" label="Sector" required>
          <SelectInput
            id="company-sector"
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            {PORTCO_SECTORS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="company-region" label="Region" required>
          <SelectInput
            id="company-region"
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {PORTCO_REGIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField htmlFor="company-status" label="Status" required>
          <SelectInput
            id="company-status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {PORTCO_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="company-subsector" label="Subsector">
          <TextInput
            id="company-subsector"
            size="md"
            value={subsector}
            onChange={(e) => setSubsector(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="company-country" label="Country" required>
          <TextInput
            id="company-country"
            size="md"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </FormField>
      </div>

      <FormField
        htmlFor="company-country-tags"
        label="Country tags"
        hint="Separate multiple countries with commas."
      >
        <TextInput
          id="company-country-tags"
          size="md"
          value={countryTags}
          onChange={(e) => setCountryTags(e.target.value)}
          placeholder="e.g. United States, Canada"
          aria-describedby="company-country-tags-hint"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="company-headquarters" label="Headquarters">
          <TextInput
            id="company-headquarters"
            size="md"
            value={headquarters}
            onChange={(e) => setHeadquarters(e.target.value)}
            placeholder="e.g. Houston, TX"
          />
        </FormField>
        <FormField htmlFor="company-website" label="Website">
          <TextInput
            id="company-website"
            size="md"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="company-year-founded" label="Year Founded">
          <TextInput
            id="company-year-founded"
            size="md"
            type="number"
            min="1800"
            max="2100"
            value={yearFounded}
            onChange={(e) => setYearFounded(e.target.value)}
          />
        </FormField>
        <FormField htmlFor="company-investment-year" label="Investment Year">
          <TextInput
            id="company-investment-year"
            size="md"
            type="number"
            min="1900"
            max="2100"
            value={investmentYear}
            onChange={(e) => setInvestmentYear(e.target.value)}
          />
        </FormField>
      </div>

      <FormField htmlFor="company-description" label="Description">
        <TextArea
          id="company-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </FormField>

      <div className="surface grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <FormField htmlFor="company-source-name" label="Primary Source Name">
          <TextInput
            id="company-source-name"
            size="md"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Publisher or official source"
          />
        </FormField>
        <FormField htmlFor="company-source-url" label="Primary Source URL">
          <TextInput
            id="company-source-url"
            size="md"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </FormField>
      </div>

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          {mode === "create" ? "Create Company" : "Save Changes"}
        </Button>
        <Link
          href="/admin/companies"
          className="type-meta font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
