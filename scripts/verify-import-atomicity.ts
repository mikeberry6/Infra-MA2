import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONFIRMATION = "VERIFY";
const ENTITY_TYPE = "deals";
const CONFIRM_ACTION = "IMPORT_ATOMICITY_CONFIRM";
const ROLLBACK_ACTION = "IMPORT_ATOMICITY_ROLLBACK";
const SYNTHETIC_PREFIX = "__infrasight_import_atomicity_probe__";

export interface ImportAtomicityEnvironment {
  IMPORT_VALIDATION_DATABASE_URL?: string;
  EXPECTED_IMPORT_VALIDATION_HOST?: string;
  IMPORT_VALIDATION_CONFIRM?: string;
}

export interface ImportAtomicityTarget {
  databaseUrl: string;
  hostname: string;
}

export class ImportAtomicityGuardError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ImportAtomicityGuardError";
  }
}

class ImportAtomicityProbeError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ImportAtomicityProbeError";
  }
}

class ForcedRollbackError extends Error {
  constructor() {
    super("FORCED_ROLLBACK");
    this.name = "ForcedRollbackError";
  }
}

/**
 * Validate the destructive-test target without mutating process.env.
 * No database-backed application module may be imported before this succeeds.
 */
export function validateImportAtomicityTarget(
  environment: ImportAtomicityEnvironment,
): ImportAtomicityTarget {
  const databaseUrl = environment.IMPORT_VALIDATION_DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new ImportAtomicityGuardError("VALIDATION_DATABASE_URL_REQUIRED");
  }

  const expectedHost = environment.EXPECTED_IMPORT_VALIDATION_HOST?.trim();
  if (!expectedHost) {
    throw new ImportAtomicityGuardError("EXPECTED_VALIDATION_HOST_REQUIRED");
  }

  if (environment.IMPORT_VALIDATION_CONFIRM !== CONFIRMATION) {
    throw new ImportAtomicityGuardError("EXACT_CONFIRMATION_REQUIRED");
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new ImportAtomicityGuardError("VALIDATION_DATABASE_URL_INVALID");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new ImportAtomicityGuardError("VALIDATION_DATABASE_PROTOCOL_INVALID");
  }
  if (!parsed.hostname || parsed.hostname !== expectedHost) {
    throw new ImportAtomicityGuardError("VALIDATION_DATABASE_HOST_MISMATCH");
  }

  return { databaseUrl, hostname: parsed.hostname };
}

function assertProbe(condition: unknown, code: string): asserts condition {
  if (!condition) throw new ImportAtomicityProbeError(code);
}

