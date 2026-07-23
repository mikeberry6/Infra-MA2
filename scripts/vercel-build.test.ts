import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createVercelBuildPlan,
  FORBIDDEN_PREVIEW_DATABASE_URL_VARIABLES,
  LONG_LIVED_DATABASE_HOST_VARIABLES,
  runVercelBuild,
  type BuildCommand,
  type BuildEnvironment,
} from "./vercel-build.ts";

const repository = process.cwd();
const previewDirectHost = "ep-preview-branch.c-5.us-east-1.aws.neon.tech";
const previewPooledHost = "ep-preview-branch-pooler.c-5.us-east-1.aws.neon.tech";
const directUrl = `postgresql://preview_user:shared-secret@${previewDirectHost}/neondb?sslmode=require`;
const pooledUrl = `postgresql://preview_user:shared-secret@${previewPooledHost}/neondb?sslmode=require`;

function previewEnvironment(): BuildEnvironment {
  return {
    CI: "1",
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_TARGET_ENV: "preview",
    VERCEL_PROJECT_ID: "prj_4OHI8VVhIy2h8PTEOTOlpfMiu4s6",
    EXPECTED_VERCEL_PROJECT_ID: "prj_4OHI8VVhIy2h8PTEOTOlpfMiu4s6",
    VERCEL_DEPLOYMENT_ID: "dpl_AbCdEf123456",
    VERCEL_GIT_PROVIDER: "github",
    VERCEL_GIT_REPO_OWNER: "mikeberry6",
    VERCEL_GIT_REPO_SLUG: "Infra-MA2",
    VERCEL_GIT_REPO_ID: "1143556044",
    EXPECTED_GITHUB_REPOSITORY_ID: "1143556044",
    VERCEL_GIT_COMMIT_REF: "codex/infra-90-day-completion",
    VERCEL_GIT_COMMIT_SHA: "a".repeat(40),
    VERCEL_GIT_PULL_REQUEST_ID: "42",
    PREVIEW_DATABASE_MIGRATIONS_ENABLED: "true",
    DATABASE_URL: pooledUrl,
    DATABASE_URL_UNPOOLED: directUrl,
    DATABASE_PGHOST: previewPooledHost,
    DATABASE_PGHOST_UNPOOLED: previewDirectHost,
    DATABASE_PGDATABASE: "neondb",
    DATABASE_NEON_PROJECT_ID: "rough-voice-89891819",
    EXPECTED_NEON_PROJECT_ID: "rough-voice-89891819",
    EXPECTED_DATABASE_NAME: "neondb",
    PRODUCTION_DATABASE_HOST:
      "ep-dawn-sky-amaxdqe4-pooler.c-5.us-east-1.aws.neon.tech",
    PRODUCTION_MIGRATION_DATABASE_HOST:
      "ep-dawn-sky-amaxdqe4.c-5.us-east-1.aws.neon.tech",
    MIGRATION_DATABASE_HOST:
      "ep-frosty-leaf-am1669hs.c-5.us-east-1.aws.neon.tech",
    DASHBOARD_MIGRATION_DATABASE_HOST:
      "ep-calm-waterfall-amr7we75.c-5.us-east-1.aws.neon.tech",
    DATABASE_POSTGRES_URL: pooledUrl,
    DATABASE_PRISMA_URL: `${pooledUrl}&pgbouncer=true`,
    DATABASE_POSTGRES_URL_NON_POOLING: directUrl,
  };
}

function productionEnvironment(
  optIn?: string,
): BuildEnvironment {
  return {
    CI: "1",
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_TARGET_ENV: "production",
    PREVIEW_DATABASE_MIGRATIONS_ENABLED: optIn,
  };
}

function commandSignature(command: BuildCommand): string {
  if (command.file.endsWith("/prisma")) return `prisma ${command.args.join(" ")}`;
  if (command.args.includes("scripts/assert-database-target.ts")) {
    return `node ${command.args.join(" ")}`;
  }
  return `${command.file} ${command.args.join(" ")}`;
}

