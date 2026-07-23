import { setTimeout as delay } from "node:timers/promises";
import { hasSafeDatabaseConnectionQuery } from "../src/lib/database-connection-query.ts";

export const NEON_API_ORIGIN = "https://console.neon.tech";
export const NEON_API_PREFIX = "/api/v2";
export const RECOVERY_ANNOTATION_RUN = "infrasight-recovery-run";
export const RECOVERY_ANNOTATION_SHA = "infrasight-release-sha";
export const RECOVERY_ANNOTATION_KIND = "infrasight-recovery-kind";

const SAFE_RESOURCE_ID = /^[a-z0-9-]{1,60}$/;
const SAFE_OPERATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_BRANCH_NAME = /^[a-z0-9-]{1,120}$/;
const SAFE_RETURNED_BRANCH_NAME = /^[A-Za-z0-9._/-]{1,256}$/;
const SAFE_RUN_KEY = /^[0-9]+-[1-9][0-9]*$/;
const SAFE_NEON_HOST = /^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/;
// PostgreSQL renders each half of an LSN as an unsigned 32-bit hexadecimal
// value. Bounding both halves prevents malformed control-plane data from
// changing the comparison semantics or allocating an arbitrarily large BigInt.
const SAFE_LSN = /^[0-9A-F]{1,8}\/[0-9A-F]{1,8}$/i;
const TERMINAL_OPERATION_FAILURES = new Set([
  "failed",
  "error",
  "cancelled",
  "skipped",
]);
const MAX_RESPONSE_BYTES = 2_000_000;
const MAX_BRANCH_LIST_PAGES = 10;
const MAX_CURSOR_BYTES = 4_096;

export type RecoveryRunIdentity = {
  runId: string;
  runAttempt: string;
  runKey: string;
  releaseSha: string;
  sourceBranchName: string;
  restoredBranchName: string;
};

export type RecoveryDatabaseTarget = {
  database: string;
  host: string;
  parsed: URL;
};

export type NeonProject = {
  id: string;
  history_retention_seconds: number;
};

export type NeonBranch = {
  id: string;
  project_id: string;
  parent_id?: string;
  parent_lsn?: string;
  name: string;
  current_state: string;
  default: boolean;
  protected: boolean;
  created_at: string;
};

export type NeonEndpoint = {
  id: string;
  project_id: string;
  branch_id: string;
  host: string;
  type: string;
  current_state: string;
};

export type NeonOperation = {
  id: string;
  project_id: string;
  branch_id?: string;
  endpoint_id?: string;
  action: string;
  status: string;
  failures_count: number;
};

export type NeonBranchDetail = {
  branch: NeonBranch;
  annotation: Record<string, string>;
};

export type CreatedBranchGuard = {
  branchId: string;
  branchName: string;
  kind: "source" | "restored";
  parentBranchId: string;
  parentLsn?: string;
  projectId: string;
  releaseSha: string;
  runKey: string;
};

export type CreatedBranch = {
  branch: NeonBranch;
  endpoint: NeonEndpoint;
  guard: CreatedBranchGuard;
  reconciled: boolean;
};

export type CreateBranchSpec = Omit<CreatedBranchGuard, "branchId"> & {
  requestedAt: string;
};

export type NeonRecoveryClientOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  pause?: (milliseconds: number) => Promise<void>;
  pollIntervalMs?: number;
  timeoutMs?: number;
};

type JsonObject = Record<string, unknown>;

function fail(message: string): never {
  throw new Error(message);
}

function requiredString(
  value: unknown,
  label: string,
  pattern?: RegExp,
): string {
  if (typeof value !== "string" || value.length === 0 || /[\r\n]/.test(value)) {
    return fail(`${label} is invalid.`);
  }
  if (pattern && !pattern.test(value)) return fail(`${label} is invalid.`);
  return value;
}

function requiredBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") return fail(`${label} is invalid.`);
  return value;
}

function requiredNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    return fail(`${label} is invalid.`);
  }
  return value as number;
}

