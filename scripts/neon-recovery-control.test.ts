import { describe, expect, it, vi } from "vitest";
import {
  NeonRecoveryClient,
  RECOVERY_ANNOTATION_KIND,
  RECOVERY_ANNOTATION_RUN,
  RECOVERY_ANNOTATION_SHA,
  assertCreatedBranchGuard,
  assertDistinctNeonProjectIds,
  assertRedactedRecoveryEvidence,
  assertValidationSourceBranch,
  compareLsn,
  deriveChildDatabaseUrl,
  parseRecoveryDatabaseTarget,
  requireRecoveryRunIdentity,
  type CreateBranchSpec,
  type CreatedBranchGuard,
  type NeonBranch,
  type NeonBranchDetail,
  type NeonOperation,
} from "./neon-recovery-control.ts";

const projectId = "silent-river-123456";
const validationBranchId = "br-validation-123456";
const sourceBranchId = "br-recovery-source-123456";
const restoredBranchId = "br-recovery-restored-123456";
const releaseSha = "a".repeat(40);
const runKey = "123456789-1";
const apiKey = "n".repeat(64);
const validationHost = "ep-validation-123456.c-5.us-east-1.aws.neon.tech";
const productionPoolerHost = "ep-production-123456-pooler.c-5.us-east-1.aws.neon.tech";
const productionDirectHost = "ep-production-123456.c-5.us-east-1.aws.neon.tech";
const dashboardHost = "ep-dashboard-123456.c-5.us-east-1.aws.neon.tech";
const sourceHost = "ep-recovery-source-123456.c-5.us-east-1.aws.neon.tech";
const restoredHost = "ep-recovery-restored-123456.c-5.us-east-1.aws.neon.tech";
const operationId = "11111111-1111-4111-8111-111111111111";

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function branch({
  id = sourceBranchId,
  name = `infrasight-recovery-source-${runKey}`,
  parentId = validationBranchId,
  parentLsn,
}: {
  id?: string;
  name?: string;
  parentId?: string;
  parentLsn?: string;
} = {}): NeonBranch {
  return {
    id,
    project_id: projectId,
    parent_id: parentId,
    parent_lsn: parentLsn,
    name,
    current_state: "ready",
    default: false,
    protected: false,
    created_at: "2026-07-23T20:00:01.123456Z",
  };
}

function annotation(kind: "source" | "restored"): Record<string, string> {
  return {
    [RECOVERY_ANNOTATION_RUN]: runKey,
    [RECOVERY_ANNOTATION_SHA]: releaseSha,
    [RECOVERY_ANNOTATION_KIND]: kind,
  };
}

function branchDetail(
  value: NeonBranch,
  kind: "source" | "restored" = "source",
): NeonBranchDetail {
  return { branch: value, annotation: annotation(kind) };
}

function operation(
  status = "finished",
  branchId = sourceBranchId,
): NeonOperation {
  return {
    id: operationId,
    project_id: projectId,
    branch_id: branchId,
    endpoint_id: "ep-recovery-source-123456",
    action: "create_timeline",
    status,
    failures_count: 0,
  };
}

function sourceSpec(): CreateBranchSpec {
  return {
    branchName: `infrasight-recovery-source-${runKey}`,
    kind: "source",
    parentBranchId: validationBranchId,
    projectId,
    releaseSha,
    requestedAt: "2026-07-23T20:00:00.000Z",
    runKey,
  };
}

