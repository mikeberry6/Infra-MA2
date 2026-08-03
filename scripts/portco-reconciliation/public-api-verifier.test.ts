import { describe, expect, it } from "vitest";
import {
  expectedPublicProjection,
  verifyPublicCompanyPayload,
} from "./public-api-verifier";
import { companyImageFixture } from "./test-fixtures";

describe("public PortCo detail API verifier", () => {
  it("verifies render-critical public fields without requiring internal audit fields", () => {
    const image = companyImageFixture();
    const expected = expectedPublicProjection({
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: ["retired_acme"],
    });
    const payload = {
      company: {
        id: expected.id,
        focusIds: expected.requiredFocusIds,
        name: expected.name,
        investmentFirm: expected.investmentFirm,
        sector: expected.sector,
        subsector: expected.subsector,
        region: expected.region,
        country: expected.country,
        ownershipVehicle: expected.ownershipVehicle,
        description: expected.description,
        status: expected.status,
        countryTags: expected.countryTags,
        website: expected.website ?? undefined,
        yearFounded: expected.yearFounded ?? undefined,
        investmentYear: expected.investmentYear ?? undefined,
        headquarters: expected.headquarters ?? undefined,
        owners: expected.owners.map((owner) => ({
          ...owner,
          fundName: owner.fundName ?? undefined,
          investmentYear: owner.investmentYear ?? undefined,
          exitYear: owner.exitYear ?? undefined,
          stake: owner.stake ?? undefined,
        })),
        milestones: expected.milestones.map((value) => JSON.parse(value)),
        management: expected.management.map((value) => JSON.parse(value)),
        sources: expected.sources.map((value) => {
          const source = JSON.parse(value) as Record<string, unknown>;
          return { ...source, evidenceLabel: source.evidenceLabel ?? undefined };
        }),
      },
    };
    expect(() => verifyPublicCompanyPayload({
      payload,
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: ["retired_acme"],
    })).not.toThrow();
    payload.company.description = "stale description";
    expect(() => verifyPublicCompanyPayload({
      payload,
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: ["retired_acme"],
    })).toThrow(/render-critical/i);
  });
});