function requiredIsoTimestamp(value: unknown, label: string): string {
  const timestamp = requiredString(value, label);
  const match = timestamp.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?Z$/,
  );
  if (!match) return fail(`${label} is invalid.`);
  const [, year, month, day, hour, minute, second, fraction = ""] = match;
  const milliseconds = Number(fraction.padEnd(3, "0").slice(0, 3));
  const parsed = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    milliseconds,
  ));
  if (
    Number.isNaN(parsed.getTime())
    || parsed.getUTCFullYear() !== Number(year)
    || parsed.getUTCMonth() + 1 !== Number(month)
    || parsed.getUTCDate() !== Number(day)
    || parsed.getUTCHours() !== Number(hour)
    || parsed.getUTCMinutes() !== Number(minute)
    || parsed.getUTCSeconds() !== Number(second)
  ) return fail(`${label} is invalid.`);
  return timestamp;
}

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail(`${label} is invalid.`);
  }
  return value as JsonObject;
}

function optionalString(
  value: unknown,
  label: string,
  pattern?: RegExp,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return requiredString(value, label, pattern);
}

export function requireRecoveryRunIdentity(
  environment: NodeJS.ProcessEnv,
): RecoveryRunIdentity {
  if (environment.GITHUB_EVENT_NAME !== "workflow_dispatch") {
    fail("Recovery exercises must run from workflow_dispatch.");
  }
  if (environment.GITHUB_REF !== "refs/heads/main") {
    fail("Recovery exercises must run from refs/heads/main.");
  }
  if (environment.RECOVERY_CONFIRMATION !== "EXERCISE") {
    fail("RECOVERY_CONFIRMATION must exactly equal EXERCISE.");
  }
  const runId = requiredString(environment.GITHUB_RUN_ID, "GITHUB_RUN_ID", /^[1-9][0-9]*$/);
  const runAttempt = requiredString(
    environment.GITHUB_RUN_ATTEMPT,
    "GITHUB_RUN_ATTEMPT",
    /^[1-9][0-9]*$/,
  );
  const releaseSha = requiredString(
    environment.RELEASE_SHA,
    "RELEASE_SHA",
    /^[0-9a-f]{40}$/,
  );
  if (environment.GITHUB_SHA !== releaseSha) {
    fail("GITHUB_SHA must exactly equal RELEASE_SHA.");
  }
  const runKey = `${runId}-${runAttempt}`;
  return {
    runId,
    runAttempt,
    runKey,
    releaseSha,
    sourceBranchName: `infrasight-recovery-source-${runKey}`,
    restoredBranchName: `infrasight-recovery-restored-${runKey}`,
  };
}

export function assertDistinctNeonProjectIds(
  recoveryProjectId: string,
  productionProjectId: string,
): void {
  const recovery = requiredString(
    recoveryProjectId,
    "NEON_RECOVERY_PROJECT_ID",
    SAFE_RESOURCE_ID,
  );
  const production = requiredString(
    productionProjectId,
    "NEON_PRODUCTION_PROJECT_ID",
    SAFE_RESOURCE_ID,
  );
  if (recovery === production) {
    fail("Recovery and production Neon project IDs must be independently distinct.");
  }
}

export function normalizeNeonHost(
  value: string,
  label: string,
  requireDirect = true,
): string {
  const host = requiredString(value.trim().toLowerCase(), label);
  if (!SAFE_NEON_HOST.test(host) || (requireDirect && host.includes("-pooler."))) {
    fail(`${label} must be a${requireDirect ? " direct" : ""} Neon endpoint host.`);
  }
  return host;
}

function normalizedForbiddenHosts(values: string[]): string[] {
  if (values.length < 3) {
    fail("At least three independently configured forbidden database hosts are required.");
  }
  const hosts = values.map((value, index) =>
    normalizeNeonHost(value, `forbidden database host ${index + 1}`, false));
  if (new Set(hosts).size !== hosts.length) {
    fail("Forbidden database hosts must be distinct.");
  }
  return hosts;
}

