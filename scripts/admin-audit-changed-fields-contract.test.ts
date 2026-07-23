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
    expect(script).toContain("runSerializableTransaction(");
    expect(script).toContain("{ maxAttempts: 3, maxWait: 10_000, timeout: 30_000 }");
    expect(script).not.toContain('changedFields: ["record"');
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
