import type { CompanyImage } from "./schema";
import { companyImageSha256 } from "./artifacts";
import { dedupeMilestoneViews } from "../../src/modules/companies/milestone-view";

interface PublicOwner {
  firm: string;
  vehicle: string;
  fundName: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  stake: string | null;
}

interface PublicProjection {
  id: string;
  requiredFocusIds: string[];
  name: string;
  investmentFirm: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  ownershipVehicle: string;
  description: string;
  status: string;
  countryTags: string[];
  website: string | null;
  yearFounded: number | null;
  investmentYear: number | null;
  headquarters: string | null;
  owners: PublicOwner[];
  milestones: string[];
  management: string[];
  sources: string[];
}

const sectorDisplay: Record<string, string> = {
  POWER_ET: "Power & ET",
  UTILITIES: "Utilities",
  DIGITAL: "Digital",
  MIDSTREAM: "Midstream",
  TRANSPORTATION: "Transportation",
  SOCIAL_INFRA: "Social Infra",
};

const regionDisplay: Record<string, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  LATIN_AMERICA: "Latin America",
  GLOBAL: "Global",
};

const statusDisplay: Record<string, string> = {
  ACTIVE: "Active",
  REALIZED: "Realized",
};

const milestoneDisplay: Record<string, string> = {
  FOUNDING: "Founding",
  ACQUISITION: "Acquisition",
  FINANCING: "Financing",
  EXPANSION: "Expansion",
  MANAGEMENT: "Management",
  DIVESTITURE: "Divestiture",
  IPO: "IPO",
  OTHER: "Other",
};

