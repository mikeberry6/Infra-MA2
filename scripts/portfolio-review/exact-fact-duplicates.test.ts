import { describe, expect, it } from "vitest";
import {
  planExactCompanyFactDeduplication,
  type ManagementFactSnapshot,
  type OwnershipFactSnapshot,
} from "./exact-fact-duplicates";

const ownership = (overrides: Partial<OwnershipFactSnapshot> = {}): OwnershipFactSnapshot => ({
  id: "ownership-a",
  companyId: "company-1",
  companyName: "Company",
  organizationId: null,
  organizationName: null,
  fundId: "fund-1",
  fundName: "Infrastructure Fund",
  fundManagerName: "Investor",
  vehicleName: null,
  stake: null,
  investmentYear: 2020,
  exitYear: null,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const management = (overrides: Partial<ManagementFactSnapshot> = {}): ManagementFactSnapshot => ({
  id: "generated-role",
  companyId: "company-1",
  companyName: "Company",
  personId: "generated-person",
  personName: "Alex Executive",
  title: "Chief Executive Officer",
  startDate: null,
  endDate: null,
  ...overrides,
});

describe("planExactCompanyFactDeduplication", () => {
  it("keeps the richer ownership relation when rendered facts are exact duplicates", () => {
    const richer = ownership({
      id: "ownership-b",
      organizationId: "organization-1",
      organizationName: "Investor",
      vehicleName: "Infrastructure Fund",
    });
    const plan = planExactCompanyFactDeduplication({
      ownership: [ownership(), richer],
      management: [],
    });

    expect(plan.ownershipGroups).toHaveLength(1);
    expect(plan.ownershipGroups[0].keep.id).toBe("ownership-b");
    expect(plan.deleteOwnershipIds).toEqual(["ownership-a"]);
  });

  it("does not conflate different stakes, vehicles, dates, or statuses", () => {
    const plan = planExactCompanyFactDeduplication({
      ownership: [
        ownership({ vehicleName: "Infrastructure Fund" }),
        ownership({ id: "stake", vehicleName: "Infrastructure Fund", stake: "49%" }),
        ownership({ id: "vehicle", vehicleName: "Other Fund" }),
        ownership({ id: "year", vehicleName: "Infrastructure Fund", investmentYear: 2021 }),
        ownership({ id: "former", vehicleName: "Infrastructure Fund", isActive: false, exitYear: 2024 }),
      ],
      management: [],
    });

    expect(plan.ownershipGroups).toHaveLength(0);
    expect(plan.dominatedOwnershipGroups).toHaveLength(0);
  });

  it("removes only blank-vehicle rows dominated by an otherwise identical richer row", () => {
    const plan = planExactCompanyFactDeduplication({
      ownership: [
        ownership({
          id: "blank",
          fundId: null,
          fundName: null,
          organizationId: "org-1",
          organizationName: "Investor",
        }),
        ownership({
          id: "rich",
          fundId: null,
          fundName: null,
          organizationId: "org-1",
          organizationName: "Investor",
          vehicleName: "Investor managed capital",
        }),
      ],
      management: [],
    });

    expect(plan.ownershipGroups).toHaveLength(0);
    expect(plan.dominatedOwnershipGroups).toHaveLength(1);
    expect(plan.dominatedOwnershipGroups[0].keep.id).toBe("rich");
    expect(plan.deleteOwnershipIds).toEqual(["blank"]);
  });

  it("keeps stable seeded management IDs for exact name/title/date duplicates", () => {
    const plan = planExactCompanyFactDeduplication({
      ownership: [],
      management: [
        management(),
        management({ id: "role_alex", personId: "person_alex" }),
      ],
    });

    expect(plan.managementGroups[0].keep.id).toBe("role_alex");
    expect(plan.deleteManagementRoleIds).toEqual(["generated-role"]);
  });

  it("preserves distinct executive terms", () => {
    const plan = planExactCompanyFactDeduplication({
      ownership: [],
      management: [
        management(),
        management({ id: "later", startDate: "2026-01-01T00:00:00.000Z" }),
      ],
    });

    expect(plan.managementGroups).toHaveLength(0);
  });
});
