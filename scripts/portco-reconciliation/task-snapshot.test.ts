import { describe, expect, it } from "vitest";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import type { ProposalQueueIndexArtifact } from "./execution-control";
import { sha256Canonical } from "./hash";
import {
  assertReviewedPostQueueExactIdentity,
  assertExpectedSeedEntry,
  matchesImmutableTaskIdentity,
  resolveSeedRetirementCandidates,
  resolveTaskSnapshotTarget,
  resolvedTaskSeedKeys,
  resolvedTaskCanonicalKey,
} from "./task-snapshot";
import type { CompanyImage } from "./schema";

type QueueEntry = ProposalQueueIndexArtifact["entries"][number];

function entry(input: Partial<QueueEntry> & Pick<QueueEntry, "taskId" | "canonicalKey">): QueueEntry {
  return {
    taskIndex: 1,
    companyName: "Pattern Energy",
    country: "United States",
    decisionStatus: "NEEDS_REVIEW",
    queueKind: "CANONICAL_COMPANY",
    earliestManagerIndex: 1,
    managers: [],
    actionScopes: { company: [], ownership: [], verification: [] },
    sourceHoldingIds: [],
    sourceRepoOnlyIds: [],
    productionCompanyIds: [],
    seedKeys: [],
    evidenceUrls: [],
    candidateCanonicalKeys: [],
    rationale: "Identity review required.",
    unresolvedQuestions: [],
    ...input,
  };
}

function seedCompany(name: string, country: string): PortCo {
  return {
    name,
    investmentFirm: "CPP Investments",
    sector: "Power & ET",
    subsector: "Renewable energy",
    region: "North America",
    country,
    ownershipVehicle: "Sustainable Energies",
    description: `${name} description.`,
    status: "Active",
    countryTags: ["United States"],
  };
}