describe("Neon recovery run and database target guards", () => {
  it("requires an exact protected-main workflow-dispatch identity", () => {
    expect(requireRecoveryRunIdentity({
      GITHUB_EVENT_NAME: "workflow_dispatch",
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123456789",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_SHA: releaseSha,
      RELEASE_SHA: releaseSha,
      RECOVERY_CONFIRMATION: "EXERCISE",
    })).toMatchObject({
      runKey,
      releaseSha,
      sourceBranchName: `infrasight-recovery-source-${runKey}`,
      restoredBranchName: `infrasight-recovery-restored-${runKey}`,
    });

    for (const environment of [
      { GITHUB_REF: "refs/heads/feature" },
      { GITHUB_EVENT_NAME: "pull_request" },
      { RECOVERY_CONFIRMATION: "exercise" },
      { GITHUB_SHA: "b".repeat(40) },
    ]) {
      expect(() => requireRecoveryRunIdentity({
        GITHUB_EVENT_NAME: "workflow_dispatch",
        GITHUB_REF: "refs/heads/main",
        GITHUB_RUN_ID: "123456789",
        GITHUB_RUN_ATTEMPT: "1",
        GITHUB_SHA: releaseSha,
        RELEASE_SHA: releaseSha,
        RECOVERY_CONFIRMATION: "EXERCISE",
        ...environment,
      })).toThrow();
    }
  });

  it("requires an independently distinct production project identity", () => {
    expect(() => assertDistinctNeonProjectIds(
      projectId,
      "production-project-123456",
    )).not.toThrow();
    expect(() => assertDistinctNeonProjectIds(projectId, projectId))
      .toThrow("independently distinct");
    expect(() => assertDistinctNeonProjectIds(projectId, "not/a/project"))
      .toThrow();
  });

  it("binds the validation URL to an exact direct host and database", () => {
    const target = parseRecoveryDatabaseTarget({
      connectionString:
        `postgresql://validation:private@${validationHost}/neondb?sslmode=require&channel_binding=require`,
      expectedHost: validationHost,
      expectedDatabase: "neondb",
      forbiddenHosts: [
        productionPoolerHost,
        productionDirectHost,
        dashboardHost,
      ],
    });

    expect(target.host).toBe(validationHost);
    const childUrl = deriveChildDatabaseUrl({
      parent: target,
      childHost: sourceHost,
      forbiddenHosts: [
        validationHost,
        productionPoolerHost,
        productionDirectHost,
        dashboardHost,
      ],
    });
    expect(new URL(childUrl).hostname).toBe(sourceHost);
    expect(new URL(childUrl).username).toBe("validation");
    expect(new URL(childUrl).password).toBe("private");
    expect(new URL(childUrl).pathname).toBe("/neondb");
    expect(new URL(childUrl).searchParams.get("sslmode")).toBe("require");
    expect(new URL(childUrl).searchParams.get("channel_binding")).toBe("require");
  });

  it.each([
    {
      name: "pooled source",
      connectionString:
        `postgresql://validation:private@${validationHost.replace("ep-validation", "ep-validation-pooler")}/neondb?sslmode=require`,
    },
    {
      name: "unsafe query override",
      connectionString:
        `postgresql://validation:private@${validationHost}/neondb?sslmode=require&options=private`,
    },
    {
      name: "production target",
      connectionString:
        `postgresql://validation:private@${productionDirectHost}/neondb?sslmode=require`,
      expectedHost: productionDirectHost,
    },
  ])("rejects $name without returning a connection string", ({ connectionString, expectedHost }) => {
    expect(() => parseRecoveryDatabaseTarget({
      connectionString,
      expectedHost: expectedHost ?? validationHost,
      expectedDatabase: "neondb",
      forbiddenHosts: [
        productionPoolerHost,
        productionDirectHost,
        dashboardHost,
      ],
    })).toThrow();
  });

  it("compares PostgreSQL WAL positions without number truncation", () => {
    expect(compareLsn("0/16B6C50", "0/16B6C50")).toBe(0);
    expect(compareLsn("1/0", "0/FFFFFFFF")).toBe(1);
    expect(compareLsn("0/1", "0/2")).toBe(-1);
    expect(() => compareLsn("0/100000000", "0/1")).toThrow();
  });
});

