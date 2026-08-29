import { describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { baseCompanies } from "../../prisma/seed-data/companies";
import {
  companyImageSha256,
  finalizeApproval,
  finalizeProductionSnapshot,
  finalizeProposal,
  snapshotCompanySha256,
} from "./artifacts";
import {
  planApprovedApply,
  semanticCompanyImageSha256,
  type FreshApplyState,
} from "./apply-plan";
import {
  executeApprovedApply,
  PORTCO_APPLY_WRITE_TOKEN,
  type ApprovedApplyDependencies,
  type AuditEventWrite,
  type CompanyRevisionWrite,
  type ProductionReleaseEvidence,
} from "./apply-executor";
import {
  buildApprovedSeedEntry,
  removeStagedApprovedSeedAfterImage,
  renderApprovedSeedArtifact,
  supersedeStagedApprovedSeedAfterImage,
  verifyApprovedSeedProjection,
  verifyApprovedSeedText,
} from "./approved-seed";
import { sha256Canonical } from "./hash";
import { ownershipLinks, ownershipOrganizationTypes } from "./prisma-apply-store";
import {
  companyImageFixture,
  FIXTURE_NOW,
  FIXTURE_SHA,
  productionSnapshotFixture,
} from "./test-fixtures";
import type {
  CompanyImage,
  ProposalExecutionLock,
  ReconciliationApproval,
  ReconciliationProposal,
  ProductionSnapshot,
} from "./schema";

describe("approved ownership organization provisioning", () => {
  it("classifies newly approved fund managers and corporate retained owners deterministically", () => {
    expect(ownershipOrganizationTypes("AT&T Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("AgeCare")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Amico Major Projects")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("BC Partners")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("BBGI")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Canadian Business Growth Fund")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Capital Power Corporation")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Clearway Energy")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Cleveland Clinic Foundation")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("Continental Grain Company")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Cresta Fund Management")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Cox Enterprises")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("CSG Investments, Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Donato Ardellini")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("Dalmore Capital")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Energy Transfer LP")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("ENGIE")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Enlightened Hospitality Investments")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Eolian employees")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("ePointZero")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Eversource Energy")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Excelsior Energy Capital")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Extendicare Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Ferrovial N.V.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Forum Equity Partners")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Gilbane Development Company")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("GE Renewable Energy")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("HPS Investment Partners")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Harvestone Group")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("GFL Environmental Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Jeff Canon and PROENERGY management")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("Kinder Morgan, Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("MAP Energy, LLC")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("MedCraft Healthcare Real Estate")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("MGX")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Montecito Medical Real Estate")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Ocean Winds")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("NextDecade Corporation")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("OPTrust")).toEqual(["PENSION"]);
    expect(ownershipOrganizationTypes("PUC Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Revera Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Sacyr Infrastructure Canada")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Stonemont Financial Group")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Silverpeak")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("TC Energy Corporation")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("TotalEnergies")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("The Sina Companies")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("XRG P.J.S.C.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Énergir L.P.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Ingka Investments")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Koninklijke Vopak N.V.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Occidental Petroleum Corporation")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("ACON Investments")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Eos Partners, L.P.")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("TCA Fund Management Group Corp.")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Walsin Lihwa Corporation")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Stem, Inc.")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Chevron New Energies")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Haddington Ventures")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("A.P. Moller-Maersk")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Littlejohn & Co.")).toEqual(["FUND_MANAGER"]);
  });

  it("provisions only exact approved missing owner organizations during the protected apply phase", async () => {
    for (const [name, type] of [
      ["AT&T Inc.", "CORPORATE"],
      ["AgeCare", "CORPORATE"],
      ["Amico Major Projects", "CORPORATE"],
      ["BC Partners", "FUND_MANAGER"],
      ["BBGI", "FUND_MANAGER"],
      ["Canadian Business Growth Fund", "FUND_MANAGER"],
      ["Capital Power Corporation", "CORPORATE"],
      ["Clearway Energy", "CORPORATE"],
      ["Cleveland Clinic Foundation", "OTHER"],
      ["Continental Grain Company", "CORPORATE"],
      ["Cresta Fund Management", "FUND_MANAGER"],
      ["Cox Enterprises", "CORPORATE"],
      ["CSG Investments, Inc.", "CORPORATE"],
      ["Donato Ardellini", "OTHER"],
      ["Dalmore Capital", "FUND_MANAGER"],
      ["Energy Transfer LP", "CORPORATE"],
      ["ENGIE", "CORPORATE"],
      ["Enlightened Hospitality Investments", "FUND_MANAGER"],
      ["Eolian employees", "OTHER"],
      ["ePointZero", "CORPORATE"],
      ["Eversource Energy", "CORPORATE"],
      ["Excelsior Energy Capital", "FUND_MANAGER"],
      ["Extendicare Inc.", "CORPORATE"],
      ["Ferrovial N.V.", "CORPORATE"],
      ["Forum Equity Partners", "FUND_MANAGER"],
      ["Gilbane Development Company", "CORPORATE"],
      ["GE Renewable Energy", "CORPORATE"],
      ["GFL Environmental Inc.", "CORPORATE"],
      ["Jeff Canon and PROENERGY management", "OTHER"],
      ["HPS Investment Partners", "FUND_MANAGER"],
      ["Harvestone Group", "CORPORATE"],
      ["Kinder Morgan, Inc.", "CORPORATE"],
      ["MAP Energy, LLC", "FUND_MANAGER"],
      ["MedCraft Healthcare Real Estate", "FUND_MANAGER"],
      ["MGX", "FUND_MANAGER"],
      ["Montecito Medical Real Estate", "FUND_MANAGER"],
      ["Ocean Winds", "CORPORATE"],
      ["NextDecade Corporation", "CORPORATE"],
      ["OPTrust", "PENSION"],
      ["PUC Inc.", "CORPORATE"],
      ["Revera Inc.", "CORPORATE"],
      ["Sacyr Infrastructure Canada", "CORPORATE"],
      ["Stonemont Financial Group", "FUND_MANAGER"],
      ["Silverpeak", "FUND_MANAGER"],
      ["TC Energy Corporation", "CORPORATE"],
      ["TotalEnergies", "CORPORATE"],
      ["The Sina Companies", "CORPORATE"],
      ["XRG P.J.S.C.", "CORPORATE"],
      ["Énergir L.P.", "CORPORATE"],
      ["ACON Investments", "FUND_MANAGER"],
      ["Eos Partners, L.P.", "FUND_MANAGER"],
      ["TCA Fund Management Group Corp.", "FUND_MANAGER"],
      ["Walsin Lihwa Corporation", "CORPORATE"],
      ["Stem, Inc.", "CORPORATE"],
      ["Chevron New Energies", "CORPORATE"],
      ["Haddington Ventures", "FUND_MANAGER"],
      ["A.P. Moller-Maersk", "CORPORATE"],
      ["Littlejohn & Co.", "FUND_MANAGER"],
    ] as const) {
      const create = vi.fn().mockResolvedValue({
        id: `org-${name}`,
        name,
        types: [type],
        status: "PUBLISHED",
      });
      const transaction = {
        organization: { findUnique: vi.fn().mockResolvedValue(null), create },
      };
      await expect(ownershipLinks(transaction, {
        id: null,
        managerName: name,
        organizationName: name,
        fundName: null,
        vehicleName: `${name} vehicle`,
        stake: "Approximately 22%",
        investmentYear: 2025,
        exitYear: null,
        isActive: true,
        transactionState: "CLOSED_ACTIVE",
      }, "APPLY")).resolves.toEqual({ organizationId: `org-${name}`, fundId: null });
      expect(create).toHaveBeenCalledWith({
        data: { name, types: [type], status: "PUBLISHED" },
        select: { id: true, name: true, types: true, status: true },
      });
    }
  });

  it("keeps validation read-only while accepting an exact provisionable new owner", async () => {
    const create = vi.fn();
    const transaction = {
      organization: { findUnique: vi.fn().mockResolvedValue(null), create },
    };
    await expect(ownershipLinks(transaction, {
      id: null,
      managerName: "BC Partners",
      organizationName: "BC Partners",
      fundName: null,
      vehicleName: "BC-managed funds",
      stake: "Approximately 22%",
      investmentYear: 2025,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
    }, "VALIDATE")).resolves.toEqual({ organizationId: null, fundId: null });
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects unknown, historical, unpublished and incorrectly typed owner organizations", async () => {
    const owner = {
      id: null,
      managerName: "BC Partners",
      organizationName: "BC Partners",
      fundName: null,
      vehicleName: "BC-managed funds",
      stake: "Approximately 22%",
      investmentYear: 2025,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE" as const,
    };
    await expect(ownershipLinks({
      organization: { findUnique: vi.fn().mockResolvedValue(null) },
    }, { ...owner, managerName: "BC Partnerz", organizationName: "BC Partnerz" }, "APPLY"))
      .rejects.toThrow("does not exist: BC Partnerz");
    await expect(ownershipLinks({
      organization: { findUnique: vi.fn().mockResolvedValue(null) },
    }, { ...owner, id: "owner-existing" }, "APPLY"))
      .rejects.toThrow("existing ownership organization does not exist");
    await expect(ownershipLinks({
      organization: { findUnique: vi.fn().mockResolvedValue({
        id: "org-bc",
        name: "BC Partners",
        types: ["CORPORATE"],
        status: "PUBLISHED",
      }) },
    }, owner, "VALIDATE")).rejects.toThrow("incompatible type");
    await expect(ownershipLinks({
      organization: { findUnique: vi.fn().mockResolvedValue({
        id: "org-bc",
        name: "BC Partners",
        types: ["FUND_MANAGER"],
        status: "IN_REVIEW",
      }) },
    }, owner, "VALIDATE")).rejects.toThrow("not published");
  });
});

