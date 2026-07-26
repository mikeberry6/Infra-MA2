import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { withServerTask } from "../src/lib/server-log.ts";
import { vercelDeploymentApiUrl } from "../src/lib/vercel-deployment.ts";
import {
  currentProductionDeploymentId,
  requireStagedPromotionConfiguration,
  type VercelProductionMutation,
  vercelProjectApiUrl,
  vercelProductionMutationApiUrl,
} from "../src/lib/vercel-production-mutation.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function requiredOption(name: string): string {
  const value = option(name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

function productionHostname(value: string): string {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("--production-url must be an HTTPS origin.");
  }
  return parsed.hostname;
}

async function main() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is required.");
  const operation = requiredOption("operation") as VercelProductionMutation;
  const deploymentId = requiredOption("deployment-id");
  const projectId = requiredOption("project-id");
  const teamId = requiredOption("team-id");
  const hostname = productionHostname(requiredOption("production-url"));
  const output = option("output") ?? "tmp/vercel-production-mutation.json";
  const timeoutMs = Number(option("timeout-ms") ?? "180000");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 10_000 || timeoutMs > 300_000) {
    throw new Error("--timeout-ms must be an integer from 10000 through 300000.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "InfraSight-production-release",
  };
  const requestedAt = new Date().toISOString();
  const stagedPromotionConfiguration = operation === "promote"
    ? await (async () => {
        const projectResponse = await fetch(vercelProjectApiUrl(projectId, teamId), {
          headers,
          signal: AbortSignal.timeout(30_000),
        });
        if (!projectResponse.ok) {
          throw new Error(
            `Vercel project configuration request failed with HTTP ${projectResponse.status}.`,
          );
        }
        return requireStagedPromotionConfiguration(
          await projectResponse.json(),
          projectId,
        );
      })()
    : null;
  const mutationResponse = await fetch(
    vercelProductionMutationApiUrl(operation, projectId, deploymentId, teamId),
    {
      method: "POST",
      headers,
      body: "{}",
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!mutationResponse.ok) {
    throw new Error(`Vercel ${operation} request failed with HTTP ${mutationResponse.status}.`);
  }

  const deadline = Date.now() + timeoutMs;
  let observedDeploymentId: string | null = null;
  do {
    const currentResponse = await fetch(vercelDeploymentApiUrl(hostname, teamId), {
      headers,
      signal: AbortSignal.timeout(30_000),
    });
    if (currentResponse.ok) {
      observedDeploymentId = currentProductionDeploymentId(
        await currentResponse.json(),
        projectId,
      );
      if (observedDeploymentId === deploymentId) break;
    } else if (currentResponse.status !== 404) {
      throw new Error(`Vercel production verification failed with HTTP ${currentResponse.status}.`);
    }
    await delay(3_000);
  } while (Date.now() < deadline);

  if (observedDeploymentId !== deploymentId) {
    throw new Error(`Vercel ${operation} did not reach the requested deployment before timeout.`);
  }

  const report = {
    requestedAt,
    completedAt: new Date().toISOString(),
    operation,
    projectId,
    deploymentId,
    productionHostname: hostname,
    stagedPromotionConfiguration,
    requestStatus: mutationResponse.status,
    completed: true,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Vercel ${operation} completed for ${deploymentId}.`);
}

withServerTask({ task: "vercel_production_mutation", operation: "mutate_production" }, main).catch(() => {
  process.exitCode = 1;
});
