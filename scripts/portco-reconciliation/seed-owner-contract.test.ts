import { describe, expect, it } from "vitest";
import type { PortCoOwner } from "../../prisma/seed-data/portco-types";
import { resolveSeedOwnership } from "../../prisma/seed-runner";

describe("fresh-seed ownership contract", () => {
  it("keeps one fund link while preserving distinct legal ownership vehicles", () => {
    const owners: PortCoOwner[] = [
      "Chief Power Finance, LLC (pre-restructuring controlling tranche)",
      "Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche",
      "Chief Power Finance II, LLC",
    ].map((vehicleName, index) => ({
      investmentFirm: "ArcLight Capital Partners",
      ownershipVehicle: "ArcLight Energy Partners Fund V, L.P.",
      fundName: "ArcLight Energy Partners Fund V, L.P.",
      vehicleName,
      investmentYear: index === 2 ? 2019 : 2014,
      status: index === 0 ? "Realized" : "Active",
      transactionState: index === 0 ? "REALIZED" : "CLOSED_ACTIVE",
    }));

    const resolved = owners.map(resolveSeedOwnership);
    expect(new Set(resolved.map((owner) => owner.fundLookupName))).toEqual(
      new Set(["ArcLight Energy Partners Fund V, L.P."]),
    );
    expect(new Set(resolved.map((owner) => owner.vehicleName))).toHaveProperty("size", 3);
    expect(resolved.map((owner) => owner.transactionState)).toEqual([
      "REALIZED",
      "CLOSED_ACTIVE",
      "CLOSED_ACTIVE",
    ]);
  });

  it("retains the legacy combined ownershipVehicle behavior", () => {
    expect(resolveSeedOwnership({
      investmentFirm: "Legacy Manager",
      ownershipVehicle: "Legacy Fund or Vehicle",
      status: "Realized",
    })).toEqual({
      fundLookupName: "Legacy Fund or Vehicle",
      vehicleName: "Legacy Fund or Vehicle",
      transactionState: "REALIZED",
    });
  });
});