function approvedCorrection(input?: {
  before?: CompanyImage;
  after?: CompanyImage;
  actions?: ReconciliationProposal["actions"];
  retiredCompanyIds?: string[];
  relationMerges?: NonNullable<ReconciliationProposal["relationMerges"]>;
  reviewedSeedRetirements?: NonNullable<ReconciliationProposal["reviewedSeedRetirements"]>;
  executionLock?: ProposalExecutionLock;
  snapshot?: ProductionSnapshot;
}): {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
} {
  const snapshot = input?.snapshot ?? productionSnapshotFixture();
  const before = input?.before ?? companyImageFixture();
  const after = input?.after ?? companyImageFixture("Approved, corrected company overview.");
  const proposal = finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: "portco-2026-08-03",
    taskId: "company:acme",
    taskIndex: 1,
    asOfDate: "2026-08-03",
    generatedAt: FIXTURE_NOW,
    canonicalKey: "acme-infrastructure|united-states",
    companyName: after.name,
    actions: input?.actions ?? ["CORRECT_COMPANY"],
    sourceHoldingIds: ["001:acme-infrastructure"],
    retiredCompanyIds: input?.retiredCompanyIds ?? [],
    relationMerges: input?.relationMerges ?? [],
    ...(input?.reviewedSeedRetirements === undefined
      ? {}
      : { reviewedSeedRetirements: input.reviewedSeedRetirements }),
    rationale: "Apply the individually reviewed company after-image.",
    evidence: [{
      url: "https://acme.example.com/owners",
      purpose: "Current company identity and ownership.",
      supports: ["IDENTITY", "OWNERSHIP"],
    }],
    unresolvedQuestions: [],
    ledgerSha256: FIXTURE_SHA,
    productionSnapshotSha256: snapshot.snapshotSha256,
    currentCompanySnapshotSha256: companyImageSha256(before),
    ...(input?.executionLock === undefined ? {} : { executionLock: input.executionLock }),
    beforeImage: before,
    beforeImageSha256: companyImageSha256(before),
    afterImage: after,
    afterImageSha256: companyImageSha256(after),
  });
  const approval = finalizeApproval({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_APPROVAL",
    runId: proposal.runId,
    taskId: proposal.taskId,
    taskIndex: proposal.taskIndex,
    companyName: proposal.companyName,
    proposalSha256: proposal.proposalSha256,
    productionSnapshotSha256: proposal.productionSnapshotSha256,
    currentCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
    approvedAfterImageSha256: proposal.afterImageSha256,
    decision: "APPROVE",
    reviewedBy: "Mike Berry",
    reviewedAt: FIXTURE_NOW,
    reviewerNotes: "Individually approved.",
  }, proposal);
  return { proposal, approval };
}

function freshState(image = companyImageFixture()): FreshApplyState {
  const snapshot = productionSnapshotFixture();
  return {
    databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    target: { snapshot: snapshot.companies[0], image },
    retiredCompanies: [],
    createNameCountryMatches: [],
  };
}

function legacySeedCompany(name: string, country: string): PortCo {
  return {
    name,
    investmentFirm: "CPP Investments",
    sector: "Power & ET",
    subsector: "Renewable energy",
    region: "North America",
    country,
    ownershipVehicle: "Sustainable Energies",
    description: `${name} legacy seed description.`,
    status: "Active",
    countryTags: ["United States"],
  };
}

