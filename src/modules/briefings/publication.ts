import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  readApprovedWeeklyBriefingIndex,
  resolveLatestApprovedWeeklyBriefingEdition,
} from "@/app/weekly-briefing/approved-editions";
import { listWeeklyBriefingEditions } from "./archive";

const publishedIssueSchema = z.object({
  edition: z.iso.date(),
  archivePath: z.string(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
});
const publishedArchiveSchema = z.object({ issues: z.array(publishedIssueSchema) });
type PublishedIssue = z.infer<typeof publishedIssueSchema>;

async function readPublicationState(editions?: readonly string[]) {
  const root = process.cwd();
  const [index, archivedEditions, publishedArchive, activityAuditDirectories] = await Promise.all([
    readApprovedWeeklyBriefingIndex(),
    editions ?? listWeeklyBriefingEditions(),
    readFile(path.join(root, "audits/briefing-deals/archive.json"), "utf8"),
    readdir(path.join(root, "audits/weekly-briefing-activity")),
  ]);

  // Dedicated activity-chart approval continues to govern editions in its workflow.
  resolveLatestApprovedWeeklyBriefingEdition({ index, archivedEditions });
  const approvedChartEditions = index.entries.map(({ edition }) => edition);
  const chartEditions = new Set([...activityAuditDirectories, ...approvedChartEditions]);
  const { issues } = publishedArchiveSchema.parse(JSON.parse(publishedArchive));
  const editorialIssues = issues.filter(({ edition }) => !chartEditions.has(edition));
  return { root, archivedEditions, approvedChartEditions, editorialIssues };
}

async function verifyEditorialIssue(issue: PublishedIssue, root: string, archivedEditions: readonly string[]) {
  // A dated HTML file alone does not advance either default. The finalized
  // editorial PR must also commit the matching publication inventory entry.
  const { edition, archivePath, contentHash } = issue;
  const expectedArchivePath = `/email-format/${edition}.html`;
  if (!archivedEditions.includes(edition) || archivePath !== expectedArchivePath) {
    throw new Error("Published weekly briefing is missing from the archive");
  }
  const bytes = await readFile(path.join(root, "public", expectedArchivePath.slice(1)));
  if (createHash("sha256").update(bytes).digest("hex") !== contentHash) {
    throw new Error("Published weekly briefing differs from the publication inventory");
  }
  return edition;
}

export async function listPublishedBriefingEditions(editions?: readonly string[]): Promise<string[]> {
  const { root, archivedEditions, approvedChartEditions, editorialIssues } = await readPublicationState(editions);
  const verifiedEditorialEditions = await Promise.all(
    editorialIssues.map((issue) => verifyEditorialIssue(issue, root, archivedEditions)),
  );
  return [...new Set([...approvedChartEditions, ...verifiedEditorialEditions])].sort((a, b) => b.localeCompare(a));
}

export async function getLatestPublishedBriefingEdition(): Promise<string> {
  const [edition] = await listPublishedBriefingEditions();
  if (!edition) throw new Error("No published weekly briefing");
  return edition;
}
