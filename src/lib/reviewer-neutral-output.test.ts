import { access, mkdtemp, mkdir, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { prepareReviewerNeutralJsonOutput } from "@/lib/reviewer-neutral-output";

async function withTemporaryRoots(
  run: (repositoryRoot: string, outsideRoot: string) => Promise<void>,
): Promise<void> {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "review-output-repo-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "review-output-outside-"));
  try {
    await run(repositoryRoot, outsideRoot);
  } finally {
    await Promise.all([
      rm(repositoryRoot, { recursive: true, force: true }),
      rm(outsideRoot, { recursive: true, force: true }),
    ]);
  }
}

describe("reviewer-neutral JSON output", () => {
  it("creates a new nested JSON file beneath a plain tmp directory", async () => {
    await withTemporaryRoots(async (repositoryRoot) => {
      const destination = await prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/review/report.json",
      });
      await destination.write("{\"reviewedBy\":null}\n");
      await expect(readFile(destination.outputPath, "utf8"))
        .resolves.toBe("{\"reviewedBy\":null}\n");
    });
  });

  it("rejects traversal, non-JSON output, and overwrites", async () => {
    await withTemporaryRoots(async (repositoryRoot) => {
      await expect(prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "../report.json",
      })).rejects.toThrow("under tmp/");
      await expect(prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/report.txt",
      })).rejects.toThrow("under tmp/");

      const destination = await prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/report.json",
      });
      await destination.write("{}\n");
      const second = await prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/report.json",
      });
      await expect(second.write("{}\n")).rejects.toMatchObject({ code: "EEXIST" });
    });
  });

  it("rejects a symlinked tmp directory without writing outside the repository", async () => {
    await withTemporaryRoots(async (repositoryRoot, outsideRoot) => {
      await symlink(outsideRoot, path.join(repositoryRoot, "tmp"), "dir");
      await expect(prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/report.json",
      })).rejects.toThrow("plain directory");
      await expect(access(path.join(outsideRoot, "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("rejects a symlinked nested parent without writing through it", async () => {
    await withTemporaryRoots(async (repositoryRoot, outsideRoot) => {
      await mkdir(path.join(repositoryRoot, "tmp"));
      await symlink(outsideRoot, path.join(repositoryRoot, "tmp", "linked"), "dir");
      await expect(prepareReviewerNeutralJsonOutput({
        repositoryRoot,
        output: "tmp/linked/report.json",
      })).rejects.toThrow("plain directory");
      await expect(access(path.join(outsideRoot, "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });
});