function retiredMergeFixture(): {
  snapshot: ProductionSnapshot;
  before: CompanyImage;
  retiredImage: CompanyImage;
  fresh: FreshApplyState;
} {
  const baseSnapshot = productionSnapshotFixture();
  const retiredSnapshotInput = {
    ...baseSnapshot.companies[0],
    id: "company_retired",
    seedKey: "acme duplicate|United States",
    name: "Acme Duplicate, LLC",
    companySnapshotSha256: "",
  };
  const { companySnapshotSha256: _ignored, ...retiredWithoutHash } = retiredSnapshotInput;
  const retiredSnapshot = {
    ...retiredWithoutHash,
    companySnapshotSha256: snapshotCompanySha256(retiredWithoutHash),
  };
  const snapshot = finalizeProductionSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
    asOfDate: baseSnapshot.asOfDate,
    capturedAt: baseSnapshot.capturedAt,
    readOnly: true,
    databaseTargetLabel: baseSnapshot.databaseTargetLabel,
    databaseTargetFingerprint: baseSnapshot.databaseTargetFingerprint,
    companies: [...baseSnapshot.companies, retiredSnapshot],
  });
  const before = companyImageFixture();
  const retiredImage = structuredClone(before);
  retiredImage.id = "company_retired";
  retiredImage.name = "Acme Duplicate, LLC";
  retiredImage.ownershipPeriods[0] = {
    ...retiredImage.ownershipPeriods[0],
    id: "owner_retired",
    stake: "49%",
  };
  retiredImage.milestones[0] = {
    ...retiredImage.milestones[0],
    id: "milestone_retired",
    date: "September 2020",
    sortDate: "2020-09-15T00:00:00.000Z",
    event: "3i invested in the Acme Infrastructure platform.",
  };
  retiredImage.citations[0].id = "citation_retired";
  const fresh = freshState(before);
  fresh.retiredCompanies = [{ snapshot: retiredSnapshot, image: retiredImage }];
  return { snapshot, before, retiredImage, fresh };
}

