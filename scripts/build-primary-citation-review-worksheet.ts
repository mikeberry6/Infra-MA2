/**
 * Converts an exact reviewer-neutral primary-citation template into a smaller,
 * hash-bound semantic review worksheet. It never queries or mutates a database,
 * recommends a source, or preselects a group.
 *
 * Usage:
 *   npm run db:citations:worksheet -- \
 *     --template=tmp/primary-citation-approval-template.json
 *
 * Add --include-exact-url-index only when Research needs the larger,
 * cross-record page-reuse index.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prepareReviewerNeutralJsonOutput } from "../src/lib/reviewer-neutral-output";
import { withServerTask } from "../src/lib/server-log";
import { parseStrictJson } from "../src/lib/strict-json";
import {
  buildPrimaryCitationReviewWorksheet,
} from "../src/modules/operations/primary-citation-review-worksheet";
import {
  sha256Hex,
  type PrimaryCitationApprovalTemplate,
} from "../src/modules/operations/primary-citation-remediation";

const DEFAULT_OUTPUT = "tmp/primary-citation-review-worksheet.json";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

function parseJson(
  bytes: Uint8Array,
  label: string,
): unknown {
  try {
    return parseStrictJson(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    throw new Error(
      `${label} must contain valid UTF-8 JSON without duplicate object keys`,
    );
  }
}

async function main(): Promise<void> {
  const template = option("template");
  if (!template) {
    throw new Error("--template=<reviewer-neutral primary-citation template> is required");
  }
  const templatePath = path.resolve(template);
  const exactTemplateBytes = await readFile(templatePath);
  const neutralTemplate = parseJson(
    exactTemplateBytes,
    "Primary-citation template",
  ) as PrimaryCitationApprovalTemplate;
  const worksheet = buildPrimaryCitationReviewWorksheet({
    neutralTemplate,
    exactTemplateBytes,
    includeExactUrlIndex: process.argv.slice(2).includes(
      "--include-exact-url-index",
    ),
  });
  const destination = await prepareReviewerNeutralJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const json = `${JSON.stringify(worksheet, null, 2)}\n`;
  await destination.write(json);

  const candidateCount = neutralTemplate.items.reduce(
    (total, item) => total + item.candidates.length,
    0,
  );
  const semanticGroupCount = worksheet.items.reduce(
    (total, item) => total + item.groups.length,
    0,
  );
  console.log(JSON.stringify({
    worksheetWritten: true,
    template: templatePath,
    output: destination.outputPath,
    sourceTemplateSha256: worksheet.sourceTemplateSha256,
    worksheetSha256: sha256Hex(json),
    itemCount: worksheet.items.length,
    zeroCandidateItemCount: worksheet.items.filter(
      (item) => item.groups.length === 0,
    ).length,
    candidateCount,
    semanticGroupCount,
    redundantCandidateRowsRemoved: candidateCount - semanticGroupCount,
    exactUrlIndexIncluded: worksheet.exactUrlIndex !== undefined,
    exactUrlCount: worksheet.exactUrlIndex?.length ?? 0,
  }, null, 2));
}

withServerTask(
  {
    task: "primary_citation_review_worksheet",
    operation: "build_review_worksheet",
  },
  main,
).catch(() => {
  process.exitCode = 1;
});