describe("Vercel build configuration", () => {
  it("routes Vercel through the guarded build without changing the ordinary build", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(repository, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const vercel = JSON.parse(
      readFileSync(path.join(repository, "vercel.json"), "utf8"),
    ) as Record<string, string>;

    expect(packageJson.scripts.build).toBe("next build");
    expect(packageJson.scripts.postinstall).toBe("prisma generate");
    expect(packageJson.scripts["vercel-build"]).toBe(
      "node --experimental-strip-types scripts/vercel-build.ts",
    );
    expect(vercel.installCommand).toBe("npm ci");
    expect(vercel.buildCommand).toBe("npm run vercel-build");
    expect(vercel.buildCommand).not.toBe("npm run build");
    expect(vercel.buildCommand).not.toBe("next build");
    expect(packageJson.scripts["vercel-build"]).not.toBe(packageJson.scripts.build);
    expect(vercel.installCommand).not.toContain("migrate");
  });
});

describe("Vercel build target selection", () => {
  it("builds only for an exact non-Preview Vercel target", () => {
    const runner = vi.fn();
    const plan = runVercelBuild(productionEnvironment(), repository, runner);

    expect(plan.target).toBe("non-preview");
    expect(plan.migrations).toBe("skipped");
    expect(runner).toHaveBeenCalledTimes(1);
    expect(commandSignature(runner.mock.calls[0][0])).toBe("npm run build");
  });

  it("rejects migration opt-in outside Preview before running a command", () => {
    const runner = vi.fn();

    expect(() =>
      runVercelBuild(productionEnvironment("true"), repository, runner)
    ).toThrow("preview_database_migrations_forbidden_outside_preview");
    expect(runner).not.toHaveBeenCalled();
  });

  it("fails closed on ambiguous Vercel environment metadata", () => {
    const environment = productionEnvironment();
    environment.VERCEL_TARGET_ENV = "preview";

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("vercel_preview_environment_mismatch");
  });

  it.each([undefined, "false"])(
    "builds a normal Preview without database metadata when opt-in is %s",
    (optIn) => {
      const environment: BuildEnvironment = {
        CI: "1",
        VERCEL: "1",
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "preview",
        PREVIEW_DATABASE_MIGRATIONS_ENABLED: optIn,
      };
      const plan = createVercelBuildPlan(environment, repository);

      expect(plan).toMatchObject({
        target: "preview",
        migrations: "skipped",
      });
      expect(plan.commands.map(commandSignature)).toEqual(["npm run build"]);
    },
  );

  it("rejects a non-exact Preview migration opt-in", () => {
    const environment: BuildEnvironment = {
      CI: "1",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_TARGET_ENV: "preview",
      PREVIEW_DATABASE_MIGRATIONS_ENABLED: "yes",
    };

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("preview_database_migrations_opt_in_invalid");
  });

  it.each([" true ", "TRUE", "False"])(
    "does not treat %j as the exact migration opt-in",
    (optIn) => {
      const environment: BuildEnvironment = {
        CI: "1",
        VERCEL: "1",
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "preview",
        PREVIEW_DATABASE_MIGRATIONS_ENABLED: optIn,
      };

      expect(() => createVercelBuildPlan(environment, repository))
        .toThrow("preview_database_migrations_opt_in_invalid");
    },
  );

  it("rejects an advisory-lock bypass variable even on a build-only target", () => {
    const environment = productionEnvironment();
    environment.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "";

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("prisma_schema_disable_advisory_lock_must_be_unset");
  });
});