export function parseRecoveryDatabaseTarget({
  connectionString,
  expectedDatabase,
  expectedHost,
  forbiddenHosts,
}: {
  connectionString: string;
  expectedDatabase: string;
  expectedHost: string;
  forbiddenHosts: string[];
}): RecoveryDatabaseTarget {
  if (!connectionString || /[\r\n]/.test(connectionString)) {
    fail("Recovery database connection is invalid.");
  }
  const approvedHost = normalizeNeonHost(expectedHost, "expected database host");
  const deniedHosts = normalizedForbiddenHosts(forbiddenHosts);
  const database = requiredString(
    expectedDatabase.trim(),
    "expected database name",
    /^[A-Za-z0-9_.-]{1,63}$/,
  );
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    return fail("Recovery database connection is invalid.");
  }
  if (
    !new Set(["postgres:", "postgresql:"]).has(parsed.protocol)
    || !parsed.username
    || !parsed.password
    || parsed.hash
    || (parsed.port && parsed.port !== "5432")
    || !hasSafeDatabaseConnectionQuery(parsed, { requireSslMode: true })
  ) {
    fail("Recovery database connection is invalid.");
  }
  const actualHost = parsed.hostname.toLowerCase();
  const actualDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (actualHost !== approvedHost || actualDatabase !== database) {
    fail("Recovery database connection does not match its approved target.");
  }
  if (deniedHosts.includes(actualHost)) {
    fail("Recovery database target matches a forbidden endpoint.");
  }
  return { database, host: actualHost, parsed };
}

export function deriveChildDatabaseUrl({
  forbiddenHosts,
  parent,
  childHost,
}: {
  forbiddenHosts: string[];
  parent: RecoveryDatabaseTarget;
  childHost: string;
}): string {
  const host = normalizeNeonHost(childHost, "child database host");
  const deniedHosts = normalizedForbiddenHosts(forbiddenHosts);
  if (host === parent.host || deniedHosts.includes(host)) {
    fail("Child database endpoint is not isolated from protected targets.");
  }
  // Neon branches inherit their parent's databases, roles, and role
  // credentials. Bind those already-validated connection components to the
  // API-proven child endpoint only; never accept a control-plane response URL
  // that could carry an unreviewed role, database, or embedded credential.
  const child = new URL(parent.parsed.toString());
  child.hostname = host;
  child.port = "";
  return child.toString();
}

export function normalizeLsn(value: string): string {
  const normalized = requiredString(value.trim().toUpperCase(), "recovery LSN", SAFE_LSN);
  const [high, low] = normalized.split("/");
  return `${BigInt(`0x${high}`).toString(16).toUpperCase()}/${BigInt(`0x${low}`).toString(16).toUpperCase()}`;
}

export function compareLsn(left: string, right: string): number {
  const numeric = (value: string): bigint => {
    const [high, low] = normalizeLsn(value).split("/");
    return (BigInt(`0x${high}`) << 32n) + BigInt(`0x${low}`);
  };
  const leftValue = numeric(left);
  const rightValue = numeric(right);
  return leftValue === rightValue ? 0 : leftValue < rightValue ? -1 : 1;
}

function parseProject(value: unknown, expectedProjectId: string): NeonProject {
  const project = object(value, "Neon project");
  const id = requiredString(project.id, "Neon project ID", SAFE_RESOURCE_ID);
  if (id !== expectedProjectId) fail("Neon project identity does not match the recovery allowlist.");
  return {
    id,
    history_retention_seconds: requiredNonNegativeInteger(
      project.history_retention_seconds,
      "Neon project history retention",
    ),
  };
}

function parseBranch(value: unknown): NeonBranch {
  const branch = object(value, "Neon branch");
  return {
    id: requiredString(branch.id, "Neon branch ID", SAFE_RESOURCE_ID),
    project_id: requiredString(
      branch.project_id,
      "Neon branch project ID",
      SAFE_RESOURCE_ID,
    ),
    parent_id: optionalString(branch.parent_id, "Neon parent branch ID", SAFE_RESOURCE_ID),
    parent_lsn: optionalString(branch.parent_lsn, "Neon parent LSN", SAFE_LSN),
    name: requiredString(
      branch.name,
      "Neon branch name",
      SAFE_RETURNED_BRANCH_NAME,
    ),
    current_state: requiredString(
      branch.current_state,
      "Neon branch state",
      /^(?:init|resetting|ready|archived)$/,
    ),
    default: requiredBoolean(branch.default, "Neon default-branch flag"),
    protected: requiredBoolean(branch.protected, "Neon protected-branch flag"),
    created_at: requiredIsoTimestamp(branch.created_at, "Neon branch creation time"),
  };
}

