import { describe, expect, it } from "vitest";
import {
  currentProductionDeploymentId,
  requireStagedPromotionConfiguration,
  vercelProjectApiUrl,
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
    expect(vercelProjectApiUrl(projectId, teamId)).toBe(
      `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`,
    );
  });

  it("requires automatic production-domain assignment to remain disabled", () => {
    expect(requireStagedPromotionConfiguration({
      id: projectId,
      autoAssignCustomDomains: false,
    }, projectId)).toEqual({
      projectId,
      automaticDomainAssignment: false,
    });

    expect(() => requireStagedPromotionConfiguration({
      id: projectId,
      autoAssignCustomDomains: true,
    }, projectId)).toThrow(/automatic production-domain assignment must be disabled/i);
    expect(() => requireStagedPromotionConfiguration({
      id: "prj_other",
      autoAssignCustomDomains: false,
    }, projectId)).toThrow(/wrong project/i);
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