describe("task snapshot target resolution", () => {
  it("uses the immutable queue target and rejects an attempt to replace it", () => {
    const active = entry({
      taskId: "task-direct",
      canonicalKey: "pattern-energy|united-states",
      productionCompanyIds: ["company-pattern"],
    });

    expect(resolveTaskSnapshotTarget({ queueEntry: active, queueEntries: [active] })).toEqual({
      method: "IMMUTABLE_QUEUE_TARGET",
      targetCompanyId: "company-pattern",
      linkedQueueTaskId: null,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-other",
    })).toThrow("cannot replace the immutable queue target");
  });

  it("pins a reviewed repo-only merge to the existing canonical survivor", () => {
    const active = entry({
      taskId: "task-arbour",
      canonicalKey: "arbour-heights|canada",
      companyName: "Arbour Heights",
      country: "Canada",
      productionCompanyIds: ["company-arbour"],
      seedKeys: ["arbour heights|Canada"],
      sourceRepoOnlyIds: ["repo-only-arbour"],
      actionScopes: { company: ["MERGE_COMPANIES"], ownership: [], verification: [] },
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-platform",
    })).toEqual({
      method: "REVIEWED_MERGE_CANONICAL_TARGET",
      targetCompanyId: "company-platform",
      linkedQueueTaskId: null,
      immutableRetiredCompanyId: "company-arbour",
    });
  });

  it("pins a mixed holding/repo-only project duplicate to one later manager-level survivor", () => {
    const active = entry({
      taskIndex: 117,
      taskId: "task-etobicoke-project",
      canonicalKey: "etobicoke-project|canada",
      companyName: "Etobicoke General Hospital Patient Tower",
      country: "Canada",
      managers: ["Axium Infrastructure", "CVC", "DIF"],
      productionCompanyIds: ["company-etobicoke-project"],
      seedKeys: ["etobicoke general hospital patient tower|Canada"],
      sourceHoldingIds: ["holding-axium-etobicoke"],
      sourceRepoOnlyIds: ["repo-only-cvc-etobicoke", "repo-only-dif-etobicoke"],
      actionScopes: { company: ["MERGE_COMPANIES"], ownership: [], verification: [] },
      rationale: "CVC and DIF identify the patient tower as the project beneath Etobicoke Healthcare Partnership.",
    });
    const survivor = entry({
      taskIndex: 203,
      taskId: "task-etobicoke-partnership",
      canonicalKey: "etobicoke-healthcare-partnership|canada",
      companyName: "Etobicoke Healthcare Partnership",
      country: "Canada",
      managers: ["CVC", "DIF"],
      productionCompanyIds: ["company-etobicoke-partnership"],
      seedKeys: ["etobicoke healthcare partnership|Canada"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, survivor],
      reviewedTargetCompanyId: "company-etobicoke-partnership",
    })).toEqual({
      method: "REVIEWED_MERGE_CANONICAL_TARGET",
      targetCompanyId: "company-etobicoke-partnership",
      linkedQueueTaskId: null,
      immutableRetiredCompanyId: "company-etobicoke-project",
    });
  });

  it.each([
    { label: "survivor is earlier", survivor: { taskIndex: 100 } },
    { label: "survivor country differs", survivor: { country: "United States" } },
    { label: "survivor manager is outside the active task", survivor: { managers: ["Unrelated Manager"] } },
    { label: "rationale does not name the survivor", active: { rationale: "Consolidation review required." } },
    { label: "more than one source holding", active: { sourceHoldingIds: ["holding-one", "holding-two"] } },
  ])("rejects an unsafe mixed holding merge when $label", ({ active: activeOverride = {}, survivor: survivorOverride = {} }) => {
    const active = entry({
      taskIndex: 117,
      taskId: "task-etobicoke-project",
      canonicalKey: "etobicoke-project|canada",
      companyName: "Etobicoke General Hospital Patient Tower",
      country: "Canada",
      managers: ["Axium Infrastructure", "CVC", "DIF"],
      productionCompanyIds: ["company-etobicoke-project"],
      seedKeys: ["etobicoke general hospital patient tower|Canada"],
      sourceHoldingIds: ["holding-axium-etobicoke"],
      sourceRepoOnlyIds: ["repo-only-cvc-etobicoke"],
      actionScopes: { company: ["MERGE_COMPANIES"], ownership: [], verification: [] },
      rationale: "The patient tower is beneath Etobicoke Healthcare Partnership.",
      ...activeOverride,
    });
    const survivor = entry({
      taskIndex: 203,
      taskId: "task-etobicoke-partnership",
      canonicalKey: "etobicoke-healthcare-partnership|canada",
      companyName: "Etobicoke Healthcare Partnership",
      country: "Canada",
      managers: ["CVC", "DIF"],
      productionCompanyIds: ["company-etobicoke-partnership"],
      seedKeys: ["etobicoke healthcare partnership|Canada"],
      ...survivorOverride,
    });

    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, survivor],
      reviewedTargetCompanyId: "company-etobicoke-partnership",
    })).toThrow("cannot replace the immutable queue target");
  });

  it.each([
    { decisionStatus: "READY_FOR_PROPOSAL" as const },
    { sourceRepoOnlyIds: [] },
    { sourceHoldingIds: ["holding-arbour"] },
    { seedKeys: [] },
    { candidateCanonicalKeys: ["platform|canada"] },
    { actionScopes: { company: [], ownership: [], verification: [] } },
  ])("rejects a reviewed merge target when the immutable task shape is not exact: %o", (override) => {
    const active = entry({
      taskId: "task-arbour",
      canonicalKey: "arbour-heights|canada",
      companyName: "Arbour Heights",
      country: "Canada",
      productionCompanyIds: ["company-arbour"],
      seedKeys: ["arbour heights|Canada"],
      sourceRepoOnlyIds: ["repo-only-arbour"],
      actionScopes: { company: ["MERGE_COMPANIES"], ownership: [], verification: [] },
      ...override,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-platform",
    })).toThrow("cannot replace the immutable queue target");
  });

  it("accepts an explicit target only through one symmetric immutable candidate link", () => {
    const active = entry({
      taskId: "task-41",
      canonicalKey: "pattern-energy|canada",
      candidateCanonicalKeys: ["pattern-energy|united-states-canada"],
    });
    const linked = entry({
      taskIndex: 196,
      taskId: "task-196",
      canonicalKey: "pattern-energy|united-states-canada",
      productionCompanyIds: ["company-pattern"],
      candidateCanonicalKeys: ["pattern-energy|canada"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, linked],
      reviewedTargetCompanyId: "company-pattern",
    })).toEqual({
      method: "REVIEWED_SYMMETRIC_CANDIDATE",
      targetCompanyId: "company-pattern",
      linkedQueueTaskId: "task-196",
    });
  });

  it("rejects one-way, unrelated, and ambiguous reviewed candidate targets", () => {
    const active = entry({
      taskId: "task-41",
      canonicalKey: "pattern-energy|canada",
      candidateCanonicalKeys: ["pattern-energy|united-states-canada"],
    });
    const oneWay = entry({
      taskIndex: 196,
      taskId: "task-196",
      canonicalKey: "pattern-energy|united-states-canada",
      productionCompanyIds: ["company-pattern"],
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, oneWay],
      reviewedTargetCompanyId: "company-pattern",
    })).toThrow("not supported by one symmetric immutable queue candidate");

    const symmetric = {
      ...oneWay,
      candidateCanonicalKeys: ["pattern-energy|canada"],
    };
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, symmetric],
      reviewedTargetCompanyId: "company-unrelated",
    })).toThrow("not supported by one symmetric immutable queue candidate");

    const duplicateLink = {
      ...symmetric,
      taskIndex: 197,
      taskId: "task-197",
    };
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, symmetric, duplicateLink],
      reviewedTargetCompanyId: "company-pattern",
    })).toThrow("ambiguous across symmetric immutable queue candidates");
  });

  it("preserves create semantics when no reviewed target is supplied", () => {
    const active = entry({ taskId: "task-create", canonicalKey: "new-platform|united-states" });
    expect(resolveTaskSnapshotTarget({ queueEntry: active, queueEntries: [active] })).toEqual({
      method: "NO_EXISTING_TARGET",
      targetCompanyId: null,
      linkedQueueTaskId: null,
    });
  });

  it("pins a repo-only judgment to an exact company created after the immutable queue", () => {
    const active = entry({
      taskId: "task-repo-only",
      canonicalKey: null,
      queueKind: "REPO_ONLY_JUDGMENT",
      companyName: "GFL Environmental Services",
      country: "United States / Canada",
      sourceRepoOnlyIds: ["repo-only-gfl"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-gfl",
    })).toEqual({
      method: "REVIEWED_POST_QUEUE_EXACT_IDENTITY",
      targetCompanyId: "company-gfl",
      linkedQueueTaskId: null,
    });
  });

  it("pins a repo-only project judgment to its evidenced canonical platform despite a stale queue country", () => {
    const active = entry({
      taskId: "task-aira",
      canonicalKey: null,
      queueKind: "REPO_ONLY_JUDGMENT",
      companyName: "Aira Solar",
      country: "United States",
      sourceRepoOnlyIds: ["repo-only-aira"],
      evidenceUrls: ["https://example.com/horizon-launch"],
      rationale: "Consolidated beneath the separately counted Horizon New Energy platform.",
    });
    const resolution = resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-horizon",
    });
    const horizon = {
      id: "company-horizon",
      name: "Horizon New Energy",
      aliases: [],
      country: "Canada",
      description: "Horizon develops the Aira Solar project in Alberta.",
      citations: [{ url: "https://example.com/horizon-launch" }],
    } as CompanyImage;

    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry: active,
      targetResolution: resolution,
      targetCompanyImage: horizon,
      productionCompanies: [
        { id: "company-horizon", name: "Horizon New Energy", country: "Canada" },
        { id: "company-aira", name: "Aira Solar", country: "Canada" },
      ],
    })).not.toThrow();
    expect(resolvedTaskCanonicalKey({
      queueEntry: active,
      targetResolution: resolution,
      targetCompanyImage: horizon,
    })).toBe("horizon-new-energy|canada");
    expect(resolvedTaskSeedKeys({
      queueEntry: active,
      queueEntries: [active],
      targetResolution: resolution,
      targetCompanyImage: horizon,
    })).toEqual(["horizon new energy|Canada"]);
  });

  it("rejects a repo-only cross-country platform target without shared immutable evidence", () => {
    const active = entry({
      taskId: "task-aira",
      canonicalKey: null,
      queueKind: "REPO_ONLY_JUDGMENT",
      companyName: "Aira Solar",
      country: "United States",
      sourceRepoOnlyIds: ["repo-only-aira"],
      evidenceUrls: ["https://example.com/horizon-launch"],
      rationale: "Consolidated beneath the separately counted Horizon New Energy platform.",
    });
    const resolution = resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-horizon",
    });
    const horizon = {
      id: "company-horizon",
      name: "Horizon New Energy",
      aliases: [],
      country: "Canada",
      description: "Horizon develops the Aira Solar project in Alberta.",
      citations: [{ url: "https://example.com/unrelated" }],
    } as CompanyImage;

    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry: active,
      targetResolution: resolution,
      targetCompanyImage: horizon,
      productionCompanies: [
        { id: "company-horizon", name: "Horizon New Energy", country: "Canada" },
        { id: "company-aira", name: "Aira Solar", country: "Canada" },
      ],
    })).toThrow("does not exactly match the immutable task identity");
  });

  it("pins a census DBA identity to the exact post-queue legal company", () => {
    const active = entry({
      taskId: "task-takanock",
      canonicalKey: "digital-generation-d-b-a-takanock|united-states",
      companyName: "Digital Generation (d/b/a Takanock)",
      country: "United States",
      sourceHoldingIds: ["holding-takanock"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-takanock",
    })).toEqual({
      method: "REVIEWED_POST_QUEUE_DBA_IDENTITY",
      targetCompanyId: "company-takanock",
      linkedQueueTaskId: null,
    });
  });

  it("pins a missed parenthetical-acronym census identity to an existing legal company", () => {
    const active = entry({
      taskId: "task-ngpl",
      canonicalKey: "natural-gas-pipeline-company-of-america-ngpl|united-states",
      companyName: "Natural Gas Pipeline Company of America (NGPL)",
      country: "United States",
      decisionStatus: "READY_FOR_PROPOSAL",
      sourceHoldingIds: ["holding-ngpl"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-ngpl",
    })).toEqual({
      method: "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY",
      targetCompanyId: "company-ngpl",
      linkedQueueTaskId: null,
    });
  });

  it("pins a reviewed manager short name to one existing renewable descriptor identity", () => {
    const active = entry({
      taskId: "task-sequitur",
      canonicalKey: "sequitur|united-states",
      companyName: "Sequitur",
      country: "United States",
      sourceHoldingIds: ["holding-sequitur"],
    });

    expect(resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-sequitur-renewables",
    })).toEqual({
      method: "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY",
      targetCompanyId: "company-sequitur-renewables",
      linkedQueueTaskId: null,
    });
  });

  it.each([
    { decisionStatus: "READY_FOR_PROPOSAL" as const },
    { sourceHoldingIds: [] },
    { sourceRepoOnlyIds: ["repo-only-sequitur"] },
    { candidateCanonicalKeys: ["sequitur-renewables|united-states"] },
    { seedKeys: ["sequitur renewables|United States"] },
  ])("rejects a manager short-name target when the immutable task shape is not exact: %o", (override) => {
    const active = entry({
      taskId: "task-sequitur",
      canonicalKey: "sequitur|united-states",
      companyName: "Sequitur",
      country: "United States",
      sourceHoldingIds: ["holding-sequitur"],
      ...override,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-sequitur-renewables",
    })).toThrow("not supported by one symmetric immutable queue candidate");
  });

  it.each([
    { companyName: "Natural Gas Pipeline Company of America" },
    { companyName: "Natural Gas Pipeline Company of America (natural gas pipeline)" },
    { decisionStatus: "NEEDS_REVIEW" as const },
    { sourceHoldingIds: [] },
    { sourceRepoOnlyIds: ["repo-only-ngpl"] },
    { candidateCanonicalKeys: ["natural-gas-pipeline-co-of-america|united-states"] },
    { seedKeys: ["natural gas pipeline co. of america|United States"] },
  ])("rejects a reviewed parenthetical alias when the immutable task shape is not exact: %o", (override) => {
    const active = entry({
      taskId: "task-ngpl",
      canonicalKey: "natural-gas-pipeline-company-of-america-ngpl|united-states",
      companyName: "Natural Gas Pipeline Company of America (NGPL)",
      country: "United States",
      decisionStatus: "READY_FOR_PROPOSAL",
      sourceHoldingIds: ["holding-ngpl"],
      ...override,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-ngpl",
    })).toThrow("not supported by one symmetric immutable queue candidate");
  });

  it.each([
    { companyName: "Digital Generation / Takanock" },
    { decisionStatus: "READY_FOR_PROPOSAL" as const },
    { sourceHoldingIds: [] },
    { sourceRepoOnlyIds: ["repo-only-takanock"] },
    { candidateCanonicalKeys: ["takanock-llc|united-states"] },
    { seedKeys: ["takanock, llc|United States"] },
  ])("rejects a reviewed DBA target when the immutable task shape is not exact: %o", (override) => {
    const active = entry({
      taskId: "task-takanock",
      canonicalKey: "digital-generation-d-b-a-takanock|united-states",
      companyName: "Digital Generation (d/b/a Takanock)",
      country: "United States",
      sourceHoldingIds: ["holding-takanock"],
      ...override,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-takanock",
    })).toThrow("not supported by one symmetric immutable queue candidate");
  });

  it("does not relax reviewed-target rules for non-repo-only tasks", () => {
    const active = entry({
      taskId: "task-no-canonical-key",
      canonicalKey: null,
      companyName: "GFL Environmental Services",
      country: "United States / Canada",
    });

    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-gfl",
    })).toThrow(/requires a canonical-key queue task|cannot replace the immutable queue target/);
  });

  it.each([
    { decisionStatus: "READY_FOR_PROPOSAL" as const },
    { sourceHoldingIds: ["holding-1"] },
    { candidateCanonicalKeys: ["gfl-environmental-services|united-states-canada"] },
    { seedKeys: ["gfl environmental services|United States / Canada"] },
    { productionCompanyIds: ["company-old"] },
    { sourceRepoOnlyIds: [] },
  ])("rejects a partially linked canonical-null repo-only shape: %o", (override) => {
    const active = entry({
      taskId: "task-partially-linked",
      canonicalKey: null,
      queueKind: "REPO_ONLY_JUDGMENT",
      decisionStatus: "NEEDS_REVIEW",
      companyName: "GFL Environmental Services",
      country: "United States / Canada",
      sourceRepoOnlyIds: ["repo-only-gfl"],
      ...override,
    });
    expect(() => resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active],
      reviewedTargetCompanyId: "company-gfl",
    })).toThrow(/requires a canonical-key queue task|cannot replace the immutable queue target/);
  });

  it("detects a case-only production collision with the immutable task identity", () => {
    const active = entry({
      taskId: "task-create",
      canonicalKey: "gfl-environmental-services|united-states-canada",
      companyName: "GFL Environmental Services",
      country: "United States / Canada",
    });
    expect(matchesImmutableTaskIdentity(active, {
      name: "gfl environmental services",
      country: "UNITED STATES / CANADA",
    })).toBe(true);
  });
});