describe("Neon recovery branch identity guards", () => {
  const sourceGuard: CreatedBranchGuard = {
    branchId: sourceBranchId,
    branchName: `infrasight-recovery-source-${runKey}`,
    kind: "source",
    parentBranchId: validationBranchId,
    projectId,
    releaseSha,
    runKey,
  };

  it("accepts only a non-default validation source", () => {
    expect(() => assertValidationSourceBranch({
      branch: branch({ id: validationBranchId, name: "validation", parentId: "br-root-123456" }),
      expectedBranchId: validationBranchId,
      expectedProjectId: projectId,
    })).not.toThrow();
    expect(() => assertValidationSourceBranch({
      branch: {
        ...branch({ id: validationBranchId, name: "validation", parentId: "br-root-123456" }),
        default: true,
      },
      expectedBranchId: validationBranchId,
      expectedProjectId: projectId,
    })).toThrow();
  });

  it("requires exact run annotations before cleanup can target a branch", () => {
    expect(() => assertCreatedBranchGuard(
      branchDetail(branch()),
      sourceGuard,
    )).not.toThrow();

    for (const detail of [
      branchDetail({ ...branch(), default: true }),
      branchDetail({ ...branch(), protected: true }),
      branchDetail({ ...branch(), parent_id: "br-other-parent-123456" }),
      {
        ...branchDetail(branch()),
        annotation: { ...annotation("source"), [RECOVERY_ANNOTATION_RUN]: "999-1" },
      },
    ]) {
      expect(() => assertCreatedBranchGuard(detail, sourceGuard)).toThrow();
    }
  });

  it("requires the restored branch to bind the exact source LSN", () => {
    const restoredGuard: CreatedBranchGuard = {
      branchId: restoredBranchId,
      branchName: `infrasight-recovery-restored-${runKey}`,
      kind: "restored",
      parentBranchId: sourceBranchId,
      parentLsn: "0/16B6C50",
      projectId,
      releaseSha,
      runKey,
    };
    expect(() => assertCreatedBranchGuard(
      branchDetail(branch({
        id: restoredBranchId,
        name: restoredGuard.branchName,
        parentId: sourceBranchId,
        parentLsn: "0/16B6C50",
      }), "restored"),
      restoredGuard,
    )).not.toThrow();
    expect(() => assertCreatedBranchGuard(
      branchDetail(branch({
        id: restoredBranchId,
        name: restoredGuard.branchName,
        parentId: sourceBranchId,
        parentLsn: "0/16B6C51",
      }), "restored"),
      restoredGuard,
    )).toThrow();
  });

  it("rejects sensitive fields and values from retained evidence", () => {
    expect(() => assertRedactedRecoveryEvidence({
      branchId: sourceBranchId,
      checkpointLsn: "0/16B6C50",
      digest: "a".repeat(64),
    })).not.toThrow();
    expect(() => assertRedactedRecoveryEvidence({
      databaseUrl: `postgresql://private@${validationHost}/neondb`,
    })).toThrow();
    expect(() => assertRedactedRecoveryEvidence({
      innocent: `https://${validationHost}`,
    })).toThrow();
  });
});

