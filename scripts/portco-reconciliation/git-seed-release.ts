import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { promisify } from "node:util";
import { sha256Text } from "./hash";
import type {
  ApprovedSeedPublication,
} from "./approved-seed";
import type { ProductionReleaseEvidence } from "./apply-executor";

const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const result = await execFileAsync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 2_000_000,
  });
  return result.stdout.trim();
}

export async function verifySeedGitRelease(input: {
  repositoryRoot: string;
  publication: ApprovedSeedPublication;
  targetDatabase: "validation" | "production";
  approvalSha256: string;
  protectedProductionWriteApproved: boolean;
}): Promise<ProductionReleaseEvidence> {
  const root = resolve(input.repositoryRoot);
  const artifact = resolve(input.publication.artifactPath);
  const relativePath = relative(root, artifact);
  if (!relativePath || relativePath.startsWith("..") || relativePath.includes("\\")) {
    throw new Error("Approved seed artifact is outside the target repository");
  }
  const workingText = await readFile(artifact, "utf8");
  if (sha256Text(workingText) !== input.publication.artifactSha256) {
    throw new Error("Working seed artifact changed before release verification");
  }
  const status = await git(root, ["status", "--porcelain", "--", relativePath]);
  const seedArtifactCommitted = status.length === 0;
  const head = await git(root, ["rev-parse", "HEAD"]);
  let committedSeedArtifactSha256: string | null = null;
  try {
    const committedText = await git(root, ["show", `HEAD:${relativePath}`]);
    committedSeedArtifactSha256 = sha256Text(`${committedText}\n`);
    if (sha256Text(committedText) === input.publication.artifactSha256) {
      committedSeedArtifactSha256 = input.publication.artifactSha256;
    }
  } catch {
    committedSeedArtifactSha256 = null;
  }

  let seedArtifactPushed = false;
  try {
    const branch = await git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    const remote = await git(root, ["ls-remote", "--heads", "origin", `refs/heads/${branch}`]);
    seedArtifactPushed = remote.split(/\s+/)[0] === head;
  } catch {
    seedArtifactPushed = false;
  }
  return {
    targetDatabase: input.targetDatabase,
    protectedProductionWriteApproved: input.protectedProductionWriteApproved,
    protectedApprovalSha256: input.approvalSha256,
    seedArtifactCommitted,
    seedArtifactPushed,
    committedSeedArtifactSha256,
    releaseSha: /^[a-f0-9]{40}$/i.test(head) ? head : null,
  };
}
