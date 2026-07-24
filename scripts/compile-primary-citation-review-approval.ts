/**
 * Compiles a completed, hash-bound semantic worksheet into the existing
 * primary-citation approval schema. The output remains a local review artifact:
 * this script never queries or mutates a database and never writes directly to
 * the canonical audits/approvals path.
 *
 * Usage:
 *   npm run db:citations:compile-review -- \
 *     --template=tmp/primary-citation-approval-template.json \
 *     --worksheet=tmp/primary-citation-review-worksheet.json
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output";
import { withServerTask } from "../src/lib/server-log";
import { parseStrictJson } from "../src/lib/strict-json";
import {
  compilePrimaryCitationReviewWorksheet,
} from "../src/modules/operations/primary-citation-review-worksheet";
import {
  sha256Hex,
  type PrimaryCitationApprovalTemplate,
} from "../src/modules/operations/primary-citation-remediation";

const DEFAULT_OUTPUT = "tmp/primary-citation-reviewed-approval.json";

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
    throw new Error("--template=<exact reviewer-neutral primary-citation template> is required");
  }
  const worksheet = option("worksheet");
  if (!worksheet) {
    throw new Error("--worksheet=<completed semantic review worksheet> is required");
  }

  const templatePath = path.resolve(template);
  const worksheetPath = path.resolve(worksheet);
  const [exactTemplateBytes, reviewedWorksheetBytes] = await Promise.all([
    readFile(templatePath),
    readFile(worksheetPath),
  ]);
  const freshNeutralTemplate = parseJson(
    exactTemplateBytes,
    "Primary-citation template",
  ) as PrimaryCitationApprovalTemplate;
  const compiled = compilePrimaryCitationReviewWorksheet({
    freshNeutralTemplate,
    exactTemplateBytes,
    reviewedWorksheetBytes,
    includeExactUrlIndex: process.argv.slice(2).includes(
      "--include-exact-url-index",
    ),
  });
  const destination = await prepareProtectedTemporaryJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const json = `${JSON.stringify(compiled, null, 2)}\n`;
  await destination.write(json);

  console.log(JSON.stringify({
    approvalCompiled: true,
    template: templatePath,
    worksheet: worksheetPath,
    output: destination.outputPath,
    sourceTemplateSha256: sha256Hex(exactTemplateBytes),
    reviewedWorksheetSha256: sha256Hex(reviewedWorksheetBytes),
    compiledApprovalSha256: sha256Hex(json),
    reviewedBy: compiled.reviewedBy,
    reviewedAt: compiled.reviewedAt,
    itemCount: compiled.items.length,
  }, null, 2));
}

withServerTask(
  {
    task: "primary_citation_review_worksheet",
    operation: "compile_reviewed_approval",
  },
  main,
).catch(() => {
  process.exitCode = 1;
});
