import { describe, expect, it } from "vitest";
import {
  currentProductionDeploymentId,
  vercelProductionMutationApiUrl,
} from "./vercel-production-mutation";

const projectId = "prj_example123";
const deploymentId = "dpl_example123";
const teamId = "team_example123";

describe("Vercel production mutation contract", () => {
  it("builds team-scoped official promote and rollback endpoints", () => {
    expect(vercelProductionMutationApiUrl("promote", projectId, deploymentId, teamId)).toBe(
      `https://api.vercel.com/v10/projects/${projectId}/promote/${deploymentId}?teamId=${teamId}`,
    );
    expect(vercelProductionMutationApiUrl("rollback", projectId, deploymentId, teamId)).toBe(
      `https://api.vercel.com/v1/projects/${projectId}/rollback/${deploymentId}?teamId=${teamId}`,
    );
  });

  it("accepts only the ready production deployment for the expected project", () => {
    expect(currentProductionDeploymentId({
      id: deploymentId,
      projectId,
      target: "production",
      readyState: "READY",
    }, projectId)).toBe(deploymentId);

    expect(() => currentProductionDeploymentId({
      id: deploymentId,
      projectId: "prj_other",
      target: "production",
      readyState: "READY",
    }, projectId)).toThrow(/wrong project/i);
    expect(() => currentProductionDeploymentId({
      id: deploymentId,
      projectId,
      target: "preview",
      readyState: "READY",
    }, projectId)).toThrow(/production deployment/i);
  });
});
