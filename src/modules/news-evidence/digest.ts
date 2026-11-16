import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { canPublishVersion } from "./policy";

const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeZoneName: "shortOffset",
});

export function easternDigestCutoff(date: string) {
  z.iso.date().parse(date);
  const clock = new Date(`${date}T06:15:00.000Z`);
  // At noon UTC, the timezone offset agrees with 6:15 Eastern even on DST transition days.
  const offset = offsetFormat.formatToParts(new Date(`${date}T12:00:00.000Z`))
    .find((part) => part.type === "timeZoneName")?.value;
  const hours = Number(offset?.replace(/^GMT/, ""));
  if (!Number.isFinite(hours)) throw new Error("Could not determine the Eastern timezone offset.");
  return new Date(clock.getTime() - hours * 3_600_000);
}

function nextDate(date: string) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

type ReviewPoint = {
  id: string;
  developmentId: string;
  number: number;
  materialChange: boolean;
  sourceVersion: { policyVersion: string; document: { sourceKey: string } };
  claims?: { evidence: { version: { policyVersion: string; document: { sourceKey: string } } }[] }[];
};

export function selectDigestEntries(
  history: ReviewPoint[],
  consumed: ReadonlySet<string>,
  permits: (sourceKey: string, policyVersion: string) => boolean = canPublishVersion,
) {
  const developments = new Map<string, { newest: ReviewPoint; material: ReviewPoint | undefined }>();
  for (const revision of history) {
    const group = developments.get(revision.developmentId);
    if (!group) {
      developments.set(revision.developmentId, {
        newest: revision,
        material: revision.materialChange ? revision : undefined,
      });
      continue;
    }
    if (revision.number > group.newest.number) group.newest = revision;
    if (revision.materialChange && (!group.material || revision.number > group.material.number)) {
      group.material = revision;
    }
  }
  return [...developments.values()].flatMap(({ newest, material }) => {
    const { policyVersion, document } = newest.sourceVersion;
    if (!material || consumed.has(material.id) || !permits(document.sourceKey, policyVersion)
      || newest.claims?.some(({ evidence }) => evidence.some(({ version }) =>
        !permits(version.document.sourceKey, version.policyVersion),
      ))) return [];
    return [{ revisionId: newest.id, materialRevisionId: material.id }];
  });
}

export async function buildNextDigestEdition(
  tx: Prisma.TransactionClient,
  { startDate, now }: { startDate: string; now: Date },
) {
  z.iso.date().parse(startDate);
  const last = await tx.newsDigestEdition.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  const date = last ? nextDate(last.date) : startDate;
  const cutoff = easternDigestCutoff(date);
  if (cutoff > now) return null;

  const history = await tx.newsRevision.findMany({
    where: { status: "APPROVED", reviewedAt: { lte: cutoff } },
    select: {
      id: true, developmentId: true, number: true, materialChange: true,
      sourceVersion: { select: { policyVersion: true, document: { select: { sourceKey: true } } } },
      claims: { select: { evidence: { select: { version: { select: {
        policyVersion: true, document: { select: { sourceKey: true } },
      } } } } } },
    },
    orderBy: [{ reviewedAt: "asc" }, { id: "asc" }],
  });
  const included = await tx.newsDigestEntry.findMany({ select: { materialRevisionId: true } });
  const entries = selectDigestEntries(history, new Set(included.map((entry) => entry.materialRevisionId)));
  const edition = await tx.newsDigestEdition.create({
    data: { date, cutoff, entries: { create: entries.map((entry, position) => ({ ...entry, position })) } },
    select: { date: true, cutoff: true, _count: { select: { entries: true } } },
  });
  return edition;
}
