import type { ImportEntityType } from "./domain";

export type ImportFieldKind =
  | "string"
  | "nullable-string"
  | "string-array"
  | "nullable-number";

export interface ImportFieldContract {
  name: string;
  kind: ImportFieldKind;
}

export interface ImportEntityContract {
  bodyKey: string;
  fields: readonly ImportFieldContract[];
}

const dealFields = [
  ["legacyId", "string"],
  ["title", "string"],
  ["target", "string"],
  ["buyer", "string"],
  ["seller", "string"],
  ["sector", "string"],
  ["subsector", "string"],
  ["region", "string"],
  ["category", "string-array"],
  ["date", "string"],
  ["status", "string"],
  ["description", "string"],
  ["targetDescription", "string"],
  ["country", "string"],
  ["enterpriseValue", "nullable-string"],
  ["equityValue", "nullable-string"],
  ["stake", "nullable-string"],
  ["closingDate", "nullable-string"],
  ["assetScale", "nullable-string"],
  ["valuationMultiple", "nullable-string"],
  ["fundVehicle", "nullable-string"],
  ["keyHighlights", "string-array"],
  ["sourceName", "nullable-string"],
  ["sourceUrl", "nullable-string"],
] as const satisfies readonly (readonly [string, ImportFieldKind])[];

const fundFields = [
  ["legacyId", "string"],
  ["managerName", "string"],
  ["fundName", "string"],
  ["strategies", "string-array"],
  ["structure", "string"],
  ["status", "string"],
  ["size", "string"],
  ["sizeUsdMm", "nullable-number"],
  ["vintage", "string"],
  ["sectors", "string-array"],
  ["regions", "string-array"],
  ["investmentStrategy", "string"],
  ["sourceUrls", "string-array"],
  ["ticker", "nullable-string"],
  ["strategyUrl", "nullable-string"],
] as const satisfies readonly (readonly [string, ImportFieldKind])[];

const portfolioFields = [
  ["name", "string"],
  ["investmentFirm", "nullable-string"],
  ["sector", "string"],
  ["subsector", "string"],
  ["region", "string"],
  ["country", "string"],
  ["countryTags", "string-array"],
  ["ownershipVehicle", "nullable-string"],
  ["status", "string"],
  ["description", "string"],
  ["website", "nullable-string"],
  ["yearFounded", "nullable-number"],
  ["investmentYear", "nullable-number"],
  ["headquarters", "nullable-string"],
] as const satisfies readonly (readonly [string, ImportFieldKind])[];

function fields(
  definitions: readonly (readonly [string, ImportFieldKind])[],
): readonly ImportFieldContract[] {
  return definitions.map(([name, kind]) => ({ name, kind }));
}

/**
 * Imports intentionally use full-row replacement contracts. Every writable
 * field must be present, including nullable fields, so a missing column can
 * never be mistaken for an explicit request to clear data.
 */
export const IMPORT_CONTRACTS: Record<
  ImportEntityType,
  ImportEntityContract
> = {
  deals: { bodyKey: "deals", fields: fields(dealFields) },
  funds: { bodyKey: "funds", fields: fields(fundFields) },
  portfolio: { bodyKey: "companies", fields: fields(portfolioFields) },
};

export function importFieldNames(
  contract: ImportEntityContract,
): string[] {
  return contract.fields.map(({ name }) => name);
}