function directExecution(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

async function runProbe(target: ImportAtomicityTarget) {
  // These assignments intentionally happen only after every target guard has
  // passed. The random secret signs disposable preview tokens for this run.
  process.env.DATABASE_URL = target.databaseUrl;
  process.env.NEXTAUTH_SECRET = randomBytes(48).toString("base64url");

  const [
    { prisma },
    { withImportTransaction },
    {
      createStoredImportPreview,
      hashImportPreviewState,
      lockStoredImportPreview,
      markStoredImportPreviewCommitted,
    },
  ] = await Promise.all([
    import("../src/lib/prisma.ts"),
    import("../src/lib/prisma-transaction.ts"),
    import("../src/modules/imports/preview-store.ts"),
  ]);

  const runKey = `${Date.now()}_${randomUUID().replaceAll("-", "")}`;
  const prefix = `${SYNTHETIC_PREFIX}${runKey}`;
  const actorId = randomUUID();
  const actorEmail = `${prefix}@invalid.example`;
  const confirmAuditId = randomUUID();
  const rollbackAuditId = randomUUID();
  const concurrencyDealId = randomUUID();
  const rollbackDealId = randomUUID();
  const rollbackOrganizationId = randomUUID();
  const rollbackParticipantId = randomUUID();
  const concurrencyLegacyId = `${prefix}_concurrency_deal`;
  const rollbackLegacyId = `${prefix}_deal`;
  const rollbackOrganizationName = `${prefix}_organization`;

  let concurrencyResult:
    | {
      confirmations: number;
      entityRows: number;
      audits: number;
      receipts: number;
      retryAttempts: number;
    }
    | undefined;
  let rollbackResult:
    | {
      entityRows: number;
      sideTableRows: number;
      organizationRows: number;
      audits: number;
      receipts: number;
      previewRemainedUsable: boolean;
    }
    | undefined;
  let cleanupResult:
    | {
      users: number;
      previews: number;
      audits: number;
      entities: number;
      sideTableRows: number;
      organizations: number;
    }
    | undefined;

  try {
    await withImportTransaction(async (tx) => {
      await tx.user.create({
        data: {
          id: actorId,
          email: actorEmail,
          passwordHash: "synthetic-probe-not-a-login-credential",
          name: "Synthetic import atomicity probe",
          role: "ADMIN",
        },
      });
    });

    const concurrencyPreview = await createStoredImportPreview({
      actorId,
      entityType: ENTITY_TYPE,
      fileName: "synthetic-concurrency.csv",
      payload: [{ synthetic: "concurrency" }],
      report: [{ row: 2, disposition: "CREATE" }],
      summary: {
        total: 1,
        valid: 1,
        creates: 1,
        updates: 0,
        quarantined: 0,
        errors: 0,
      },
      stateHash: hashImportPreviewState({
        synthetic: "concurrency",
        runKey,
      }),
    });

    let firstAttempts = 0;
    let secondAttempts = 0;
    let firstLockSignalSent = false;
    let signalFirstLock: (() => void) | undefined;
    const firstLockAcquired = new Promise<void>((resolve) => {
      signalFirstLock = resolve;
    });

    const confirm = async (
      caller: "first" | "second",
      holdLock: boolean,
    ) => withImportTransaction(async (tx) => {
      if (caller === "first") firstAttempts += 1;
      else secondAttempts += 1;

      const locked = await lockStoredImportPreview(tx, {
        token: concurrencyPreview.token,
        actorId,
        entityType: ENTITY_TYPE,
      });
      if (!firstLockSignalSent && caller === "first") {
        firstLockSignalSent = true;
        signalFirstLock?.();
      }
      if (locked.committedReceipt) return locked.committedReceipt;

      if (holdLock) {
        await tx.$queryRawUnsafe(
          `SELECT 1 AS "held" FROM pg_sleep(1.0)`,
        );
      }

      await tx.deal.create({
        data: {
          id: concurrencyDealId,
          legacyId: concurrencyLegacyId,
          title: "Synthetic concurrency probe deal",
          target: "Synthetic concurrency probe target",
          sector: "DIGITAL",
          region: "NORTH_AMERICA",
          categories: ["ACQUISITION_BUYOUT"],
          date: new Date("2026-01-01T00:00:00.000Z"),
          dealStatus: "ANNOUNCED",
          keyHighlights: [],
          status: "DRAFT",
        },
      });
      const audit = await tx.auditEvent.create({
        data: {
          id: confirmAuditId,
          actorId,
          entityType: "ImportAtomicityProbe",
          entityId: concurrencyPreview.id,
          action: CONFIRM_ACTION,
          changes: {
            synthetic: true,
            created: 1,
            updated: 0,
          },
        },
        select: { id: true },
      });
      return markStoredImportPreviewCommitted(tx, {
        id: concurrencyPreview.id,
        auditEventId: audit.id,
        result: {
          created: 1,
          updated: 0,
          unchanged: 0,
          quarantined: 0,
          changedFields: ["deal"],
        },
      });
    });

    const firstConfirmation = confirm("first", true);
    await Promise.race([
      firstLockAcquired,
      firstConfirmation.then(() => {
        throw new ImportAtomicityProbeError(
          "FIRST_CONFIRMATION_FINISHED_BEFORE_OVERLAP",
        );
      }),
    ]);
    const secondConfirmation = confirm("second", false);
    const returnedReceipts = await Promise.all([
      firstConfirmation,
      secondConfirmation,
    ]);

    const [
      concurrencyEntityCount,
      confirmAuditCount,
      persistedConcurrencyPreview,
    ] = await Promise.all([
      prisma.deal.count({ where: { id: concurrencyDealId } }),
      prisma.auditEvent.count({
        where: {
          id: confirmAuditId,
          actorId,
          entityId: concurrencyPreview.id,
          action: CONFIRM_ACTION,
        },
      }),
      prisma.importPreview.findUnique({
        where: { id: concurrencyPreview.id },
        select: {
          committedAt: true,
          auditEventId: true,
          result: true,
        },
      }),
    ]);
    const persistedReceiptCount = persistedConcurrencyPreview?.committedAt
      && persistedConcurrencyPreview.auditEventId
      && persistedConcurrencyPreview.result !== null
      ? 1
      : 0;

    assertProbe(returnedReceipts.length === 2, "CONFIRMATION_COUNT_INVALID");
    assertProbe(
      returnedReceipts.every(
        (receipt) => receipt.previewId === concurrencyPreview.id,
      ),
      "CONFIRMATION_PREVIEW_MISMATCH",
    );
    assertProbe(
      returnedReceipts.every(
        (receipt) => receipt.auditEventId === confirmAuditId,
      ),
      "CONFIRMATION_AUDIT_MISMATCH",
    );
    assertProbe(
      concurrencyEntityCount === 1,
      "CONFIRMATION_ENTITY_NOT_EXACTLY_ONCE",
    );
    assertProbe(confirmAuditCount === 1, "CONFIRMATION_AUDIT_NOT_EXACTLY_ONCE");
    assertProbe(
      persistedReceiptCount === 1,
      "CONFIRMATION_RECEIPT_NOT_EXACTLY_ONCE",
    );
    assertProbe(firstAttempts === 1, "LOCK_HOLDER_RETRIED_UNEXPECTEDLY");
    assertProbe(secondAttempts >= 2, "SERIALIZABLE_RETRY_NOT_OBSERVED");

    concurrencyResult = {
      confirmations: returnedReceipts.length,
      entityRows: concurrencyEntityCount,
      audits: confirmAuditCount,
      receipts: persistedReceiptCount,
      retryAttempts: secondAttempts,
    };

    const rollbackPreview = await createStoredImportPreview({
      actorId,
      entityType: ENTITY_TYPE,
      fileName: "synthetic-rollback.csv",
      payload: [{ synthetic: "rollback" }],
      report: [{ row: 2, disposition: "CREATE" }],
      summary: {
        total: 1,
        valid: 1,
        creates: 1,
        updates: 0,
        quarantined: 0,
        errors: 0,
      },
      stateHash: hashImportPreviewState({
        synthetic: "rollback",
        runKey,
      }),
    });

    let forcedRollbackObserved = false;
    try {
      await withImportTransaction(async (tx) => {
        await lockStoredImportPreview(tx, {
          token: rollbackPreview.token,
          actorId,
          entityType: ENTITY_TYPE,
        });
        await tx.deal.create({
          data: {
            id: rollbackDealId,
            legacyId: rollbackLegacyId,
            title: "Synthetic rollback probe deal",
            target: "Synthetic rollback probe target",
            sector: "DIGITAL",
            region: "NORTH_AMERICA",
            categories: ["ACQUISITION_BUYOUT"],
            date: new Date("2026-01-01T00:00:00.000Z"),
            dealStatus: "ANNOUNCED",
            keyHighlights: [],
            status: "DRAFT",
          },
        });
        await tx.organization.create({
          data: {
            id: rollbackOrganizationId,
            name: rollbackOrganizationName,
            types: ["OTHER"],
            status: "DRAFT",
          },
        });
        await tx.dealParticipant.create({
          data: {
            id: rollbackParticipantId,
            dealId: rollbackDealId,
            organizationId: rollbackOrganizationId,
            role: "BUYER",
            displayName: "Synthetic rollback participant",
          },
        });
        await tx.auditEvent.create({
          data: {
            id: rollbackAuditId,
            actorId,
            entityType: "ImportAtomicityProbe",
            entityId: rollbackPreview.id,
            action: ROLLBACK_ACTION,
            changes: { synthetic: true },
          },
        });
        await markStoredImportPreviewCommitted(tx, {
          id: rollbackPreview.id,
          auditEventId: rollbackAuditId,
          result: {
            created: 1,
            updated: 0,
            unchanged: 0,
            quarantined: 0,
            changedFields: ["deal", "participant"],
          },
        });
        throw new ForcedRollbackError();
      });
    } catch (error) {
      if (!(error instanceof ForcedRollbackError)) throw error;
      forcedRollbackObserved = true;
    }
    assertProbe(forcedRollbackObserved, "FORCED_ROLLBACK_NOT_OBSERVED");

    const [
      rollbackEntityRows,
      rollbackSideTableRows,
      rollbackOrganizationRows,
      rollbackAuditRows,
      persistedRollbackPreview,
    ] = await Promise.all([
      prisma.deal.count({ where: { id: rollbackDealId } }),
      prisma.dealParticipant.count({
        where: { id: rollbackParticipantId },
      }),
      prisma.organization.count({
        where: { id: rollbackOrganizationId },
      }),
      prisma.auditEvent.count({ where: { id: rollbackAuditId } }),
      prisma.importPreview.findUnique({
        where: { id: rollbackPreview.id },
        select: {
          consumedAt: true,
          committedAt: true,
          auditEventId: true,
          result: true,
          payload: true,
          report: true,
        },
      }),
    ]);
    const rollbackReceiptCount = persistedRollbackPreview
      && (
        persistedRollbackPreview.committedAt
        || persistedRollbackPreview.auditEventId
        || persistedRollbackPreview.result !== null
      )
      ? 1
      : 0;
    const previewRemainedUsable = Boolean(
      persistedRollbackPreview
      && !persistedRollbackPreview.consumedAt
      && !persistedRollbackPreview.committedAt
      && !persistedRollbackPreview.auditEventId
      && persistedRollbackPreview.result === null
      && persistedRollbackPreview.payload !== null
      && persistedRollbackPreview.report !== null,
    );

    assertProbe(rollbackEntityRows === 0, "ROLLBACK_ENTITY_PERSISTED");
    assertProbe(
      rollbackSideTableRows === 0,
      "ROLLBACK_SIDE_TABLE_ROW_PERSISTED",
    );
    assertProbe(
      rollbackOrganizationRows === 0,
      "ROLLBACK_ORGANIZATION_PERSISTED",
    );
    assertProbe(rollbackAuditRows === 0, "ROLLBACK_AUDIT_PERSISTED");
    assertProbe(rollbackReceiptCount === 0, "ROLLBACK_RECEIPT_PERSISTED");
    assertProbe(previewRemainedUsable, "ROLLBACK_PREVIEW_WAS_CONSUMED");

    rollbackResult = {
      entityRows: rollbackEntityRows,
      sideTableRows: rollbackSideTableRows,
      organizationRows: rollbackOrganizationRows,
      audits: rollbackAuditRows,
      receipts: rollbackReceiptCount,
      previewRemainedUsable,
    };
  } finally {
    try {
      await withImportTransaction(async (tx) => {
        await tx.dealParticipant.deleteMany({
          where: { id: rollbackParticipantId },
        });
        await tx.deal.deleteMany({
          where: { id: { in: [concurrencyDealId, rollbackDealId] } },
        });
        await tx.organization.deleteMany({
          where: { id: rollbackOrganizationId },
        });
        await tx.importPreview.deleteMany({ where: { actorId } });
        await tx.auditEvent.deleteMany({ where: { actorId } });
        await tx.user.deleteMany({ where: { id: actorId } });
      });

      const [
        users,
        previews,
        audits,
        entities,
        sideTableRows,
        organizations,
      ] = await Promise.all([
        prisma.user.count({ where: { id: actorId } }),
        prisma.importPreview.count({ where: { actorId } }),
        prisma.auditEvent.count({ where: { actorId } }),
        prisma.deal.count({
          where: { id: { in: [concurrencyDealId, rollbackDealId] } },
        }),
        prisma.dealParticipant.count({
          where: { id: rollbackParticipantId },
        }),
        prisma.organization.count({
          where: { id: rollbackOrganizationId },
        }),
      ]);
      cleanupResult = {
        users,
        previews,
        audits,
        entities,
        sideTableRows,
        organizations,
      };
      assertProbe(
        Object.values(cleanupResult).every((count) => count === 0),
        "SYNTHETIC_CLEANUP_INCOMPLETE",
      );
    } finally {
      await prisma.$disconnect();
    }
  }

  assertProbe(concurrencyResult, "CONCURRENCY_RESULT_MISSING");
  assertProbe(rollbackResult, "ROLLBACK_RESULT_MISSING");
  assertProbe(cleanupResult, "CLEANUP_RESULT_MISSING");

  return {
    event: "import_atomicity_verification",
    status: "passed",
    concurrency: concurrencyResult,
    rollback: rollbackResult,
    cleanup: cleanupResult,
  };
}

async function main() {
  const target = validateImportAtomicityTarget({
    IMPORT_VALIDATION_DATABASE_URL:
      process.env.IMPORT_VALIDATION_DATABASE_URL,
    EXPECTED_IMPORT_VALIDATION_HOST:
      process.env.EXPECTED_IMPORT_VALIDATION_HOST,
    IMPORT_VALIDATION_CONFIRM: process.env.IMPORT_VALIDATION_CONFIRM,
  });
  const result = await runProbe(target);
  console.log(JSON.stringify(result));
}

if (directExecution()) {
  main().catch((error) => {
    const candidate = error && typeof error === "object"
      ? error as {
        code?: unknown;
        meta?: {
          driverAdapterError?: {
            cause?: { originalCode?: unknown };
          };
        };
      }
      : null;
    console.error(JSON.stringify({
      event: "import_atomicity_verification",
      status: "failed",
      failureCode:
        error instanceof ImportAtomicityGuardError
        || error instanceof ImportAtomicityProbeError
          ? error.code
          : "UNEXPECTED_FAILURE",
      errorType: error instanceof Error ? error.name : "UnknownError",
      prismaCode:
        typeof candidate?.code === "string" ? candidate.code : undefined,
      databaseCode:
        typeof candidate?.meta?.driverAdapterError?.cause?.originalCode
          === "string"
          ? candidate.meta.driverAdapterError.cause.originalCode
          : undefined,
      failureLocation:
        error instanceof Error
          ? error.stack?.split("\n")[1]?.trim() ?? "unavailable"
          : "unavailable",
    }));
    process.exitCode = 1;
  });
}
