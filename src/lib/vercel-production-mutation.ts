export type VercelProductionMutation = "promote" | "rollback";

function requireProjectId(value: string): string {
  if (!/^prj_[A-Za-z0-9]+$/.test(value)) throw new Error("Vercel project ID is invalid.");
  return value;
}

function requireDeploymentId(value: string): string {
  if (!/^dpl_[A-Za-z0-9]+$/.test(value)) throw new Error("Vercel deployment ID is invalid.");
  return value;
}

function requireTeamId(value: string): string {
  if (!/^team_[A-Za-z0-9]+$/.test(value)) throw new Error("Vercel team ID is invalid.");
  return value;
}

export function vercelProductionMutationApiUrl(
  operation: VercelProductionMutation,
  projectId: string,
  deploymentId: string,
  teamId: string,
): string {
  if (operation !== "promote" && operation !== "rollback") {
    throw new Error("Vercel production operation is invalid.");
  }
  const version = operation === "promote" ? "v10" : "v1";
  const action = operation === "promote" ? "promote" : "rollback";
  const endpoint = new URL(
    `https://api.vercel.com/${version}/projects/${requireProjectId(projectId)}/${action}/${requireDeploymentId(deploymentId)}`,
  );
  endpoint.searchParams.set("teamId", requireTeamId(teamId));
  return endpoint.toString();
}

export function currentProductionDeploymentId(
  payload: unknown,
  expectedProjectId: string,
): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Vercel returned an invalid production deployment payload.");
  }
  const deployment = payload as Record<string, unknown>;
  if (deployment.projectId !== requireProjectId(expectedProjectId)) {
    throw new Error("Vercel production alias belongs to the wrong project.");
  }
  if (deployment.target !== "production") {
    throw new Error("Vercel production alias does not resolve to a production deployment.");
  }
  if (deployment.readyState !== "READY") {
    throw new Error("Vercel production alias does not resolve to a ready deployment.");
  }
  return requireDeploymentId(String(deployment.id ?? ""));
}
