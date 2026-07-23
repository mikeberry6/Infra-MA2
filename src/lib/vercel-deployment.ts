export type VerifiedVercelDeployment = {
  id: string;
  projectId: string;
  target: "production";
  readyState: "READY";
  url: string;
  githubCommitSha: string;
  githubRepositoryId: string;
};

export function vercelDeploymentApiUrl(reference: string, teamId: string): string {
  if (!reference || !/^dpl_[A-Za-z0-9]+$/.test(reference) && !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(reference)) {
    throw new Error("Vercel deployment reference is invalid.");
  }
  if (!/^team_[A-Za-z0-9]+$/.test(teamId)) {
    throw new Error("Vercel team ID must be an immutable team_ identifier.");
  }

  const endpoint = new URL(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(reference)}`,
  );
  endpoint.searchParams.set("teamId", teamId);
  return endpoint.toString();
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Vercel returned an invalid deployment payload.");
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Vercel deployment ${field} is missing.`);
  }
  return value;
}

function requiredDeploymentHostname(value: unknown): string {
  const hostname = requiredString(value, "url");
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.vercel\.app$/.test(hostname)) {
    throw new Error("Vercel deployment url is not an immutable vercel.app hostname.");
  }
  return hostname;
}

function requiredRepositoryId(value: unknown): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === "string" && /^[1-9][0-9]*$/.test(value)) return value;
  throw new Error("Vercel deployment gitSource.repoId is missing.");
}

export function verifyVercelDeployment(
  payload: unknown,
  expectedProjectId: string,
  expectedSha: string,
  expectedGithubRepositoryId: string,
): VerifiedVercelDeployment {
  if (!/^prj_[A-Za-z0-9]+$/.test(expectedProjectId)) throw new Error("Expected Vercel project ID is invalid.");
  if (!/^[0-9a-f]{40}$/.test(expectedSha)) throw new Error("Expected Git SHA must be full and lowercase.");
  if (!/^[1-9][0-9]*$/.test(expectedGithubRepositoryId)) throw new Error("Expected GitHub repository ID is invalid.");
  const deployment = record(payload);
  const meta = record(deployment.meta);
  const gitSource = record(deployment.gitSource);
  const id = requiredString(deployment.id, "id");
  const projectId = requiredString(deployment.projectId, "projectId");
  const target = requiredString(deployment.target, "target");
  const readyState = requiredString(deployment.readyState, "readyState");
  const url = requiredDeploymentHostname(deployment.url);
  const githubCommitSha = requiredString(meta.githubCommitSha, "meta.githubCommitSha");
  const gitSourceType = requiredString(gitSource.type, "gitSource.type");
  const gitSourceSha = requiredString(gitSource.sha, "gitSource.sha");
  const githubRepositoryId = requiredRepositoryId(gitSource.repoId);

  if (!/^dpl_[A-Za-z0-9]+$/.test(id)) throw new Error("Vercel deployment id is invalid.");
  if (projectId !== expectedProjectId) throw new Error("Vercel deployment belongs to the wrong project.");
  if (target !== "production") throw new Error("Vercel deployment is not a production-target build.");
  if (readyState !== "READY") throw new Error("Vercel deployment is not ready.");
  if (gitSourceType !== "github") throw new Error("Vercel deployment was not built from GitHub.");
  if (gitSourceSha !== expectedSha || githubCommitSha !== expectedSha) {
    throw new Error("Vercel deployment Git SHA does not match the reviewed SHA.");
  }
  if (githubRepositoryId !== expectedGithubRepositoryId) {
    throw new Error("Vercel deployment belongs to the wrong GitHub repository.");
  }

  return {
    id,
    projectId,
    target: "production",
    readyState: "READY",
    url,
    githubCommitSha,
    githubRepositoryId,
  };
}
