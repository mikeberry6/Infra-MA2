import {
  getSafeErrorDetails,
  type SafeErrorClassification,
} from "@/lib/safe-error";
import {
  createServerRequestId,
  getServerRequestContext,
} from "@/lib/server-request-context";

export const SERVER_ROUTES = {
  trackerPage: "/tracker",
  fundsPage: "/funds",
  portfolioPage: "/portfolio",
  dashboardPage: "/dashboard",
  newsPage: "/news",
  latestEmail: "/email-format/latest",
  health: "/api/health",
  dealDetail: "/api/deals/[legacyId]",
  fundDetail: "/api/funds/[legacyId]",
  portfolioDetail: "/api/portfolio/[id]",
  importDeals: "/api/imports/deals",
  importFunds: "/api/imports/funds",
  importPortfolio: "/api/imports/portfolio",
  exportDeals: "/api/exports/deals",
  exportFunds: "/api/exports/funds",
  exportPortfolio: "/api/exports/portfolio",
  exportPermission: "/api/export-permission",
} as const;

export const SERVER_OPERATIONS = {
  trackerPageRead: "tracker-page.read",
  fundsPageRead: "funds-page.read",
  portfolioPageRead: "portfolio-page.read",
  dashboardPageRead: "dashboard-page.read",
  newsPageRead: "news-page.read",
  latestEmailResolve: "latest-email.resolve",
  healthRead: "health.read",
  dealDetailRead: "deal-detail.read",
  fundDetailRead: "fund-detail.read",
  portfolioDetailRead: "portfolio-detail.read",
  importPreview: "import.preview",
  importCommit: "import.commit",
  exportRead: "export.read",
  exportPermissionRead: "export-permission.read",
} as const;

export type ServerRoute = (typeof SERVER_ROUTES)[keyof typeof SERVER_ROUTES];
export type ServerOperation = (typeof SERVER_OPERATIONS)[keyof typeof SERVER_OPERATIONS];

const ROUTE_ALLOWLIST = new Set<string>(Object.values(SERVER_ROUTES));
const OPERATION_ALLOWLIST = new Set<string>(Object.values(SERVER_OPERATIONS));
const ERROR_CLASS_ALLOWLIST = new Set<SafeErrorClassification>([
  "authorization_error",
  "configuration_error",
  "conflict_error",
  "database_error",
  "internal_error",
  "not_found",
  "timeout_error",
  "upstream_error",
  "validation_error",
]);

export interface ServerLogInput {
  route: ServerRoute;
  operation: ServerOperation;
  startedAt: number;
  status: number;
  error?: unknown;
  errorClass?: SafeErrorClassification;
}

type ServerLogRecord = {
  route: ServerRoute;
  operation: ServerOperation;
  durationMs: number;
  status: number;
  requestId: string;
  errorClass?: SafeErrorClassification;
};

/**
 * Emit one deliberately small server record. URL, query, arguments, entity
 * names, imported rows, exception text, and arbitrary metadata have no place
 * in either the type or the serialized output.
 */
export function logServerRequest(input: ServerLogInput): ServerLogRecord {
  assertStaticLabel(input.route, ROUTE_ALLOWLIST, "route");
  assertStaticLabel(input.operation, OPERATION_ALLOWLIST, "operation");
  if (!Number.isInteger(input.status) || input.status < 100 || input.status > 599) {
    throw new Error("Server log status must be an HTTP status code.");
  }

  const elapsed = performance.now() - input.startedAt;
  const durationMs = Number.isFinite(elapsed) && elapsed > 0
    ? Math.round(elapsed)
    : 0;
  const derivedErrorClass = input.error === undefined
    ? undefined
    : getSafeErrorDetails(input.error, input.status)?.classification;
  const errorClass = safeErrorClass(input.errorClass ?? derivedErrorClass);
  const record: ServerLogRecord = {
    route: input.route,
    operation: input.operation,
    durationMs,
    status: input.status,
    requestId: getServerRequestContext()?.requestId ?? createServerRequestId(),
    ...(errorClass ? { errorClass } : {}),
  };
  const serialized = JSON.stringify(record);
  if (input.status >= 500) console.error(serialized);
  else console.info(serialized);
  return record;
}

export async function withServerOperationLogging<T extends Response>(
  route: ServerRoute,
  operation: ServerOperation,
  callback: () => Promise<T>,
): Promise<T> {
  const startedAt = performance.now();
  try {
    const response = await callback();
    logServerRequest({ route, operation, startedAt, status: response.status });
    return response;
  } catch (error) {
    logServerRequest({ route, operation, startedAt, status: 500, error });
    throw error;
  }
}

function assertStaticLabel(
  value: string,
  allowlist: ReadonlySet<string>,
  field: "route" | "operation",
): void {
  if (!allowlist.has(value)) {
    throw new Error(`Server log ${field} must use a declared static label.`);
  }
}

function safeErrorClass(
  value: SafeErrorClassification | undefined,
): SafeErrorClassification | undefined {
  return value && ERROR_CLASS_ALLOWLIST.has(value) ? value : undefined;
}
