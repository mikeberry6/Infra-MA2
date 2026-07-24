import {
  vercelDeploymentApiUrl,
  verifyVercelDeployment,
  type VercelDeploymentTarget,
} from "../src/lib/vercel-deployment.ts";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output.ts";
import { withServerTask } from "../src/lib/server-log.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function flag(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

function deploymentReference(): { reference: string; requestedHostname?: string } {
  const value = option("deployment") ?? option("deployment-url");
  if (!value) throw new Error("--deployment or --deployment-url is required.");
  if (/^dpl_[A-Za-z0-9]+$/.test(value)) return { reference: value };
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("The deployment URL must be an HTTPS origin without credentials, path, query, or fragment.");
  }
  return { reference: parsed.hostname, requestedHostname: parsed.hostname };
}

async function main(): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not set.");
  const expectedSha = option("expected-sha");
  const expectedProjectId = option("expected-project-id");
  const expectedGithubRepositoryId = option("expected-github-repository-id");
  const expectedTarget = option("expected-target") ?? "production";
  const teamId = option("team-id");
  if (!expectedSha || !expectedProjectId || !expectedGithubRepositoryId || !teamId) {
    throw new Error("--expected-sha, --expected-project-id, --expected-github-repository-id, and --team-id are required.");
  }
  if (expectedTarget !== "preview" && expectedTarget !== "production") {
    throw new Error("--expected-target must be preview or production.");
  }
  const deployment = deploymentReference();
  const response = await fetch(vercelDeploymentApiUrl(deployment.reference, teamId), {
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "InfraSight-release-verifier",
    },
  });
  if (!response.ok) throw new Error(`Vercel deployment verification failed with HTTP ${response.status}.`);
  const verified = verifyVercelDeployment(
    await response.json(),
    expectedProjectId,
    expectedSha,
    expectedGithubRepositoryId,
    expectedTarget as VercelDeploymentTarget,
  );
  if (flag("require-immutable-url") && deployment.requestedHostname && deployment.requestedHostname !== verified.url) {
    throw new Error("The supplied URL is an alias, not the deployment's immutable Vercel URL.");
  }
  const output = option("output") ?? "tmp/vercel-deployment.json";
  const destination = await prepareProtectedTemporaryJsonOutput({
    repositoryRoot: process.cwd(),
    output,
  });
  await destination.write(
    `${JSON.stringify({ verifiedAt: new Date().toISOString(), ...verified }, null, 2)}\n`,
  );
  console.log(`Vercel deployment ${verified.id} verified for ${verified.githubCommitSha}.`);
}

withServerTask({ task: "vercel_deployment_verification", operation: "verify_deployment" }, main).catch(() => {
  process.exitCode = 1;
});