describe("Vercel Preview migration plan", () => {
  it("runs the reviewed guard, Prisma checks, and build in order", () => {
    const plan = createVercelBuildPlan(previewEnvironment(), repository);

    expect(plan.target).toBe("preview");
    expect(plan.migrations).toBe("enabled");
    expect(plan.commands.map(commandSignature)).toEqual([
      "node --experimental-strip-types scripts/assert-database-target.ts",
      "prisma migrate deploy",
      "prisma migrate status",
      "prisma migrate diff --from-schema=prisma/schema.prisma --to-config-datasource --exit-code",
      "npm run build",
    ]);
    expect(plan.commands.every((item) => item.shell === false)).toBe(true);
  });

  it("passes the direct URL only through child environments and preserves the pooled build URL", () => {
    const environment = previewEnvironment();
    const plan = createVercelBuildPlan(environment, repository);
    const serializedArgs = plan.commands.flatMap((item) => item.args).join(" ");

    expect(serializedArgs).not.toContain("shared-secret");
    expect(serializedArgs).not.toContain(directUrl);
    expect(serializedArgs).not.toContain(pooledUrl);
    for (const migration of plan.commands.slice(0, -1)) {
      expect(migration.env.DATABASE_URL).toBe(directUrl);
      expect(migration.env.TARGET_DATABASE).toBe("validation");
      expect(migration.env.EXPECTED_DATABASE_HOST).toBe(previewDirectHost);
    }
    expect(plan.commands.at(-1)?.env.DATABASE_URL).toBe(pooledUrl);
    expect(environment.DATABASE_URL).toBe(pooledUrl);
  });

  it("stops immediately when any guarded command fails", () => {
    const visited: string[] = [];

    expect(() =>
      runVercelBuild(previewEnvironment(), repository, (item) => {
        visited.push(item.failureCode);
        if (item.failureCode === "prisma_migrate_deploy_failed") {
          throw new Error("simulated failure");
        }
      })
    ).toThrow("simulated failure");
    expect(visited).toEqual([
      "database_target_guard_failed",
      "prisma_migrate_deploy_failed",
    ]);
  });

  it("propagates a build failure after every database check succeeds", () => {
    const visited: string[] = [];

    expect(() =>
      runVercelBuild(previewEnvironment(), repository, (item) => {
        visited.push(item.failureCode);
        if (item.failureCode === "application_build_failed") {
          throw new Error("simulated build failure");
        }
      })
    ).toThrow("simulated build failure");
    expect(visited).toHaveLength(5);
    expect(visited.at(-1)).toBe("application_build_failed");
  });
});