function parseEndpoint(value: unknown): NeonEndpoint {
  const endpoint = object(value, "Neon endpoint");
  return {
    id: requiredString(endpoint.id, "Neon endpoint ID", SAFE_RESOURCE_ID),
    project_id: requiredString(
      endpoint.project_id,
      "Neon endpoint project ID",
      SAFE_RESOURCE_ID,
    ),
    branch_id: requiredString(
      endpoint.branch_id,
      "Neon endpoint branch ID",
      SAFE_RESOURCE_ID,
    ),
    host: normalizeNeonHost(
      requiredString(endpoint.host, "Neon endpoint host"),
      "Neon endpoint host",
    ),
    type: requiredString(endpoint.type, "Neon endpoint type", /^(?:read_write|read_only)$/),
    current_state: requiredString(
      endpoint.current_state,
      "Neon endpoint state",
      /^(?:init|active|idle)$/,
    ),
  };
}

function parseOperation(value: unknown): NeonOperation {
  const operation = object(value, "Neon operation");
  return {
    id: requiredString(operation.id, "Neon operation ID", SAFE_OPERATION_ID),
    project_id: requiredString(
      operation.project_id,
      "Neon operation project ID",
      SAFE_RESOURCE_ID,
    ),
    branch_id: optionalString(
      operation.branch_id,
      "Neon operation branch ID",
      SAFE_RESOURCE_ID,
    ),
    endpoint_id: optionalString(
      operation.endpoint_id,
      "Neon operation endpoint ID",
      SAFE_RESOURCE_ID,
    ),
    action: requiredString(
      operation.action,
      "Neon operation action",
      /^[a-z][a-z0-9_]{0,80}$/,
    ),
    status: requiredString(
      operation.status,
      "Neon operation status",
      /^(?:scheduling|running|finished|failed|error|cancelling|cancelled|skipped)$/,
    ),
    failures_count: requiredNonNegativeInteger(
      operation.failures_count,
      "Neon operation failure count",
    ),
  };
}

function parseAnnotation(value: unknown): Record<string, string> {
  if (value === undefined || value === null) return {};
  const annotation = object(value, "Neon branch annotation");
  const raw = annotation.value === undefined
    ? annotation
    : object(annotation.value, "Neon branch annotation value");
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(raw)) {
    if (
      !/^[A-Za-z0-9_.-]{1,80}$/.test(key)
      || typeof item !== "string"
      || item.length > 160
      || /[\r\n]/.test(item)
    ) {
      fail("Neon branch annotation is invalid.");
    }
    result[key] = item;
  }
  return result;
}

export function assertValidationSourceBranch({
  branch,
  expectedBranchId,
  expectedProjectId,
}: {
  branch: NeonBranch;
  expectedBranchId: string;
  expectedProjectId: string;
}): void {
  if (
    branch.id !== expectedBranchId
    || branch.project_id !== expectedProjectId
    || branch.default
    || branch.current_state !== "ready"
  ) {
    fail("Validation source branch failed the recovery source guard.");
  }
}

function expectedAnnotations(
  guard: Pick<CreatedBranchGuard, "kind" | "releaseSha" | "runKey">,
): Record<string, string> {
  return {
    [RECOVERY_ANNOTATION_RUN]: guard.runKey,
    [RECOVERY_ANNOTATION_SHA]: guard.releaseSha,
    [RECOVERY_ANNOTATION_KIND]: guard.kind,
  };
}

export function assertCreatedBranchGuard(
  detail: NeonBranchDetail,
  guard: CreatedBranchGuard,
): void {
  const { branch, annotation } = detail;
  if (
    branch.id !== guard.branchId
    || branch.project_id !== guard.projectId
    || branch.name !== guard.branchName
    || branch.parent_id !== guard.parentBranchId
    || branch.default
    || branch.protected
    || branch.id === branch.parent_id
  ) {
    fail("Created recovery branch failed its exact identity guard.");
  }
  if (
    guard.kind === "restored"
    && (
      !guard.parentLsn
      || !branch.parent_lsn
      || compareLsn(branch.parent_lsn, guard.parentLsn) !== 0
    )
  ) {
    fail("Restored branch does not match the requested recovery LSN.");
  }
  const expected = expectedAnnotations(guard);
  if (
    Object.keys(expected).some((key) => annotation[key] !== expected[key])
  ) {
    fail("Created recovery branch annotation does not match this exact run.");
  }
}

