import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const actions = readFileSync("src/modules/admin/actions.ts", "utf8");
const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const PRODUCTION_SOURCE_ROOTS = ["src", "scripts", "prisma"];
const AUDIT_FACTORY_PATH = "src/modules/operations/audit.ts";
const IMPORT_COMMIT_PATH = "src/modules/imports/commit.ts";
const ADMIN_CONTENT_TRANSACTION_PATHS = [
  "src/modules/admin/actions.ts",
  "src/modules/dashboard/admin-actions.ts",
];
const ADMIN_CONTENT_MODELS = new Set([
  "alias",
  "citation",
  "company",
  "companyRedirect",
  "dashboardSignal",
  "deal",
  "dealParticipant",
  "fund",
  "managementRole",
  "milestone",
  "newsMention",
  "organization",
  "ownershipPeriod",
  "source",
]);
const ADMIN_CONTENT_MUTATION_METHODS = new Set([
  "create",
  "createMany",
  "delete",
  "deleteMany",
  "update",
  "updateMany",
  "upsert",
]);
const ADMIN_CONTENT_MUTATION_HELPERS = new Set([
  "replacePrimaryCitation",
]);

function productionSourceFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const normalizedPath = absolutePath.split(path.sep).join("/");

    if (entry.isDirectory()) {
      if (
        entry.name === "generated"
        || entry.name === "node_modules"
        || entry.name === "__tests__"
      ) {
        continue;
      }
      files.push(...productionSourceFiles(absolutePath));
      continue;
    }

    if (
      entry.isFile()
      && SOURCE_EXTENSIONS.has(path.extname(entry.name))
      && !/\.(?:spec|test)\.[cm]?[jt]sx?$/.test(entry.name)
      && !normalizedPath.includes("/fixtures/")
    ) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isAuditEventCreate(node: ts.CallExpression): boolean {
  if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== "create") {
    return false;
  }

  const receiver = node.expression.expression;
  return ts.isPropertyAccessExpression(receiver) && receiver.name.text === "auditEvent";
}

function isRecordAuditEventCall(node: ts.CallExpression): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === "recordAuditEvent";
}

function isAuditMutationCall(node: ts.CallExpression): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === "auditMutation";
}

function hasIdentifierArgument(
  node: ts.CallExpression,
  argumentIndex: number,
  expectedName: string,
): boolean {
  const argument = node.arguments[argumentIndex];
  return Boolean(argument && ts.isIdentifier(argument) && argument.text === expectedName);
}

function isAuditEventCreateUsingClient(
  node: ts.CallExpression,
  expectedName: string,
): boolean {
  if (!isAuditEventCreate(node) || !ts.isPropertyAccessExpression(node.expression)) {
    return false;
  }
  const auditEventReceiver = node.expression.expression;
  return ts.isPropertyAccessExpression(auditEventReceiver)
    && ts.isIdentifier(auditEventReceiver.expression)
    && auditEventReceiver.expression.text === expectedName;
}

function isTransactionCall(node: ts.CallExpression): boolean {
  return ts.isPropertyAccessExpression(node.expression)
    && node.expression.name.text === "$transaction";
}

function contentMutationDescription(
  node: ts.CallExpression,
  transactionClientName: string,
  includeHelpers = true,
): string | null {
  if (
    includeHelpers
    && ts.isIdentifier(node.expression)
    && ADMIN_CONTENT_MUTATION_HELPERS.has(node.expression.text)
  ) {
    return node.expression.text;
  }
  if (
    !ts.isPropertyAccessExpression(node.expression)
    || !ADMIN_CONTENT_MUTATION_METHODS.has(node.expression.name.text)
  ) {
    return null;
  }
  const receiver = node.expression.expression;
  if (
    !ts.isPropertyAccessExpression(receiver)
    || !ts.isIdentifier(receiver.expression)
    || receiver.expression.text !== transactionClientName
    || !ADMIN_CONTENT_MODELS.has(receiver.name.text)
  ) {
    return null;
  }
  return `${receiver.name.text}.${node.expression.name.text}`;
}

function nonTransactionalAdminContentWrites(
  sourceText: string,
  sourcePath: string,
): string[] {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourcePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const failures: string[] = [];
  const inspect = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const mutation = contentMutationDescription(node, "prisma", false);
      if (mutation) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        failures.push(`${sourcePath}:${line + 1} (${mutation})`);
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(sourceFile);
  return failures;
}