describe("reviewed merge canonical binding", () => {
  const queueEntry = entry({
    taskId: "task-arbour",
    canonicalKey: "arbour-heights|canada",
    companyName: "Arbour Heights",
    country: "Canada",
    productionCompanyIds: ["company-arbour"],
    seedKeys: ["arbour heights|Canada"],
    sourceRepoOnlyIds: ["repo-only-arbour"],
    actionScopes: { company: ["MERGE_COMPANIES"], ownership: [], verification: [] },
  });
  const targetResolution = {
    method: "REVIEWED_MERGE_CANONICAL_TARGET" as const,
    targetCompanyId: "company-platform",
    linkedQueueTaskId: null,
    immutableRetiredCompanyId: "company-arbour",
  };
  const company = {
    id: "company-platform",
    name: "Axium Extendicare LTC II LP",
    country: "Canada",
  } as CompanyImage;
  const productionCompanies = [
    { id: "company-platform", name: "Revera Joint Venture", country: "Canada" },
    { id: "company-arbour", name: "Arbour Heights", country: "Canada" },
  ];

  it("requires both exact production ids and the immutable country", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "United States" },
      productionCompanies,
    })).toThrow("country differs");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: productionCompanies.slice(0, 1),
    })).toThrow("exactly one canonical target and one immutable retired company");
  });

  it("binds the survivor's seed identity and canonical key", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["axium extendicare ltc ii lp|Canada"]);
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("axium-extendicare-ltc-ii-lp|canada");
  });
});