function assertCreateSpec(spec: CreateBranchSpec): void {
  requiredString(spec.projectId, "recovery project ID", SAFE_RESOURCE_ID);
  requiredString(spec.parentBranchId, "recovery parent branch ID", SAFE_RESOURCE_ID);
  requiredString(spec.branchName, "recovery branch name", SAFE_BRANCH_NAME);
  requiredString(spec.releaseSha, "recovery release SHA", /^[0-9a-f]{40}$/);
  requiredString(spec.runKey, "recovery run key", SAFE_RUN_KEY);
  requiredIsoTimestamp(spec.requestedAt, "recovery request time");
  if (spec.kind === "restored") {
    if (!spec.parentLsn) fail("A restored branch requires an exact parent LSN.");
    normalizeLsn(spec.parentLsn);
  } else if (spec.parentLsn) {
    fail("A source exercise branch may not specify a recovery LSN.");
  }
}

export function recoveryBranchGuard(
  branch: NeonBranch,
  spec: CreateBranchSpec,
): CreatedBranchGuard {
  return {
    branchId: branch.id,
    branchName: spec.branchName,
    kind: spec.kind,
    parentBranchId: spec.parentBranchId,
    parentLsn: spec.parentLsn ? normalizeLsn(spec.parentLsn) : undefined,
    projectId: spec.projectId,
    releaseSha: spec.releaseSha,
    runKey: spec.runKey,
  };
}

class NeonApiRequestError extends Error {
  readonly status: number | null;

  constructor(status: number | null) {
    super(status === null
      ? "Neon API request did not return a response."
      : `Neon API request failed with HTTP ${status}.`);
    this.name = "NeonApiRequestError";
    this.status = status;
  }
}

async function responseJson(response: Response): Promise<unknown> {
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength
    && (
      !/^[0-9]+$/.test(declaredLength)
      || Number(declaredLength) > MAX_RESPONSE_BYTES
    )
  ) {
    fail("Neon API response exceeded the safety limit.");
  }
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) {
    fail("Neon API response exceeded the safety limit.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return fail("Neon API returned invalid JSON.");
  }
}

export class NeonRecoveryClient {
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly pause: (milliseconds: number) => Promise<void>;
  private readonly pollIntervalMs: number;
  private readonly timeoutMs: number;

  constructor(options: NeonRecoveryClientOptions) {
    this.apiKey = requiredString(
      options.apiKey,
      "NEON_RECOVERY_API_KEY",
      /^[A-Za-z0-9_-]{32,256}$/,
    );
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
    this.pause = options.pause ?? ((milliseconds) => delay(milliseconds));
    this.pollIntervalMs = options.pollIntervalMs ?? 2_000;
    this.timeoutMs = options.timeoutMs ?? 180_000;
    if (
      !Number.isSafeInteger(this.pollIntervalMs)
      || this.pollIntervalMs < 10
      || this.pollIntervalMs > 10_000
      || !Number.isSafeInteger(this.timeoutMs)
      || this.timeoutMs < 1_000
      || this.timeoutMs > 300_000
    ) {
      fail("Neon recovery polling configuration is invalid.");
    }
  }

