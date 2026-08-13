import { describe, expect, it } from "vitest";
import {
  createPublicDetailApiVerifier,
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

  it("verifies the same milestone projection that the public scorecard serves", () => {
    const image = companyImageFixture();
    image.milestones = [
      {
        id: "milestone-short",
        date: "May 27, 2021",
        event: "Amber Infrastructure and Circle Power launched Circle Power Renewables.",
        category: "FINANCING",
        evidenceUrls: [],
      },
      {
        id: "milestone-long",
        date: "May 27, 2021",
        event: "Amber Infrastructure and Circle Power launched Circle Power Renewables as a U.S. renewable development platform covering Michigan projects.",
        category: "FINANCING",
        evidenceUrls: [],
      },
    ];
    const expected = expectedPublicProjection({
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: [],
    });

    expect(expected.milestones).toHaveLength(1);
    expect(expected.milestones[0]).toContain("launched Circle Power Renewables");
  });

  it("accepts either equally ranked active co-owner as the legacy scalar primary", () => {
    const image = companyImageFixture();
    image.ownershipPeriods.push({
      ...image.ownershipPeriods[0],
      id: "owner_2",
      managerName: "Argo Infrastructure Partners",
      organizationName: "Argo Infrastructure Partners",
      fundName: null,
      vehicleName: "AMF Hawaiʻi Investment Holdings, LLC",
      stake: null,
    });
    const expected = expectedPublicProjection({
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: [],
    });
    const argo = expected.owners.find(
      (owner) => owner.firm === "Argo Infrastructure Partners",
    );
    expect(argo).toBeDefined();
    const payload = {
      company: {
        ...expected,
        focusIds: expected.requiredFocusIds,
        investmentFirm: argo!.firm,
        ownershipVehicle: argo!.vehicle,
        investmentYear: argo!.investmentYear ?? undefined,
        owners: expected.owners.map((owner) => ({
          ...owner,
          fundName: owner.fundName ?? undefined,
          investmentYear: owner.investmentYear ?? undefined,
          exitYear: owner.exitYear ?? undefined,
          stake: owner.stake ?? undefined,
        })),
        milestones: expected.milestones.map((value) => JSON.parse(value)),
        management: expected.management.map((value) => JSON.parse(value)),
        sources: expected.sources.map((value) => JSON.parse(value)),
      },
    };

    expect(() => verifyPublicCompanyPayload({
      payload,
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: [],
    })).not.toThrow();

    payload.company.investmentFirm = "Unapproved Manager";
    expect(() => verifyPublicCompanyPayload({
      payload,
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: [],
    })).toThrow(/primary-owner/i);
  });

  it("treats a 404 as the required public result for an archived company", async () => {
    const image = companyImageFixture();
    image.recordStatus = "ARCHIVED";
    const verify = createPublicDetailApiVerifier({
      baseUrl: "https://example.com/Infra-MA2/",
      attempts: 1,
      fetchImpl: async () => new Response(null, { status: 404 }),
    });

    await expect(verify("company_acme", image, [])).resolves.toBeUndefined();
  });

  it("rejects an archived company that remains publicly retrievable", async () => {
    const image = companyImageFixture();
    image.recordStatus = "ARCHIVED";
    const verify = createPublicDetailApiVerifier({
      baseUrl: "https://example.com/Infra-MA2/",
      attempts: 1,
      fetchImpl: async () => new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    });

    await expect(verify("company_acme", image, [])).rejects.toThrow(/remains available/i);
  });

  it("uses the after-image hash by default and can exercise the ordinary unversioned cache key", async () => {
    const image = companyImageFixture();
    const requestedUrls: URL[] = [];
    const expected = expectedPublicProjection({
      companyId: "company_acme",
      afterImage: image,
      retiredCompanyIds: [],
    });
    const payload = {
      company: {
        ...expected,
        focusIds: expected.requiredFocusIds,
        owners: expected.owners,
        milestones: expected.milestones.map((value) => JSON.parse(value)),
        management: expected.management.map((value) => JSON.parse(value)),
        sources: expected.sources.map((value) => JSON.parse(value)),
      },
    };
    const fetchImpl = async (input: string | URL | Request) => {
      requestedUrls.push(new URL(input instanceof Request ? input.url : input.toString()));
      return Response.json(payload);
    };
    await createPublicDetailApiVerifier({
      baseUrl: "https://example.com/Infra-MA2/",
      attempts: 1,
      fetchImpl,
    })("company_acme", image, []);
    await createPublicDetailApiVerifier({
      baseUrl: "https://example.com/Infra-MA2/",
      attempts: 1,
      fetchImpl,
      cacheVersion: "default",
    })("company_acme", image, []);

    expect(requestedUrls).toHaveLength(2);
    expect(requestedUrls[0].searchParams.get("verification")).toMatch(/^[a-f0-9]{64}$/);
    expect(requestedUrls[1].search).toBe("");
  });
});