describe("approved PortCo apply planner", () => {
  it("binds the mutation plan to approval, target, full before-image, and exact actions", () => {
    const { proposal, approval } = approvedCorrection();
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    });
    expect(plan.mutations.map((mutation) => mutation.kind)).toEqual(["CORRECT_COMPANY"]);
    expect(plan.changedFields).toEqual(["description"]);
  });

  it("retracts only explicitly approved erroneous ownership while preserving it in revision inputs", () => {
    const before = companyImageFixture();
    const after = companyImageFixture("Approved correction after retracting a false pre-close owner.");
    after.ownershipPeriods = [];
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: ["CORRECT_COMPANY", "RETRACT_ERRONEOUS_OWNERSHIP"],
    });
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(before),
    });
    expect(proposal.beforeImage?.ownershipPeriods).toHaveLength(1);
    expect(plan.mutations).toEqual([
      expect.objectContaining({ kind: "CORRECT_COMPANY" }),
      expect.objectContaining({
        kind: "RETRACT_ERRONEOUS_OWNERSHIP",
        relationIds: ["owner_1"],
      }),
    ]);

    const missingAction = approvedCorrection({ before, after, actions: ["CORRECT_COMPANY"] });
    expect(() => planApprovedApply({
      proposal: missingAction.proposal,
      approval: missingAction.approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(before),
    })).toThrow(/Ownership history owner_1 is missing/);
  });

  it("rejects unsupported citation source types before opening the mutation path", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations[0].sourceType = "REPORT";
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/source type is not supported/i);
  });

  it("rejects unsupported citation purposes before opening the mutation path", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations[0].purpose = "OWNERSHIP_EXIT";
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/citation purpose is not supported/i);
  });

  it("rejects duplicate database citation keys before the transaction", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations.push({
      ...after.citations[0],
      id: "citation_duplicate",
      isPrimary: false,
    });
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/repeats a database citation key/i);
  });

  it("rejects stale same-count relation content using the full before-image hash", () => {
    const { proposal, approval } = approvedCorrection();
    const stale = structuredClone(companyImageFixture());
    stale.ownershipPeriods[0].stake = "51%";
    // The lightweight snapshot and all relation counts intentionally remain
    // unchanged, reproducing the class of race this gate must catch.
    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(stale),
    })).toThrow(/full target company image changed/i);
  });

  it("plans owner retirement/addition and pending add/resolve without deleting ownership history", () => {
    const before = structuredClone(companyImageFixture());
    before.pendingOwnershipTransactions = [{
      id: "pending_old",
      direction: "EXIT",
      transactionState: "SIGNED_PENDING_EXIT",
      counterpartyName: "Old Buyer",
      transactionDescription: "Signed sale awaiting closing.",
      announcedAt: null,
      expectedClosing: "2026",
      relatedOwnershipPeriodIds: ["owner_1"],
      evidenceUrls: ["https://acme.example.com/owners"],
    }];
    const after = structuredClone(before);
    after.description = "Approved correction.";
    after.ownershipPeriods[0] = {
      ...after.ownershipPeriods[0],
      transactionState: "REALIZED",
      isActive: false,
      exitYear: 2026,
    };
    after.ownershipPeriods.push({
      id: null,
      managerName: "New Infrastructure",
      organizationName: "New Infrastructure LP",
      fundName: "New Infrastructure Fund I",
      vehicleName: null,
      stake: "100%",
      investmentYear: 2026,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
    });
    after.pendingOwnershipTransactions = [{
      id: null,
      direction: "INCOMING",
      transactionState: "SIGNED_PENDING_INCOMING",
      counterpartyName: "Future Buyer",
      transactionDescription: "Signed acquisition awaiting closing.",
      announcedAt: null,
      expectedClosing: "2027",
      relatedOwnershipPeriodIds: [],
      evidenceUrls: ["https://acme.example.com/owners"],
    }];
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: [
        "CORRECT_COMPANY",
        "ADD_OWNER",
        "RETIRE_OWNERSHIP",
        "ADD_PENDING_TRANSACTION",
        "RESOLVE_PENDING_TRANSACTION",
      ],
    });
    const fresh = freshState(before);
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh,
    });
    expect(plan.mutations.map((mutation) => mutation.kind)).toEqual([
      "CORRECT_COMPANY",
      "ADD_OWNER",
      "RETIRE_OWNERSHIP",
      "ADD_PENDING_TRANSACTION",
      "RESOLVE_PENDING_TRANSACTION",
    ]);
  });

  it("ignores database-generated ids only for semantic post-apply comparison", () => {
    const approved = companyImageFixture();
    approved.id = null;
    approved.ownershipPeriods[0].id = null;
    const observed = structuredClone(approved);
    observed.id = "generated_company";
    observed.ownershipPeriods[0].id = "generated_owner";
    expect(semanticCompanyImageSha256(observed)).toBe(semanticCompanyImageSha256(approved));
  });

  it("treats an implicit direct-owner organization as its persisted manager organization", () => {
    const approved = companyImageFixture();
    approved.ownershipPeriods[0] = {
      ...approved.ownershipPeriods[0],
      managerName: "Kinder Morgan, Inc.",
      organizationName: null,
      fundName: null,
    };
    const observed = structuredClone(approved);
    observed.ownershipPeriods[0].organizationName = "Kinder Morgan, Inc.";

    expect(semanticCompanyImageSha256(observed)).toBe(semanticCompanyImageSha256(approved));
  });

  it("does not equate an implicit direct owner with a different explicit organization", () => {
    const approved = companyImageFixture();
    approved.ownershipPeriods[0] = {
      ...approved.ownershipPeriods[0],
      managerName: "Kinder Morgan, Inc.",
      organizationName: null,
      fundName: null,
    };
    const observed = structuredClone(approved);
    observed.ownershipPeriods[0].organizationName = "Different Holding Company";

    expect(semanticCompanyImageSha256(observed)).not.toBe(semanticCompanyImageSha256(approved));
  });

  it("does not infer a manager organization for a fund-linked owner", () => {
    const approved = companyImageFixture();
    approved.ownershipPeriods[0] = {
      ...approved.ownershipPeriods[0],
      managerName: "ArcLight Capital Partners",
      organizationName: null,
      fundName: "ArcLight Energy Partners Fund VII, L.P.",
    };
    const observed = structuredClone(approved);
    observed.ownershipPeriods[0].organizationName = "ArcLight Capital Partners";

    expect(semanticCompanyImageSha256(observed)).not.toBe(semanticCompanyImageSha256(approved));
  });

  it("treats relation evidence URLs as order-independent after database round-trip", () => {
    const approved = companyImageFixture();
    approved.milestones[0].evidenceUrls = [
      "https://example.com/second",
      "https://example.com/first",
    ];
    const observed = structuredClone(approved);
    observed.milestones[0].evidenceUrls.reverse();

    expect(semanticCompanyImageSha256(observed)).toBe(semanticCompanyImageSha256(approved));
  });

  it("plans a create only when the fresh database still has no name/country match", () => {
    const snapshot = productionSnapshotFixture();
    const after = structuredClone(companyImageFixture());
    after.id = null;
    for (const row of after.ownershipPeriods) row.id = null;
    for (const row of after.milestones) row.id = null;
    for (const row of after.citations) row.id = null;
    const proposal = finalizeProposal({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_PROPOSAL",
      methodologyVersion: "PORTCO_RECONCILIATION_V1",
      runId: "portco-2026-08-03",
      taskId: "company:create-acme",
      taskIndex: 2,
      asOfDate: "2026-08-03",
      generatedAt: FIXTURE_NOW,
      canonicalKey: "new-acme|united-states",
      companyName: after.name,
      actions: ["CREATE_COMPANY"],
      sourceHoldingIds: ["001:new-acme"],
      retiredCompanyIds: [],
      rationale: "Individually approved new company.",
      evidence: [{
        url: "https://acme.example.com/owners",
        purpose: "Identity and ownership.",
        supports: ["IDENTITY", "OWNERSHIP"],
      }],
      unresolvedQuestions: [],
      ledgerSha256: FIXTURE_SHA,
      productionSnapshotSha256: snapshot.snapshotSha256,
      currentCompanySnapshotSha256: null,
      beforeImage: null,
      beforeImageSha256: null,
      afterImage: after,
      afterImageSha256: companyImageSha256(after),
    });
    const approval = finalizeApproval({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_APPROVAL",
      runId: proposal.runId,
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposalSha256: proposal.proposalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      currentCompanySnapshotSha256: null,
      approvedAfterImageSha256: proposal.afterImageSha256,
      decision: "APPROVE",
      reviewedBy: "Mike Berry",
      reviewedAt: FIXTURE_NOW,
      reviewerNotes: "Approved.",
    }, proposal);
    const fresh: FreshApplyState = {
      databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
      target: null,
      retiredCompanies: [],
      createNameCountryMatches: [],
    };
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["CREATE_COMPANY"]);
    fresh.createNameCountryMatches = [freshState().target!];
    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    })).toThrow(/already matches/i);
  });

  it("plans ownership retirement and realization as separate history-preserving operations", () => {
    const before = companyImageFixture();
    const after = structuredClone(before);
    after.companyStatus = "REALIZED";
    after.ownershipPeriods[0] = {
      ...after.ownershipPeriods[0],
      isActive: false,
      transactionState: "REALIZED",
      exitYear: 2026,
    };
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: ["RETIRE_OWNERSHIP", "REALIZE_COMPANY"],
    });
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(before),
    }).mutations.map((mutation) => mutation.kind)).toEqual([
      "RETIRE_OWNERSHIP",
      "REALIZE_COMPANY",
    ]);
  });

  it("plans a canonical merge while requiring retired ownership and milestones in the after-image", () => {
    const baseSnapshot = productionSnapshotFixture();
    const retiredSnapshotInput = {
      ...baseSnapshot.companies[0],
      id: "company_retired",
      seedKey: "acme duplicate|United States",
      name: "Acme Duplicate, LLC",
      companySnapshotSha256: "",
    };
    const { companySnapshotSha256: _ignored, ...retiredWithoutHash } = retiredSnapshotInput;
    const retiredSnapshot = {
      ...retiredWithoutHash,
      companySnapshotSha256: snapshotCompanySha256(retiredWithoutHash),
    };
    const snapshot = finalizeProductionSnapshot({
      schemaVersion: 1,
      artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
      asOfDate: baseSnapshot.asOfDate,
      capturedAt: baseSnapshot.capturedAt,
      readOnly: true,
      databaseTargetLabel: baseSnapshot.databaseTargetLabel,
      databaseTargetFingerprint: baseSnapshot.databaseTargetFingerprint,
      companies: [...baseSnapshot.companies, retiredSnapshot],
    });
    const before = companyImageFixture();
    const retiredImage = structuredClone(before);
    retiredImage.id = "company_retired";
    retiredImage.name = "Acme Duplicate, LLC";
    retiredImage.ownershipPeriods[0].id = "owner_retired";
    retiredImage.ownershipPeriods[0].stake = "49%";
    retiredImage.milestones[0].id = "milestone_retired";
    retiredImage.milestones[0].event = "Duplicate record milestone retained by merge.";
    retiredImage.citations[0].id = "citation_retired";
    const after = structuredClone(before);
    after.ownershipPeriods.push(retiredImage.ownershipPeriods[0]);
    after.milestones.push(retiredImage.milestones[0]);
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    const fresh = freshState(before);
    fresh.retiredCompanies = [{ snapshot: retiredSnapshot, image: retiredImage }];
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["MERGE_COMPANIES"]);

    const correctedRetiredAfter = structuredClone(after);
    correctedRetiredAfter.ownershipPeriods[1].stake = "51%";
    const correctedRetired = approvedCorrection({
      before,
      after: correctedRetiredAfter,
      actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    expect(planApprovedApply({
      ...correctedRetired,
      approvedProductionSnapshot: snapshot,
      fresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["CORRECT_COMPANY", "MERGE_COMPANIES"]);

    // Re-finalization would change the proposal hash; directly testing the
    // preservation guard through a newly approved proposal keeps lineage real.
    const broken = approvedCorrection({
      before,
      after: { ...after, ownershipPeriods: before.ownershipPeriods },
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    expect(() => planApprovedApply({
      ...broken,
      approvedProductionSnapshot: snapshot,
      fresh,
    })).toThrow(/ownership.*(history|periods)/i);

    const exactRetiredImage = structuredClone(before);
    exactRetiredImage.id = "company_retired";
    exactRetiredImage.name = "Acme Duplicate, LLC";
    exactRetiredImage.ownershipPeriods[0].id = "owner_retired_exact_duplicate";
    exactRetiredImage.milestones[0].id = "milestone_retired_exact_duplicate";
    exactRetiredImage.citations[0].id = "citation_retired_exact_duplicate";
    const exactAfter = structuredClone(before);
    exactAfter.milestones.push(...exactRetiredImage.milestones);
    const exactDuplicate = approvedCorrection({
      before,
      after: exactAfter,
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      relationMerges: [{
        kind: "OWNERSHIP_PERIOD",
        retiredRelationId: "owner_retired_exact_duplicate",
        canonicalRelationId: "owner_1",
        rationale: "The retired row duplicates the canonical 3i ownership period.",
      }],
      snapshot,
    });
    const exactDuplicateFresh = freshState(before);
    exactDuplicateFresh.retiredCompanies = [{
      snapshot: retiredSnapshot,
      image: exactRetiredImage,
    }];
    expect(planApprovedApply({
      ...exactDuplicate,
      approvedProductionSnapshot: snapshot,
      fresh: exactDuplicateFresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["MERGE_COMPANIES"]);
  });

  it("allows only proposal-bound compatible ownership and milestone mappings to retire duplicate relations", () => {
    const { snapshot, before, fresh } = retiredMergeFixture();
    const relationMerges: NonNullable<ReconciliationProposal["relationMerges"]> = [{
      kind: "OWNERSHIP_PERIOD",
      retiredRelationId: "owner_retired",
      canonicalRelationId: "owner_1",
      rationale: "Both rows represent the same 3i ownership period.",
    }, {
      kind: "MILESTONE",
      retiredRelationId: "milestone_retired",
      canonicalRelationId: "milestone_1",
      rationale: "Both rows describe 3i's 2020 investment milestone.",
    }];
    const approved = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      relationMerges,
      snapshot,
    });

    const plan = planApprovedApply({
      ...approved,
      approvedProductionSnapshot: snapshot,
      fresh,
    });
    expect(plan.mutations.map((mutation) => mutation.kind)).toEqual(["MERGE_COMPANIES"]);
    expect(plan.proposal.relationMerges).toEqual(relationMerges);

    const unmapped = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    expect(() => planApprovedApply({
      ...unmapped,
      approvedProductionSnapshot: snapshot,
      fresh,
    })).toThrow(/retired ownership period history owner_retired/i);
  });

  it("rejects missing, mis-typed, or incompatible retired relation mappings", () => {
    const { snapshot, before, fresh } = retiredMergeFixture();
    const proposalFor = (relationMerges: NonNullable<ReconciliationProposal["relationMerges"]>) =>
      approvedCorrection({
        before,
        after: structuredClone(before),
        actions: ["MERGE_COMPANIES"],
        retiredCompanyIds: ["company_retired"],
        relationMerges,
        snapshot,
      });
    const apply = (approved: ReturnType<typeof proposalFor>, state = fresh) => planApprovedApply({
      ...approved,
      approvedProductionSnapshot: snapshot,
      fresh: state,
    });

    expect(() => apply(proposalFor([{
      kind: "OWNERSHIP_PERIOD",
      retiredRelationId: "owner_missing",
      canonicalRelationId: "owner_1",
      rationale: "Invalid missing relation fixture.",
    }]))).toThrow(/does not exist in a reviewed retired company/i);

    expect(() => apply(proposalFor([{
      kind: "MILESTONE",
      retiredRelationId: "owner_retired",
      canonicalRelationId: "milestone_1",
      rationale: "Invalid relation kind fixture.",
    }]))).toThrow(/ownership period, not a milestone/i);

    expect(() => apply(proposalFor([{
      kind: "OWNERSHIP_PERIOD",
      retiredRelationId: "owner_retired",
      canonicalRelationId: "owner_missing",
      rationale: "Invalid canonical relation fixture.",
    }]))).toThrow(/canonical ownership relation owner_missing/i);

    const wrongOwner = structuredClone(fresh);
    wrongOwner.retiredCompanies[0].image.ownershipPeriods[0].organizationName = "Different Owner LLC";
    expect(() => apply(proposalFor([{
      kind: "OWNERSHIP_PERIOD",
      retiredRelationId: "owner_retired",
      canonicalRelationId: "owner_1",
      rationale: "Invalid owner identity fixture.",
    }]), wrongOwner)).toThrow(/different owner identity/i);

    const wrongMilestone = structuredClone(fresh);
    wrongMilestone.retiredCompanies[0].image.milestones[0].event = "A wholly unrelated expansion occurred.";
    expect(() => apply(proposalFor([{
      kind: "MILESTONE",
      retiredRelationId: "milestone_retired",
      canonicalRelationId: "milestone_1",
      rationale: "Invalid milestone identity fixture.",
    }]), wrongMilestone)).toThrow(/incompatible milestone identity/i);

    const wrongMilestoneCategory = structuredClone(fresh);
    wrongMilestoneCategory.retiredCompanies[0].image.milestones[0].category = "Expansion";
    expect(() => apply(proposalFor([{
      kind: "MILESTONE",
      retiredRelationId: "milestone_retired",
      canonicalRelationId: "milestone_1",
      rationale: "Invalid milestone category fixture.",
    }]), wrongMilestoneCategory)).toThrow(/incompatible category/i);

    const wrongMilestoneDate = structuredClone(fresh);
    wrongMilestoneDate.retiredCompanies[0].image.milestones[0].date = "September 2019";
    wrongMilestoneDate.retiredCompanies[0].image.milestones[0].sortDate = "2019-09-15T00:00:00.000Z";
    expect(() => apply(proposalFor([{
      kind: "MILESTONE",
      retiredRelationId: "milestone_retired",
      canonicalRelationId: "milestone_1",
      rationale: "Invalid milestone date fixture.",
    }]), wrongMilestoneDate)).toThrow(/incompatible date/i);
  });

  it("rejects relation mappings outside a company merge", () => {
    expect(() => approvedCorrection({
      relationMerges: [{
        kind: "OWNERSHIP_PERIOD",
        retiredRelationId: "owner_retired",
        canonicalRelationId: "owner_1",
        rationale: "Mappings require an explicit company merge.",
      }],
    })).toThrow(/valid only for MERGE_COMPANIES/i);
  });

  it("derives a merge mutation for a reviewed seed-only retirement without fake database ids", () => {
    const before = companyImageFixture();
    const seedDuplicate = legacySeedCompany("Acme Infrastructure Legacy", "United States");
    const retirement = {
      sourceQueueTaskId: "ledger:0485:acme-legacy",
      sourceQueueEntrySha256: "a".repeat(64),
      name: seedDuplicate.name,
      country: seedDuplicate.country,
      rawSeedEntrySha256: sha256Canonical(seedDuplicate),
      evaluatedSeedEntrySha256: sha256Canonical(seedDuplicate),
    };
    const { proposal, approval } = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      reviewedSeedRetirements: [retirement],
    });

    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(before),
    });
    expect(plan.retiredCompanyIds).toEqual([]);
    expect(plan.mutations).toEqual([expect.objectContaining({
      kind: "MERGE_COMPANIES",
      relationIds: [`seed:${retirement.sourceQueueTaskId}`],
    })]);
    expect(plan.changedFields).toContain("seedIdentities");
  });
});

