import { execFileSync } from "node:child_process";
import { sha256Canonical } from "./sources-normalize";
import type { GitHistorySnapshot, GitPathHistory, GitPathHistoryEntry } from "./sources-types";

function runGit(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function blobAtCommit(repoRoot: string, commit: string, relativePath: string): string | null {
  try {
    return runGit(repoRoot, ["rev-parse", `${commit}:${relativePath}`]);
  } catch {
    return null;
  }
}

export function captureGitPathHistory(repoRoot: string, relativePath: string): GitPathHistory {
  const output = runGit(repoRoot, [
    "log",
    "--all",
    "--format=%H%x09%aI%x09%s",
    "--",
    relativePath,
  ]);
  const entries: GitPathHistoryEntry[] = output
    ? output.split("\n").map((line) => {
      const [commit, authorDate, ...subjectParts] = line.split("\t");
      return {
        commit,
        authorDate,
        subject: subjectParts.join("\t"),
        blob: blobAtCommit(repoRoot, commit, relativePath),
      };
    })
    : [];

  return { relativePath, entries };
}

export function captureGitHistory(input: {
  repoRoot: string;
  relativePaths: string[];
}): GitHistorySnapshot {
  const paths = [...new Set(input.relativePaths)]
    .sort()
    .map((relativePath) => captureGitPathHistory(input.repoRoot, relativePath));
  const head = runGit(input.repoRoot, ["rev-parse", "HEAD"]);
  return {
    head,
    paths,
    historyHash: sha256Canonical({ head, paths }),
  };
}
