import rawAfterImages from "./approved-portco-after-images.json" with { type: "json" };
import type { PortCo } from "./portco-types";

export const CHICAGO_SEED_NAME = "Chicago Parking Meters, LLC";
export const CHICAGO_SEED_COUNTRY = "United States";
export const CHICAGO_LEGACY_PROPOSAL = "e8e04c45b1ab744cfddcccb93362e39a22b6adbac9b47a98eaf32c2797aa9535";

/**
 * Separate technical persistence of the existing production display, not an
 * application of deferred task 345 or a finding about the contemplated sale.
 * The immutable overlay and all citation annotations remain unchanged. See
 * audits/portco-reconciliation/2026-09-06/chicago-seed-state-persistence.
 * A changed/future overlay requires review instead of silently inheriting this fix.
 */
export function persistChicagoDisplayedOwnerStates(input: readonly PortCo[]): PortCo[] {
  const entries = rawAfterImages.filter((entry) => entry.proposalSha256 === CHICAGO_LEGACY_PROPOSAL);
  if (entries.length !== 1 || entries[0].operation !== "UPSERT" || entries[0].retiredCompanies.length !== 0) {
    throw new Error("Chicago persistence: immutable overlay scope changed");
  }
  const expected = entries[0].company as PortCo;
  const matching = input.filter((company) => company.name.trim().toLowerCase() === CHICAGO_SEED_NAME.toLowerCase()
    && company.country.trim().toLowerCase() === CHICAGO_SEED_COUNTRY.toLowerCase());
  if (matching.length !== 1 || expected.name !== CHICAGO_SEED_NAME || expected.country !== CHICAGO_SEED_COUNTRY) {
    throw new Error("Chicago persistence: missing or ambiguous identity");
  }
  const before = matching[0];
  if (JSON.stringify(before) !== JSON.stringify(expected)) throw new Error("Chicago persistence: changed before-image or repeated application");
  const owners = before.owners;
  const expectedOwners = [
    ["Morgan Stanley Infrastructure Partners", "North Haven Infrastructure Partners", "50.1%"],
    ["Allianz Global Investors", "Deeside Investments, Inc.", "25.0%"],
    ["ADIA Infrastructure", "Deeside Investments, Inc.", "24.9%"],
  ];
  if (!owners || owners.length !== 3 || owners.some((owner, index) =>
    owner.investmentFirm !== expectedOwners[index][0] || owner.ownershipVehicle !== expectedOwners[index][1]
    || owner.stake !== expectedOwners[index][2] || owner.investmentYear !== 2009 || owner.exitYear !== undefined
    || owner.status !== "Active" || owner.transactionState !== "SIGNED_PENDING_EXIT")) {
    throw new Error("Chicago persistence: owner scope changed");
  }
  return input.map((company) => company === before
    ? { ...company, owners: owners.map((owner) => ({ ...owner, transactionState: "CLOSED_ACTIVE" as const })) }
    : company);
}