describe("approved local seed after-image", () => {
  it("retains the full canonical image and verifies the same approved hash", () => {
    const { proposal, approval } = approvedCorrection();
    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());
    const text = renderApprovedSeedArtifact([], entry);
    verifyApprovedSeedText(text, entry);
    expect(entry.canonicalAfterImage).toEqual(proposal.afterImage);
    expect(entry.afterImageSha256).toBe(proposal.afterImageSha256);
  });

  it("publishes an archived after-image as a seed removal", () => {
    const archived = companyImageFixture("Archived outside the North American census scope.");
    archived.recordStatus = "ARCHIVED";
    archived.companyStatus = "REALIZED";
    archived.ownershipPeriods = [];
    const { proposal, approval } = approvedCorrection({ after: archived });

    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());

    expect(entry.operation).toBe("ARCHIVE");
    expect(entry.canonicalAfterImage.recordStatus).toBe("ARCHIVED");
    expect(entry.company.owners).toEqual([]);
    expect(entry.company.investmentFirm).toBe("Not applicable");
  });

  it("rejects an ownerless published after-image", () => {
    const published = companyImageFixture("A published company still requires ownership evidence.");
    published.ownershipPeriods = [];
    const { proposal, approval } = approvedCorrection({ after: published });

    expect(() => buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture()))
      .toThrow(/published approved seed company requires at least one ownership period/i);
  });

  it("retires the previous seed identity when an approved company is renamed", () => {
    const before = companyImageFixture();
    const after = { ...before, name: "Renamed Infrastructure" };
    const { proposal, approval } = approvedCorrection({ before, after });

    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());

    expect(entry.operation).toBe("UPSERT");
    expect(entry.company.name).toBe("Renamed Infrastructure");
    expect(entry.retiredCompanies).toEqual([{
      name: before.name,
      country: before.country,
    }]);
  });

  it("retires a proposal-bound legacy seed identity when production already uses the canonical name", () => {
    const before = companyImageFixture();
    const legacyTarget = legacySeedCompany("Acme Infrastructure Inc.", before.country);
    const funds: ProposalExecutionLock["funds"] = [];
    const organizations: ProposalExecutionLock["organizations"] = [];
    const redirects: ProposalExecutionLock["redirects"] = [];
    const dependencies = {
      ownershipPeriodsSha256: sha256Canonical(before.ownershipPeriods),
      pendingTransactionsSha256: sha256Canonical(before.pendingOwnershipTransactions),
      fundsSha256: sha256Canonical(funds),
      organizationsSha256: sha256Canonical(organizations),
      citationsSha256: sha256Canonical(before.citations),
      redirectsSha256: sha256Canonical(redirects),
    };
    const executionLock: ProposalExecutionLock = {
      taskSnapshotSha256: "1".repeat(64),
      taskStateSha256: "2".repeat(64),
      taskDependencySha256: sha256Canonical(dependencies),
      seedEntrySha256: sha256Canonical(legacyTarget),
      dependencies,
      funds,
      organizations,
      redirects,
    };
    const { proposal, approval } = approvedCorrection({
      before,
      after: structuredClone(before),
      executionLock,
    });

    const entry = buildApprovedSeedEntry(
      proposal,
      approval,
      productionSnapshotFixture(),
      [legacyTarget],
    );

    expect(entry.retiredCompanies).toEqual([{
      name: legacyTarget.name,
      country: legacyTarget.country,
    }]);
    expect(() => verifyApprovedSeedProjection({
      artifact: [],
      expectedEntry: entry,
      rawSeedCompanies: [legacyTarget],
    })).not.toThrow();
  });

  it("verifies raw and evaluated seed-only retirements and leaves one canonical after-image", () => {
    const duplicateLp = legacySeedCompany("Pattern Energy Group LP", "United States");
    const duplicateGroup = legacySeedCompany("Pattern Energy Group", "United States / Canada");
    const reviewedSeedRetirements = [duplicateGroup, duplicateLp].map((company, index) => ({
      sourceQueueTaskId: `ledger:${485 + index}:pattern-seed-duplicate`,
      sourceQueueEntrySha256: `${index + 1}`.repeat(64),
      name: company.name,
      country: company.country,
      rawSeedEntrySha256: sha256Canonical(company),
      evaluatedSeedEntrySha256: sha256Canonical(company),
    }));
    const before = companyImageFixture();
    const { proposal, approval } = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      reviewedSeedRetirements,
    });
    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());

    expect(entry.operation).toBe("MERGE");
    expect(entry.retiredCompanies).toEqual(reviewedSeedRetirements.map(({ name, country }) => ({ name, country })));
    expect(() => verifyApprovedSeedProjection({
      artifact: [],
      expectedEntry: entry,
      rawSeedCompanies: [duplicateLp, duplicateGroup],
    })).not.toThrow();
  });

  it("rejects seed-entry hash drift and any hand-edited retired identity list", () => {
    const duplicate = legacySeedCompany("Pattern Energy Group", "United States / Canada");
    const before = companyImageFixture();
    const { proposal, approval } = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      reviewedSeedRetirements: [{
        sourceQueueTaskId: "ledger:0485:pattern-seed-duplicate",
        sourceQueueEntrySha256: "a".repeat(64),
        name: duplicate.name,
        country: duplicate.country,
        rawSeedEntrySha256: sha256Canonical(duplicate),
        evaluatedSeedEntrySha256: sha256Canonical(duplicate),
      }],
    });
    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());
    const drifted = { ...duplicate, description: "Changed after approval." };
    expect(() => verifyApprovedSeedProjection({
      artifact: [],
      expectedEntry: entry,
      rawSeedCompanies: [drifted],
    })).toThrow(/raw seed entry changed/i);

    const rendered = JSON.parse(renderApprovedSeedArtifact([], entry)) as Array<Record<string, unknown>>;
    rendered[0] = { ...rendered[0], retiredCompanies: [] };
    expect(() => verifyApprovedSeedText(`${JSON.stringify(rendered)}\n`, entry))
      .toThrow(/exactly match the proposal-derived entry/i);
  });

  it("removes only the superseded staged proposal for the same exact task", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    try {
      const oldApproved = approvedCorrection();
      const newApproved = approvedCorrection({
        after: companyImageFixture("The corrected replacement after-image."),
      });
      const oldEntry = buildApprovedSeedEntry(oldApproved.proposal, oldApproved.approval);
      const newEntry = buildApprovedSeedEntry(newApproved.proposal, newApproved.approval);
      const unrelatedProposalSha256 = "f".repeat(64);
      const unrelatedEntry = { ...newEntry, proposalSha256: unrelatedProposalSha256 };
      await writeFile(
        artifactPath,
        `${JSON.stringify([oldEntry, newEntry, unrelatedEntry], null, 2)}\n`,
        "utf8",
      );

      const result = await supersedeStagedApprovedSeedAfterImage({
        artifactPath,
        supersededProposal: oldApproved.proposal,
        supersededApproval: oldApproved.approval,
        supersedingProposal: newApproved.proposal,
        supersedingApproval: newApproved.approval,
        approvedProductionSnapshot: productionSnapshotFixture(),
      });
      const remaining = JSON.parse(await readFile(artifactPath, "utf8")) as Array<{ proposalSha256: string }>;
      expect(result.removedProposalSha256).toBe(oldApproved.proposal.proposalSha256);
      expect(remaining.map((entry) => entry.proposalSha256)).toEqual([
        newApproved.proposal.proposalSha256,
        unrelatedProposalSha256,
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("atomically replaces a staged seed-retirement proposal before its aliases disappear", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-replace-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    const patternGroup = baseCompanies.find((company) =>
      company.name === "Pattern Energy Group" && company.country === "United States / Canada")!;
    const patternLp = baseCompanies.find((company) =>
      company.name === "Pattern Energy Group LP" && company.country === "United States")!;
    const retirement = (company: PortCo, taskId: string) => ({
      sourceQueueTaskId: taskId,
      sourceQueueEntrySha256: taskId.endsWith("485") ? "a".repeat(64) : "b".repeat(64),
      name: company.name,
      country: company.country,
      rawSeedEntrySha256: sha256Canonical(company),
      evaluatedSeedEntrySha256: sha256Canonical(company),
    });
    try {
      const oldApproved = approvedCorrection({
        before: companyImageFixture(),
        after: companyImageFixture("Old reviewed canonical after-image."),
        actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
        reviewedSeedRetirements: [retirement(patternGroup, "task-485")],
      });
      const newApproved = approvedCorrection({
        before: companyImageFixture(),
        after: companyImageFixture("Superseding reviewed canonical after-image."),
        actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
        reviewedSeedRetirements: [
          retirement(patternGroup, "task-485"),
          retirement(patternLp, "task-486"),
        ],
      });
      const oldEntry = buildApprovedSeedEntry(oldApproved.proposal, oldApproved.approval);
      const newEntry = buildApprovedSeedEntry(newApproved.proposal, newApproved.approval);
      await writeFile(artifactPath, `${JSON.stringify([oldEntry], null, 2)}\n`, "utf8");

      await supersedeStagedApprovedSeedAfterImage({
        artifactPath,
        supersededProposal: oldApproved.proposal,
        supersededApproval: oldApproved.approval,
        supersedingProposal: newApproved.proposal,
        supersedingApproval: newApproved.approval,
        approvedProductionSnapshot: productionSnapshotFixture(),
      });

      const stored = JSON.parse(await readFile(artifactPath, "utf8")) as Array<Record<string, unknown>>;
      expect(stored).toHaveLength(1);
      expect(stored[0].proposalSha256).toBe(newApproved.proposal.proposalSha256);
      expect(sha256Canonical(stored[0])).toBe(sha256Canonical(newEntry));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("atomically supersedes a staged merge proposal using the proposal-bound production snapshot", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-merge-replace-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    const baseSnapshot = productionSnapshotFixture();
    const { companySnapshotSha256: _existingSnapshotSha256, ...baseCompanyWithoutHash }
      = baseSnapshot.companies[0];
    const retiredWithoutHash = {
      ...baseCompanyWithoutHash,
      id: "company_retired",
      seedKey: "retired infrastructure|United States",
      name: "Retired Infrastructure, LLC",
    };
    const retired = {
      ...retiredWithoutHash,
      companySnapshotSha256: snapshotCompanySha256(retiredWithoutHash),
    };
    const snapshot = finalizeProductionSnapshot({
      ...baseSnapshot,
      companies: [...baseSnapshot.companies, retired],
    });
    try {
      const oldApproved = approvedCorrection({
        snapshot,
        actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
        retiredCompanyIds: [retired.id],
      });
      const newApproved = approvedCorrection({
        snapshot,
        after: companyImageFixture("Superseding merged after-image."),
        actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
        retiredCompanyIds: [retired.id],
      });
      const oldEntry = buildApprovedSeedEntry(oldApproved.proposal, oldApproved.approval, snapshot);
      await writeFile(artifactPath, `${JSON.stringify([oldEntry], null, 2)}\n`, "utf8");

      await supersedeStagedApprovedSeedAfterImage({
        artifactPath,
        supersededProposal: oldApproved.proposal,
        supersededApproval: oldApproved.approval,
        supersedingProposal: newApproved.proposal,
        supersedingApproval: newApproved.approval,
        approvedProductionSnapshot: snapshot,
      });

      const stored = JSON.parse(await readFile(artifactPath, "utf8")) as Array<Record<string, unknown>>;
      expect(stored).toHaveLength(1);
      expect(stored[0].proposalSha256).toBe(newApproved.proposal.proposalSha256);
      expect(stored[0].retiredCompanies).toEqual([{
        name: retired.name,
        country: retired.country,
      }]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("unstages only the exact failed proposal without touching unrelated entries", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    try {
      const approved = approvedCorrection();
      const snapshot = productionSnapshotFixture();
      const staged = buildApprovedSeedEntry(approved.proposal, approved.approval, snapshot);
      const unrelated = { ...staged, proposalSha256: "f".repeat(64) };
      await writeFile(
        artifactPath,
        `${JSON.stringify([unrelated, staged], null, 2)}\n`,
        "utf8",
      );

      const result = await removeStagedApprovedSeedAfterImage({
        artifactPath,
        proposal: approved.proposal,
        approval: approved.approval,
        approvedProductionSnapshot: snapshot,
      });
      const remaining = JSON.parse(await readFile(artifactPath, "utf8")) as Array<{ proposalSha256: string }>;
      expect(result.removedProposalSha256).toBe(approved.proposal.proposalSha256);
      expect(remaining).toEqual([unrelated]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("approved apply coordinator", () => {
  it("orders seed publication before a serializable transaction and verifies DB, seed, and API before receipt", async () => {
    const { proposal, approval } = approvedCorrection();
    const snapshot = productionSnapshotFixture();
    const events: string[] = [];
    const release: ProductionReleaseEvidence = {
      targetDatabase: "production",
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: approval.approvalSha256,
      seedArtifactCommitted: true,
      seedArtifactPushed: true,
      committedSeedArtifactSha256: "d".repeat(64),
      releaseSha: "e".repeat(40),
    };
    const dependencies: ApprovedApplyDependencies<{ id: string }> = {
      publishSeed: async () => {
        events.push("seed:publish");
        return {
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          afterImageSha256: proposal.afterImageSha256!,
          proposalSha256: proposal.proposalSha256,
          approvalSha256: approval.approvalSha256,
        };
      },
      verifyPublishedSeed: async () => { events.push("seed:verify"); },
      verifyRelease: async () => { events.push("release:verify"); return release; },
      runSerializable: async (work) => {
        events.push("tx:start");
        const result = await work({ id: "tx" });
        events.push("tx:commit");
        return result;
      },
      store: {
        loadFreshState: async () => { events.push("db:fresh"); return freshState(); },
        applyMutationPlan: async () => { events.push("db:apply"); return { companyId: "company_acme" }; },
        loadAppliedCompanyImage: async () => { events.push("db:verify"); return proposal.afterImage!; },
        createCompanyRevision: async () => { events.push("db:revision"); return { id: "revision_1" }; },
        createAuditEvent: async () => { events.push("db:audit"); return { id: "audit_1" }; },
      },
      verifyDetailApi: async () => { events.push("api:verify"); },
      now: () => new Date(FIXTURE_NOW),
      transactionId: () => "transaction_1",
    };
    const receipt = await executeApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      gate: {
        explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: snapshot.databaseTargetFingerprint,
        release,
      },
      dependencies,
    });
    expect(events).toEqual([
      "seed:publish",
      "seed:verify",
      "release:verify",
      "tx:start",
      "db:fresh",
      "db:apply",
      "db:verify",
      "db:revision",
      "db:audit",
      "tx:commit",
      "seed:verify",
      "api:verify",
    ]);
    expect(receipt.verification).toEqual({
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    });
    expect(receipt.companyId).toBe("company_acme");
  });

  it("preserves complete retired before-images in the merge revision and audit event", async () => {
    const { snapshot, before, retiredImage, fresh } = retiredMergeFixture();
    const { proposal, approval } = approvedCorrection({
      before,
      after: structuredClone(before),
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      relationMerges: [{
        kind: "OWNERSHIP_PERIOD",
        retiredRelationId: "owner_retired",
        canonicalRelationId: "owner_1",
        rationale: "Both rows represent the same 3i ownership period.",
      }, {
        kind: "MILESTONE",
        retiredRelationId: "milestone_retired",
        canonicalRelationId: "milestone_1",
        rationale: "Both rows describe 3i's 2020 investment milestone.",
      }],
      snapshot,
    });
    const release: ProductionReleaseEvidence = {
      targetDatabase: "production",
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: approval.approvalSha256,
      seedArtifactCommitted: true,
      seedArtifactPushed: true,
      committedSeedArtifactSha256: "d".repeat(64),
      releaseSha: "e".repeat(40),
    };
    let revision: CompanyRevisionWrite | undefined;
    let audit: AuditEventWrite | undefined;

    await executeApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      gate: {
        explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: snapshot.databaseTargetFingerprint,
        release,
      },
      dependencies: {
        publishSeed: async () => ({
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          afterImageSha256: proposal.afterImageSha256!,
          proposalSha256: proposal.proposalSha256,
          approvalSha256: approval.approvalSha256,
        }),
        verifyPublishedSeed: async () => undefined,
        verifyRelease: async () => release,
        runSerializable: async (work) => await work({ id: "tx" }),
        store: {
          loadFreshState: async () => fresh,
          applyMutationPlan: async () => ({ companyId: "company_acme" }),
          loadAppliedCompanyImage: async () => proposal.afterImage!,
          createCompanyRevision: async (_transaction, write) => {
            revision = write;
            return { id: "revision_1" };
          },
          createAuditEvent: async (_transaction, write) => {
            audit = write;
            return { id: "audit_1" };
          },
        },
        verifyDetailApi: async () => undefined,
        now: () => new Date(FIXTURE_NOW),
        transactionId: () => "transaction_1",
      },
    });

    expect(revision?.beforeJson).toEqual({
      artifactType: "PORTCO_MERGE_REVISION_BEFORE_IMAGES",
      canonicalCompany: before,
      retiredCompanies: [retiredImage],
      relationMerges: proposal.relationMerges,
    });
    expect(audit?.changes.retiredCompanyBeforeImages).toEqual([retiredImage]);
    expect(audit?.changes.relationMerges).toEqual(proposal.relationMerges);
  });

  it("refuses production before the exact seed artifact is committed and pushed", async () => {
    const { proposal, approval } = approvedCorrection();
    const snapshot = productionSnapshotFixture();
    const transaction = vi.fn();
    const release: ProductionReleaseEvidence = {
      targetDatabase: "production",
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: approval.approvalSha256,
      seedArtifactCommitted: false,
      seedArtifactPushed: false,
      committedSeedArtifactSha256: null,
      releaseSha: null,
    };
    await expect(executeApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      gate: {
        explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: snapshot.databaseTargetFingerprint,
        release,
      },
      dependencies: {
        publishSeed: async () => ({
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          afterImageSha256: proposal.afterImageSha256!,
          proposalSha256: proposal.proposalSha256,
          approvalSha256: approval.approvalSha256,
        }),
        verifyPublishedSeed: async () => undefined,
        verifyRelease: async () => release,
        runSerializable: transaction,
        store: {} as never,
        verifyDetailApi: async () => undefined,
      },
    })).rejects.toThrow(/committed and pushed/i);
    expect(transaction).not.toHaveBeenCalled();
  });
});