  private async request(
    path: string,
    init: { method?: "GET" | "POST" | "DELETE"; body?: JsonObject } = {},
  ): Promise<unknown> {
    const pathname = path.split("?", 1)[0];
    if (
      !pathname.startsWith(`${NEON_API_PREFIX}/projects/`)
      || pathname.includes("..")
      || /[\r\n]/.test(path)
    ) {
      fail("Refusing an invalid Neon API path.");
    }
    let response: Response;
    try {
      response = await this.fetchImpl(`${NEON_API_ORIGIN}${path}`, {
        method: init.method ?? "GET",
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          "User-Agent": "InfraSight-recovery-exercise",
        },
        body: init.body ? JSON.stringify(init.body) : undefined,
      });
    } catch {
      throw new NeonApiRequestError(null);
    }
    if (!response.ok) throw new NeonApiRequestError(response.status);
    return responseJson(response);
  }

  async getProject(projectId: string): Promise<NeonProject> {
    requiredString(projectId, "Neon project ID", SAFE_RESOURCE_ID);
    const payload = object(
      await this.request(`${NEON_API_PREFIX}/projects/${projectId}`),
      "Neon project response",
    );
    return parseProject(payload.project, projectId);
  }

  async getBranch(
    projectId: string,
    branchId: string,
  ): Promise<NeonBranchDetail | null> {
    requiredString(projectId, "Neon project ID", SAFE_RESOURCE_ID);
    requiredString(branchId, "Neon branch ID", SAFE_RESOURCE_ID);
    let payload: unknown;
    try {
      payload = await this.request(
        `${NEON_API_PREFIX}/projects/${projectId}/branches/${branchId}`,
      );
    } catch (error) {
      if (error instanceof NeonApiRequestError && error.status === 404) return null;
      throw error;
    }
    const response = object(payload, "Neon branch response");
    return {
      branch: parseBranch(response.branch),
      annotation: parseAnnotation(response.annotation),
    };
  }

  async listBranches(
    projectId: string,
    search: string,
  ): Promise<NeonBranch[]> {
    return this.listBranchesMatching(projectId, search, "exact");
  }

  async listBranchesWithPrefix(
    projectId: string,
    prefix: string,
  ): Promise<NeonBranch[]> {
    return this.listBranchesMatching(projectId, prefix, "prefix");
  }

  private async listBranchesMatching(
    projectId: string,
    search: string,
    match: "exact" | "prefix",
  ): Promise<NeonBranch[]> {
    requiredString(projectId, "Neon project ID", SAFE_RESOURCE_ID);
    requiredString(search, "Neon branch search", SAFE_BRANCH_NAME);
    const branches: NeonBranch[] = [];
    const branchIds = new Set<string>();
    const cursors = new Set<string>();
    let cursor: string | undefined;

    for (let page = 0; page < MAX_BRANCH_LIST_PAGES; page += 1) {
      const query = new URLSearchParams({
        search,
        limit: "100",
        sort_by: "created_at",
        sort_order: "asc",
      });
      if (cursor) query.set("cursor", cursor);
      const payload = object(
        await this.request(
          `${NEON_API_PREFIX}/projects/${projectId}/branches?${query.toString()}`,
        ),
        "Neon branch-list response",
      );
      if (!Array.isArray(payload.branches)) {
        fail("Neon branch-list response is invalid.");
      }
      for (const value of payload.branches) {
        const branch = parseBranch(value);
        if (branchIds.has(branch.id)) {
          fail("Neon branch pagination returned a duplicate branch.");
        }
        branchIds.add(branch.id);
        branches.push(branch);
      }
      const pagination = payload.pagination === undefined
        ? {}
        : object(payload.pagination, "Neon branch pagination");
      if (
        pagination.next === undefined
        || pagination.next === null
        || pagination.next === ""
      ) {
        return branches.filter((branch) =>
          match === "exact" ? branch.name === search : branch.name.startsWith(search));
      }
      const next = requiredString(pagination.next, "Neon branch pagination cursor");
      if (
        Buffer.byteLength(next) > MAX_CURSOR_BYTES
        || cursors.has(next)
      ) {
        fail("Neon branch pagination cursor is invalid.");
      }
      cursors.add(next);
      cursor = next;
    }

    fail("Neon branch reconciliation exceeded the bounded result set.");
  }

  async listEndpoints(
    projectId: string,
    branchId: string,
  ): Promise<NeonEndpoint[]> {
    requiredString(projectId, "Neon project ID", SAFE_RESOURCE_ID);
    requiredString(branchId, "Neon branch ID", SAFE_RESOURCE_ID);
    const payload = object(
      await this.request(
        `${NEON_API_PREFIX}/projects/${projectId}/branches/${branchId}/endpoints`,
      ),
      "Neon endpoint-list response",
    );
    if (!Array.isArray(payload.endpoints)) {
      fail("Neon endpoint-list response is invalid.");
    }
    return payload.endpoints.map(parseEndpoint);
  }

  async getOperation(
    projectId: string,
    operationId: string,
  ): Promise<NeonOperation> {
    requiredString(projectId, "Neon project ID", SAFE_RESOURCE_ID);
    requiredString(operationId, "Neon operation ID", SAFE_OPERATION_ID);
    const payload = object(
      await this.request(
        `${NEON_API_PREFIX}/projects/${projectId}/operations/${operationId}`,
      ),
      "Neon operation response",
    );
    return parseOperation(payload.operation);
  }

  async pollOperations(
    projectId: string,
    operations: NeonOperation[],
    expectedBranchId: string,
  ): Promise<void> {
    const ids = [...new Set(operations.map((operation) => operation.id))];
    if (ids.length > 20) fail("Neon operation set exceeded the safety limit.");
    const pending = new Set(ids);
    const deadline = this.now() + this.timeoutMs;
    while (pending.size > 0) {
      for (const id of [...pending]) {
        const operation = await this.getOperation(projectId, id);
        if (
          operation.project_id !== projectId
          || (operation.branch_id && operation.branch_id !== expectedBranchId)
          || operation.failures_count > 0
          || TERMINAL_OPERATION_FAILURES.has(operation.status)
        ) {
          fail("Neon branch operation failed its exact identity or completion guard.");
        }
        if (operation.status === "finished") pending.delete(id);
      }
      if (pending.size === 0) return;
      if (this.now() >= deadline) fail("Neon branch operation timed out.");
      await this.pause(this.pollIntervalMs);
    }
  }

  private async readyCreatedBranch(
    spec: CreateBranchSpec,
    branch: NeonBranch,
    reconciled: boolean,
  ): Promise<CreatedBranch> {
    const guard = recoveryBranchGuard(branch, spec);
    const deadline = this.now() + this.timeoutMs;
    for (;;) {
      const detail = await this.getBranch(spec.projectId, guard.branchId);
      if (!detail) fail("Created recovery branch disappeared before verification.");
      assertCreatedBranchGuard(detail, guard);
      const endpoints = (await this.listEndpoints(spec.projectId, guard.branchId))
        .filter((endpoint) => endpoint.type === "read_write");
      if (endpoints.length !== 1) {
        fail("Created recovery branch must have exactly one read-write endpoint.");
      }
      const endpoint = endpoints[0];
      if (
        endpoint.project_id !== spec.projectId
        || endpoint.branch_id !== guard.branchId
      ) {
        fail("Created recovery endpoint failed its exact branch guard.");
      }
      if (
        detail.branch.current_state === "ready"
        && new Set(["active", "idle"]).has(endpoint.current_state)
      ) {
        return { branch: detail.branch, endpoint, guard, reconciled };
      }
      if (this.now() >= deadline) fail("Created recovery branch did not become ready.");
      await this.pause(this.pollIntervalMs);
    }
  }

  private async reconcileCreatedBranch(
    spec: CreateBranchSpec,
    attempts = Math.max(
      1,
      Math.min(30, Math.ceil(this.timeoutMs / this.pollIntervalMs)),
    ),
  ): Promise<NeonBranch | null> {
    const requestedAt = Date.parse(spec.requestedAt);
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const candidates = await this.listBranches(spec.projectId, spec.branchName);
      const matching: NeonBranch[] = [];
      for (const branch of candidates) {
        const detail = await this.getBranch(spec.projectId, branch.id);
        if (!detail) continue;
        const guard = recoveryBranchGuard(branch, spec);
        try {
          assertCreatedBranchGuard(detail, guard);
          if (Date.parse(branch.created_at) + 5_000 < requestedAt) {
            fail("Reconciled recovery branch predates this request.");
          }
          matching.push(branch);
        } catch {
          fail("Recovery branch name is occupied by an untrusted branch.");
        }
      }
      if (matching.length > 1) {
        fail("Non-idempotent Neon create produced ambiguous recovery branches.");
      }
      if (matching.length === 1) return matching[0];
      if (attempt < attempts - 1) await this.pause(this.pollIntervalMs);
    }
    return null;
  }

  async createBranchReconciled(spec: CreateBranchSpec): Promise<CreatedBranch> {
    assertCreateSpec(spec);
    const existing = await this.reconcileCreatedBranch(spec, 1);
    if (existing) return this.readyCreatedBranch(spec, existing, true);

    let payload: unknown;
    try {
      payload = await this.request(
        `${NEON_API_PREFIX}/projects/${spec.projectId}/branches`,
        {
          method: "POST",
          body: {
            branch: {
              parent_id: spec.parentBranchId,
              name: spec.branchName,
              protected: false,
              init_source: "parent-data",
              ...(spec.parentLsn
                ? { parent_lsn: normalizeLsn(spec.parentLsn) }
                : {}),
            },
            endpoints: [{ type: "read_write" }],
            annotation_value: expectedAnnotations(spec),
          },
        },
      );
    } catch (requestFailure) {
      const reconciled = await this.reconcileCreatedBranch(spec);
      if (!reconciled) throw requestFailure;
      return this.readyCreatedBranch(spec, reconciled, true);
    }

    const response = object(payload, "Neon create-branch response");
    const branch = parseBranch(response.branch);
    const guard = recoveryBranchGuard(branch, spec);
    if (!Array.isArray(response.operations)) {
      fail("Neon create-branch operations are invalid.");
    }
    const operations = response.operations.map(parseOperation);
    if (operations.length === 0) {
      fail("Neon create-branch response omitted operation evidence.");
    }
    await this.pollOperations(spec.projectId, operations, guard.branchId);
    return this.readyCreatedBranch(spec, branch, false);
  }

  async deleteCreatedBranch(
    guard: CreatedBranchGuard,
  ): Promise<{ alreadyDeleted: boolean; branchId: string; deleted: true; kind: string }> {
    requiredString(guard.branchId, "cleanup branch ID", SAFE_RESOURCE_ID);
    requiredString(guard.projectId, "cleanup project ID", SAFE_RESOURCE_ID);
    let detail = await this.getBranch(guard.projectId, guard.branchId);
    if (!detail) {
      return {
        alreadyDeleted: true,
        branchId: guard.branchId,
        deleted: true,
        kind: guard.kind,
      };
    }
    assertCreatedBranchGuard(detail, guard);

    let lastFailure: unknown;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        const response = object(
          await this.request(
            `${NEON_API_PREFIX}/projects/${guard.projectId}/branches/${guard.branchId}`,
            { method: "DELETE" },
          ),
          "Neon delete-branch response",
        );
        if (!Array.isArray(response.operations)) {
          fail("Neon delete-branch operations are invalid.");
        }
        await this.pollOperations(
          guard.projectId,
          response.operations.map(parseOperation),
          guard.branchId,
        );
        lastFailure = undefined;
        break;
      } catch (error) {
        lastFailure = error;
        detail = await this.getBranch(guard.projectId, guard.branchId);
        if (!detail) {
          lastFailure = undefined;
          break;
        }
        assertCreatedBranchGuard(detail, guard);
        if (attempt < 9) await this.pause(this.pollIntervalMs);
      }
    }
    if (lastFailure) throw lastFailure;

    const deadline = this.now() + this.timeoutMs;
    for (;;) {
      if (!await this.getBranch(guard.projectId, guard.branchId)) {
        return {
          alreadyDeleted: false,
          branchId: guard.branchId,
          deleted: true,
          kind: guard.kind,
        };
      }
      if (this.now() >= deadline) fail("Recovery branch deletion timed out.");
      await this.pause(this.pollIntervalMs);
    }
  }

  /**
   * Crash-safe cleanup for the interval after a non-idempotent create request
   * may have reached Neon but before its returned branch ID was persisted.
   * Reconciliation accepts only this run's exact deterministic name, parent,
   * timestamp, release SHA, and annotations before delegating to the normal
   * exact-ID deletion guard.
   */
  async deleteReconciledBranch(
    spec: CreateBranchSpec,
  ): Promise<{
    alreadyDeleted: boolean;
    branchId: string | null;
    deleted: true;
    kind: string;
    reconciled: true;
  }> {
    assertCreateSpec(spec);
    const branch = await this.reconcileCreatedBranch(spec);
    if (!branch) {
      return {
        alreadyDeleted: true,
        branchId: null,
        deleted: true,
        kind: spec.kind,
        reconciled: true,
      };
    }
    const result = await this.deleteCreatedBranch(recoveryBranchGuard(branch, spec));
    return { ...result, reconciled: true };
  }
}

export function assertRedactedRecoveryEvidence(value: unknown): void {
  const visit = (item: unknown, key = ""): void => {
    if (/url|host|token|password|secret|credential|connection/i.test(key)) {
      fail("Recovery evidence contains a forbidden sensitive field.");
    }
    if (typeof item === "string") {
      if (
        item.includes("://")
        || item.includes("@")
        || /postgres(?:ql)?:/i.test(item)
        || SAFE_NEON_HOST.test(item)
      ) {
        fail("Recovery evidence contains a sensitive value.");
      }
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((entry) => visit(entry, key));
      return;
    }
    if (item && typeof item === "object") {
      for (const [childKey, child] of Object.entries(item)) visit(child, childKey);
    }
  };
  visit(value);
}