function unauditedAdminContentTransactions(
  sourceText: string,
  sourcePath: string,
): string[] {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourcePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const failures: string[] = [];

  const inspect = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isTransactionCall(node)) {
      const callback = node.arguments[0];
      if (
        callback
        && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        && callback.parameters.length > 0
        && ts.isIdentifier(callback.parameters[0].name)
      ) {
        const transactionClientName = callback.parameters[0].name.text;
        const mutations: string[] = [];
        let hasAudit = false;
        const inspectTransaction = (transactionNode: ts.Node): void => {
          if (ts.isCallExpression(transactionNode)) {
            const mutation = contentMutationDescription(
              transactionNode,
              transactionClientName,
            );
            if (mutation) mutations.push(mutation);
            if (
              (
                isAuditMutationCall(transactionNode)
                && hasIdentifierArgument(transactionNode, 4, transactionClientName)
              )
              || (
                isRecordAuditEventCall(transactionNode)
                && hasIdentifierArgument(transactionNode, 1, transactionClientName)
              )
              || isAuditEventCreateUsingClient(transactionNode, transactionClientName)
            ) {
              hasAudit = true;
            }
          }
          ts.forEachChild(transactionNode, inspectTransaction);
        };
        inspectTransaction(callback.body);
        if (mutations.length > 0 && !hasAudit) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          failures.push(
            `${sourcePath}:${line + 1} (${[...new Set(mutations)].sort().join(", ")})`,
          );
        }
      }
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);
  return failures;
}

function exportedAsyncFunctionBlocks(sourceText: string): Array<{ name: string; body: string }> {
  const sourceFile = ts.createSourceFile(
    "actions.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  return sourceFile.statements.flatMap((node) => {
    if (
      !ts.isFunctionDeclaration(node)
      || !node.name
      || !node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      || !node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
    ) {
      return [];
    }
    return [{ name: node.name.text, body: node.getText(sourceFile) }];
  });
}

function propertyName(node: ts.ObjectLiteralElementLike): string | null {
  if (
    !ts.isPropertyAssignment(node)
    && !ts.isShorthandPropertyAssignment(node)
  ) {
    return null;
  }

  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
    return node.name.text;
  }
  return null;
}

