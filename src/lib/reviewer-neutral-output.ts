import { constants } from "node:fs";
import { lstat, mkdir, open, realpath } from "node:fs/promises";
import path from "node:path";

export interface PreparedReviewerNeutralJsonOutput {
  outputPath: string;
  write(contents: string): Promise<void>;
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error
    ? String(error.code)
    : undefined;
}

async function ensurePlainDirectory(directory: string): Promise<void> {
  let stats;
  try {
    stats = await lstat(directory);
  } catch (error) {
    if (errorCode(error) !== "ENOENT") throw error;
    try {
      await mkdir(directory, { mode: 0o700 });
    } catch (mkdirError) {
      if (errorCode(mkdirError) !== "EEXIST") throw mkdirError;
    }
    stats = await lstat(directory);
  }
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(`Reviewer-neutral output parent must be a plain directory: ${directory}`);
  }
}

function isContainedPath(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function validateAndPrepareDestination(input: {
  repositoryRoot: string;
  output: string;
}): Promise<{ outputPath: string; realTmpRoot: string }> {
  const repositoryRoot = await realpath(input.repositoryRoot);
  const tmpRoot = path.join(repositoryRoot, "tmp");
  const outputPath = path.resolve(repositoryRoot, input.output);
  const relativeOutput = path.relative(tmpRoot, outputPath);
  if (
    !relativeOutput
    || relativeOutput.startsWith("..")
    || path.isAbsolute(relativeOutput)
    || path.extname(outputPath) !== ".json"
  ) {
    throw new Error("Reviewer-neutral templates must be written to a .json file under tmp/");
  }

  await ensurePlainDirectory(tmpRoot);
  const relativeParent = path.relative(tmpRoot, path.dirname(outputPath));
  let current = tmpRoot;
  for (const part of relativeParent.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    await ensurePlainDirectory(current);
  }

  const [realTmpRoot, realParent] = await Promise.all([
    realpath(tmpRoot),
    realpath(path.dirname(outputPath)),
  ]);
  if (realTmpRoot !== tmpRoot || !isContainedPath(realTmpRoot, realParent)) {
    throw new Error("Reviewer-neutral output parent resolves outside the repository tmp/ directory");
  }
  return { outputPath, realTmpRoot };
}

export async function prepareReviewerNeutralJsonOutput(input: {
  repositoryRoot: string;
  output: string;
}): Promise<PreparedReviewerNeutralJsonOutput> {
  const prepared = await validateAndPrepareDestination(input);
  return {
    outputPath: prepared.outputPath,
    async write(contents: string): Promise<void> {
      // Recheck every ancestor immediately before opening so a symlink cannot
      // be introduced between report generation and the filesystem write.
      const current = await validateAndPrepareDestination(input);
      if (current.outputPath !== prepared.outputPath || current.realTmpRoot !== prepared.realTmpRoot) {
        throw new Error("Reviewer-neutral output destination changed after validation");
      }
      const handle = await open(
        current.outputPath,
        constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
        0o600,
      );
      try {
        const actualPath = await realpath(current.outputPath);
        if (!isContainedPath(current.realTmpRoot, actualPath)) {
          throw new Error("Reviewer-neutral output file resolves outside the repository tmp/ directory");
        }
        await handle.writeFile(contents, { encoding: "utf8" });
      } finally {
        await handle.close();
      }
    },
  };
}