describe("post-queue DBA identity binding", () => {
  const queueEntry = entry({
    taskId: "task-takanock",
    canonicalKey: "digital-generation-d-b-a-takanock|united-states",
    companyName: "Digital Generation (d/b/a Takanock)",
    country: "United States",
    sourceHoldingIds: ["holding-takanock"],
  });
  const targetResolution = {
    method: "REVIEWED_POST_QUEUE_DBA_IDENTITY" as const,
    targetCompanyId: "company-takanock",
    linkedQueueTaskId: null,
  };
  const company = {
    id: "company-takanock",
    name: "Takanock, LLC",
    country: "United States",
  } as CompanyImage;
  const productionCompanies = [{
    id: "company-takanock",
    name: "Takanock, LLC",
    country: "United States",
  }];

  it("requires the legal company to match the immutable DBA alias and country", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, name: "Another Platform, LLC" },
      productionCompanies,
    })).toThrow("does not exactly match the immutable DBA alias and country");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "Canada" },
      productionCompanies,
    })).toThrow("does not exactly match the immutable DBA alias and country");
  });

  it("requires one uniquely matching production identity pinned to the reviewed id", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [...productionCompanies, {
        id: "company-duplicate",
        name: "Takanock Ltd.",
        country: "United States",
      }],
    })).toThrow("resolved to 2 production records instead of exactly one");
  });

  it("binds the target's evaluated seed identity and canonical key", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["takanock, llc|United States"]);
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("takanock-llc|united-states");
  });
});

