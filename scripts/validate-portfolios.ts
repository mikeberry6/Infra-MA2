/**
 * Portfolio Company Validation Script
 *
 * Checks for:
 * 1. Cross-fund consistency (same company in multiple funds should have identical data)
 * 2. Source URL coverage
 * 3. Financial data completeness
 * 4. Missing descriptions / subsectors
 *
 * Run: npx tsx scripts/validate-portfolios.ts
 */

import { PORTFOLIO_DATA } from "../src/data/portfolios";
import type { PortfolioCompany } from "../src/data/funds";

interface CompanyInstance {
  fundId: string;
  company: PortfolioCompany;
}

// Collect all instances grouped by company name
const companyMap = new Map<string, CompanyInstance[]>();

for (const [fundId, companies] of Object.entries(PORTFOLIO_DATA)) {
  for (const company of companies) {
    const key = company.name;
    if (!companyMap.has(key)) {
      companyMap.set(key, []);
    }
    companyMap.get(key)!.push({ fundId, company });
  }
}

const totalEntries = Object.values(PORTFOLIO_DATA).reduce((s, arr) => s + arr.length, 0);
const uniqueCompanies = companyMap.size;

// --- Check 1: Cross-fund consistency ---
const inconsistencies: { name: string; field: string; values: { fundId: string; value: string }[] }[] = [];
const fieldsToCheck: (keyof PortfolioCompany)[] = ["sector", "subsector", "region", "country", "description"];

for (const [name, instances] of companyMap) {
  if (instances.length < 2) continue;
  for (const field of fieldsToCheck) {
    const values = instances.map((inst) => ({
      fundId: inst.fundId,
      value: String(inst.company[field] ?? ""),
    }));
    const uniqueValues = new Set(values.map((v) => v.value));
    if (uniqueValues.size > 1) {
      inconsistencies.push({ name, field, values });
    }
  }
}

// --- Check 2: Source URL coverage ---
const withSources: string[] = [];
const withoutSources: string[] = [];

for (const [name, instances] of companyMap) {
  const hasSources = instances.some(
    (inst) => inst.company.sourceUrls && inst.company.sourceUrls.length > 0
  );
  if (hasSources) {
    withSources.push(name);
  } else {
    withoutSources.push(name);
  }
}

// --- Check 3: Financial data ---
const withFinancials: string[] = [];
const withoutFinancials: string[] = [];

for (const [name, instances] of companyMap) {
  const hasFinancials = instances.some(
    (inst) =>
      inst.company.financials &&
      Object.values(inst.company.financials).some((v) => v !== undefined)
  );
  if (hasFinancials) {
    withFinancials.push(name);
  } else {
    withoutFinancials.push(name);
  }
}

// --- Check 4: Missing descriptions / subsectors ---
const missingDescriptions: string[] = [];
const missingSubsectors: string[] = [];

for (const [name, instances] of companyMap) {
  if (instances.every((inst) => !inst.company.description)) {
    missingDescriptions.push(name);
  }
  if (instances.every((inst) => !inst.company.subsector)) {
    missingSubsectors.push(name);
  }
}

// --- Output Report ---
console.log("═══════════════════════════════════════════════════════════");
console.log("  PORTFOLIO COMPANY VALIDATION REPORT");
console.log("═══════════════════════════════════════════════════════════\n");

console.log(`  Total entries:       ${totalEntries}`);
console.log(`  Unique companies:    ${uniqueCompanies}`);
console.log(`  Duplicates:          ${totalEntries - uniqueCompanies} entries across ${[...companyMap.values()].filter((v) => v.length > 1).length} companies\n`);

const sourcePct = ((withSources.length / uniqueCompanies) * 100).toFixed(1);
const finPct = ((withFinancials.length / uniqueCompanies) * 100).toFixed(1);

console.log("─── Coverage ───────────────────────────────────────────");
console.log(`  Source URLs:         ${withSources.length} / ${uniqueCompanies} (${sourcePct}%)`);
console.log(`  Financial data:      ${withFinancials.length} / ${uniqueCompanies} (${finPct}%)`);
console.log(`  Missing description: ${missingDescriptions.length}`);
console.log(`  Missing subsector:   ${missingSubsectors.length}\n`);

if (inconsistencies.length > 0) {
  console.log("─── Cross-Fund Inconsistencies ─────────────────────────");
  for (const inc of inconsistencies) {
    console.log(`\n  ${inc.name} [${inc.field}]:`);
    for (const v of inc.values) {
      console.log(`    ${v.fundId}: "${v.value}"`);
    }
  }
  console.log();
} else {
  console.log("─── Cross-Fund Inconsistencies ─────────────────────────");
  console.log("  None found.\n");
}

if (withoutSources.length > 0 && withoutSources.length <= 50) {
  console.log("─── Companies Without Source URLs ───────────────────────");
  for (const name of withoutSources.sort()) {
    console.log(`  - ${name}`);
  }
  console.log();
} else if (withoutSources.length > 50) {
  console.log("─── Companies Without Source URLs ───────────────────────");
  console.log(`  ${withoutSources.length} companies (too many to list)\n`);
}

// Summary
const issues = inconsistencies.length + missingDescriptions.length;
if (issues === 0 && withoutSources.length === 0) {
  console.log("✓ All checks passed!\n");
} else {
  console.log(`Summary: ${inconsistencies.length} inconsistencies, ${withoutSources.length} missing sources, ${missingDescriptions.length} missing descriptions\n`);
}
