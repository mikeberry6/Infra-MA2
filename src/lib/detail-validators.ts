import type {
  CompanyDetail,
  DealDetail,
  FundDetail,
  OwnerView,
  PortfolioCompanyView,
} from "@/modules/shared/types";

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || isNullableString(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isNullableStringArray(value: unknown): value is string[] | null {
  return value === null || isStringArray(value);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function hasListIdentity(value: UnknownRecord): boolean {
  return isString(value.id) && value.id.length > 0;
}

function isOwner(value: unknown): value is OwnerView {
  if (!isObject(value)) return false;
  return (
    isString(value.firm)
    && isString(value.vehicle)
    && isOptionalString(value.fundName)
    && isOptionalNumber(value.investmentYear)
    && isOptionalNumber(value.exitYear)
    && typeof value.isActive === "boolean"
    && isOptionalString(value.stake)
  );
}

function isPortfolioCompany(value: unknown): value is PortfolioCompanyView {
  if (!isObject(value)) return false;
  return (
    isString(value.name)
    && isString(value.sector)
    && isOptionalString(value.subsector)
    && isString(value.region)
    && isString(value.country)
    && isOptionalString(value.description)
    && typeof value.isActive === "boolean"
    && isOptionalNumber(value.investmentYear)
    && isOptionalNumber(value.exitYear)
  );
}

export function isDealDetail(value: unknown): value is DealDetail {
  if (!isObject(value) || !hasListIdentity(value)) return false;
  const validDisclosureStatus = value.sellerDisclosureStatus === undefined
    || value.sellerDisclosureStatus === "DISCLOSED"
    || value.sellerDisclosureStatus === "NOT_DISCLOSED"
    || value.sellerDisclosureStatus === "NOT_APPLICABLE"
    || value.sellerDisclosureStatus === "LEGACY_UNREVIEWED";
  return (
    isString(value.legacyId)
    && isString(value.title)
    && isString(value.target)
    && isString(value.buyer)
    && isString(value.seller)
    && isString(value.sector)
    && isString(value.subsector)
    && isString(value.region)
    && isStringArray(value.category)
    && isString(value.date)
    && isString(value.sourceName)
    && isString(value.sourceUrl)
    && isString(value.status)
    && isString(value.country)
    && validDisclosureStatus
    && isOptionalNullableString(value.sellerDisclosureReason)
    && isString(value.description)
    && isString(value.targetDescription)
    && isNullableString(value.enterpriseValue)
    && isNullableString(value.equityValue)
    && isNullableString(value.stake)
    && isNullableString(value.closingDate)
    && isNullableStringArray(value.financialAdvisorBuyer)
    && isNullableStringArray(value.financialAdvisorSeller)
    && isNullableStringArray(value.legalAdvisorBuyer)
    && isNullableStringArray(value.legalAdvisorSeller)
    && isNullableString(value.assetScale)
    && isNullableString(value.valuationMultiple)
    && isNullableString(value.fundVehicle)
    && isNullableStringArray(value.keyHighlights)
  );
}

export function isFundDetail(value: unknown): value is FundDetail {
  if (!isObject(value) || !hasListIdentity(value)) return false;
  return (
    isString(value.legacyId)
    && isString(value.managerName)
    && isString(value.fundName)
    && isString(value.size)
    && (value.sizeUsdMm === null
      || (typeof value.sizeUsdMm === "number" && Number.isFinite(value.sizeUsdMm)))
    && isString(value.vintage)
    && isStringArray(value.strategies)
    && isString(value.status)
    && isStringArray(value.sectors)
    && isNullableString(value.ticker)
    && isString(value.investmentStrategy)
    && isStringArray(value.sourceUrls)
    && isNullableString(value.primarySourceUrl)
    && isString(value.structure)
    && isStringArray(value.regions)
    && Array.isArray(value.portfolioCompanies)
    && value.portfolioCompanies.every(isPortfolioCompany)
    && Array.isArray(value.managerPortfolioCompanies)
    && value.managerPortfolioCompanies.every((entry) => (
      isObject(entry)
      && isPortfolioCompany(entry.company)
      && isString(entry.fundName)
      && isStringArray(entry.strategies)
    ))
    && isString(value.strategyUrl)
  );
}

export function isCompanyDetail(value: unknown): value is CompanyDetail {
  if (!isObject(value) || !hasListIdentity(value)) return false;
  return (
    isStringArray(value.focusIds)
    && isString(value.name)
    && isString(value.investmentFirm)
    && isString(value.sector)
    && isString(value.subsector)
    && isString(value.region)
    && isString(value.country)
    && isString(value.ownershipVehicle)
    && isString(value.status)
    && isStringArray(value.countryTags)
    && isOptionalNumber(value.investmentYear)
    && Array.isArray(value.owners)
    && value.owners.every(isOwner)
    && isString(value.description)
    && isOptionalString(value.website)
    && isOptionalNumber(value.yearFounded)
    && isOptionalString(value.headquarters)
    && (value.milestones === undefined || (
      Array.isArray(value.milestones)
      && value.milestones.every((milestone) => (
        isObject(milestone)
        && isString(milestone.date)
        && isString(milestone.event)
        && isString(milestone.category)
      ))
    ))
    && (value.management === undefined || (
      Array.isArray(value.management)
      && value.management.every((executive) => (
        isObject(executive)
        && isString(executive.name)
        && isString(executive.title)
      ))
    ))
    && (value.sources === undefined || (
      Array.isArray(value.sources)
      && value.sources.every((source) => (
        isObject(source)
        && isString(source.label)
        && isString(source.url)
        && isOptionalString(source.type)
        && isOptionalString(source.purpose)
        && isOptionalString(source.evidenceLabel)
      ))
    ))
  );
}