describe("post-queue parenthetical-alias identity binding", () => {
  const queueEntry = entry({
    taskId: "task-ngpl",
    canonicalKey: "natural-gas-pipeline-company-of-america-ngpl|united-states",
    companyName: "Natural Gas Pipeline Company of America (NGPL)",
    country: "United States",
    decisionStatus: "READY_FOR_PROPOSAL",
    sourceHoldingIds: ["holding-ngpl"],
  });
  const targetResolution = {
    method: "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY" as const,
    targetCompanyId: "company-ngpl",
    linkedQueueTaskId: null,
  };
  const company = {
    id: "company-ngpl",
    name: "Natural Gas Pipeline Co. of America",
    country: "United States",
  } as CompanyImage;
  const productionCompanies = [{
    id: "company-ngpl",
    name: "Natural Gas Pipeline Co. of America",
    country: "United States",
  }];

  it("requires the legal company to match the immutable parenthetical-alias base and country", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, name: "Natural Gas Pipeline Co. of Canada" },
      productionCompanies,
    })).toThrow("does not exactly match the immutable parenthetical-alias base and country");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "Canada" },
      productionCompanies,
    })).toThrow("does not exactly match the immutable parenthetical-alias base and country");
  });

  it("requires one uniquely matching production identity pinned to the reviewed id", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [],
    })).toThrow("resolved to 0 production records instead of exactly one");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [...productionCompanies, {
        id: "company-ngpl-duplicate",
        name: "Natural Gas Pipeline Company of America",
        country: "United States",
      }],
    })).toThrow("resolved to 2 production records instead of exactly one");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [{ ...productionCompanies[0], id: "company-other" }],
    })).toThrow("target id does not match the unique exact production identity");
  });

  it("binds the target legal evaluated-seed identity and canonical key", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["natural gas pipeline co. of america|United States"]);
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("natural-gas-pipeline-co-of-america|united-states");
  });
});

