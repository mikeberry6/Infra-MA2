/**
 * Read-only report for explicit primary-citation remediation.
 *
 * The generated JSON is deliberately reviewer-neutral: every candidate is
 * listed in opaque citation-ID order and every selectedCitationId is null.
 * This script never mutates data and never recommends or infers a selection.
 *
 * Usage:
 *   npm run db:citations:report -- --output=audits/primary-citation-approval.json
 *   npx tsx scripts/report-primary-citation-remediation.ts > approval.json
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  buildPrimaryCitationApprovalTemplate,
  loadPrimaryCitationReportInput,
  sha256Hex,
} from "../src/modules/operations/primary-citation-remediation";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for the read-only citation report");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const input = await loadPrimaryCitationReportInput(prisma);
    const template = buildPrimaryCitationApprovalTemplate(input);
    const json = `${JSON.stringify(template, null, 2)}\n`;
    const output = option("output");
    if (output) {
      const outputPath = path.resolve(output);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, json, { encoding: "utf8", flag: "wx" });
      console.error(`Wrote reviewer-neutral approval template to ${outputPath}`);
    } else {
      process.stdout.write(json);
    }
    console.error(
      `Published records missing explicit primary citation: ${template.items.length}; template SHA-256: ${sha256Hex(json)}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Primary-citation report failed");
  process.exitCode = 1;
});
