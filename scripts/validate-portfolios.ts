/**
 * Portfolio company validation for the current seed-data architecture.
 *
 * This replaces the retired `src/data/portfolios` validator. It validates the
 * canonical seed files under `prisma/seed-data` and reports known enrichment
 * gaps separately from hard structural failures.
 */

import { companies } from "../prisma/seed-data/companies";
import { funds, validateFundData } from "../prisma/seed-data/funds";
import {
  PORTCO_REGIONS,
  PORTCO_SECTORS,
  PORTCO_STATUSES,
  type PortCo,
  type PortCoOwner,
} from "../prisma/seed-data/portco-types";

const errors: string[] = [];
const warnings: string[] = [];

function addError(message: string) {
  errors.push(message);
}

function addWarning(message: string) {
  warnings.push(message);
}

function validUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function ownersFor(company: PortCo): PortCoOwner[] {
  if (company.owners?.length) return company.owners;
  return [
    {
      investmentFirm: company.investmentFirm,
      ownershipVehicle: company.ownershipVehicle,
      investmentYear: company.investmentYear,
      status: company.status,
    },
  ];
}

const fundNames = new Set(funds.map((fund) => fund.fundName));
const seenCompanyKeys = new Map<string, number>();
const seenSourceUrls = new Set<string>();

for (const fundError of validateFundData()) {
  addError(`funds: ${fundError}`);
}

for (const [index, company] of companies.entries()) {
  const label = `${company.name || `(row ${index + 1})`} / ${company.country || "unknown country"}`;
  const key = `${company.name}||${company.country}`;
  seenCompanyKeys.set(key, (seenCompanyKeys.get(key) ?? 0) + 1);

  if (!company.name) addError(`${label}: missing name`);
  if (!company.investmentFirm) addError(`${label}: missing investmentFirm`);
  if (!company.ownershipVehicle) addWarning(`${label}: missing ownershipVehicle`);
  if (!company.description) addError(`${label}: missing description`);
  if (!company.country) addError(`${label}: missing country`);
  if (!PORTCO_SECTORS.includes(company.sector)) addError(`${label}: invalid sector "${company.sector}"`);
  if (!PORTCO_REGIONS.includes(company.region)) addError(`${label}: invalid region "${company.region}"`);
  if (!PORTCO_STATUSES.includes(company.status)) addError(`${label}: invalid status "${company.status}"`);

  if (!company.sources?.length) {
    addWarning(`${label}: no sources`);
  } else {
    for (const source of company.sources) {
      if (!source.label) addError(`${label}: source without label`);
      if (!source.url || !validUrl(source.url)) addError(`${label}: invalid source URL "${source.url}"`);
      if (source.url) seenSourceUrls.add(source.url);
    }
  }

  if (!company.milestones?.length) {
    addWarning(`${label}: no milestones`);
  } else {
    const milestoneKeys = new Set<string>();
    for (const milestone of company.milestones) {
      if (!milestone.date) addError(`${label}: milestone without date`);
      if (!milestone.event) addError(`${label}: milestone without event`);
      const milestoneKey = `${milestone.date}|${milestone.event}`;
      if (milestoneKeys.has(milestoneKey)) addWarning(`${label}: duplicate milestone "${milestoneKey}"`);
      milestoneKeys.add(milestoneKey);
    }
  }

  if (!company.management?.length) addWarning(`${label}: no management records`);

  for (const owner of ownersFor(company)) {
    if (!owner.investmentFirm) addError(`${label}: owner missing investmentFirm`);
    if (!owner.ownershipVehicle) addWarning(`${label}: owner missing ownershipVehicle`);
    if (!PORTCO_STATUSES.includes(owner.status)) addError(`${label}: owner has invalid status "${owner.status}"`);
    if (owner.ownershipVehicle && !fundNames.has(owner.ownershipVehicle)) {
      addWarning(`${label}: ownershipVehicle does not exactly match a fund name: "${owner.ownershipVehicle}"`);
    }
  }
}

for (const [key, count] of seenCompanyKeys) {
  if (count > 1) addError(`duplicate company name/country key: ${key} (${count} rows)`);
}

console.log("Portfolio Company Validation Report");
console.log("===================================");
console.log(`Companies: ${companies.length}`);
console.log(`Funds: ${funds.length}`);
console.log(`Unique source URLs: ${seenSourceUrls.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\nErrors:");
  for (const error of errors.slice(0, 80)) console.log(`  - ${error}`);
  if (errors.length > 80) console.log(`  ...and ${errors.length - 80} more`);
}

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings.slice(0, 80)) console.log(`  - ${warning}`);
  if (warnings.length > 80) console.log(`  ...and ${warnings.length - 80} more`);
}

if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("\nNo structural errors found.");
}