describe("post-queue manager short-name alias identity binding", () => {
  const queueEntry = entry({
    taskId: "task-sequitur",
    canonicalKey: "sequitur|united-states",
    companyName: "Sequitur",
    country: "United States",
    sourceHoldingIds: ["holding-sequitur"],
  });
  const targetResolution = {
    method: "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY" as const,
    targetCompanyId: "company-sequitur-renewables",
    linkedQueueTaskId: null,
  };
  const company = {
    id: "company-sequitur-renewables",
    name: "Sequitur Renewables, LLC",
    country: "United States",
  } as CompanyImage;
  const productionCompanies = [{
    id: "company-sequitur-renewables",
    name: "Sequitur Renewables, LLC",
    country: "United States",
  }];

  it("requires one whitelisted descriptor token after the immutable whole-token name", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    for (const name of [
      "Sequitur, LLC",
      "Sequitur Energy, LLC",
      "Sequitur Renewable Energy, LLC",
      "Sequiturn Renewables, LLC",
    ]) {
      expect(() => assertReviewedPostQueueExactIdentity({
        queueEntry,
        targetResolution,
        targetCompanyImage: { ...company, name },
        productionCompanies,
      })).toThrow("does not match the immutable manager short-name alias and country");
    }
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "Canada" },
      productionCompanies,
    })).toThrow("does not match the immutable manager short-name alias and country");
  });

  it("requires exactly one matching production identity pinned to the reviewed id", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [...productionCompanies, {
        id: "company-sequitur-renewable",
        name: "Sequitur Renewable",
        country: "United States",
      }],
    })).toThrow("resolved to 2 production records instead of exactly one");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [{ ...productionCompanies[0], id: "company-other" }],
    })).toThrow("target id does not match the unique exact production identity");
  });

  it("binds the target evaluated seed identity and target canonical key", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["sequitur renewables, llc|United States"]);
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("sequitur-renewables-llc|united-states");
  });
});

describe("post-queue embedded portfolio identity binding", () => {
  const queueEntry = entry({
    taskId: "task-aster-bloom",
    canonicalKey: "axium-aster-and-axium-bloom|canada",
    companyName: "Axium Aster & Axium Bloom",
    country: "Canada",
    decisionStatus: "READY_FOR_PROPOSAL",
    managers: ["Axium Infrastructure"],
    sourceHoldingIds: ["holding-aster-bloom"],
    evidenceUrls: ["https://manager.example/portfolio"],
    actionScopes: { company: ["CREATE_COMPANY"], ownership: ["ADD_OWNER"], verification: [] },
  });
  const targetResolution = {
    method: "REVIEWED_POST_QUEUE_EMBEDDED_PORTFOLIO_IDENTITY" as const,
    targetCompanyId: "company-agecare",
    linkedQueueTaskId: null,
  };
  const company = {
    id: "company-agecare",
    name: "AgeCare Facilities Portfolio",
    country: "Canada",
    aliases: [],
    description: "The record includes the Axium Aster and Axium Bloom portfolios.",
    citations: [{ url: "https://manager.example/portfolio" }],
  } as CompanyImage;
  const productionCompanies = [{
    id: "company-agecare",
    name: "AgeCare Facilities Portfolio",
    country: "Canada",
  }];

  it("allows the exact reviewed target only for the narrow create-and-add queue shape", () => {
    expect(resolveTaskSnapshotTarget({
      queueEntry,
      queueEntries: [queueEntry],
      reviewedTargetCompanyId: "company-agecare",
    })).toEqual(targetResolution);
    for (const override of [
      { sourceHoldingIds: [] },
      { sourceHoldingIds: ["one", "two"] },
      { evidenceUrls: [] },
      { actionScopes: { company: [], ownership: ["ADD_OWNER"], verification: [] } },
      { actionScopes: { company: ["CREATE_COMPANY"], ownership: [], verification: [] } },
    ]) {
      expect(() => resolveTaskSnapshotTarget({
        queueEntry: { ...queueEntry, ...override },
        queueEntries: [{ ...queueEntry, ...override }],
        reviewedTargetCompanyId: "company-agecare",
      })).toThrow("not supported by one symmetric immutable queue candidate");
    }
  });

  it("requires target-country, embedded discriminating tokens, and shared immutable evidence", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "United States" },
      productionCompanies,
    })).toThrow("target id or country does not match");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, description: "AgeCare facilities." },
      productionCompanies,
    })).toThrow("missing immutable queue-name tokens: aster, bloom");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, citations: [{ url: "https://other.example/source" }] },
      productionCompanies,
    })).toThrow("does not share immutable queue evidence");
  });

  it("binds the existing seed entry while retaining the immutable queue canonical identity", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["agecare facilities portfolio|Canada"]);
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("axium-aster-and-axium-bloom|canada");
  });
});

