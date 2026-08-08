import { readdir, readFile } from "fs/promises";
import path from "path";

const WEEKLY_EDITION_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_ARCHIVE_DIR = path.join(process.cwd(), "public", "email-format");

export interface WeeklyBriefingDocument {
  edition: string;
  bodyMarkup: string;
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

export function rewriteBriefingArchiveLinks(
  bodyMarkup: string,
  basePath = "",
): string {
  const prefix = basePath.replace(/\/$/, "");
  return bodyMarkup
    .replace(
      /href="(\d{4}-\d{2}-\d{2})\.html"/g,
      (_match, edition: string) =>
        `href="${prefix}/weekly-briefing?edition=${edition}"`,
    )
    .replace(
      /src="assets\//g,
      `src="${prefix}/email-format/assets/`,
    );
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
  basePath = "",
  archiveDir = DEFAULT_ARCHIVE_DIR,
}: {
  edition: string;
  basePath?: string;
  archiveDir?: string;
}): Promise<WeeklyBriefingDocument> {
  if (!isWeeklyBriefingEdition(edition)) {
    throw new Error(`Invalid weekly briefing edition: ${edition}`);
  }

  const documentMarkup = await readFile(
    path.join(archiveDir, `${edition}.html`),
    "utf8",
  );
  const prefix = basePath.replace(/\/$/, "");

  return {
    edition,
    bodyMarkup: rewriteBriefingArchiveLinks(
      extractBodyMarkup(documentMarkup),
      prefix,
    ),
    sourceHref: `${prefix}/email-format/${edition}.html`,
  };
}