describe("Neon recovery control-plane client", () => {
  it("follows the documented pagination.next cursor before reconciling a branch", async () => {
    const search = `infrasight-recovery-source-${runKey}`;
    const queue = [
      json({
        branches: [branch({
          id: "br-unrelated-123456",
          name: "infrasight-recovery-source-999-1",
        })],
        pagination: { next: "opaque+cursor/value" },
      }),
      json({
        branches: [branch()],
        pagination: {},
      }),
    ];
    const urls: string[] = [];
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      urls.push(String(url));
      const next = queue.shift();
      if (!next) throw new Error("Unexpected request.");
      return next;
    }) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.listBranches(projectId, search)).resolves.toEqual([
      expect.objectContaining({ id: sourceBranchId, name: search }),
    ]);
    expect(urls).toHaveLength(2);
    expect(new URL(urls[1]).searchParams.get("cursor")).toBe("opaque+cursor/value");
  });

  it("polls create operations and verifies the exact annotated branch", async () => {
    const created = branch();
    const queue: Array<Response | Error> = [
      json({ branches: [], pagination: {} }),
      json({ branch: created, operations: [operation()] }, 201),
      json({ operation: operation() }),
      json({ branch: created, annotation: { value: annotation("source") } }),
      json({
        endpoints: [{
          id: "ep-recovery-source-123456",
          project_id: projectId,
          branch_id: sourceBranchId,
          host: sourceHost,
          type: "read_write",
          current_state: "active",
        }],
      }),
    ];
    const fetchImpl = vi.fn(async () => {
      const next = queue.shift();
      if (next instanceof Error) throw next;
      if (!next) throw new Error("Unexpected request.");
      return next;
    }) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.createBranchReconciled(sourceSpec())).resolves.toMatchObject({
      reconciled: false,
      branch: { id: sourceBranchId },
      endpoint: { host: sourceHost },
      guard: {
        branchId: sourceBranchId,
        parentBranchId: validationBranchId,
        runKey,
      },
    });
    expect(queue).toHaveLength(0);
  });

  it("reconciles an uncertain POST without issuing a second create", async () => {
    const created = {
      ...branch(),
      created_at: "2026-07-23T20:00:01Z",
    };
    const queue: Array<Response | Error> = [
      json({ branches: [], pagination: {} }),
      new TypeError("network interrupted"),
      json({ branches: [created], pagination: {} }),
      json({ branch: created, annotation: { value: annotation("source") } }),
      json({ branch: created, annotation: { value: annotation("source") } }),
      json({
        endpoints: [{
          id: "ep-recovery-source-123456",
          project_id: projectId,
          branch_id: sourceBranchId,
          host: sourceHost,
          type: "read_write",
          current_state: "idle",
        }],
      }),
    ];
    const methods: string[] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      methods.push(init?.method ?? "GET");
      const next = queue.shift();
      if (next instanceof Error) throw next;
      if (!next) throw new Error("Unexpected request.");
      return next;
    }) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.createBranchReconciled(sourceSpec())).resolves.toMatchObject({
      reconciled: true,
      branch: { id: sourceBranchId },
    });
    expect(methods.filter((method) => method === "POST")).toHaveLength(1);
    expect(queue).toHaveLength(0);
  });

  it("fails closed on a terminal operation failure", async () => {
    const fetchImpl = vi.fn(async () => json({
      operation: operation("failed"),
    })) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.pollOperations(
      projectId,
      [operation("running")],
      sourceBranchId,
    )).rejects.toThrow("operation failed");
  });

  it("revalidates annotations before exact created-branch deletion", async () => {
    const sourceGuard: CreatedBranchGuard = {
      branchId: sourceBranchId,
      branchName: `infrasight-recovery-source-${runKey}`,
      kind: "source",
      parentBranchId: validationBranchId,
      projectId,
      releaseSha,
      runKey,
    };
    const queue = [
      json({ branch: branch(), annotation: { value: annotation("source") } }),
      json({ branch: branch(), operations: [operation()] }),
      json({ operation: operation() }),
      new Response("", { status: 404 }),
    ];
    const methods: string[] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      methods.push(init?.method ?? "GET");
      const next = queue.shift();
      if (!next) throw new Error("Unexpected request.");
      return next;
    }) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.deleteCreatedBranch(sourceGuard)).resolves.toEqual({
      alreadyDeleted: false,
      branchId: sourceBranchId,
      deleted: true,
      kind: "source",
    });
    expect(methods.filter((method) => method === "DELETE")).toHaveLength(1);
    expect(queue).toHaveLength(0);
  });

  it("reconciles and deletes an annotated branch after a crash lost the POST response", async () => {
    const created = branch();
    const queue = [
      json({ branches: [created], pagination: {} }),
      json({ branch: created, annotation: { value: annotation("source") } }),
      json({ branch: created, annotation: { value: annotation("source") } }),
      json({ branch: created, operations: [operation()] }),
      json({ operation: operation() }),
      new Response("", { status: 404 }),
    ];
    const methods: string[] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      methods.push(init?.method ?? "GET");
      const next = queue.shift();
      if (!next) throw new Error("Unexpected request.");
      return next;
    }) as unknown as typeof fetch;
    const client = new NeonRecoveryClient({
      apiKey,
      fetchImpl,
      pause: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 1_000,
    });

    await expect(client.deleteReconciledBranch(sourceSpec())).resolves.toEqual({
      alreadyDeleted: false,
      branchId: sourceBranchId,
      deleted: true,
      kind: "source",
      reconciled: true,
    });
    expect(methods.filter((method) => method === "POST")).toHaveLength(0);
    expect(methods.filter((method) => method === "DELETE")).toHaveLength(1);
    expect(queue).toHaveLength(0);
  });
});