function display(value: string, values: Record<string, string>): string {
  return values[value] ?? value;
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function ownerSort(left: PublicOwner, right: PublicOwner): number {
  if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
  return (right.investmentYear ?? 0) - (left.investmentYear ?? 0)
    || left.firm.localeCompare(right.firm)
    || left.vehicle.localeCompare(right.vehicle);
}

function ownerKey(owner: PublicOwner): string {
  return JSON.stringify(owner);
}

export function expectedPublicProjection(input: {
  companyId: string;
  afterImage: CompanyImage;
  retiredCompanyIds: string[];
}): PublicProjection {
  const owners = input.afterImage.ownershipPeriods.map((owner): PublicOwner => ({
    firm: owner.managerName,
    vehicle: owner.vehicleName ?? owner.fundName ?? "",
    fundName: owner.fundName,
    investmentYear: owner.investmentYear,
    exitYear: owner.exitYear,
    isActive: owner.isActive,
    stake: owner.stake,
  })).sort(ownerSort);
  const primary = owners[0];
  return {
    id: input.companyId,
    requiredFocusIds: sortStrings([input.companyId, ...input.retiredCompanyIds]),
    name: input.afterImage.name,
    investmentFirm: primary?.firm ?? "",
    sector: display(input.afterImage.sector, sectorDisplay),
    subsector: input.afterImage.subsector,
    region: display(input.afterImage.region, regionDisplay),
    country: input.afterImage.country,
    ownershipVehicle: primary?.vehicle ?? "",
    description: input.afterImage.description,
    status: display(input.afterImage.companyStatus, statusDisplay),
    countryTags: input.afterImage.countryTags,
    website: input.afterImage.website,
    yearFounded: input.afterImage.yearFounded,
    investmentYear: primary?.investmentYear ?? null,
    headquarters: input.afterImage.headquarters,
    owners,
    milestones: sortStrings(dedupeMilestoneViews(input.afterImage.milestones.map((milestone) => ({
      date: milestone.date,
      event: milestone.event,
      category: display(milestone.category, milestoneDisplay),
    }))).map((milestone) => JSON.stringify(milestone))),
    management: sortStrings(input.afterImage.managementRoles.map((role) => JSON.stringify({
      name: role.personName,
      title: role.title,
    }))),
    sources: sortStrings(input.afterImage.citations.map((citation) => JSON.stringify({
      label: citation.label,
      url: citation.url,
      type: citation.sourceType,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
    }))),
  };
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is not an object`);
  }
  return value as Record<string, unknown>;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function normalizePublicPayload(payload: unknown): PublicProjection {
  const envelope = record(payload, "Detail API response");
  const company = record(envelope.company, "Detail API company");
  const array = (value: unknown, label: string): unknown[] => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error(`${label} is not an array`);
    return value;
  };
  const owners = array(company.owners, "owners").map((value): PublicOwner => {
    const owner = record(value, "owner");
    return {
      firm: String(owner.firm ?? ""),
      vehicle: String(owner.vehicle ?? ""),
      fundName: nullableString(owner.fundName),
      investmentYear: nullableNumber(owner.investmentYear),
      exitYear: nullableNumber(owner.exitYear),
      isActive: owner.isActive === true,
      stake: nullableString(owner.stake),
    };
  }).sort(ownerSort);
  return {
    id: String(company.id ?? ""),
    requiredFocusIds: sortStrings(array(company.focusIds, "focusIds").map(String)),
    name: String(company.name ?? ""),
    investmentFirm: String(company.investmentFirm ?? ""),
    sector: String(company.sector ?? ""),
    subsector: String(company.subsector ?? ""),
    region: String(company.region ?? ""),
    country: String(company.country ?? ""),
    ownershipVehicle: String(company.ownershipVehicle ?? ""),
    description: String(company.description ?? ""),
    status: String(company.status ?? ""),
    countryTags: array(company.countryTags, "countryTags").map(String),
    website: nullableString(company.website),
    yearFounded: nullableNumber(company.yearFounded),
    investmentYear: nullableNumber(company.investmentYear),
    headquarters: nullableString(company.headquarters),
    owners,
    milestones: sortStrings(array(company.milestones, "milestones").map((value) => {
      const milestone = record(value, "milestone");
      return JSON.stringify({
        date: String(milestone.date ?? ""),
        event: String(milestone.event ?? ""),
        category: String(milestone.category ?? ""),
      });
    })),
    management: sortStrings(array(company.management, "management").map((value) => {
      const role = record(value, "management role");
      return JSON.stringify({ name: String(role.name ?? ""), title: String(role.title ?? "") });
    })),
    sources: sortStrings(array(company.sources, "sources").map((value) => {
      const source = record(value, "source");
      return JSON.stringify({
        label: String(source.label ?? ""),
        url: String(source.url ?? ""),
        type: String(source.type ?? ""),
        purpose: String(source.purpose ?? ""),
        evidenceLabel: nullableString(source.evidenceLabel),
      });
    })),
  };
}

export function verifyPublicCompanyPayload(input: {
  payload: unknown;
  companyId: string;
  afterImage: CompanyImage;
  retiredCompanyIds: string[];
}): void {
  const expected = expectedPublicProjection(input);
  const actual = normalizePublicPayload(input.payload);
  for (const requiredId of expected.requiredFocusIds) {
    if (!actual.requiredFocusIds.includes(requiredId)) {
      throw new Error(`Detail API is missing canonical/redirect focus id ${requiredId}`);
    }
  }
  const comparableActual = { ...actual, requiredFocusIds: expected.requiredFocusIds };
  if (JSON.stringify(comparableActual) !== JSON.stringify(expected)) {
    throw new Error("Detail API render-critical projection does not match the approved after-image");
  }
}

export function createPublicDetailApiVerifier(options: {
  baseUrl: string;
  attempts?: number;
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
}): (companyId: string, afterImage: CompanyImage, retiredCompanyIds: string[]) => Promise<void> {
  const baseUrl = new URL(options.baseUrl);
  const local = baseUrl.hostname === "127.0.0.1" || baseUrl.hostname === "localhost";
  if (baseUrl.protocol !== "https:" && !(local && baseUrl.protocol === "http:")) {
    throw new Error("Detail API base URL must use HTTPS (or local HTTP)");
  }
  const attempts = options.attempts ?? 12;
  const retryDelayMs = options.retryDelayMs ?? 5_000;
  const fetchImpl = options.fetchImpl ?? fetch;
  return async (companyId, afterImage, retiredCompanyIds) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const url = new URL(`api/portfolio/${encodeURIComponent(companyId)}`, `${baseUrl.toString().replace(/\/?$/, "/")}`);
        url.searchParams.set("verification", companyImageSha256(afterImage));
        const response = await fetchImpl(url, {
          method: "GET",
          headers: { accept: "application/json", "cache-control": "no-cache" },
          cache: "no-store",
        });
        if (afterImage.recordStatus === "ARCHIVED" && response.status === 404) return;
        if (!response.ok) throw new Error(`Detail API returned HTTP ${response.status}`);
        if (afterImage.recordStatus === "ARCHIVED") {
          throw new Error("Archived company remains available from the public detail API");
        }
        verifyPublicCompanyPayload({
          payload: await response.json(),
          companyId,
          afterImage,
          retiredCompanyIds,
        });
        return;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
    throw new Error(`Detail API verification failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  };
}

export function publicOwnerKeyForTest(owner: PublicOwner): string {
  return ownerKey(owner);
}
