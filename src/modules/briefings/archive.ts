import { readdir, readFile } from "fs/promises";
import path from "path";

const WEEKLY_EDITION_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_ARCHIVE_DIR = path.join(process.cwd(), "public", "email-format");

export interface WeeklyBriefingDocument {
  edition: string;
  bodyMarkup: string;
  documentMarkup: string;
  headStyles: string;
  sourceHref: string;
}
export function isWeeklyBriefingEdition(value: string): boolean {
  return WEEKLY_EDITION_PATTERN.test(value);
}

export function extractBodyMarkup(documentMarkup: string): string {
  const match = documentMarkup.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) throw new Error("Weekly briefing HTML is missing a body element");
  if (/<script\b/i.test(match[1])) {
    throw new Error("Weekly briefing HTML unexpectedly contains a script");
  }
  return match[1].trim();
}

export function rewriteBriefingArchiveLinks(bodyMarkup: string): string {
  return bodyMarkup
    .replace(/href="(\d{4}-\d{2}-\d{2})\.html"/g, 'href="/weekly-briefing?edition=$1"')
    .replace(/src="assets\//g, 'src="/email-format/assets/');
}

export async function listWeeklyBriefingEditions(
  archiveDir = DEFAULT_ARCHIVE_DIR,
): Promise<string[]> {
  const files = await readdir(archiveDir);
  return files
    .map((file) => file.replace(/\.html$/, ""))
    .filter(isWeeklyBriefingEdition)
    .sort((left, right) => right.localeCompare(left));
}

export async function loadWeeklyBriefingDocument({
  edition,
  archiveDir = DEFAULT_ARCHIVE_DIR,
}: {
  edition: string;
  archiveDir?: string;
}): Promise<WeeklyBriefingDocument> {
  if (!isWeeklyBriefingEdition(edition)) {
    throw new Error(`Invalid weekly briefing edition: ${edition}`);
  }

  const documentMarkup = await readFile(
    path.join(archiveDir, `${edition}.html`),
    "utf8",
  );

  return {
    edition,
    documentMarkup,
    headStyles: (documentMarkup.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? []).join("\n"),
    bodyMarkup: rewriteBriefingArchiveLinks(extractBodyMarkup(documentMarkup)),
    sourceHref: `/email-format/${edition}.html`,
  };
}