describe("post-queue exact identity binding", () => {
  const queueEntry = entry({
    taskId: "task-repo-only",
    canonicalKey: null,
    queueKind: "REPO_ONLY_JUDGMENT",
    companyName: "GFL Environmental Services",
    country: "United States / Canada",
    sourceRepoOnlyIds: ["repo-only-gfl"],
  });
  const targetResolution = {
    method: "REVIEWED_POST_QUEUE_EXACT_IDENTITY" as const,
    targetCompanyId: "company-gfl",
    linkedQueueTaskId: null,
  };
  const company = {
    id: "company-gfl",
    name: "GFL Environmental Services",
    country: "United States / Canada",
  } as CompanyImage;
  const productionCompanies = [{
    id: "company-gfl",
    name: "GFL Environmental Services",
    country: "United States / Canada",
  }];

  it("requires the reviewed database identity to match the immutable name and country", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies,
    })).not.toThrow();
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: { ...company, country: "Canada" },
      productionCompanies,
    })).toThrow("does not exactly match the immutable task identity");
  });

  it("requires one unique exact production match pinned to the reviewed id", () => {
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [],
    })).toThrow("resolved to 0 production records instead of exactly one");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [...productionCompanies, { ...productionCompanies[0], id: "company-duplicate" }],
    })).toThrow("resolved to 2 production records instead of exactly one");
    expect(() => assertReviewedPostQueueExactIdentity({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
      productionCompanies: [{ ...productionCompanies[0], id: "company-other" }],
    })).toThrow("target id does not match the unique exact production identity");
  });

  it("binds the matching evaluated seed identity even though the older queue had no seed key", () => {
    expect(resolvedTaskSeedKeys({
      queueEntry,
      queueEntries: [queueEntry],
      targetResolution,
      targetCompanyImage: company,
    })).toEqual(["gfl environmental services|United States / Canada"]);
  });

  it("derives and binds a proposal-safe canonical key without changing the immutable queue", () => {
    expect(resolvedTaskCanonicalKey({
      queueEntry,
      targetResolution,
      targetCompanyImage: company,
    })).toBe("gfl-environmental-services|united-states-canada");
    expect(queueEntry.canonicalKey).toBeNull();
  });

  it("requires the evaluated seed binding even when the reviewed target is archived", () => {
    expect(() => assertExpectedSeedEntry({
      expectedSeedKeyCount: 1,
      seedEntryPresent: false,
      targetRecordStatus: "ARCHIVED",
      requireEvaluatedSeedEntry: true,
    })).toThrow("Expected evaluated seed entry is missing");
    expect(() => assertExpectedSeedEntry({
      expectedSeedKeyCount: 1,
      seedEntryPresent: false,
      targetRecordStatus: "ARCHIVED",
    })).not.toThrow();
  });
});

