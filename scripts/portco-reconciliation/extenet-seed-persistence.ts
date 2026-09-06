import type { PortCo } from "../../prisma/seed-data/portco-types";
import type { CompanyImage } from "./schema";
import { sha256Canonical } from "./hash";

export const EXTENET_ID = "cmrxpjdak00twivheazjbfqum";
export const EXTENET_NAME = "Extenet (formerly ExteNet Systems)";
export const EXTENET_OLD_NAME = "ExteNet Systems";
export const EXTENET_DUPLICATE_NAME = "Extenet";
export const EXTENET_COUNTRY = "United States";

/** Identity-only persistence, not an application of task 213's deferred research.
 * No owner, attribution, citation, milestone or other retained field is changed.
 */
export function projectExtenetSeedIdentity(source: readonly PortCo[], production: CompanyImage) {
  const scoped = source.filter((company) => company.country === EXTENET_COUNTRY
    && [EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME].includes(company.name));
  const retained = scoped.filter((company) => company.name === EXTENET_OLD_NAME);
  const duplicate = scoped.filter((company) => company.name === EXTENET_DUPLICATE_NAME);
  if (scoped.length !== 2 || retained.length !== 1 || duplicate.length !== 1) throw new Error("Missing, ambiguous or already repaired Extenet seed identity");
  const before = retained[0];
  if (production.id !== EXTENET_ID || production.name !== EXTENET_NAME || production.country !== EXTENET_COUNTRY
    || production.recordStatus !== "PUBLISHED" || production.companyStatus !== "ACTIVE"
    || production.description !== before.description || production.pendingOwnershipTransactions.length !== 0) throw new Error("Extenet production identity or dependencies changed");
  if (before.owners?.length !== 4 || duplicate[0].owners?.length !== 1
    || duplicate[0].owners[0].investmentFirm !== "Stonepeak"
    || !before.owners.some((owner) => sha256Canonical(owner) === sha256Canonical(duplicate[0].owners![0]))) throw new Error("Duplicate owner is not an exact subset of the retained seed");
  const seedOwners = before.owners.map((owner) => ({
    organizationName: owner.investmentFirm, vehicleName: owner.vehicleName || owner.ownershipVehicle,
    investmentYear: owner.investmentYear ?? null, exitYear: owner.exitYear ?? null, stake: owner.stake ?? null,
    isActive: owner.status === "Active", transactionState: owner.transactionState ?? (owner.status === "Active" ? "CLOSED_ACTIVE" : "REALIZED"),
  }));
  const productionOwners = production.ownershipPeriods.map((owner) => ({
    organizationName: owner.organizationName, vehicleName: owner.vehicleName,
    investmentYear: owner.investmentYear, exitYear: owner.exitYear, stake: owner.stake,
    isActive: owner.isActive, transactionState: owner.transactionState,
  }));
  const sortedHashes = (rows: unknown[]) => rows.map(sha256Canonical).sort();
  if (sha256Canonical(sortedHashes(seedOwners)) !== sha256Canonical(sortedHashes(productionOwners))) throw new Error("Displayed production owners differ; identity repair must not decide ownership");
  const after = { ...before, name: EXTENET_NAME };
  const resultingCompanies = source.filter((company) => company !== duplicate[0]).map((company) => company === before ? after : company);
  const keys = resultingCompanies.map((company) => `${company.name.toLowerCase()}\0${company.country.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) throw new Error("Resulting seed identity collision");
  return { before, after, retired: duplicate[0], resultingCompanies };
}