describe("Vercel Preview metadata guard", () => {
  it.each([
    ["CI", "true", "ci_runtime_invalid"],
    ["VERCEL_PROJECT_ID", "prj_wrong", "vercel_project_id_mismatch"],
    ["VERCEL_GIT_PROVIDER", "gitlab", "vercel_git_provider_invalid"],
    ["VERCEL_GIT_REPO_OWNER", "someone-else", "vercel_git_repository_owner_invalid"],
    ["VERCEL_GIT_REPO_SLUG", "other-repository", "vercel_git_repository_slug_invalid"],
    ["VERCEL_GIT_REPO_ID", "999", "vercel_git_repository_id_mismatch"],
    ["VERCEL_GIT_COMMIT_REF", "main", "vercel_preview_git_ref_invalid"],
    ["VERCEL_GIT_COMMIT_REF", "invalid..ref", "vercel_preview_git_ref_invalid"],
    ["VERCEL_GIT_COMMIT_SHA", "not-a-sha", "vercel_git_commit_sha_invalid"],
    ["VERCEL_DEPLOYMENT_ID", "deployment", "vercel_deployment_id_invalid"],
    ["VERCEL_GIT_PULL_REQUEST_ID", "0", "vercel_pull_request_id_invalid"],
    ["DATABASE_NEON_PROJECT_ID", "wrong-project-1234", "neon_project_id_mismatch"],
    ["DATABASE_PGDATABASE", "other", "database_name_metadata_mismatch"],
    ["DATABASE_PGHOST", "ep-other-pooler.c-5.us-east-1.aws.neon.tech", "database_pooled_host_metadata_mismatch"],
    ["DATABASE_PGHOST_UNPOOLED", "ep-other.c-5.us-east-1.aws.neon.tech", "database_unpooled_host_metadata_mismatch"],
  ])("rejects invalid %s metadata", (name, value, expectedCode) => {
    const environment = previewEnvironment();
    environment[name] = value;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow(expectedCode);
  });

  it.each(LONG_LIVED_DATABASE_HOST_VARIABLES)(
    "rejects the Preview endpoint when it matches %s",
    (name) => {
      const environment = previewEnvironment();
      environment[name] = previewDirectHost;

      expect(() => createVercelBuildPlan(environment, repository))
        .toThrow("preview_database_host_is_long_lived");
    },
  );

  it.each(LONG_LIVED_DATABASE_HOST_VARIABLES)(
    "requires long-lived host metadata %s",
    (name) => {
      const environment = previewEnvironment();
      delete environment[name];

      expect(() => createVercelBuildPlan(environment, repository))
        .toThrow(`${name.toLowerCase()}_required`);
    },
  );

  it.each(FORBIDDEN_PREVIEW_DATABASE_URL_VARIABLES)(
    "rejects the alternate or long-lived database URL %s",
    (name) => {
      const environment = previewEnvironment();
      environment[name] = directUrl;

      expect(() => createVercelBuildPlan(environment, repository))
        .toThrow("forbidden_preview_database_url_present");
    },
  );

  it.each([
    "DATABASE_URL_NO_SSL",
    "DATABASE_POSTGRES_URL_NO_SSL",
    "POSTGRES_URL_NO_SSL",
  ])("rejects the no-SSL database URL alias %s", (name) => {
    const environment = previewEnvironment();
    environment[name] =
      `postgresql://preview_user:shared-secret@${previewDirectHost}/neondb`;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("forbidden_preview_database_url_present");
  });

  it.each([undefined, ""])(
    "allows a missing or empty pull-request ID (%s)",
    (pullRequestId) => {
      const environment = previewEnvironment();
      environment.VERCEL_GIT_PULL_REQUEST_ID = pullRequestId;

      expect(createVercelBuildPlan(environment, repository).migrations)
        .toBe("enabled");
    },
  );

  it("accepts a bounded one-character non-main branch ref", () => {
    const environment = previewEnvironment();
    environment.VERCEL_GIT_COMMIT_REF = "x";

    expect(createVercelBuildPlan(environment, repository).migrations)
      .toBe("enabled");
  });

  it("requires matching URL usernames, passwords, databases, and normalized ports", () => {
    for (const runtimeUrl of [
      pooledUrl.replace("preview_user", "other_user"),
      pooledUrl.replace("shared-secret", "other-secret"),
      pooledUrl.replace("/neondb?", "/other?"),
      pooledUrl.replace(previewPooledHost, `${previewPooledHost}:5433`),
    ]) {
      const environment = previewEnvironment();
      environment.DATABASE_URL = runtimeUrl;

      expect(() => createVercelBuildPlan(environment, repository))
        .toThrow("database_connection_identity_mismatch");
    }
  });

  it.each(["verify-ca", "verify-full"])(
    "accepts PostgreSQL sslmode=%s on the reviewed URLs",
    (sslMode) => {
      const environment = previewEnvironment();
      environment.DATABASE_URL = pooledUrl.replace("sslmode=require", `sslmode=${sslMode}`);
      environment.DATABASE_URL_UNPOOLED = directUrl.replace(
        "sslmode=require",
        `sslmode=${sslMode}`,
      );

      expect(createVercelBuildPlan(environment, repository).migrations)
        .toBe("enabled");
    },
  );

  it("accepts the reviewed Neon channel-binding and bounded timeout parameters", () => {
    const environment = previewEnvironment();
    environment.DATABASE_URL =
      `${pooledUrl}&channel_binding=require&connect_timeout=15`;
    environment.DATABASE_URL_UNPOOLED =
      `${directUrl}&channel_binding=require&connect_timeout=15`;

    expect(createVercelBuildPlan(environment, repository).migrations)
      .toBe("enabled");
  });

  it.each([
    "host",
    "hostaddr",
    "port",
    "user",
    "username",
    "password",
    "db",
    "database",
    "dbname",
    "service",
    "servicefile",
    "passfile",
    "options",
    "schema",
  ])("rejects the direct URL query identity override %s", (name) => {
    const environment = previewEnvironment();
    environment.DATABASE_URL_UNPOOLED =
      `${directUrl}&${name}=${encodeURIComponent("override-value")}`;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("database_url_unpooled_invalid");
  });

  it("rejects a recursive connectionString override on the pooled URL", () => {
    const environment = previewEnvironment();
    const forbiddenUrl =
      "postgresql://other:secret@production.invalid/neondb?sslmode=require";
    environment.DATABASE_URL =
      `${pooledUrl}&connectionString=${encodeURIComponent(forbiddenUrl)}`;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("database_url_invalid");
  });

  it("applies the query allowlist to optional aliases", () => {
    const environment = previewEnvironment();
    environment.DATABASE_PRISMA_URL =
      `${pooledUrl}&host=${environment.PRODUCTION_MIGRATION_DATABASE_HOST}`;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("database_connection_alias_invalid");
  });

  it.each([
    [directUrl.replace("sslmode=require", "sslmode=disable"), "database_url_unpooled_invalid"],
    [`${directUrl}#fragment`, "database_url_unpooled_invalid"],
    [directUrl.replace("shared-secret", ""), "database_url_unpooled_invalid"],
    [`${directUrl}&sslmode=require`, "database_url_unpooled_invalid"],
    [`${directUrl}&unknown=value`, "database_url_unpooled_invalid"],
  ])("rejects an unsafe direct connection URL", (url, expectedCode) => {
    const environment = previewEnvironment();
    environment.DATABASE_URL_UNPOOLED = url;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow(expectedCode);
  });

  it("rejects Prisma migration advisory-lock bypass configuration", () => {
    const environment = previewEnvironment();
    environment.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "false";

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("prisma_schema_disable_advisory_lock_must_be_unset");
  });

  it("requires optional pooled and non-pooling aliases to match the reviewed endpoints", () => {
    const pooledMismatch = previewEnvironment();
    pooledMismatch.DATABASE_PRISMA_URL = directUrl;
    expect(() => createVercelBuildPlan(pooledMismatch, repository))
      .toThrow("database_connection_alias_mismatch");

    const directMismatch = previewEnvironment();
    directMismatch.DATABASE_POSTGRES_URL_NON_POOLING = pooledUrl;
    expect(() => createVercelBuildPlan(directMismatch, repository))
      .toThrow("database_connection_alias_mismatch");
  });

  it("rejects an optional connection alias targeting a long-lived endpoint", () => {
    const environment = previewEnvironment();
    const forbidden = environment.PRODUCTION_MIGRATION_DATABASE_HOST;
    environment.DATABASE_PRISMA_URL =
      `postgresql://preview_user:shared-secret@${forbidden}/neondb?sslmode=require`;

    expect(() => createVercelBuildPlan(environment, repository))
      .toThrow("database_connection_alias_is_long_lived");
  });

  it("never includes credentials in validation failures", () => {
    const environment = previewEnvironment();
    environment.DATABASE_URL_UNPOOLED =
      "postgresql://preview_user:do-not-leak@not-neon.invalid/neondb?sslmode=require";

    let failure: unknown;
    try {
      createVercelBuildPlan(environment, repository);
    } catch (error) {
      failure = error;
    }
    expect(String(failure)).toContain("database_url_unpooled_host_not_neon_direct");
    expect(String(failure)).not.toContain("do-not-leak");
    expect(String(failure)).not.toContain("postgresql://");
  });

  it("prints only a safe failure code when invoked as a native entrypoint", () => {
    const environment = previewEnvironment();
    environment.DATABASE_URL_UNPOOLED =
      "postgresql://preview_user:do-not-log@not-neon.invalid/neondb?sslmode=require";
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        path.join(repository, "scripts", "vercel-build.ts"),
      ],
      {
        cwd: repository,
        encoding: "utf8",
        env: {
          ...environment,
          NODE_NO_WARNINGS: "1",
        },
        shell: false,
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Vercel build guard failed: database_url_unpooled_host_not_neon_direct.",
    );
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("do-not-log");
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("postgresql://");
  });
});
