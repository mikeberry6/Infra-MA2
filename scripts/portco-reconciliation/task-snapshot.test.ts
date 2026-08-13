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
