import { describe, expect, it } from "vitest";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import type { ProposalQueueIndexArtifact } from "./execution-control";
import { sha256Canonical } from "./hash";
import {
  resolveSeedRetirementCandidates,
  resolveTaskSnapshotTarget,
} from "./task-snapshot";

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
