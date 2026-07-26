import { describe, expect, it } from "vitest";
import {
  verifyVercelPreviewEvent,
  type VercelPreviewEventExpectations,
} from "./vercel-preview-event";

const expected: VercelPreviewEventExpectations = {
  projectId: "prj_4OHI8VVhIy2h8PTEOTOlpfMiu4s6",
  projectName: "infra-ma-2",
  repository: "mikeberry6/Infra-MA2",
  repositoryId: "1143556044",
  scope: "mberry",
  senderId: "35613825",
  senderLogin: "vercel[bot]",
};
const sha = "a".repeat(40);
const validEvent = {
  action: "vercel.deployment.success",
  repository: {
    id: Number(expected.repositoryId),
    full_name: expected.repository,
  },
  sender: {
    id: Number(expected.senderId),
    login: expected.senderLogin,
    type: "Bot",
  },
  client_payload: {
    id: "dpl_example123",
    url: "https://infra-ma-2-a1b2c3d4e-mberry.vercel.app",
    environment: "preview",
    project: {
      id: expected.projectId,
      name: expected.projectName,
    },
    git: {
      ref: "codex/infra-90-day-completion",
      sha,
      shortSha: sha.slice(0, 7),
    },
    state: {
      type: "success",
    },
  },
};

describe("verifyVercelPreviewEvent", () => {
  it("accepts the exact Vercel bot, repository, project, immutable URL, and Preview SHA", () => {
    expect(verifyVercelPreviewEvent(validEvent, expected)).toEqual({
      deploymentId: "dpl_example123",
      deploymentUrl: "https://infra-ma-2-a1b2c3d4e-mberry.vercel.app",
      environment: "preview",
      gitRef: "codex/infra-90-day-completion",
      gitSha: sha,
      projectId: expected.projectId,
      projectName: expected.projectName,
      repositoryId: expected.repositoryId,
    });
  });

  it.each([
    ["event type", { action: "vercel.deployment.ready" }],
    ["repository", { repository: { id: 1, full_name: expected.repository } }],
    ["sender", { sender: { id: 1, login: expected.senderLogin, type: "Bot" } }],
    ["payload", { client_payload: { ...validEvent.client_payload, environment: "production" } }],
    ["project", {
      client_payload: {
        ...validEvent.client_payload,
        project: { id: "prj_other", name: expected.projectName },
      },
    }],
    ["Git SHA", {
      client_payload: {
        ...validEvent.client_payload,
        git: { ...validEvent.client_payload.git, sha: "b".repeat(39) },
      },
    }],
    ["production ref", {
      client_payload: {
        ...validEvent.client_payload,
        git: { ...validEvent.client_payload.git, ref: "main" },
      },
    }],
    ["branch alias", {
      client_payload: {
        ...validEvent.client_payload,
        url: "https://infra-ma-2-git-codex-infra-90-day-completion-mberry.vercel.app",
      },
    }],
    ["foreign immutable URL", {
      client_payload: {
        ...validEvent.client_payload,
        url: "https://another-project-a1b2c3d4e-mberry.vercel.app",
      },
    }],
    ["URL path", {
      client_payload: {
        ...validEvent.client_payload,
        url: "https://infra-ma-2-a1b2c3d4e-mberry.vercel.app/Infra-MA2",
      },
    }],
  ])("rejects a mismatched %s", (_label, override) => {
    expect(() => verifyVercelPreviewEvent(
      { ...validEvent, ...override },
      expected,
    )).toThrow();
  });
});
