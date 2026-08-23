import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { sha256Text } from "./hash";
import { verifySeedBatchGitRelease } from "./git-seed-release";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];

async function git(cwd: string, ...args: string[]): Promise<void> {
  await execFileAsync("git", args, { cwd });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("seed artifact git release verification", () => {
  it("hashes a committed and pushed seed artifact larger than the former 2 MB buffer", async () => {
    const root = await mkdtemp(join(tmpdir(), "portco-seed-release-"));
    temporaryDirectories.push(root);
    const remote = join(root, "remote.git");
    const repository = join(root, "repository");
    await git(root, "init", "--bare", remote);
    await git(root, "init", "--initial-branch=main", repository);
    await git(repository, "config", "user.name", "PortCo Test");
    await git(repository, "config", "user.email", "portco-test@example.com");
    await git(repository, "remote", "add", "origin", remote);

    const artifactPath = join(repository, "approved-portco-after-images.json");
    const artifactText = `${"x".repeat(2_100_000)}\n`;
    await writeFile(artifactPath, artifactText, "utf8");
    await git(repository, "add", "approved-portco-after-images.json");
    await git(repository, "commit", "-m", "add large seed artifact");
    await git(repository, "push", "-u", "origin", "main");

    const evidence = await verifySeedBatchGitRelease({
      repositoryRoot: repository,
      publication: {
        artifactPath,
        artifactSha256: sha256Text(artifactText),
        entries: [],
      },
      targetDatabase: "production",
      batchSha256: "b".repeat(64),
      protectedProductionWriteApproved: true,
    });

    expect(evidence.seedArtifactCommitted).toBe(true);
    expect(evidence.seedArtifactPushed).toBe(true);
    expect(evidence.committedSeedArtifactSha256).toBe(sha256Text(artifactText));
    expect(evidence.releaseSha).toMatch(/^[a-f0-9]{40}$/);
  });
});