function propertyInitializer(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | null {
  const property = object.properties.find((candidate) => propertyName(candidate) === name);
  return property && ts.isPropertyAssignment(property) ? property.initializer : null;
}

function changesObject(
  call: ts.CallExpression,
  auditEventCreate: boolean,
): ts.ObjectLiteralExpression | null {
  const argument = call.arguments[0];
  if (!argument || !ts.isObjectLiteralExpression(argument)) return null;

  const auditEnvelope = auditEventCreate
    ? propertyInitializer(argument, "data")
    : argument;
  if (!auditEnvelope || !ts.isObjectLiteralExpression(auditEnvelope)) return null;

  const changes = propertyInitializer(auditEnvelope, "changes");
  if (changes && ts.isObjectLiteralExpression(changes)) return changes;
  if (
    changes
    && ts.isCallExpression(changes)
    && ts.isIdentifier(changes.expression)
    && changes.expression.text === "toAuditSnapshot"
    && ts.isObjectLiteralExpression(changes.arguments[0])
  ) {
    return changes.arguments[0];
  }
  return null;
}

function declaresChangedFields(changes: ts.ObjectLiteralExpression | null): boolean {
  return Boolean(
    changes?.properties.some((property) => propertyName(property) === "changedFields"),
  );
}

function actionBlock(name: string, nextName?: string): string {
  const start = actions.indexOf(`export async function ${name}`);
  const end = nextName
    ? actions.indexOf(`export async function ${nextName}`, start + 1)
    : actions.length;
  expect(start, name).toBeGreaterThanOrEqual(0);
  expect(end, nextName ?? "end of file").toBeGreaterThan(start);
  return actions.slice(start, end);
}

describe("admin audit changed-field contracts", () => {
  it.each([
    ["createDeal", "updateDeal"],
    ["createFund", "updateFund"],
    ["createCompany", "updateCompany"],
  ])("%s records explicit field names instead of a record placeholder", (name, nextName) => {
    const block = actionBlock(name, nextName);

    expect(block).toContain('auditMutation(');
    expect(block).not.toContain('"record"');
  });

  it.each([
    ["updateDeal", "deleteDeal", "existingDeal", "deal"],
    ["updateFund", "deleteFund", "existingFund", "fund"],
    ["updateCompany", "deleteCompany", "existingCompany", "company"],
  ])("%s computes an exact, concurrency-safe field summary", (name, nextName, existing, model) => {
    const block = actionBlock(name, nextName);
    const transactionStart = block.indexOf("await prisma.$transaction");
    const snapshotRead = block.indexOf(`const ${existing} = await tx.${model}.findUnique`);

    expect(block).toContain("changedFieldSummary(");
    expect(block).toContain("changedFields,");
    expect(block).toContain(`updatedAt: ${existing}.updatedAt`);
    expect(block).toContain('isolationLevel: "Serializable"');
    expect(transactionStart).toBeGreaterThanOrEqual(0);
    expect(snapshotRead).toBeGreaterThan(transactionStart);
    expect(block).not.toContain(`await prisma.${model}.findUnique`);
    expect(block).not.toContain('"record"');
  });

  it.each([
    ["updateDeal", "deleteDeal", "existingDeal"],
    ["updateCompany", "deleteCompany", "existingCompany"],
  ])("%s audits full primary-citation cardinality before normalization", (name, nextName, existing) => {
    const block = actionBlock(name, nextName);
    const input = name === "updateDeal" ? "d" : "c";

    expect(block).toContain(`const existingPrimarySources = ${existing}.citations`);
    expect(block).toContain("citations: existingPrimarySources.map");
    expect(block).toContain(`citations: ${input}.sourceUrl ? [${input}.sourceUrl] : []`);
    expect(block).not.toContain("take: 1");
  });

  it.each([
    ["deleteDeal", "publishDeal"],
    ["deleteFund", "publishFund"],
    ["deleteCompany", "publishCompany"],
  ])("%s includes deleted field names with its existing snapshot", (name, nextName) => {
    const block = actionBlock(name, nextName);

    expect(block).toContain("deletedFieldSummary(");
    expect(block).toContain("beforeSnapshot:");
  });

  it("covers ownership child create, update, and delete mutations", () => {
    const ownership = actionBlock("addOwnershipPeriod");

    expect(ownership).toContain("changedFieldSummary({}, ownershipAuditSnapshot(created))");
    expect(ownership).toContain("changedFieldSummary(beforeSnapshot, afterSnapshot)");
    expect(ownership).toContain("deletedFieldSummary(beforeSnapshot)");
    expect(ownership).not.toContain('"record"');
  });

  it.each([
    "src/app/api/imports/deals/route.ts",
    "src/app/api/imports/funds/route.ts",
    "src/app/api/imports/portfolio/route.ts",
  ])("%s includes only a field-name union in bulk-import audit changes", (path) => {
    const route = readFileSync(path, "utf8");

    expect(route).toContain("changedFieldSummary(");
    expect(route).toContain("changedFields: [...changedFields].sort()");
    expect(route).not.toContain('changedFields: ["record"]');
  });

  it("derives bootstrap fields from transaction-local states without persisting password material", () => {
    const script = readFileSync("scripts/create-admin.ts", "utf8");
    const auditStart = script.indexOf("await tx.auditEvent.create");
    const auditEnd = script.indexOf("});", auditStart);
    const auditBlock = script.slice(auditStart, auditEnd);

    expect(script).toContain("const before = await tx.user.findUnique");
    expect(auditBlock).toContain("changedFields: adminBootstrapChangedFields(before, admin)");
    expect(script).toContain('isolationLevel: "Serializable"');
    expect(auditBlock).not.toContain("ADMIN_PASSWORD");
    expect(auditBlock).not.toContain("password,");
    expect(auditBlock).not.toContain("passwordHash:");
  });

  it("computes weekly proposal changes from record and relation snapshots", () => {
    const script = readFileSync("scripts/sync-weekly-briefing-deals.ts", "utf8");

    expect(script).toContain("weeklyProposalWriteDecision(");
    expect(script).toContain("participants: existing.participants.map");
    expect(script).toContain("citations: existing.citations.map");
    expect(script).toContain("changedFields: decision.changedFields");
    expect(script).toContain('if (decision.result === "skipped") return decision.result');
    expect(script).toContain("assertWeeklyProposalIdentitySnapshot(");
    expect(script).toContain("preserving the existing DRAFT for manual review");
    expect(script).toContain("if (!isHttpUrl(weeklyDeal.sourceUrl))");
    expect(script).toContain("isHttpUrl(seedDeal.sourceUrl) ? seedDeal : weeklyDeal");
    expect(script).toContain("if (!isHttpUrl(deal.sourceUrl))");
    expect(script).toContain("runSerializableTransaction(");
    expect(script).toContain("{ maxAttempts: 3, maxWait: 10_000, timeout: 30_000 }");
    expect(script).not.toContain("tx.deal.update(");
    expect(script).not.toContain("tx.dealParticipant.deleteMany(");
    expect(script).not.toContain("tx.citation.deleteMany(");
    expect(script).not.toContain('changedFields: ["record"');
  });

  it("requires every exported editorial action to own an audited transaction", () => {
    const exportedActions = exportedAsyncFunctionBlocks(actions);

    expect(exportedActions.length).toBeGreaterThan(0);
    for (const action of exportedActions) {
      expect(action.body, `${action.name} must use an atomic transaction`).toContain(
        "prisma.$transaction",
      );
      expect(
        action.body.includes("auditMutation(") || action.body.includes("recordAuditEvent("),
        `${action.name} must write its AuditEvent inside the content transaction`,
      ).toBe(true);
    }
  });

  it("requires each admin content-write transaction to contain an audit write", () => {
    const failures = ADMIN_CONTENT_TRANSACTION_PATHS.flatMap((sourcePath) =>
      unauditedAdminContentTransactions(readFileSync(sourcePath, "utf8"), sourcePath)
    );

    expect(
      failures,
      "Admin content transactions with writes but no AuditEvent in the same callback",
    ).toEqual([]);
  });

  it("forbids non-transactional admin content writes that could escape their audit", () => {
    const failures = ADMIN_CONTENT_TRANSACTION_PATHS.flatMap((sourcePath) =>
      nonTransactionalAdminContentWrites(readFileSync(sourcePath, "utf8"), sourcePath)
    );

    expect(
      failures,
      "Admin content writes must be enclosed by the same transaction as their AuditEvent",
    ).toEqual([]);
  });

  it("detects an admin content transaction that mutates without an audit", () => {
    const fixture = `
      export async function unsafeUpdate() {
        await prisma.$transaction(async (tx) => {
          await tx.deal.update({ where: { id: "deal-1" }, data: { target: "Changed" } });
        });
      }
    `;

    expect(unauditedAdminContentTransactions(fixture, "unsafe-action.ts")).toEqual([
      "unsafe-action.ts:3 (deal.update)",
    ]);
  });

  it("rejects an audit helper call that omits the current transaction client", () => {
    const fixture = `
      export async function unsafeUpdate() {
        await prisma.$transaction(async (tx) => {
          await tx.deal.update({ where: { id: "deal-1" }, data: { target: "Changed" } });
          await auditMutation("Deal", "deal-1", "UPDATE", ["target"]);
        });
      }
    `;

    expect(unauditedAdminContentTransactions(fixture, "unsafe-action.ts")).toEqual([
      "unsafe-action.ts:3 (deal.update)",
    ]);
  });

  it("rejects an audit write that uses a different client", () => {
    const fixture = `
      export async function unsafeUpdate() {
        await prisma.$transaction(async (tx) => {
          await tx.deal.update({ where: { id: "deal-1" }, data: { target: "Changed" } });
          await recordAuditEvent({
            entityType: "Deal",
            entityId: "deal-1",
            action: "UPDATE",
            changes: { changedFields: ["target"] },
          }, prisma);
        });
      }
    `;

    expect(unauditedAdminContentTransactions(fixture, "unsafe-action.ts")).toEqual([
      "unsafe-action.ts:3 (deal.update)",
    ]);
  });

  it("detects a non-transactional admin content write", () => {
    const fixture = `
      export async function unsafeUpdate() {
        await prisma.company.update({ where: { id: "company-1" }, data: { name: "Changed" } });
      }
    `;

    expect(nonTransactionalAdminContentWrites(fixture, "unsafe-action.ts")).toEqual([
      "unsafe-action.ts:3 (company.update)",
    ]);
  });

  it("requires every production mutation audit call to provide a changedFields contract", () => {
    const repositoryRoot = process.cwd();
    const sourceFiles = PRODUCTION_SOURCE_ROOTS.flatMap((root) =>
      productionSourceFiles(path.join(repositoryRoot, root))
    );
    const failures: string[] = [];

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(repositoryRoot, sourcePath).split(path.sep).join("/");
      const sourceText = readFileSync(sourcePath, "utf8");
      const sourceFile = ts.createSourceFile(
        sourcePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        sourcePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );

      const inspect = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
          const auditEventCreate = isAuditEventCreate(node);
          const recordAuditEventCall = isRecordAuditEventCall(node);

          if (
            (auditEventCreate && relativePath !== AUDIT_FACTORY_PATH)
            || recordAuditEventCall
          ) {
            const callText = node.getText(sourceFile);
            const importCommitContract =
              relativePath === IMPORT_COMMIT_PATH
              && recordAuditEventCall
              && callText.includes("changes: work.auditChanges")
              && /auditChanges:\s*Prisma\.InputJsonValue\s*&\s*\{\s*changedFields:\s*string\[\]\s*;?\s*\}/
                .test(sourceText);

            if (
              !declaresChangedFields(changesObject(node, auditEventCreate))
              && !importCommitContract
            ) {
              const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
              failures.push(`${relativePath}:${line + 1}`);
            }
          }
        }

        ts.forEachChild(node, inspect);
      };

      inspect(sourceFile);
    }

    expect(
      failures,
      "Audit mutation calls without an explicit changedFields payload or typed contract",
    ).toEqual([]);
  });
});