describe("reviewed symmetric seed binding", () => {
  it("binds the existing target's reciprocal evaluated seed identity", () => {
    const active = entry({
      taskIndex: 73,
      taskId: "task-73",
      canonicalKey: "inspiration-mobility|united-states",
      candidateCanonicalKeys: ["inspiration-mobility-group|united-states"],
    });
    const linked = entry({
      taskIndex: 481,
      taskId: "task-481",
      canonicalKey: "inspiration-mobility-group|united-states",
      productionCompanyIds: ["company-inspiration"],
      seedKeys: ["inspiration mobility group|United States"],
      candidateCanonicalKeys: ["inspiration-mobility|united-states"],
    });
    const targetResolution = resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, linked],
      reviewedTargetCompanyId: "company-inspiration",
    });

    expect(resolvedTaskSeedKeys({
      queueEntry: active,
      queueEntries: [active, linked],
      targetResolution,
      targetCompanyImage: { id: "company-inspiration" } as CompanyImage,
    })).toEqual(["inspiration mobility group|United States"]);
  });

  it("fails closed if the reciprocal target has ambiguous seed identities", () => {
    const active = entry({
      taskId: "task-73",
      canonicalKey: "inspiration-mobility|united-states",
      candidateCanonicalKeys: ["inspiration-mobility-group|united-states"],
    });
    const linked = entry({
      taskId: "task-481",
      canonicalKey: "inspiration-mobility-group|united-states",
      productionCompanyIds: ["company-inspiration"],
      seedKeys: ["seed-one|United States", "seed-two|United States"],
      candidateCanonicalKeys: ["inspiration-mobility|united-states"],
    });
    const targetResolution = resolveTaskSnapshotTarget({
      queueEntry: active,
      queueEntries: [active, linked],
      reviewedTargetCompanyId: "company-inspiration",
    });

    expect(() => resolvedTaskSeedKeys({
      queueEntry: active,
      queueEntries: [active, linked],
      targetResolution,
      targetCompanyImage: { id: "company-inspiration" } as CompanyImage,
    })).toThrow("more than one evaluated seed identity");
  });
});

describe("task snapshot seed-retirement candidates", () => {
  it("captures reciprocal seed-only queue identities with raw and evaluated hashes", () => {
    const active = entry({
      taskIndex: 41,
      taskId: "task-41",
      canonicalKey: "pattern-energy|canada",
      candidateCanonicalKeys: [
        "pattern-energy|united-states-canada",
        "pattern-energy-group|united-states-canada",
        "pattern-energy-group-lp|united-states",
      ],
    });
    const production = entry({
      taskIndex: 196,
      taskId: "task-196",
      canonicalKey: "pattern-energy|united-states-canada",
      productionCompanyIds: ["company-pattern"],
      candidateCanonicalKeys: ["pattern-energy|canada"],
    });
    const group = entry({
      taskIndex: 485,
      taskId: "task-485",
      canonicalKey: "pattern-energy-group|united-states-canada",
      seedKeys: ["pattern energy group|United States / Canada"],
      candidateCanonicalKeys: ["pattern-energy|canada"],
    });
    const lp = entry({
      taskIndex: 486,
      taskId: "task-486",
      canonicalKey: "pattern-energy-group-lp|united-states",
      seedKeys: ["pattern energy group lp|United States"],
      candidateCanonicalKeys: ["pattern-energy|canada"],
    });
    const raw = [
      seedCompany("Pattern Energy Group LP", "United States"),
      seedCompany("Pattern Energy Group", "United States / Canada"),
    ];
    const candidates = resolveSeedRetirementCandidates({
      queueEntry: active,
      queueEntries: [active, production, group, lp],
      rawSeedCompanies: raw,
      evaluatedSeedCompanies: structuredClone(raw),
    });

    expect(candidates.map((candidate) => candidate.sourceQueueTaskId)).toEqual(["task-485", "task-486"]);
    expect(candidates[0]).toMatchObject({
      sourceQueueEntrySha256: sha256Canonical(group),
      name: "Pattern Energy Group",
      country: "United States / Canada",
      rawSeedEntrySha256: sha256Canonical(raw[1]),
      evaluatedSeedEntrySha256: sha256Canonical(raw[1]),
    });
  });

  it("fails closed when a reciprocal seed identity is ambiguous or missing", () => {
    const active = entry({
      taskId: "task-41",
      canonicalKey: "pattern-energy|canada",
      candidateCanonicalKeys: ["pattern-energy-group|united-states-canada"],
    });
    const duplicate = entry({
      taskIndex: 485,
      taskId: "task-485",
      canonicalKey: "pattern-energy-group|united-states-canada",
      seedKeys: ["pattern energy group|United States / Canada"],
      candidateCanonicalKeys: ["pattern-energy|canada"],
    });
    const company = seedCompany("Pattern Energy Group", "United States / Canada");

    expect(() => resolveSeedRetirementCandidates({
      queueEntry: active,
      queueEntries: [active, duplicate],
      rawSeedCompanies: [company, structuredClone(company)],
      evaluatedSeedCompanies: [company],
    })).toThrow(/exactly one/i);
    expect(() => resolveSeedRetirementCandidates({
      queueEntry: active,
      queueEntries: [active, duplicate],
      rawSeedCompanies: [company],
      evaluatedSeedCompanies: [],
    })).toThrow(/exactly one/i);
  });
});
