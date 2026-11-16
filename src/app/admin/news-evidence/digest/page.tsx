import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { newsEvidenceEnabled } from "@/modules/news-evidence/feature";
import { canPublishVersion, publicSourceMetadata } from "@/modules/news-evidence/policy";

export default async function NewsDigestPage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string }>;
}) {
  if (!newsEvidenceEnabled()) notFound();
  const before = z.iso.date().safeParse((await searchParams).before);
  const rows = await prisma.newsDigestEdition.findMany({
    where: before.success ? { date: { lt: before.data } } : undefined,
    orderBy: { date: "desc" },
    take: 32,
    include: {
      entries: {
        orderBy: { position: "asc" },
        include: {
          revision: {
            select: {
              title: true, summary: true, correctsRevisionId: true,
              claims: { select: { evidence: { select: { version: { select: {
                policyVersion: true, document: { select: { sourceKey: true } },
              } } } } } },
              sourceVersion: { select: { policyVersion: true, document: { select: {
                sourceKey: true, sourceName: true, canonicalUrl: true,
              } } } },
            },
          },
        },
      },
    },
  });
  const editions = rows.slice(0, 31);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link className="text-sm underline" href="/admin/news-evidence">News review</Link>
      <h1 className="text-2xl font-semibold">Morning news digest</h1>
      {editions.length === 0 && <p>No editions for this period.</p>}
      {editions.map((edition) => {
        const entries = edition.entries.flatMap((entry) => {
          const { document, policyVersion } = entry.revision.sourceVersion;
          const source = publicSourceMetadata(document.sourceKey, policyVersion, document);
          const evidenceAllowed = entry.revision.claims.every(({ evidence }) => evidence.every(({ version }) =>
            canPublishVersion(version.document.sourceKey, version.policyVersion),
          ));
          return source && evidenceAllowed ? [{ ...entry, source }] : [];
        });
        return (
          <section key={edition.date} className="space-y-4 border-t border-current/15 pt-4">
            <h2 className="text-lg font-semibold"><time dateTime={edition.date}>{edition.date}</time></h2>
            {entries.length === 0 && <p className="text-sm opacity-70">No eligible updates.</p>}
            {entries.map(({ revision, revisionId, source }) => (
              <article key={revisionId} className="space-y-1">
                <h3 className="font-medium">
                  {revision.correctsRevisionId && <span>Correction · </span>}{revision.title}
                </h3>
                <p className="text-sm">{revision.summary}</p>
                {source.sourceUrl && (
                  <a className="text-sm underline" href={source.sourceUrl} target="_blank" rel="noreferrer">
                    {source.sourceName}
                  </a>
                )}
              </article>
            ))}
          </section>
        );
      })}
      {rows.length > editions.length && (
        <Link className="text-sm underline" href={`/admin/news-evidence/digest?before=${editions.at(-1)?.date}`}>Earlier editions</Link>
      )}
    </div>
  );
}
