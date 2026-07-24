export type VerifiedVercelPreviewEvent = {
  deploymentId: string;
  deploymentUrl: string;
  environment: "preview";
  gitRef: string;
  gitSha: string;
  projectId: string;
  projectName: string;
  repositoryId: string;
};

export type VercelPreviewEventExpectations = {
  projectId: string;
  projectName: string;
  repository: string;
  repositoryId: string;
  scope: string;
  senderId: string;
  senderLogin: string;
};

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is missing or invalid.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} is missing or invalid.`);
  }
  return value;
}

function requiredPositiveId(value: unknown, label: string): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === "string" && /^[1-9][0-9]*$/.test(value)) return value;
  throw new Error(`${label} is missing or invalid.`);
}

function regexEscape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateExpectations(expected: VercelPreviewEventExpectations): void {
  if (!/^prj_[A-Za-z0-9]+$/.test(expected.projectId)) {
    throw new Error("Expected Vercel project ID is invalid.");
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/.test(expected.projectName)) {
    throw new Error("Expected Vercel project name is invalid.");
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/.test(expected.scope)) {
    throw new Error("Expected Vercel scope is invalid.");
  }
  if (!/^[1-9][0-9]*$/.test(expected.repositoryId)) {
    throw new Error("Expected GitHub repository ID is invalid.");
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(expected.repository)) {
    throw new Error("Expected GitHub repository name is invalid.");
  }
  if (!/^[1-9][0-9]*$/.test(expected.senderId) || !/^[A-Za-z0-9_.\-[\]]+$/.test(expected.senderLogin)) {
    throw new Error("Expected Vercel GitHub App identity is invalid.");
  }
}

/**
 * Verifies the repository_dispatch envelope emitted by the installed Vercel
 * GitHub App before trusted default-branch tooling requests a Preview URL.
 * Candidate-controlled source is never imported or executed here.
 */
export function verifyVercelPreviewEvent(
  value: unknown,
  expected: VercelPreviewEventExpectations,
): VerifiedVercelPreviewEvent {
  validateExpectations(expected);

  const event = record(value, "GitHub event");
  const repository = record(event.repository, "GitHub event repository");
  const sender = record(event.sender, "GitHub event sender");
  const payload = record(event.client_payload, "Vercel client payload");
  const project = record(payload.project, "Vercel project");
  const git = record(payload.git, "Vercel Git metadata");
  const state = record(payload.state, "Vercel deployment state");

  if (requiredString(event.action, "GitHub event action") !== "vercel.deployment.success") {
    throw new Error("GitHub event is not a successful Vercel deployment dispatch.");
  }
  if (
    requiredPositiveId(repository.id, "GitHub repository ID") !== expected.repositoryId
    || requiredString(repository.full_name, "GitHub repository name") !== expected.repository
  ) {
    throw new Error("Vercel dispatch belongs to the wrong GitHub repository.");
  }
  if (
    requiredPositiveId(sender.id, "GitHub sender ID") !== expected.senderId
    || requiredString(sender.login, "GitHub sender login") !== expected.senderLogin
    || requiredString(sender.type, "GitHub sender type") !== "Bot"
  ) {
    throw new Error("Vercel dispatch was not sent by the expected GitHub App.");
  }

  const projectId = requiredString(project.id, "Vercel project ID");
  const projectName = requiredString(project.name, "Vercel project name");
  if (projectId !== expected.projectId || projectName !== expected.projectName) {
    throw new Error("Vercel dispatch belongs to the wrong project.");
  }

  const environment = requiredString(payload.environment, "Vercel environment");
  if (environment !== "preview") {
    throw new Error("Vercel dispatch is not for the Preview environment.");
  }
  if (requiredString(state.type, "Vercel deployment state") !== "success") {
    throw new Error("Vercel Preview deployment is not successful.");
  }

  const deploymentId = requiredString(payload.id, "Vercel deployment ID");
  if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
    throw new Error("Vercel Preview deployment ID is invalid.");
  }

  const gitSha = requiredString(git.sha, "Vercel Git SHA");
  if (!/^[0-9a-f]{40}$/.test(gitSha)) {
    throw new Error("Vercel Preview Git SHA must be full and lowercase.");
  }
  const gitRef = requiredString(git.ref, "Vercel Git ref");
  if (gitRef === "main" || gitRef === "refs/heads/main" || gitRef.length > 255) {
    throw new Error("Vercel Preview must originate from a non-production Git ref.");
  }

  const deploymentUrl = requiredString(payload.url, "Vercel deployment URL");
  const parsed = new URL(deploymentUrl);
  const immutableHostname = new RegExp(
    `^${regexEscape(projectName)}-[a-z0-9]{9}-${regexEscape(expected.scope)}\\.vercel\\.app$`,
  );
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
    || !immutableHostname.test(parsed.hostname)
  ) {
    throw new Error("Vercel Preview URL is not the immutable project deployment origin.");
  }

  return {
    deploymentId,
    deploymentUrl: parsed.origin,
    environment: "preview",
    gitRef,
    gitSha,
    projectId,
    projectName,
    repositoryId: expected.repositoryId,
  };
}
