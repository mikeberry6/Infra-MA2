import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const repository = process.cwd();
const nativeCommand = /\bnode\s+--experimental-strip-types\s+(?:"([^"]+\.ts)"|'([^']+\.ts)'|([^\s\\'"`]+\.ts))/g;
const typescriptCommand = /(?:\bnode\s+--experimental-strip-types|\bnpx\s+tsx|(?:\.\/node_modules\/\.bin\/)?\btsx)\s+(?:"([^"]+\.ts)"|'([^']+\.ts)'|([^\s\\'"`]+\.ts))/g;
const expectedNativeEntrypoints = [
  "scripts/assert-database-target.ts",
  "scripts/audit-additive-migrations.ts",
  "scripts/audit-current-owner-funds.ts",
  "scripts/audit-portfolio-fund-ownership.ts",
  "scripts/audit-portfolio-investment-years.ts",
  "scripts/audit-portfolio-milestones.ts",
  "scripts/curate-portfolio-milestones.ts",
  "scripts/validate-portfolios.ts",
  "scripts/validate-weekly-email.ts",
  "scripts/verify-migration-baseline.ts",
  "scripts/verify-release-provenance.ts",
  "scripts/verify-vercel-deployment.ts",
];
const protectedWorkflowPaths = [
  ".github/workflows/release-production.yml",
  ".github/workflows/stage-production-schema.yml",
  ".github/workflows/remediate-production-data.yml",
];
const nativeSyntaxFailures = new Map<string, string | undefined>();
const stripTypesCheck = [
  'import { readFileSync } from "node:fs";',
  'import { stripTypeScriptTypes } from "node:module";',
  'stripTypeScriptTypes(readFileSync(process.argv[1], "utf8"), { mode: "strip" });',
].join(" ");

function filesBelow(directory: string, extensions: Set<string>): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(candidate, extensions);
    return entry.isFile() && extensions.has(path.extname(entry.name)) ? [candidate] : [];
  });
}

function commandSources(includeDocumentation: boolean): string[] {
  const sources = [
    path.join(repository, "package.json"),
    ...filesBelow(path.join(repository, ".github/workflows"), new Set([".yml", ".yaml"])),
  ];
  if (includeDocumentation) {
    sources.push(
      ...filesBelow(path.join(repository, "docs"), new Set([".md"])),
      ...filesBelow(path.join(repository, "audits"), new Set([".md"])),
    );
    for (const file of ["README.md", "CLAUDE.md"]) {
      const candidate = path.join(repository, file);
      if (existsSync(candidate)) sources.push(candidate);
    }
  }
  return sources;
}

function captureEntrypoints(files: string[], pattern: RegExp): string[] {
  const entries = files.flatMap((file) => {
    const content = readFileSync(file, "utf8");
    pattern.lastIndex = 0;
    return Array.from(content.matchAll(pattern), (match) => match[1] ?? match[2] ?? match[3]);
  });
  return [...new Set(entries)].sort();
}

function isRuntimeImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause;
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (clause.name) return true;
  const bindings = clause.namedBindings;
  if (!bindings) return false;
  if (ts.isNamespaceImport(bindings)) return true;
  return bindings.elements.some((element) => !element.isTypeOnly);
}

function runtimeSpecifiers(file: string): string[] {
  const content = readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers: string[] = [];

  function addStringLiteral(node: ts.Expression | undefined) {
    if (node && ts.isStringLiteralLike(node)) specifiers.push(node.text);
  }

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && isRuntimeImport(node)) {
      addStringLiteral(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node)
      && !node.isTypeOnly
      && ts.isExternalModuleReference(node.moduleReference)
    ) {
      addStringLiteral(node.moduleReference.expression);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly) {
      const runtimeExport = !node.exportClause || ts.isNamespaceExport(node.exportClause)
        || node.exportClause.elements.some((element) => !element.isTypeOnly);
      if (runtimeExport) addStringLiteral(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node)
      && node.arguments.length === 1
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      addStringLiteral(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return specifiers;
}

function nativeGraphProblems(entrypoint: string, allowExternalPackages = true): string[] {
  const problems: string[] = [];
  const visited = new Set<string>();

  function visit(file: string) {
    const normalized = path.normalize(file);
    if (visited.has(normalized)) return;
    visited.add(normalized);
    if (!existsSync(normalized) || !statSync(normalized).isFile()) {
      problems.push(`${path.relative(repository, normalized)} does not exist`);
      return;
    }
    if (!nativeSyntaxFailures.has(normalized)) {
      const syntax = spawnSync(
        process.execPath,
        ["--input-type=module", "--eval", stripTypesCheck, normalized],
        {
          cwd: repository,
          encoding: "utf8",
          env: { ...process.env, NODE_NO_WARNINGS: "1" },
        },
      );
      nativeSyntaxFailures.set(
        normalized,
        syntax.status === 0 ? undefined : syntax.stderr.trim().split(/\r?\n/, 1)[0] || "syntax check failed",
      );
    }
    const syntaxFailure = nativeSyntaxFailures.get(normalized);
    if (syntaxFailure) problems.push(`${path.relative(repository, normalized)} is not natively erasable: ${syntaxFailure}`);

    for (const specifier of runtimeSpecifiers(normalized)) {
      if (specifier.startsWith("@/")) {
        problems.push(`${path.relative(repository, normalized)} uses runtime alias ${specifier}`);
        continue;
      }
      if (!specifier.startsWith(".")) {
        if (!allowExternalPackages && !specifier.startsWith("node:")) {
          problems.push(`${path.relative(repository, normalized)} requires pre-install package ${specifier}`);
        }
        continue;
      }
      if (!path.extname(specifier)) {
        problems.push(`${path.relative(repository, normalized)} uses extensionless runtime import ${specifier}`);
        continue;
      }
      const target = path.resolve(path.dirname(normalized), specifier);
      if (!existsSync(target) || !statSync(target).isFile()) {
        problems.push(`${path.relative(repository, normalized)} cannot resolve runtime import ${specifier}`);
        continue;
      }
      if (/\.[cm]?tsx?$/.test(target)) visit(target);
    }
  }

  visit(path.join(repository, entrypoint));
  return problems;
}

describe("TypeScript script runtime contract", () => {
  it("strictly type-checks operational scripts and Prisma TypeScript in the release gate", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(repository, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    const scriptsConfig = JSON.parse(
      readFileSync(path.join(repository, "scripts/tsconfig.json"), "utf8"),
    ) as {
      compilerOptions?: {
        lib?: string[];
        noEmit?: boolean;
        strict?: boolean;
        target?: string;
      };
      include?: string[];
    };
    const workflow = readFileSync(
      path.join(repository, ".github/workflows/deploy.yml"),
      "utf8",
    );

    expect(packageJson.scripts?.["typecheck:scripts"]).toBe(
      "tsc -p scripts/tsconfig.json --pretty false",
    );
    expect(scriptsConfig.compilerOptions).toMatchObject({
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      noEmit: true,
      strict: true,
      target: "ES2022",
    });
    expect(scriptsConfig.include).toEqual(expect.arrayContaining([
      "./**/*.ts",
      "../prisma/**/*.ts",
      "../prisma.config.ts",
    ]));

    const applicationTypecheck = workflow.indexOf("run: npm run typecheck\n");
    const scriptsTypecheck = workflow.indexOf("run: npm run typecheck:scripts");
    const tests = workflow.indexOf("run: npm test");
    expect(applicationTypecheck).toBeGreaterThanOrEqual(0);
    expect(scriptsTypecheck).toBeGreaterThan(applicationTypecheck);
    expect(tests).toBeGreaterThan(scriptsTypecheck);
  });

  it("keeps the complete native-Node command inventory explicit and resolvable", () => {
    const nativeEntrypoints = captureEntrypoints(commandSources(true), nativeCommand);
    expect(nativeEntrypoints).toEqual(expectedNativeEntrypoints);
    expect(nativeEntrypoints.flatMap((entrypoint) => nativeGraphProblems(entrypoint))).toEqual([]);
  }, 20_000);

  it("points every package and workflow TypeScript invocation at a real entrypoint", () => {
    const invoked = captureEntrypoints(commandSources(false), typescriptCommand);
    expect(invoked.length).toBeGreaterThan(0);
    expect(invoked.filter((entrypoint) => !existsSync(path.join(repository, entrypoint)))).toEqual([]);
  });

  it("authenticates protected main before installing or running generated/database code", () => {
    for (const workflowPath of protectedWorkflowPaths) {
      const workflow = readFileSync(path.join(repository, workflowPath), "utf8");
      const refGuard = workflow.indexOf('if [ "$GITHUB_REF" != "refs/heads/main" ]');
      const checkout = workflow.indexOf("- name: Checkout approved release");
      const identity = workflow.indexOf("- name: Verify checked-out release identity");
      const setupNode = workflow.indexOf("- name: Setup Node");
      const provenance = workflow.indexOf("- name: Verify protected-");
      const nativeProvenance = workflow.indexOf(
        "node --experimental-strip-types scripts/verify-release-provenance.ts",
        provenance,
      );
      const install = workflow.indexOf("npm ci");

      expect(refGuard, workflowPath).toBeGreaterThanOrEqual(0);
      expect(refGuard, workflowPath).toBeLessThan(checkout);
      expect(checkout, workflowPath).toBeLessThan(identity);
      expect(identity, workflowPath).toBeLessThan(setupNode);
      expect(setupNode, workflowPath).toBeLessThan(provenance);
      expect(nativeProvenance, workflowPath).toBeGreaterThan(provenance);
      expect(nativeProvenance, workflowPath).toBeLessThan(install);
      expect(workflow.slice(checkout, identity), workflowPath).toContain("ref: refs/heads/main");
      expect(workflow.slice(checkout, identity), workflowPath).not.toContain("inputs.release_sha");
      expect(workflow.slice(identity, setupNode), workflowPath).toContain('"$(git rev-parse HEAD)" != "$RELEASE_SHA"');

      for (const command of [
        "npm run db:generate",
        "npm run db:validate",
        "scripts/assert-database-target.ts",
        "prisma migrate",
      ]) {
        const commandIndex = workflow.indexOf(command);
        expect(commandIndex, `${workflowPath}: ${command}`).toBeGreaterThan(install);
      }

      const beforeInstall = workflow.slice(checkout, install);
      expect(beforeInstall, workflowPath).not.toMatch(/(?:node_modules\/\.bin\/tsx|\bnpx\s+tsx)\s+scripts\/verify-release-provenance\.ts/);
    }

    const schemaWorkflow = readFileSync(
      path.join(repository, ".github/workflows/stage-production-schema.yml"),
      "utf8",
    );
    const schemaProvenance = schemaWorkflow.indexOf("node --experimental-strip-types scripts/verify-release-provenance.ts");
    const migrationAudit = schemaWorkflow.indexOf("node --experimental-strip-types scripts/audit-additive-migrations.ts");
    const schemaInstall = schemaWorkflow.indexOf("npm ci");
    expect(schemaProvenance).toBeLessThan(migrationAudit);
    expect(migrationAudit).toBeLessThan(schemaInstall);
    expect([
      ...nativeGraphProblems("scripts/verify-release-provenance.ts", false),
      ...nativeGraphProblems("scripts/audit-additive-migrations.ts", false),
    ]).toEqual([]);
  });

  it("runs rollback tooling only from the exact protected-main dispatch SHA", () => {
    const workflowPath = ".github/workflows/rollback-production.yml";
    const workflow = readFileSync(path.join(repository, workflowPath), "utf8");
    const refGuard = workflow.indexOf('if [ "$GITHUB_REF" != "refs/heads/main" ]');
    const checkout = workflow.indexOf("- name: Checkout rollback tooling");
    const identity = workflow.indexOf("- name: Verify checked-out rollback tooling identity");
    const setupNode = workflow.indexOf("- name: Setup Node");
    const verifier = workflow.indexOf("node --experimental-strip-types scripts/verify-vercel-deployment.ts");

    expect(refGuard).toBeGreaterThanOrEqual(0);
    expect(refGuard).toBeLessThan(checkout);
    expect(checkout).toBeLessThan(identity);
    expect(identity).toBeLessThan(setupNode);
    expect(setupNode).toBeLessThan(verifier);
    expect(workflow.slice(checkout, identity)).toContain("ref: refs/heads/main");
    expect(workflow.slice(identity, setupNode)).toContain('"$(git rev-parse HEAD)" != "$GITHUB_SHA"');
    expect(workflow).toContain("canonical-production-inspect.json");
  });

  it("starts representative native and locally installed tsx CLIs without database or network access", () => {
    expect(process.versions.node).toMatch(/^24\./);

    const nativeResult = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "scripts/assert-database-target.ts"],
      {
        cwd: repository,
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_URL: "postgresql://runtime-test:unused@validation.invalid:5432/infrasight_validation",
          EXPECTED_DATABASE_HOST: "validation.invalid",
          EXPECTED_DATABASE_NAME: "infrasight_validation",
          FORBIDDEN_DATABASE_HOST: "production.invalid",
          FORBIDDEN_DATABASE_HOST_2: "",
        },
      },
    );
    expect(nativeResult.status, nativeResult.stderr).toBe(0);
    expect(nativeResult.stdout).toContain("Database target guard passed");

    for (const omitted of ["EXPECTED_DATABASE_NAME", "FORBIDDEN_DATABASE_HOST"] as const) {
      const guardedEnvironment: NodeJS.ProcessEnv = {
        ...process.env,
        DATABASE_URL: "postgresql://runtime-test:unused@validation.invalid:5432/infrasight_validation",
        EXPECTED_DATABASE_HOST: "validation.invalid",
        EXPECTED_DATABASE_NAME: "infrasight_validation",
        FORBIDDEN_DATABASE_HOST: "production.invalid",
        FORBIDDEN_DATABASE_HOST_2: "",
      };
      delete guardedEnvironment[omitted];
      const rejected = spawnSync(
        process.execPath,
        ["--experimental-strip-types", "scripts/assert-database-target.ts"],
        { cwd: repository, encoding: "utf8", env: guardedEnvironment },
      );
      expect(rejected.status).toBe(1);
      expect(rejected.stderr).toContain("Database target guard failed");
    }

    const head = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: repository,
      encoding: "utf8",
    }).stdout.trim();
    const provenanceResult = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "scripts/verify-release-provenance.ts",
        `--release-sha=${head}`,
        "--branch=main",
        "--required-check=build",
      ],
      {
        cwd: repository,
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "infrasight/runtime-contract",
          GITHUB_TOKEN: "",
        },
      },
    );
    expect(provenanceResult.status).toBe(1);
    expect(provenanceResult.stderr).not.toMatch(/ERR_MODULE_NOT_FOUND|Cannot find module/);
    expect(provenanceResult.stderr).toContain('"task":"release_provenance"');

    const migrationDirectory = mkdtempSync(path.join(os.tmpdir(), "infrasight-migration-runtime-"));
    const migrationResult = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "scripts/audit-additive-migrations.ts",
        "--base-sha=HEAD",
        "--release-sha=HEAD",
        `--output=${path.join(migrationDirectory, "manifest.json")}`,
      ],
      { cwd: repository, encoding: "utf8" },
    );
    rmSync(migrationDirectory, { recursive: true, force: true });
    expect(migrationResult.status, migrationResult.stderr).toBe(0);
    expect(migrationResult.stdout).toContain("Additive migration audit passed");

    const tsxCli = path.join(repository, "node_modules/tsx/dist/cli.mjs");
    expect(existsSync(tsxCli)).toBe(true);
    const tsxResult = spawnSync(
      process.execPath,
      [
        tsxCli,
        "scripts/audit-historical-weekly-emails.ts",
        "--base-sha=invalid",
        "--release-sha=HEAD",
        "--output=tmp/runtime-contract-must-not-exist.json",
      ],
      { cwd: repository, encoding: "utf8" },
    );
    expect(tsxResult.status).toBe(1);
    expect(tsxResult.stderr).not.toMatch(/ERR_MODULE_NOT_FOUND|Cannot find module/);
    expect(tsxResult.stderr).toContain('"task":"weekly_email_history"');
  });
});
